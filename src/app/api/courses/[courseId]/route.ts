import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }

    // Fetch course data
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:profiles!courses_instructor_id_fkey(
          full_name,
          avatar_url
        )
      `)
      .eq('id', courseId)
      .single();

    if (error) {
      console.error('Error fetching course:', error);
      return NextResponse.json(
        { error: 'Failed to fetch course' },
        { status: 500 }
      );
    }

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Process course data
    const processedCourse = {
      ...course,
      instructor_name: course.instructor?.full_name || 'Unknown Instructor',
      instructor_avatar: course.instructor?.avatar_url || '/default-avatar.svg',
      student_count: course.total_enrollments || 0,
      rating: course.average_rating || 0,
      duration: course.estimated_duration ? `${Math.floor(course.estimated_duration / 60)}h ${course.estimated_duration % 60}m` : 'Not specified',
      level: course.difficulty_level || 'Beginner',
      category: course.category || 'Uncategorized',
      content_folder_id: course.content_folder_id
    };

    return NextResponse.json(processedCourse);

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 