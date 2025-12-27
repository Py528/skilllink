#!/bin/bash

# Configure S3 ObjectCreated events to trigger Lambda
# Usage: ./configure-s3-events.sh [function-name] [bucket-name] [region] [method]
# method: 'eventbridge' (recommended) or 'direct'

set -e

FUNCTION_NAME="${1:-s3-lesson-sync}"
BUCKET_NAME="${2}"
AWS_REGION="${3:-us-east-1}"
METHOD="${4:-eventbridge}"

if [ -z "$BUCKET_NAME" ]; then
    echo "❌ Error: BUCKET_NAME is required"
    echo "Usage: ./configure-s3-events.sh [function-name] [bucket-name] [region] [method]"
    exit 1
fi

echo "🔧 Configuring S3 events for bucket: $BUCKET_NAME"
echo "📍 Region: $AWS_REGION"
echo "🎯 Method: $METHOD"
echo ""

# Check AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI first."
    exit 1
fi

if [ "$METHOD" = "eventbridge" ]; then
    echo "📡 Configuring EventBridge (recommended)..."
    
    # Enable EventBridge on S3 bucket
    echo "   1. Enabling EventBridge on S3 bucket..."
    aws s3api put-bucket-notification-configuration \
        --bucket "$BUCKET_NAME" \
        --notification-configuration '{"EventBridgeConfiguration": {}}' \
        --region "$AWS_REGION"
    
    echo "   2. Creating EventBridge rule..."
    RULE_NAME="${FUNCTION_NAME}-s3-rule"
    
    # Check if rule exists
    if aws events describe-rule --name "$RULE_NAME" --region "$AWS_REGION" &> /dev/null; then
        echo "   Rule exists, updating..."
        aws events delete-rule --name "$RULE_NAME" --region "$AWS_REGION" 2>/dev/null || true
    fi
    
    # Create event pattern
    cat > /tmp/event-pattern.json <<EOF
{
  "source": ["aws.s3"],
  "detail-type": ["Object Created"],
  "detail": {
    "bucket": {
      "name": ["$BUCKET_NAME"]
    }
  }
}
EOF
    
    # Create rule
    aws events put-rule \
        --name "$RULE_NAME" \
        --event-pattern file:///tmp/event-pattern.json \
        --state ENABLED \
        --region "$AWS_REGION" \
        --output json > /dev/null
    
    # Get Lambda ARN
    LAMBDA_ARN=$(aws lambda get-function --function-name "$FUNCTION_NAME" --region "$AWS_REGION" --query 'Configuration.FunctionArn' --output text)
    
    # Add Lambda permission for EventBridge
    echo "   3. Adding Lambda permission..."
    STATEMENT_ID="${RULE_NAME}-$(date +%s)"
    aws lambda add-permission \
        --function-name "$FUNCTION_NAME" \
        --statement-id "$STATEMENT_ID" \
        --action 'lambda:InvokeFunction' \
        --principal events.amazonaws.com \
        --source-arn "arn:aws:events:${AWS_REGION}:$(aws sts get-caller-identity --query Account --output text):rule/${RULE_NAME}" \
        --region "$AWS_REGION" \
        --output json > /dev/null 2>&1 || echo "   Permission may already exist, continuing..."
    
    # Add Lambda as target
    echo "   4. Adding Lambda as target..."
    aws events put-targets \
        --rule "$RULE_NAME" \
        --targets "Id=1,Arn=$LAMBDA_ARN" \
        --region "$AWS_REGION" \
        --output json > /dev/null
    
    echo ""
    echo "✅ EventBridge configuration complete!"
    echo "   Rule: $RULE_NAME"
    echo "   Target: $FUNCTION_NAME"
    
elif [ "$METHOD" = "direct" ]; then
    echo "📡 Configuring direct S3 bucket notification..."
    
    # Get Lambda ARN
    LAMBDA_ARN=$(aws lambda get-function --function-name "$FUNCTION_NAME" --region "$AWS_REGION" --query 'Configuration.FunctionArn' --output text)
    
    # Add Lambda permission for S3
    echo "   1. Adding Lambda permission for S3..."
    STATEMENT_ID="s3-invoke-$(date +%s)"
    aws lambda add-permission \
        --function-name "$FUNCTION_NAME" \
        --statement-id "$STATEMENT_ID" \
        --action 'lambda:InvokeFunction' \
        --principal s3.amazonaws.com \
        --source-arn "arn:aws:s3:::$BUCKET_NAME" \
        --source-account "$(aws sts get-caller-identity --query Account --output text)" \
        --region "$AWS_REGION" \
        --output json > /dev/null 2>&1 || echo "   Permission may already exist, continuing..."
    
    # Configure S3 notification
    echo "   2. Configuring S3 bucket notification..."
    cat > /tmp/notification-config.json <<EOF
{
  "LambdaFunctionConfigurations": [
    {
      "Id": "${FUNCTION_NAME}-notification",
      "LambdaFunctionArn": "$LAMBDA_ARN",
      "Events": ["s3:ObjectCreated:*"],
      "Filter": {
        "Key": {
          "FilterRules": [
            {
              "Name": "prefix",
              "Value": "course_"
            }
          ]
        }
      }
    }
  ]
}
EOF
    
    aws s3api put-bucket-notification-configuration \
        --bucket "$BUCKET_NAME" \
        --notification-configuration file:///tmp/notification-config.json \
        --region "$AWS_REGION"
    
    echo ""
    echo "✅ Direct S3 notification configuration complete!"
    echo "   Lambda: $FUNCTION_NAME"
    echo "   Prefix filter: course_*"
fi

echo ""
echo "📋 Test with:"
echo "   ./test-single-file.sh $BUCKET_NAME <lesson-id> <test-video.mp4>"


