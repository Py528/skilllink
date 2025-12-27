#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: node import-lessons-from-csv.js <path-to-lessons.csv>');
    process.exit(1);
  }
  const apiBase = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const endpoint = `${apiBase}/api/courses/lessons/bulk-update`;

  const fileStream = fs.createReadStream(path.resolve(csvPath));
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let header = [];
  const rows = [];
  for await (const line of rl) {
    if (!header.length) {
      header = line.split(',');
      continue;
    }
    // naive CSV split; good enough for our generated CSV
    const cols = []; let cur = ''; let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; cur += ch; continue; }
      if (ch === ',' && !inQuotes) { cols.push(cur); cur = ''; continue; }
      cur += ch;
    }
    cols.push(cur);
    const rec = Object.fromEntries(header.map((h, i) => [h, cols[i] ?? '']));

    const parsedResources = (() => {
      try {
        return rec.resources ? JSON.parse(rec.resources) : undefined;
      } catch {
        return undefined;
      }
    })();

    const parsedContent = (() => {
      try {
        return rec.content ? JSON.parse(rec.content) : undefined;
      } catch {
        return undefined;
      }
    })();

    let videoUrl = rec.video_url || '';
    if ((!videoUrl || videoUrl === '') && Array.isArray(parsedResources) && parsedResources.length > 0) {
      const firstVideo = parsedResources.find(r => {
        const name = (r.name || '').toLowerCase();
        const type = (r.type || '').toLowerCase();
        return type.startsWith('video/') || name.endsWith('.mp4') || name.endsWith('.mov') || name.endsWith('.mkv') || name.endsWith('.webm');
      });
      if (firstVideo && firstVideo.url) {
        videoUrl = firstVideo.url;
      }
    }

    rows.push({
      id: rec.id,
      video_url: videoUrl || null,
      resources: parsedResources,
      thumbnail_url: rec.thumbnail_url || null,
      content: parsedContent,
    });
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rows),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error('Bulk update failed:', json);
    process.exit(2);
  }
  console.log('Bulk update result:', JSON.stringify(json, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
