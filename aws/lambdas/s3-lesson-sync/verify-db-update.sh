#!/bin/bash

# Verify database update
# Usage: ./verify-db-update.sh [lesson-id] [expected-video-url]

set -e

LESSON_ID="${1}"
EXPECTED_URL="${2}"

if [ -z "$LESSON_ID" ]; then
    echo "❌ Error: lesson_id is required"
    echo "Usage: ./verify-db-update.sh [lesson-id] [expected-video-url]"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Missing required environment variables:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

echo "🔍 Verifying database update for lesson: $LESSON_ID"
echo ""

# Use Node.js to query Supabase
cat > /tmp/verify-db.js <<'EOF'
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const lessonId = process.argv[2]
const expectedUrl = process.argv[3]

const supabase = createClient(supabaseUrl, supabaseKey)

async function verify() {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, video_url, updated_at')
    .eq('id', lessonId)
    .single()

  if (error) {
    console.error('❌ Error querying database:', error.message)
    process.exit(1)
  }

  if (!data) {
    console.error('❌ Lesson not found:', lessonId)
    process.exit(1)
  }

  console.log('📊 Lesson data:')
  console.log('   ID:', data.id)
  console.log('   Title:', data.title || '(no title)')
  console.log('   Video URL:', data.video_url || '(null)')
  console.log('   Updated At:', data.updated_at)
  console.log('')

  if (expectedUrl) {
    if (data.video_url === expectedUrl) {
      console.log('✅ Video URL matches expected value!')
      process.exit(0)
    } else {
      console.log('❌ Video URL mismatch!')
      console.log('   Expected:', expectedUrl)
      console.log('   Actual:', data.video_url)
      process.exit(1)
    }
  } else {
    if (data.video_url) {
      console.log('✅ Video URL is set:', data.video_url)
      process.exit(0)
    } else {
      console.log('❌ Video URL is not set')
      process.exit(1)
    }
  }
}

verify().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
EOF

node /tmp/verify-db.js "$LESSON_ID" "$EXPECTED_URL"


