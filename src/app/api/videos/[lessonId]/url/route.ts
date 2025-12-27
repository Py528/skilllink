import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { extractS3KeyFromUrl, presignGetObject } from '@/lib/s3'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const { lessonId } = await params
    const { data, error } = await supabaseServer
      .from('lessons')
      .select('video_url, transcript_url')
      .eq('id', lessonId)
      .single()

    if (error || !data) return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 })

    let videoUrl = data.video_url
    if (videoUrl && videoUrl.includes('s3')) {
      const key = extractS3KeyFromUrl(videoUrl)
      videoUrl = await presignGetObject(key)
    }
    // Transcript: best-effort presign if looks like S3
    let transcriptUrl = data.transcript_url
    if (transcriptUrl && transcriptUrl.includes('s3')) {
      const key = extractS3KeyFromUrl(transcriptUrl)
      transcriptUrl = await presignGetObject(key)
    }
    return NextResponse.json({ videoUrl, transcriptUrl })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}


