# S3 → Supabase Sync Deployment Status

## Overview

This document tracks the deployment status of the minimal S3 → Supabase sync system.

## Architecture

- **Lambda Function**: `s3-lesson-sync`
  - Triggers on S3 `ObjectCreated` events
  - Updates `lessons.video_url` directly using `SUPABASE_SERVICE_ROLE_KEY`
  - Stores only S3 key (e.g., `course_<folder>/videos/<filename>`)
  - Requires `lesson_id` via S3 object metadata (`x-amz-meta-lesson-id`)

- **Bulk Sync**: `tools/bulk-sync-lessons-from-csv.js`
  - CSV format: `lesson_id,course_folder,filename`
  - Updates `lessons.video_url` explicitly

## Deployment Steps

### 1. Lambda Deployment

**Status**: ⏳ Ready to deploy

**Commands:**
```bash
cd aws/lambdas/s3-lesson-sync
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
./deploy.sh s3-lesson-sync us-east-1 your-bucket-name
```

**Requirements:**
- ✅ Node.js 18+ runtime
- ✅ Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- ✅ CloudWatch Logs permissions (auto-configured)
- ✅ Dependencies packaged (`@supabase/supabase-js`)

### 2. S3 Event Wiring

**Status**: ⏳ Ready to configure

**Option A: EventBridge (Recommended)**
```bash
./configure-s3-events.sh s3-lesson-sync your-bucket-name us-east-1 eventbridge
```

**Option B: Direct S3 Notification**
```bash
./configure-s3-events.sh s3-lesson-sync your-bucket-name us-east-1 direct
```

**Requirements:**
- ✅ S3 bucket exists
- ✅ Lambda function deployed
- ✅ IAM permissions for EventBridge/S3 → Lambda

### 3. Verification Tests

#### Test 1: Single File Upload

**Status**: ⏳ Ready to test

**Command:**
```bash
./test-single-file.sh your-bucket-name lesson-uuid test-video.mp4 us-east-1
```

**Verify:**
```bash
./verify-db-update.sh lesson-uuid expected-s3-key
```

**Expected Result:**
- ✅ File uploaded to S3 with metadata
- ✅ Lambda triggered within seconds
- ✅ `lessons.video_url` updated in Supabase
- ✅ CloudWatch logs show success message

#### Test 2: Bulk CSV Sync

**Status**: ⏳ Ready to test

**Command:**
```bash
cd ../../tools
./test-bulk-sync.sh test-lessons.csv
```

**Verify:**
```sql
SELECT id, title, video_url, updated_at 
FROM lessons 
WHERE id IN ('lesson-id-1', 'lesson-id-2')
ORDER BY updated_at DESC;
```

**Expected Result:**
- ✅ All CSV rows processed
- ✅ All `lessons.video_url` updated correctly
- ✅ Summary shows updated count and errors (if any)

#### Test 3: Playback Verification

**Status**: ⏳ Ready to test

**Steps:**
1. Navigate to a lesson with `video_url` set
2. Verify video player loads presigned URL
3. Check browser network tab for presigned S3 URL
4. Video should play correctly

**Expected Result:**
- ✅ Presigned URL generated from stored S3 key
- ✅ Video loads and plays
- ✅ URL expires after configured time (typically 1-2 hours)

### 4. Monitoring

**Status**: ⏳ Ready to monitor

**CloudWatch Logs:**
```bash
aws logs tail /aws/lambda/s3-lesson-sync --follow
```

**Expected Log Patterns:**
- ✅ `Updated lesson <uuid> -> <s3-key>` (success)
- ⚠️ `No lesson_id metadata provided for <key>` (skipped - expected for non-lesson uploads)
- ⚠️ `Skip non-video: <key>` (skipped - expected for non-video files)
- ❌ `Update failed for lesson <uuid>: <error>` (error - investigate)

## Deployment Checklist

- [ ] AWS CLI installed and configured
- [ ] Node.js 18+ installed
- [ ] Environment variables set (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] Lambda function deployed (`./deploy.sh`)
- [ ] S3 events configured (`./configure-s3-events.sh`)
- [ ] Single file test passed (`./test-single-file.sh`)
- [ ] Bulk CSV sync test passed (`./test-bulk-sync.sh`)
- [ ] Database updates verified (`./verify-db-update.sh`)
- [ ] CloudWatch logs accessible
- [ ] Playback test passed (video loads with presigned URL)
- [ ] Monitoring alerts configured (optional)

## Known Issues

_None reported yet. Track any issues here._

## Next Actions

1. **Execute deployment** using the commands above
2. **Run verification tests** to confirm everything works
3. **Monitor CloudWatch logs** for first few days
4. **Document any issues** encountered
5. **Set up CloudWatch alarms** for Lambda errors (optional)

## Notes

- Lambda uses only S3 object metadata to identify lessons (no heuristics)
- Old API routes with filename inference have been removed
- Bulk sync script is deterministic (CSV → explicit updates)
- Presigned URLs are generated at playback time, not stored


