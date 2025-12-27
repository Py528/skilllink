'use strict'

// Minimal Lambda: handle S3 ObjectCreated events and update lessons.video_url directly.
// Triggers on S3 ObjectCreated events.
// Updates lessons.video_url directly using SUPABASE_SERVICE_ROLE_KEY.
// Stores only the S3 key; no heuristics or webhook.

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function isVideoKey(key) {
  return key && /\.(mp4|mov|mkv|webm|avi)$/i.test(key)
}

exports.handler = async (event) => {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error('Missing Supabase envs: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
  const records = Array.isArray(event?.Records) ? event.Records : []
  const logs = []
  let updated = 0

  for (const rec of records) {
    const keyEncoded = rec?.s3?.object?.key || ''
    const key = decodeURIComponent(String(keyEncoded).replace(/\+/g, ' '))
    
    // Skip non-video files
    if (!isVideoKey(key)) {
      logs.push(`Skip non-video: ${key}`)
      continue
    }

    // lesson_id must be provided via S3 object metadata (x-amz-meta-lesson-id)
    // This is set when uploading the file
    const metaLessonId = rec?.s3?.object?.userMetadata?.['lesson-id'] || 
                         rec?.s3?.object?.userMetadata?.['lesson_id'] ||
                         rec?.s3?.object?.metadata?.['lesson-id'] ||
                         rec?.s3?.object?.metadata?.['lesson_id']

    if (!metaLessonId || !/[0-9a-f-]{36}/i.test(metaLessonId)) {
      logs.push(`No lesson_id metadata provided for ${key}`)
      continue
    }

    // Store only the S3 key (no query params, no full URLs)
    const keyToStore = key.split('?')[0] // Remove any query params if present

    const { error } = await supabase
      .from('lessons')
      .update({ video_url: keyToStore })
      .eq('id', metaLessonId)

    if (error) {
      logs.push(`Update failed for lesson ${metaLessonId}: ${error.message}`)
      continue
    }

    updated++
    logs.push(`Updated lesson ${metaLessonId} -> ${keyToStore}`)
  }

  return { ok: true, updated, logs }
}


