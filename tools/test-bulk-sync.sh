#!/bin/bash

# Test bulk sync from CSV
# Usage: ./test-bulk-sync.sh [csv-file]

set -e

CSV_FILE="${1}"

if [ -z "$CSV_FILE" ]; then
    echo "❌ Error: CSV file is required"
    echo "Usage: ./test-bulk-sync.sh [csv-file]"
    echo ""
    echo "CSV format (no header):"
    echo "  lesson_id,course_folder,filename"
    echo ""
    echo "Example:"
    echo "  abc-123,course_folder_1,video1.mp4"
    echo "  def-456,course_folder_1,video2.mp4"
    exit 1
fi

if [ ! -f "$CSV_FILE" ]; then
    echo "❌ Error: CSV file not found: $CSV_FILE"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Missing required environment variables:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

echo "🧪 Testing bulk sync from CSV"
echo "📁 CSV file: $CSV_FILE"
echo ""

# Run the bulk sync script
node "$(dirname "$0")/bulk-sync-lessons-from-csv.js" "$CSV_FILE"

echo ""
echo "✅ Bulk sync complete!"
echo ""
echo "📋 Verify updates in Supabase:"
echo "   SELECT id, title, video_url, updated_at FROM lessons WHERE id IN ("
echo "     SELECT id FROM (VALUES"
echo "       ('lesson-id-1'),"
echo "       ('lesson-id-2')"
echo "     ) AS t(id)"
echo "   ) ORDER BY updated_at DESC;"


