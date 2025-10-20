# 🔧 AWS S3 Permissions Fix

## Issue Identified
The AWS user `courses-user` lacks the necessary S3 permissions to access the bucket `courses-skilllearn`.

## Required Permissions
Your AWS IAM user needs the following permissions:

### 1. S3 Bucket Access
- `s3:ListBucket` - To list objects in the bucket
- `s3:GetObject` - To download/stream video files
- `s3:PutObject` - To upload new files
- `s3:DeleteObject` - To delete files (optional)

### 2. Signed URL Generation
- `s3:GetObject` - Required for generating presigned download URLs
- `s3:PutObject` - Required for generating presigned upload URLs

## How to Fix

### Option 1: Update IAM Policy (Recommended)
1. Go to AWS IAM Console
2. Find the user `courses-user`
3. Attach the policy from `aws-iam-policy.json` in this repository
4. Or create a new policy with the following JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::courses-skilllearn",
        "arn:aws:s3:::courses-skilllearn/*"
      ]
    }
  ]
}
```

### Option 2: Use AWS CLI
```bash
# Create the policy
aws iam create-policy \
  --policy-name SkillLinkS3Access \
  --policy-document file://aws-iam-policy.json

# Attach to user
aws iam attach-user-policy \
  --user-name courses-user \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/SkillLinkS3Access
```

### Option 3: Bucket Policy (Alternative)
Add this policy to your S3 bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowSkillLinkAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::601883338270:user/courses-user"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::courses-skilllearn",
        "arn:aws:s3:::courses-skilllearn/*"
      ]
    }
  ]
}
```

## Verification
After applying the permissions, run the diagnostics again:

```bash
node test-s3-diagnostics.js
```

You should see all tests passing ✅.

## Current Status
- ✅ Environment variables configured
- ✅ Signed URL generation working
- ❌ S3 bucket access (missing permissions)
- ❌ Object access (missing permissions)
- ❌ Public bucket access (expected - bucket is private)

## Expected Result After Fix
- ✅ Environment variables configured
- ✅ S3 bucket access
- ✅ Object access
- ✅ Signed URL generation
- ❌ Public bucket access (expected - bucket is private)

## Security Notes
- The bucket is correctly configured as private
- Signed URLs provide secure, time-limited access
- No public read access is needed (and not recommended)
- The current setup is secure once permissions are fixed
