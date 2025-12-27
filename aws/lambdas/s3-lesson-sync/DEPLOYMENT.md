# S3 → Supabase Sync Deployment Guide

This guide walks through deploying the minimal S3 → Supabase sync Lambda function.

## Prerequisites

1. **AWS CLI** installed and configured with credentials
   ```bash
   aws --version
   aws configure
   ```

2. **Node.js 18+** installed
   ```bash
   node --version
   ```

3. **Environment variables** set:
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

4. **S3 bucket** created (or use existing)
   ```bash
   aws s3 ls  # List your buckets
   ```

## Step 1: Deploy Lambda Function

Navigate to the Lambda directory:
```bash
cd aws/lambdas/s3-lesson-sync
```

Deploy the function:
```bash
./deploy.sh [function-name] [region] [bucket-name]
```

**Example:**
```bash
./deploy.sh s3-lesson-sync us-east-1 my-course-bucket
```

**What this does:**
- Installs dependencies (`@supabase/supabase-js`)
- Creates deployment package (zip)
- Creates/updates Lambda function with:
  - Node.js 18.x runtime
  - Environment variables (Supabase URL and key)
  - IAM role with CloudWatch Logs permissions
  - 256MB memory, 30s timeout

**Expected output:**
```
🚀 Deploying Lambda: s3-lesson-sync
📍 Region: us-east-1
📦 Installing dependencies...
📦 Creating deployment package...
🔧 Creating/updating Lambda function...
✅ Lambda deployment complete!
```

## Step 2: Configure S3 Event Triggers

Choose one method:

### Option A: EventBridge (Recommended)

```bash
./configure-s3-events.sh [function-name] [bucket-name] [region] eventbridge
```

**Example:**
```bash
./configure-s3-events.sh s3-lesson-sync my-course-bucket us-east-1 eventbridge
```

**What this does:**
- Enables EventBridge on S3 bucket
- Creates EventBridge rule for `Object Created` events
- Adds Lambda as target
- Configures Lambda permissions

### Option B: Direct S3 Notification

```bash
./configure-s3-events.sh [function-name] [bucket-name] [region] direct
```

**Example:**
```bash
./configure-s3-events.sh s3-lesson-sync my-course-bucket us-east-1 direct
```

**What this does:**
- Configures S3 bucket notification directly to Lambda
- Filters for keys starting with `course_` prefix
- Adds Lambda permissions for S3

## Step 3: Verification Tests

### Test 1: Single File Upload

Upload a test video with metadata:

```bash
./test-single-file.sh [bucket-name] [lesson-id] [video-file] [region]
```

**Example:**
```bash
# First, get a lesson ID from your Supabase database
LESSON_ID="abc123-def456-789-012-34567890abcd"
./test-single-file.sh my-course-bucket "$LESSON_ID" test-video.mp4 us-east-1
```

**What this does:**
- Uploads video to S3 with `x-amz-meta-lesson-id` metadata
- Waits 5 seconds for Lambda processing
- Provides commands to verify in CloudWatch and Supabase

**Verify in database:**
```bash
./verify-db-update.sh "$LESSON_ID" "course_test_<timestamp>/videos/test-video.mp4"
```

### Test 2: Bulk CSV Sync

Create a test CSV file:
```csv
lesson-id-1,course_folder_1,video1.mp4
lesson-id-2,course_folder_1,video2.mp4
lesson-id-3,course_folder_2,video3.mp4
```

Run bulk sync:
```bash
cd ../../tools
./test-bulk-sync.sh test-lessons.csv
```

**Verify in Supabase:**
```sql
SELECT id, title, video_url, updated_at 
FROM lessons 
WHERE id IN ('lesson-id-1', 'lesson-id-2', 'lesson-id-3')
ORDER BY updated_at DESC;
```

### Test 3: Monitor CloudWatch Logs

Watch Lambda execution logs:
```bash
aws logs tail /aws/lambda/s3-lesson-sync --follow
```

**Expected log entries:**
- `Updated lesson <uuid> -> <s3-key>` (success)
- `No lesson_id metadata provided for <key>` (skipped)
- `Skip non-video: <key>` (skipped)
- `Update failed for lesson <uuid>: <error>` (error)

## Step 4: Production Checklist

- [ ] Lambda function deployed with correct environment variables
- [ ] S3 events configured (EventBridge or direct)
- [ ] CloudWatch Logs accessible
- [ ] Single file test passed
- [ ] Bulk CSV sync test passed
- [ ] Database updates verified
- [ ] Video playback works with presigned URLs

## Troubleshooting

### Lambda not triggering
- Check S3 event configuration: `aws s3api get-bucket-notification-configuration --bucket <bucket>`
- Check EventBridge rule: `aws events describe-rule --name <rule-name>`
- Verify Lambda permissions: `aws lambda get-policy --function-name s3-lesson-sync`

### "No lesson_id metadata provided"
- Ensure upload includes metadata: `aws s3 cp file.mp4 s3://bucket/key --metadata "lesson-id=uuid"`
- Check S3 object metadata: `aws s3api head-object --bucket <bucket> --key <key>`

### "Update failed" errors
- Verify Supabase service role key is correct
- Check RLS policies allow updates
- Verify lesson ID exists in database

### No CloudWatch logs
- Check IAM role has `logs:CreateLogGroup` and `logs:CreateLogStream` permissions
- Verify CloudWatch Logs group exists: `aws logs describe-log-groups --log-group-name-prefix /aws/lambda/s3-lesson-sync`

## Manual Verification Commands

**Check Lambda function:**
```bash
aws lambda get-function --function-name s3-lesson-sync
```

**Check Lambda environment:**
```bash
aws lambda get-function-configuration --function-name s3-lesson-sync --query 'Environment'
```

**Test Lambda manually:**
```bash
# Create test event
cat > /tmp/test-event.json <<EOF
{
  "Records": [
    {
      "s3": {
        "object": {
          "key": "course_test/videos/test.mp4",
          "userMetadata": {
            "lesson-id": "your-lesson-uuid"
          }
        }
      }
    }
  ]
}
EOF

# Invoke Lambda
aws lambda invoke \
  --function-name s3-lesson-sync \
  --payload file:///tmp/test-event.json \
  /tmp/response.json

# Check response
cat /tmp/response.json
```

**Check recent Lambda invocations:**
```bash
aws lambda list-functions --query "Functions[?FunctionName=='s3-lesson-sync']"
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=s3-lesson-sync \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum
```

## Next Steps

1. Monitor CloudWatch logs for the first few days
2. Set up CloudWatch alarms for Lambda errors
3. Document your S3 bucket structure and course folder naming
4. Train team on uploading videos with correct metadata


