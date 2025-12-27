import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params
    const { data, error } = await supabaseServer
      .from('ide_files')
      .select('id, path, url, storage, version, size_bytes, content_type, checksum_sha256')
      .eq('project_id', projectId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ files: data ?? [] })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params
    const body = await req.json()
    const { path, url, storage = 'supabase', sizeBytes, contentType, checksumSha256 } = body
    if (!path || !url) return NextResponse.json({ error: 'path and url required' }, { status: 400 })

    // Get latest version for this path
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

    const { data, error } = await supabaseServer
      .from('ide_files')
      .insert({
        project_id: projectId,
        path,
        url,
        storage,
        size_bytes: sizeBytes ?? null,
        content_type: contentType ?? null,
        checksum_sha256: checksumSha256 ?? null,
        version: nextVersion,
      })
      .select('id, version')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ id: data.id, version: data.version })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}


