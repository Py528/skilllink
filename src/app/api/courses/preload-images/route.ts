import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  try {
    if (!supabaseUrl || !supabaseKey) {
      // Return empty response instead of error to prevent dashboard issues
      return NextResponse.json({ images: [] });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch course thumbnails for preloading
    const { data: courses, error } = await supabase
      .from('courses')
      .select('thumbnail_url')
      .eq('is_published', true)
      .not('thumbnail_url', 'is', null)
      .limit(20);

    if (error) {
      console.error('Error fetching course images:', error);
      // Return empty response instead of error
      return NextResponse.json({ images: [] });
    }

    const images = (courses || [])
      .map(course => course.thumbnail_url)
      .filter(Boolean) as string[];

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error in preload-images:', error);
    // Return empty response to prevent dashboard issues
    return NextResponse.json({ images: [] });
  }
}


