import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side bulk update of lessons media fields
// Requires SUPABASE_SERVICE_ROLE_KEY on server

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server misconfigured: missing Supabase envs' }, { status: 500 })
    }

    const updates = await req.json().catch(() => null) as Array<{
      id: string
      video_url?: string | null
      resources?: unknown[]
      thumbnail_url?: string | null
      content?: Record<string, unknown>
    }> | null

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'Body must be a non-empty array of lesson updates' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // Chunk updates to avoid payload limits
    const chunkSize = 100
    const results: Array<{ ok: boolean; count?: number; error?: string }> = []
    for (let i = 0; i < updates.length; i += chunkSize) {
      const chunk = updates.slice(i, i + chunkSize)
      // Build row-wise updates; only send allowed fields
      const rows = chunk.map(u => ({
        id: u.id,
        video_url: u.video_url ?? null,
        resources: u.resources ?? undefined,
        thumbnail_url: u.thumbnail_url ?? undefined,
        content: u.content ?? undefined,
        updated_at: new Date().toISOString(),
      }))

      const { error, count } = await supabase
        .from('lessons')
        .upsert(rows, { onConflict: 'id', ignoreDuplicates: false })
        .select('id', { count: 'exact', head: true })

      if (error) {
        results.push({ ok: false, error: error.message })
      } else {
        results.push({ ok: true, count: count ?? rows.length })
      }
    }

    const failed = results.filter(r => !r.ok)
    if (failed.length > 0) {
      return NextResponse.json({ ok: false, results }, { status: 207 })
    }
    return NextResponse.json({ ok: true, results })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}




