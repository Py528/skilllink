import { NextRequest, NextResponse } from 'next/server';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

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
    return NextResponse.json({ 
      error: 'Missing AWS environment variables',
      env: {
        bucket: !!process.env.AWS_BUCKET_NAME,
        region: !!process.env.AWS_BUCKET_REGION,
        accessKey: !!process.env.AWS_ACCESS_KEY,
        secretKey: !!process.env.AWS_SECRET_KEY,
      }
    }, { status: 500 });
  }

  const body = await req.json();
  const { key } = body;
  
  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
  }

  try {
    // Test if the object exists in S3
    const headCommand = new HeadObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });

    const result = await s3.send(headCommand);
    
    console.log('S3 object exists:', {
      key,
      bucket: process.env.AWS_BUCKET_NAME,
      size: result.ContentLength,
      type: result.ContentType,
      lastModified: result.LastModified,
    });

    return NextResponse.json({
      success: true,
      object: {
        key,
        size: result.ContentLength,
        type: result.ContentType,
        lastModified: result.LastModified,
      },
      bucket: process.env.AWS_BUCKET_NAME,
      region: process.env.AWS_BUCKET_REGION,
    });
  } catch (error: unknown) {
    console.error('S3 access test failed:', error);
    
    return NextResponse.json({
      error: 'S3 access failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode,
      key,
      bucket: process.env.AWS_BUCKET_NAME,
    }, { status: 500 });
  }
}
