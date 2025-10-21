# SkillLink Setup Guide

## Environment Configuration

To fix the S3/Supabase connection issues, you need to set up your environment variables.

### 1. Create Environment File

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

### 2. Configure Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use existing one
3. Go to Settings > API
4. Copy your project URL and anon key

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Configure AWS S3

1. Create an AWS account and S3 bucket
2. Create IAM user with S3 permissions
3. Get access keys

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name
AWS_BUCKET_REGION=us-east-1
```

### 4. Application Configuration

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
```

## Quick Start (Without S3/Supabase)

If you want to run the app without S3/Supabase for now:

1. The app will show fallback messages for video content
2. Course creation will work with local file handling
3. Authentication will use mock data

## Database Setup

Run the Supabase migrations:

```bash
npx supabase db reset
```

## Testing S3 Connection

Test your S3 setup:

```bash
curl -X POST http://localhost:3000/api/test-s3-access
```

## Troubleshooting

### Video Player Issues
- Check browser console for S3 connection errors
- Verify AWS credentials are correct
- Ensure S3 bucket has proper permissions

### Supabase Issues
- Verify project URL and keys
- Check RLS policies are enabled
- Ensure database migrations are applied

## Production Deployment

For production, update the environment variables:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
```