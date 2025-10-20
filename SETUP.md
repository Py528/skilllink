# SkillLink Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- AWS account with S3 bucket

### 1. Clone and Install
```bash
git clone <repository-url>
cd skilllink
npm install
```

### 2. Environment Variables
Create `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AWS S3 Configuration
AWS_BUCKET_NAME=your_s3_bucket_name
AWS_BUCKET_REGION=your_s3_region
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup
Run the Supabase migrations:
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 4. Start Development Server
```bash
npm run dev
```

## 🔧 Troubleshooting

### S3 Video Streaming Issues

If videos are not loading, run the S3 diagnostics:

```bash
# Start your dev server first
npm run dev

# In another terminal, run diagnostics
node test-s3-diagnostics.js
```

**Common S3 Issues:**

1. **Missing AWS Permissions**
   - Ensure your AWS credentials have `s3:GetObject` permission
   - Add this policy to your IAM user:
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
           "arn:aws:s3:::your-bucket-name",
           "arn:aws:s3:::your-bucket-name/*"
         ]
       }
     ]
   }
   ```

2. **Bucket Configuration**
   - Ensure bucket is in the correct region
   - Check bucket permissions and CORS settings

3. **Environment Variables**
   - Verify all AWS environment variables are set correctly
   - Check for typos in bucket name and region

### Database Issues

1. **Migration Errors**
   ```bash
   # Reset database (WARNING: This will delete all data)
   supabase db reset
   
   # Re-run migrations
   supabase db push
   ```

2. **RLS Policies**
   - Ensure Row Level Security is enabled
   - Check that policies are correctly configured

### Authentication Issues

1. **Supabase Configuration**
   - Verify Supabase URL and keys
   - Check authentication settings in Supabase dashboard

2. **OAuth Providers**
   - Configure GitHub/Google OAuth in Supabase
   - Set correct redirect URLs

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── courses/           # Course-related pages
│   └── dashboard/         # Dashboard pages
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── common/           # Shared components
│   ├── courses/          # Course-specific components
│   ├── dashboard/        # Dashboard components
│   └── ui/               # UI component library
├── lib/                  # Utility functions
├── providers/            # React context providers
├── services/             # API service functions
└── types/                # TypeScript type definitions
```

## 🛠️ Development

### Code Quality
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint -- --fix

# Type checking
npm run type-check
```

### Testing
```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📊 Monitoring

### Error Tracking
- Errors are logged using the custom logger
- Check browser console for client-side errors
- Check server logs for API errors

### Performance
- Use Next.js built-in analytics
- Monitor Core Web Vitals
- Check bundle size with `npm run analyze`

## 🔒 Security

### Environment Variables
- Never commit `.env.local` to version control
- Use different credentials for development/production
- Rotate AWS keys regularly

### Database Security
- Enable RLS on all tables
- Use service role key only on server-side
- Implement proper authentication checks

## 📝 API Documentation

### Course Management
- `POST /api/courses` - Create course
- `GET /api/courses/[id]` - Get course details
- `PUT /api/courses/[id]` - Update course

### File Upload
- `POST /api/s3-presign-upload` - Get upload URL
- `POST /api/s3-presign-download` - Get download URL
- `POST /api/courses/bulk-upload` - Bulk upload files

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

## 🆘 Support

### Common Issues
1. **Videos not loading**: Check S3 permissions and bucket configuration
2. **Authentication failing**: Verify Supabase configuration
3. **Database errors**: Check migration status and RLS policies
4. **Build failures**: Ensure all environment variables are set

### Getting Help
1. Check the troubleshooting section above
2. Run the S3 diagnostics script
3. Check browser console and server logs
4. Verify all environment variables are correct

### Reporting Issues
When reporting issues, please include:
- Error messages from console/logs
- Steps to reproduce
- Environment details (OS, Node version, etc.)
- Output from diagnostics scripts
