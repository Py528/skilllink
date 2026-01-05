import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { s3 } from '@/lib/s3'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { extractS3KeyFromUrl } from '@/lib/s3'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; path: string }> }
) {
  try {
    const { projectId, path } = await params
    const decodedPath = decodeURIComponent(path)

    // Get file metadata from Supabase
    const { data: fileData, error: fileError } = await supabaseServer
      .from('ide_files')
      .select('id, path, url, storage, version, size_bytes, content_type, checksum_sha256')
      .eq('project_id', projectId)
      .eq('path', decodedPath)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fileError) {
      return NextResponse.json({ error: fileError.message }, { status: 400 })
    }

    if (!fileData) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Fetch file content based on storage backend
    let content: string
    let contentType: string

    if (fileData.storage === 's3') {
      // Fetch from S3
      const s3Key = extractS3KeyFromUrl(fileData.url)
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: s3Key,
      })

      const response = await s3.send(command)
      const arrayBuffer = await response.Body!.transformToByteArray()
      const buffer = Buffer.from(arrayBuffer)
      content = buffer.toString('utf-8')
      contentType = response.ContentType || fileData.content_type || 'text/plain'
    } else {
      // Fetch from Supabase Storage
      const { data: fileContent, error: downloadError } = await supabaseServer.storage
        .from('ide-code')
        .download(fileData.url)

      if (downloadError) {
        return NextResponse.json({ error: downloadError.message }, { status: 400 })
      }

      const arrayBuffer = await fileContent.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      content = buffer.toString('utf-8')
      contentType = fileData.content_type || 'text/plain'
    }

    return NextResponse.json({
      content,
      metadata: {
        id: fileData.id,
        path: fileData.path,
        url: fileData.url,
        storage: fileData.storage,
        version: fileData.version,
        size_bytes: fileData.size_bytes,
        content_type: contentType,
        checksum_sha256: fileData.checksum_sha256,
      },
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

