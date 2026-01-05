import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { s3 } from '@/lib/s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { createHash } from 'crypto'

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME
const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION || process.env.AWS_REGION || 'us-east-1'

// Sample file contents
const SAMPLE_FILES = {
  'samples/sample.js': `// Sample JavaScript demonstrating syntax highlighting
function greet(name) {
  const msg = 'Hello, ' + name + '!';
  console.log(msg);
  return msg;
}

class Counter {
  constructor() {
    this.count = 0;
  }
  inc() {
    this.count += 1;
    return this.count;
  }
}

export { greet, Counter };
`,
  'samples/sample.py': `# Sample Python demonstrating syntax highlighting
from typing import List

def greet(name: str) -> str:
    msg = f"Hello, {name}!"
    print(msg)
    return msg

class Counter:
    def __init__(self) -> None:
        self.count = 0

    def inc(self) -> int:
        self.count += 1
        return self.count

if __name__ == '__main__':
    greet('World')
    c = Counter()
    for _ in range(3):
        print(c.inc())
`,
}

function generateChecksum(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}

function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()
  switch (ext) {
    case 'js': return 'application/javascript'
    case 'py': return 'text/x-python'
    case 'md': return 'text/markdown'
    case 'json': return 'application/json'
    default: return 'text/plain'
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params
    const { force = false } = await req.json().catch(() => ({ force: false }))

    const storageBackend = (AWS_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID) ? 's3' : 'supabase'
    
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
    
    const uploadedFiles = []

    for (const [filePath, content] of Object.entries(SAMPLE_FILES)) {
      const buffer = Buffer.from(content, 'utf-8')
      const checksum = generateChecksum(buffer)
      const contentType = getContentType(filePath)
      const fileName = filePath.split('/').pop() || filePath
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''

      // Check if file already exists
      if (!force) {
        const { data: existing } = await supabaseServer
          .from('ide_files')
          .select('id, version')
          .eq('project_id', projectId)
          .eq('path', filePath)
          .order('version', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (existing) {
          // File exists, skip unless forced
          uploadedFiles.push({
            path: filePath,
            status: 'skipped',
            version: existing.version,
          })
          continue
        }
      }

      let fileUrl: string

      if (storageBackend === 's3') {
        // Upload to S3 with structured path
        let s3Key: string
        if (projectData?.course_id) {
          const courseFolder = `course_${projectData.course_id.replace(/-/g, '_')}`
          if (projectData.lesson_id) {
            const lessonFolder = `lesson_${projectData.lesson_id.replace(/-/g, '_')}`
            s3Key = `ide-code/${courseFolder}/${lessonFolder}/samples/${fileName}`
          } else {
            s3Key = `ide-code/${courseFolder}/samples/${fileName}`
          }
        } else {
          s3Key = `ide-code/ide-projects/${projectId}/samples/${fileName}`
        }
        
        // Build comprehensive metadata
        const uploadTimestamp = new Date().toISOString()
        const metadata: Record<string, string> = {
          'project-id': projectId,
          'original-path': filePath,
          'checksum-sha256': checksum,
          'upload-timestamp': uploadTimestamp,
          'file-name': fileName,
          'file-extension': fileExtension,
          'content-type': contentType,
          'file-size': buffer.length.toString(),
          'storage-backend': 's3',
          'is-sample-file': 'true',
          'file-category': 'sample',
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
          { Key: 'FileCategory', Value: 'sample' },
          { Key: 'IsSample', Value: 'true' },
        ]
        
        if (projectData?.course_id) {
          tags.push({ Key: 'CourseID', Value: projectData.course_id })
        }
        
        if (projectData?.lesson_id) {
          tags.push({ Key: 'LessonID', Value: projectData.lesson_id })
        }
        
        if (fileExtension) {
          tags.push({ Key: 'FileExtension', Value: fileExtension })
          tags.push({ Key: 'Language', Value: fileExtension === 'js' ? 'javascript' : fileExtension === 'py' ? 'python' : fileExtension })
        }
        
        const command = new PutObjectCommand({
          Bucket: AWS_BUCKET_NAME!,
          Key: s3Key,
          Body: buffer,
          ContentType: contentType,
          Metadata: metadata,
          Tagging: tags.map(t => `${t.Key}=${t.Value}`).join('&'),
          CacheControl: 'no-cache',
        })

        await s3.send(command)
        fileUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_BUCKET_REGION}.amazonaws.com/${s3Key}`
      } else {
        // Upload to Supabase Storage (fallback)
        const storagePath = `${projectId}/${filePath}`
        const { error: uploadErr } = await supabaseServer.storage
          .from('ide-code')
          .upload(storagePath, buffer, {
            contentType,
            upsert: true,
          })
        if (uploadErr) {
          uploadedFiles.push({
            path: filePath,
            status: 'error',
            error: uploadErr.message,
          })
          continue
        }
        fileUrl = storagePath
      }

      // Get latest version
      const { data: latest } = await supabaseServer
        .from('ide_files')
        .select('version')
        .eq('project_id', projectId)
        .eq('path', filePath)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle()

      const nextVersion = latest?.version ? latest.version + 1 : 1

      // Insert into ide_files
      const { data: inserted, error: insertErr } = await supabaseServer
        .from('ide_files')
        .insert({
          project_id: projectId,
          path: filePath,
          url: fileUrl,
          storage: storageBackend,
          version: nextVersion,
          content_type: contentType,
          size_bytes: buffer.length,
          checksum_sha256: checksum,
        })
        .select('id, version, path')
        .single()

      if (insertErr) {
        uploadedFiles.push({
          path: filePath,
          status: 'error',
          error: insertErr.message,
        })
      } else {
        uploadedFiles.push({
          path: filePath,
          status: 'uploaded',
          id: inserted.id,
          version: inserted.version,
          url: fileUrl,
          storage: storageBackend,
        })
      }
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      storage: storageBackend,
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

