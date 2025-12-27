import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const region = (process.env.AWS_BUCKET_REGION || process.env.AWS_REGION) as string
const bucket = process.env.AWS_BUCKET_NAME as string
const accessKeyId = (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY) as string
const secretAccessKey = (process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_KEY) as string

export const s3 = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } })

export async function presignGetObject(key: string, expiresInSeconds = 600) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key })
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds })
}

export function extractS3KeyFromUrl(url: string) {
  try {
    const u = new URL(url)
    // handle virtual-hosted–style and path-style
    // virtual: https://bucket.s3.region.amazonaws.com/key
    // path:    https://s3.region.amazonaws.com/bucket/key
    const hostParts = u.hostname.split('.')
    if (hostParts[0] !== 's3') {
      // virtual hosted
      const key = u.pathname.replace(/^\//, '')
      return key
    }
    // path-style
    const [, , ] = hostParts // ignore
    const [, ...rest] = u.pathname.replace(/^\//, '').split('/')
    return rest.join('/')
  } catch {
    return url
  }
}


