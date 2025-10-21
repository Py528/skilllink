#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up SkillLink environment...\n');

// Check if .env.local already exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
  fs.copyFileSync(envPath, path.join(process.cwd(), '.env.local.backup'));
}

// Create .env.local with template
const envTemplate = `# SkillLink Environment Configuration
# Copy this file and update with your actual credentials

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_s3_bucket_name
AWS_BUCKET_REGION=us-east-1

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# Optional: For production
# NEXT_PUBLIC_APP_URL=https://your-domain.com
# NEXTAUTH_URL=https://your-domain.com
`;

fs.writeFileSync(envPath, envTemplate);

console.log('✅ Created .env.local template');
console.log('\n📝 Next steps:');
console.log('1. Update .env.local with your actual credentials');
console.log('2. Set up Supabase project at https://supabase.com/dashboard');
console.log('3. Set up AWS S3 bucket for video storage');
console.log('4. Run: npm run dev');
console.log('\n📖 For detailed setup instructions, see SETUP.md');

console.log('\n🎯 Quick Start (without S3/Supabase):');
console.log('- The app will show fallback messages for video content');
console.log('- Course creation will work with local file handling');
console.log('- Authentication will use mock data');
console.log('\n✨ Happy coding!');


