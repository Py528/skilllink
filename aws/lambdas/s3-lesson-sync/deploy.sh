#!/bin/bash

# Deploy Lambda function for S3 → Supabase sync
# Usage: ./deploy.sh [function-name] [region] [bucket-name]

set -e

FUNCTION_NAME="${1:-s3-lesson-sync}"
AWS_REGION="${2:-us-east-1}"
BUCKET_NAME="${3}"

echo "🚀 Deploying Lambda: $FUNCTION_NAME"
echo "📍 Region: $AWS_REGION"
echo ""

# Check AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI first."
    exit 1
fi

# Check required environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Missing required environment variables:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create deployment package
echo "📦 Creating deployment package..."
zip -r function.zip index.js node_modules/ -q

# Create or update Lambda function
echo "🔧 Creating/updating Lambda function..."

# Check if function exists
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$AWS_REGION" &> /dev/null; then
    echo "   Function exists, updating code..."
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file fileb://function.zip \
        --region "$AWS_REGION" \
        --output json > /dev/null
    
    echo "   Updating environment variables..."
    aws lambda update-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --environment "Variables={NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY}" \
        --region "$AWS_REGION" \
        --output json > /dev/null
else
    echo "   Creating new function..."
    
    # Create IAM role for Lambda (basic execution role)
    ROLE_NAME="${FUNCTION_NAME}-execution-role"
    
    # Check if role exists
    if ! aws iam get-role --role-name "$ROLE_NAME" &> /dev/null; then
        echo "   Creating IAM role..."
        cat > /tmp/trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
        
        aws iam create-role \
            --role-name "$ROLE_NAME" \
            --assume-role-policy-document file:///tmp/trust-policy.json \
            --region "$AWS_REGION" \
            --output json > /dev/null
        
        # Attach CloudWatch Logs policy
        aws iam attach-role-policy \
            --role-name "$ROLE_NAME" \
            --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
            --region "$AWS_REGION"
        
        echo "   Waiting for IAM role to propagate..."
        sleep 5
    fi
    
    ROLE_ARN=$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)
    
    aws lambda create-function \
        --function-name "$FUNCTION_NAME" \
        --runtime nodejs18.x \
        --role "$ROLE_ARN" \
        --handler index.handler \
        --zip-file fileb://function.zip \
        --environment "Variables={NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY}" \
        --timeout 30 \
        --memory-size 256 \
        --region "$AWS_REGION" \
        --output json
    
    echo "✅ Lambda function created: $FUNCTION_NAME"
fi

# Clean up
rm -f function.zip

echo ""
echo "✅ Lambda deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Configure S3 → Lambda trigger (see configure-s3-events.sh)"
echo "   2. Test with: ./test-single-file.sh"
echo "   3. Monitor logs: aws logs tail /aws/lambda/$FUNCTION_NAME --follow"


