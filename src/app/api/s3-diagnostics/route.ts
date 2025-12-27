import { NextResponse } from 'next/server';
import { S3Client, HeadObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get('prefix') || undefined;
  const diagnostics = {
    environment: {
      bucket: !!process.env.AWS_BUCKET_NAME,
      region: !!process.env.AWS_BUCKET_REGION,
      accessKey: !!process.env.AWS_ACCESS_KEY,
      secretKey: !!process.env.AWS_SECRET_KEY,
    },
    tests: [] as Array<{ test: string; status: string; message?: string; details?: unknown; error?: string; code?: number }>,
    recommendations: [] as string[],
  };

  // Test 1: Environment variables
  if (!process.env.AWS_BUCKET_NAME || !process.env.AWS_BUCKET_REGION || !process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET_KEY) {
    diagnostics.tests.push({
      test: 'Environment Variables',
      status: 'FAILED',
      message: 'Missing required AWS environment variables',
      error: 'Missing required AWS environment variables',
    });
    diagnostics.recommendations.push('Add all required AWS environment variables to .env.local');
    return NextResponse.json(diagnostics, { status: 500 });
  }

  diagnostics.tests.push({
    test: 'Environment Variables',
    status: 'PASSED',
    message: 'All required AWS environment variables are present',
    details: {
      bucket: process.env.AWS_BUCKET_NAME,
      region: process.env.AWS_BUCKET_REGION,
    },
  });

  try {
    // Test 2: List objects in bucket
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.AWS_BUCKET_NAME!,
        MaxKeys: 50,
        Prefix: prefix,
      });
      const listResult = await s3.send(listCommand);
      
      diagnostics.tests.push({
        test: 'Bucket Access (List)',
        status: 'PASSED',
        details: {
          objectCount: listResult.Contents?.length || 0,
          prefix: prefix || null,
          sampleObjects: listResult.Contents?.slice(0, 10).map(obj => ({
            key: obj.Key,
            size: obj.Size,
            lastModified: obj.LastModified,
          })) || [],
        },
      });
    } catch (error: unknown) {
      diagnostics.tests.push({
        test: 'Bucket Access (List)',
        status: 'FAILED',
        error: (error as Error).message,
        code: (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode,
      });
      diagnostics.recommendations.push('Check AWS credentials have s3:ListBucket permission');
    }

    // Test 3: Try to access a sample object
    const sampleKey = 'test-video.mp4'; // This might not exist, but we'll test the permission
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: sampleKey,
      });
      await s3.send(headCommand);
      
      diagnostics.tests.push({
        test: 'Object Access (Head)',
        status: 'PASSED',
        details: { key: sampleKey },
      });
    } catch (error: unknown) {
      if ((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404) {
        diagnostics.tests.push({
          test: 'Object Access (Head)',
          status: 'PASSED',
          details: { key: sampleKey, note: 'Object not found (expected for test key)' },
        });
      } else {
        diagnostics.tests.push({
          test: 'Object Access (Head)',
          status: 'FAILED',
          error: (error as Error).message,
          code: (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode,
        });
        diagnostics.recommendations.push('Check AWS credentials have s3:GetObject permission');
      }
    }

    // Test 4: Try to generate a signed URL
    try {
      const getCommand = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: sampleKey,
      });
      const signedUrl = await getSignedUrl(s3, getCommand, { expiresIn: 3600 });
      
      diagnostics.tests.push({
        test: 'Signed URL Generation',
        status: 'PASSED',
        details: { 
          key: sampleKey,
          urlGenerated: !!signedUrl,
          urlLength: signedUrl.length,
        },
      });
    } catch (error: unknown) {
      diagnostics.tests.push({
        test: 'Signed URL Generation',
        status: 'FAILED',
        error: (error as Error).message,
        code: (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode,
      });
      diagnostics.recommendations.push('Check AWS credentials have s3:GetObject permission for signed URL generation');
    }

    // Test 5: Check if bucket is public
    try {
      const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/test-video.mp4`;
      const response = await fetch(publicUrl, { method: 'HEAD' });
      
      diagnostics.tests.push({
        test: 'Public Bucket Access',
        status: response.ok ? 'PASSED' : 'FAILED',
        details: {
          status: response.status,
          statusText: response.statusText,
          isPublic: response.ok,
        },
      });
      
      if (!response.ok) {
        diagnostics.recommendations.push('Bucket is private (good for security). Ensure signed URLs are working.');
      }
    } catch (error: unknown) {
      diagnostics.tests.push({
        test: 'Public Bucket Access',
        status: 'FAILED',
        error: (error as Error).message,
      });
    }

  } catch (error: unknown) {
    diagnostics.tests.push({
      test: 'General S3 Connection',
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    diagnostics.recommendations.push('Check AWS credentials and region configuration');
  }

  // Add general recommendations
  if (diagnostics.recommendations.length === 0) {
    diagnostics.recommendations.push('S3 configuration appears to be working correctly');
  }

  return NextResponse.json(diagnostics);
}
