import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { courseId, lessonId, name, template, entryFile, packageManager } = body

    const { data, error } = await supabaseServer
      .from('ide_projects')
      .insert({
        course_id: courseId,
        lesson_id: lessonId ?? null,
        name,
        template: template ?? null,
        entry_file: entryFile ?? null,
        package_manager: packageManager ?? null,
      })
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ projectId: data.id })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}



