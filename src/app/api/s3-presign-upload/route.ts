import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

export async function POST(req: NextRequest) {
  // Check for required env vars
  if (!process.env.AWS_BUCKET_NAME || !process.env.AWS_BUCKET_REGION || !process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET_KEY) {
    return NextResponse.json({ error: 'Missing AWS environment variables' }, { status: 500 });
  }

  const body = await req.json();
  console.log('[s3-presign-upload] Request body:', body);
  
  const { fileName, fileType, folder } = body;
  if (!fileName || !folder) {
    console.log('[s3-presign-upload] Missing fields:', { fileName, fileType, folder });
    return NextResponse.json({ error: 'Missing required fields', received: { fileName, fileType, folder } }, { status: 400 });
  }

  // Infer file type from extension if not provided or empty
  let contentType = fileType;
  if (!contentType || contentType === '') {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'mp4':
        contentType = 'video/mp4';
        break;
      case 'mov':
        contentType = 'video/quicktime';
        break;
      case 'avi':
        contentType = 'video/x-msvideo';
        break;
      case 'webm':
        contentType = 'video/webm';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'doc':
        contentType = 'application/msword';
        break;
      case 'docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'xls':
        contentType = 'application/vnd.ms-excel';
        break;
      case 'xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'ppt':
        contentType = 'application/vnd.ms-powerpoint';
        break;
      case 'pptx':
        contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        break;
      case 'txt':
        contentType = 'text/plain';
        break;
      case 'html':
      case 'htm':
        contentType = 'text/html';
        break;
      case 'css':
        contentType = 'text/css';
        break;
      case 'js':
        contentType = 'application/javascript';
        break;
      case 'json':
        contentType = 'application/json';
        break;
      case 'xml':
        contentType = 'application/xml';
        break;
      case 'zip':
        contentType = 'application/zip';
        break;
      case 'rar':
        contentType = 'application/vnd.rar';
        break;
      case '7z':
        contentType = 'application/x-7z-compressed';
        break;
      case 'srt':
        contentType = 'text/plain'; // Subtitle files are plain text
        break;
      case 'vtt':
        contentType = 'text/vtt';
        break;
      case 'ass':
      case 'ssa':
        contentType = 'text/plain'; // Advanced subtitle formats
        break;
      case 'md':
        contentType = 'text/markdown';
        break;
      case 'py':
        contentType = 'text/x-python';
        break;
      case 'js':
        contentType = 'application/javascript';
        break;
      case 'ts':
        contentType = 'application/typescript';
        break;
      case 'java':
        contentType = 'text/x-java-source';
        break;
      case 'cpp':
      case 'cc':
        contentType = 'text/x-c++src';
        break;
      case 'c':
        contentType = 'text/x-csrc';
        break;
      case 'cs':
        contentType = 'text/x-csharp';
        break;
      case 'php':
        contentType = 'text/x-php';
        break;
      case 'rb':
        contentType = 'text/x-ruby';
        break;
      case 'go':
        contentType = 'text/x-go';
        break;
      case 'rs':
        contentType = 'text/x-rust';
        break;
      case 'swift':
        contentType = 'text/x-swift';
        break;
      case 'kt':
        contentType = 'text/x-kotlin';
        break;
      case 'scala':
        contentType = 'text/x-scala';
        break;
      case 'r':
        contentType = 'text/x-r';
        break;
      case 'm':
        contentType = 'text/x-matlab';
        break;
      case 'sql':
        contentType = 'text/x-sql';
        break;
      case 'sh':
        contentType = 'application/x-sh';
        break;
      case 'bat':
        contentType = 'application/x-msdownload';
        break;
      case 'ps1':
        contentType = 'application/x-powershell';
        break;
      case 'ds_store':
        contentType = 'application/octet-stream'; // macOS system file
        break;
      default:
        contentType = 'application/octet-stream'; // Default binary type
        break;
    }
  }

  // Sanitize folder path to prevent directory traversal
  const sanitizedFolder = folder.replace(/[^a-zA-Z0-9._/-]/g, '_');
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  const key = `${sanitizedFolder}/${sanitizedFileName}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
    // Add metadata for better organization
    Metadata: {
      'original-filename': fileName,
      'upload-timestamp': new Date().toISOString(),
      'folder-structure': sanitizedFolder,
      'inferred-content-type': contentType
    }
  });

  try {
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    // Debug log for S3 upload
    console.log('[s3-presign-upload] Bucket:', process.env.AWS_BUCKET_NAME);
    console.log('[s3-presign-upload] Key:', key);
    console.log('[s3-presign-upload] ContentType:', contentType);
    console.log('[s3-presign-upload] publicUrl:', `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${key}`);

    return NextResponse.json({
      url,
      key,
      publicUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error('[s3-presign-upload] Error generating presigned URL:', error);
    return NextResponse.json({ error: 'Failed to generate presigned URL' }, { status: 500 });
  }
}
