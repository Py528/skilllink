#!/bin/bash

# Test single file upload with metadata
# Usage: ./test-single-file.sh [bucket-name] [lesson-id] [video-file] [region]

set -e

BUCKET_NAME="${1}"
LESSON_ID="${2}"
VIDEO_FILE="${3}"
AWS_REGION="${4:-us-east-1}"

if [ -z "$BUCKET_NAME" ] || [ -z "$LESSON_ID" ] || [ -z "$VIDEO_FILE" ]; then
    echo "❌ Error: Missing required arguments"
    echo "Usage: ./test-single-file.sh [bucket-name] [lesson-id] [video-file] [region]"
    echo ""
    echo "Example:"
    echo "  ./test-single-file.sh my-bucket abc123-def456-789 test-video.mp4"
    exit 1
fi

if [ ! -f "$VIDEO_FILE" ]; then
    echo "❌ Error: Video file not found: $VIDEO_FILE"
    exit 1
fi

echo "🧪 Testing single file upload with metadata"
echo "📍 Bucket: $BUCKET_NAME"
echo "📍 Region: $AWS_REGION"
echo "🎯 Lesson ID: $LESSON_ID"
echo "📁 File: $VIDEO_FILE"
echo ""

# Generate test S3 key
TIMESTAMP=$(date +%s)
S3_KEY="course_test_${TIMESTAMP}/videos/$(basename "$VIDEO_FILE")"

echo "📤 Uploading to S3 with metadata..."
aws s3 cp "$VIDEO_FILE" "s3://${BUCKET_NAME}/${S3_KEY}" \
    --metadata "lesson-id=$LESSON_ID" \
    --region "$AWS_REGION" \
    --output json

echo ""
echo "✅ File uploaded: s3://${BUCKET_NAME}/${S3_KEY}"
echo ""
echo "⏳ Waiting 5 seconds for Lambda to process..."
sleep 5

echo ""
echo "📋 Checking CloudWatch logs..."
FUNCTION_NAME="s3-lesson-sync"
echo "   Run: aws logs tail /aws/lambda/$FUNCTION_NAME --follow"
echo ""

echo "📋 Verifying in Supabase..."
echo "   Query: SELECT id, title, video_url, updated_at FROM lessons WHERE id = '$LESSON_ID';"
echo ""
echo "   Expected video_url: $S3_KEY"
echo ""
echo "💡 To verify programmatically, use:"
echo "   ./verify-db-update.sh $LESSON_ID '$S3_KEY'"


