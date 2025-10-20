import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
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
  console.log('[s3-presign-download] Request body:', body);
  
  const { key, expiresIn = 3600 } = body; // Default 1 hour expiry
  
  if (!key) {
    console.log('[s3-presign-download] Missing key:', { key });
    return NextResponse.json({ error: 'Missing required key field' }, { status: 400 });
  }

  // Sanitize key to prevent directory traversal
  const sanitizedKey = key.replace(/[^a-zA-Z0-9._/-]/g, '_');
  
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: sanitizedKey,
  });

  try {
    const url = await getSignedUrl(s3, command, { expiresIn });

    console.log('[s3-presign-download] Generated signed URL for key:', sanitizedKey);
    console.log('[s3-presign-download] Expires in:', expiresIn, 'seconds');

    return NextResponse.json({
      url,
      key: sanitizedKey,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    });
  } catch (error) {
    console.error('[s3-presign-download] Error generating presigned URL:', error);
    return NextResponse.json({ error: 'Failed to generate presigned URL' }, { status: 500 });
  }
}
