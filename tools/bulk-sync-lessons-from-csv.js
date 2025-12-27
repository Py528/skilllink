#!/usr/bin/env node

// Minimal CSV bulk updater for lessons.video_url
// CSV format (no header autodetect): lesson_id,course_folder,filename
// - Stores video_url as: course_folder + '/videos/' + filename
// - Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { createClient } = require('@supabase/supabase-js')

async function main() {
  const csvPath = process.argv[2]
  if (!csvPath) {
    console.error('Usage: node tools/bulk-sync-lessons-from-csv.js <path-to.csv>')
    process.exit(1)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(2)
  }

  const supabase = createClient(url, key)
  const rl = readline.createInterface({ input: fs.createReadStream(path.resolve(csvPath)), crlfDelay: Infinity })

  let lineNo = 0
  let updated = 0
  const errors = []
  for await (const line of rl) {
    lineNo++
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [lessonId, courseFolder, filename] = trimmed.split(',').map(s => s?.trim())
    if (!lessonId || !courseFolder || !filename) { errors.push(`Line ${lineNo}: invalid record`); continue }
    const keyToStore = `${courseFolder.replace(/\/$/, '')}/videos/${filename.replace(/^\//, '')}`
    const { error } = await supabase.from('lessons').update({ video_url: keyToStore }).eq('id', lessonId)
    if (error) { errors.push(`Line ${lineNo}: ${error.message}`); continue }
    updated++
    console.log(`Updated ${lessonId} -> ${keyToStore}`)
  }

  console.log(`\nDone. Updated: ${updated}. Errors: ${errors.length}`)
  if (errors.length) {
    console.log('Errors:')
    errors.forEach(e => console.log(' -', e))
  }
}

main().catch(err => { console.error(err); process.exit(1) })


