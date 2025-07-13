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
  if (!fileName || !fileType || !folder) {
    console.log('[s3-presign-upload] Missing fields:', { fileName, fileType, folder });
    return NextResponse.json({ error: 'Missing required fields', received: { fileName, fileType, folder } }, { status: 400 });
  }

  const key = `${folder}/${fileName}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!, // Should be 'courses-skilllearn'
    Key: key,
    ContentType: fileType,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 });

  // Debug log for S3 upload
  console.log('[s3-presign-upload] Bucket:', process.env.AWS_BUCKET_NAME);
  console.log('[s3-presign-upload] publicUrl:', `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${key}`);

  return NextResponse.json({
    url,
    key,
    publicUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${key}`,
  });
}
