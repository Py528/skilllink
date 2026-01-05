import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { s3 } from '@/lib/s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { createHash } from 'crypto'

const BUCKET = 'ide-code'
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME
const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION || process.env.AWS_REGION || 'us-east-1'

// Generate SHA256 checksum
function generateChecksum(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}

// Helper to determine storage backend
function getStorageBackend(): 's3' | 'supabase' {
  // Prefer S3 if configured, otherwise fallback to Supabase
  return (AWS_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID) ? 's3' : 'supabase'
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params
    const { path, contentBase64, contentType, storage } = await req.json()
    if (!path || !contentBase64) return NextResponse.json({ error: 'path and contentBase64 required' }, { status: 400 })

    const buffer = Buffer.from(contentBase64, 'base64')
    const checksum = generateChecksum(buffer)
    const storageBackend = storage || getStorageBackend()
    
    // Fetch project details to get course_id and lesson_id
    const { data: projectData } = await supabaseServer
      .from('ide_projects')
      .select('course_id, lesson_id, name, template, package_manager')
      .eq('id', projectId)
      .single()
    
    // Fetch course details if available
    let courseData = null
    if (projectData?.course_id) {
      const { data: course } = await supabaseServer
        .from('courses')
        .select('id, title, instructor_name, slug')
        .eq('id', projectData.course_id)
        .single()
      courseData = course
    }
    
    let fileUrl: string
    let s3Key: string | undefined

    if (storageBackend === 's3') {
      // Upload to S3
      if (!AWS_BUCKET_NAME) {
        return NextResponse.json({ error: 'AWS S3 not configured' }, { status: 500 })
      }

      // Use structured path: ide-code/{course_id}/{lesson_id}/{filename} or ide-code/{project_id}/{path}
      const fileName = path.split('/').pop() || path
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
      const isSampleFile = path.startsWith('samples/')
      
      // Build S3 key with course/lesson structure if available
      if (projectData?.course_id) {
        const courseFolder = `course_${projectData.course_id.replace(/-/g, '_')}`
        if (projectData.lesson_id) {
          const lessonFolder = `lesson_${projectData.lesson_id.replace(/-/g, '_')}`
          s3Key = `ide-code/${courseFolder}/${lessonFolder}/${isSampleFile ? 'samples/' : ''}${fileName}`
        } else {
          s3Key = `ide-code/${courseFolder}/${isSampleFile ? 'samples/' : ''}${fileName}`
        }
      } else {
        s3Key = `ide-code/ide-projects/${projectId}/${path}`
      }
      
      // Build comprehensive metadata
      const uploadTimestamp = new Date().toISOString()
      const metadata: Record<string, string> = {
        'project-id': projectId,
        'original-path': path,
        'checksum-sha256': checksum,
        'upload-timestamp': uploadTimestamp,
        'file-name': fileName,
        'file-extension': fileExtension,
        'content-type': contentType || 'application/octet-stream',
        'file-size': buffer.length.toString(),
        'storage-backend': 's3',
        'is-sample-file': isSampleFile ? 'true' : 'false',
      }
      
      if (projectData) {
        metadata['project-name'] = projectData.name || ''
        if (projectData.template) metadata['project-template'] = projectData.template
        if (projectData.package_manager) metadata['package-manager'] = projectData.package_manager
      }
      
      if (projectData?.course_id) {
        metadata['course-id'] = projectData.course_id
        if (courseData) {
          metadata['course-title'] = courseData.title || ''
          if (courseData.instructor_name) metadata['instructor-name'] = courseData.instructor_name
          if (courseData.slug) metadata['course-slug'] = courseData.slug
        }
      }
      
      if (projectData?.lesson_id) {
        metadata['lesson-id'] = projectData.lesson_id
      }
      
      // Build S3 tags for better filtering/searching
      const tags: Array<{ Key: string; Value: string }> = [
        { Key: 'ProjectID', Value: projectId },
        { Key: 'FileType', Value: 'ide-code' },
        { Key: 'StorageBackend', Value: 's3' },
      ]
      
      if (isSampleFile) {
        tags.push({ Key: 'FileCategory', Value: 'sample' })
      }
      
      if (projectData?.course_id) {
        tags.push({ Key: 'CourseID', Value: projectData.course_id })
      }
      
      if (projectData?.lesson_id) {
        tags.push({ Key: 'LessonID', Value: projectData.lesson_id })
      }
      
      if (fileExtension) {
        tags.push({ Key: 'FileExtension', Value: fileExtension })
      }
      
      const command = new PutObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: contentType || 'application/octet-stream',
        Metadata: metadata,
        Tagging: tags.map(t => `${t.Key}=${t.Value}`).join('&'),
        // Add cache control for code files
        CacheControl: 'no-cache',
        // Add server-side encryption if configured
        // ServerSideEncryption: 'AES256',
      })

      await s3.send(command)
      
      // Generate public URL
      fileUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_BUCKET_REGION}.amazonaws.com/${s3Key}`
    } else {
      // Upload to Supabase Storage (fallback)
      const storagePath = `${projectId}/${path}`
      const { error: uploadErr } = await supabaseServer.storage
        .from(BUCKET)
        .upload(storagePath, buffer, {
          contentType: contentType || 'application/octet-stream',
          upsert: true,
        })
      if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 400 })
      fileUrl = storagePath
    }

    // Get latest version for this path
    const { data: latest, error: latestErr } = await supabaseServer
      .from('ide_files')
      .select('version')
      .eq('project_id', projectId)
      .eq('path', path)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (latestErr) return NextResponse.json({ error: latestErr.message }, { status: 400 })

    const nextVersion = latest?.version ? latest.version + 1 : 1
    const { data: inserted, error: insertErr } = await supabaseServer
      .from('ide_files')
      .insert({
        project_id: projectId,
        path,
        url: storageBackend === 's3' ? fileUrl : fileUrl,
        storage: storageBackend,
        version: nextVersion,
        content_type: contentType || null,
        size_bytes: buffer.length,
        checksum_sha256: checksum,
      })
      .select('id, version')
      .single()
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 400 })

    return NextResponse.json({ 
      id: inserted.id, 
      version: inserted.version, 
      url: fileUrl,
      storage: storageBackend,
      checksum_sha256: checksum
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}


