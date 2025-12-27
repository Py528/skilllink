import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

const BUCKET = 'ide-code'

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params
    const { path, contentBase64, contentType } = await req.json()
    if (!path || !contentBase64) return NextResponse.json({ error: 'path and contentBase64 required' }, { status: 400 })

    const storagePath = `${projectId}/${path}`
    const buffer = Buffer.from(contentBase64, 'base64')

    const { error: uploadErr } = await supabaseServer.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: contentType || 'application/octet-stream',
        upsert: true,
      })
    if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 400 })

    // Index the file (creates new version)
    const { data: latest, error: latestErr } = await supabaseServer
      .from('ide_files')
      .select('version')
      .eq('project_id', projectId)
      .eq('path', path)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (latestErr) return NextResponse.json({ error: latestErr.message }, { status: 400 })

    const nextVersion = latest?.version ? latest.version + 1 : 1
    const { data: inserted, error: insertErr } = await supabaseServer
      .from('ide_files')
      .insert({
        project_id: projectId,
        path,
        url: storagePath,
        storage: 'supabase',
        version: nextVersion,
        content_type: contentType || null,
        size_bytes: buffer.length,
      })
      .select('id, version')
      .single()
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 400 })

    // Signed URL for immediate consumption
    const { data: signed, error: signErr } = await supabaseServer.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 60 * 10) // 10 minutes
    if (signErr) return NextResponse.json({ error: signErr.message }, { status: 400 })

    return NextResponse.json({ id: inserted.id, version: inserted.version, url: signed.signedUrl })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}


