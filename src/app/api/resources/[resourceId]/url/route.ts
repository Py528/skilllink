import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { extractS3KeyFromUrl, presignGetObject } from '@/lib/s3'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ resourceId: string }> }) {
  try {
    const { resourceId } = await params
    const { data, error } = await supabaseServer
      .from('lesson_resources')
      .select('url, storage')
      .eq('id', resourceId)
      .single()

    if (error || !data) return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 })

    if (data.storage === 'supabase') {
      const [projectId, ...rest] = data.url.split('/')
      const storagePath = `${projectId}/${rest.join('/')}`
      const { data: signed, error: signErr } = await supabaseServer.storage
        .from('ide-code')
        .createSignedUrl(storagePath, 60 * 10)
      if (signErr) return NextResponse.json({ error: signErr.message }, { status: 400 })
      return NextResponse.json({ url: signed.signedUrl, storage: 'supabase' })
    }

    // S3 case: presign
    const key = extractS3KeyFromUrl(data.url)
    const signed = await presignGetObject(key)
    return NextResponse.json({ url: signed, storage: 's3' })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}


