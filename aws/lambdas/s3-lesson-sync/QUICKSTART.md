# Quick Start Deployment

## Prerequisites Check

```bash
# Check AWS CLI
aws --version

# Check Node.js
node --version  # Should be 18+

# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## Deploy (3 Steps)

### 1. Deploy Lambda
```bash
cd aws/lambdas/s3-lesson-sync
./deploy.sh s3-lesson-sync us-east-1 your-bucket-name
```

### 2. Configure S3 Events
```bash
./configure-s3-events.sh s3-lesson-sync your-bucket-name us-east-1 eventbridge
```

### 3. Test
```bash
# Get a lesson ID from your database first
LESSON_ID="your-lesson-uuid"
./test-single-file.sh your-bucket-name "$LESSON_ID" test-video.mp4 us-east-1

# Verify
./verify-db-update.sh "$LESSON_ID"
```

## What Happens

1. **Lambda deployed** with Supabase credentials
2. **S3 events configured** to trigger Lambda on file uploads
3. **Test upload** verifies the sync works

## Monitor

```bash
# Watch logs
aws logs tail /aws/lambda/s3-lesson-sync --follow
```

## Full Documentation

See `DEPLOYMENT.md` for detailed instructions and troubleshooting.







