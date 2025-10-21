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

    // First try to get lessons directly from the course (legacy approach)
    const { error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });
    
    let lessonsData = (await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })).data;

    if (lessonsError) {
      console.error('Error fetching direct lessons:', lessonsError);
      return NextResponse.json(
        { error: 'Failed to load lessons' },
        { status: 500 }
      );
    }

    // If no direct lessons found, try section-based approach
    if (!lessonsData || lessonsData.length === 0) {
      console.log('No direct lessons found, trying sections approach');
      
      // Get all sections for the course
      const { data: sections, error: sectionsError } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (sectionsError) {
        console.error('Error fetching sections:', sectionsError);
        return NextResponse.json(
          { error: 'Failed to load course sections' },
          { status: 500 }
        );
      }

      if (!sections || sections.length === 0) {
        return NextResponse.json([]);
      }

      // Get all lessons for all sections
      const sectionIds = sections.map(section => section.id);
      const { data: sectionLessonsData, error: sectionLessonsError } = await supabase
        .from('lessons')
        .select('*')
        .in('section_id', sectionIds)
        .order('order_index', { ascending: true });

      if (sectionLessonsError) {
        console.error('Error fetching section lessons:', sectionLessonsError);
        return NextResponse.json(
          { error: 'Failed to load lessons' },
          { status: 500 }
        );
      }

      lessonsData = sectionLessonsData;
    }

    if (!lessonsData || lessonsData.length === 0) {
      return NextResponse.json([]);
    }

    // Process lessons to ensure video URLs and resources are properly formatted
    const processedLessons = lessonsData.map(lesson => {
      // Ensure video_url is properly formatted
      let videoUrl = lesson.video_url;
      
      // If no video_url is set, try to find the first video resource
      if (!videoUrl || videoUrl === '') {
        const videoResources = lesson.resources?.filter((resource: { type: string; name: string; url: string }) => 
          resource.type === 'video/mp4' || 
          resource.name.endsWith('.mp4') ||
          resource.name.endsWith('.mov') ||
          resource.name.endsWith('.avi')
        ) || [];
        
        if (videoResources.length > 0) {
          videoUrl = videoResources[0].url;
        }
      }
      
      if (videoUrl && !videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
        // If it's a relative path, assume it's in the S3 bucket
        if (videoUrl.startsWith('videos/') || videoUrl.startsWith('course_')) {
          videoUrl = `https://courses-skilllearn.s3.us-east-1.amazonaws.com/${videoUrl}`;
        } else {
          // If it's just a filename, assume it's in the videos folder
          videoUrl = `https://courses-skilllearn.s3.us-east-1.amazonaws.com/videos/${videoUrl}`;
        }
      }

      // Process resources from content field (bulk upload format)
      let resources: Array<{ url: string; name: string; size: number; type: string; key?: string }> = [];
      if (lesson.content && lesson.content.resources) {
        resources = lesson.content.resources.map((resource: { url: string; name: string; size: number; type: string; key?: string }) => {
          let resourceUrl = resource.url;
          if (resourceUrl && !resourceUrl.startsWith('http://') && !resourceUrl.startsWith('https://')) {
            // If it's a relative path, assume it's in the S3 bucket
            if (resourceUrl.startsWith('documents/') || resourceUrl.startsWith('transcripts/') || 
                resourceUrl.startsWith('subtitles/') || resourceUrl.startsWith('instructions/') ||
                resourceUrl.startsWith('course_')) {
              resourceUrl = `https://courses-skilllearn.s3.us-east-1.amazonaws.com/${resourceUrl}`;
            } else {
              // If it's just a filename, assume it's in the documents folder
              resourceUrl = `https://courses-skilllearn.s3.us-east-1.amazonaws.com/documents/${resourceUrl}`;
            }
          }
          return {
            ...resource,
            url: resourceUrl
          };
        });
      }

      // Also process legacy resources field if it exists
      if (lesson.resources && Array.isArray(lesson.resources)) {
        const legacyResources = lesson.resources.map((resource: { url: string; name: string; size: number; type: string; key?: string }) => {
          let resourceUrl = resource.url;
          if (resourceUrl && !resourceUrl.startsWith('http://') && !resourceUrl.startsWith('https://')) {
            // If it's a relative path, assume it's in the S3 bucket
            if (resourceUrl.startsWith('documents/') || resourceUrl.startsWith('transcripts/') || 
                resourceUrl.startsWith('subtitles/') || resourceUrl.startsWith('instructions/') ||
                resourceUrl.startsWith('course_')) {
              resourceUrl = `https://courses-skilllearn.s3.us-east-1.amazonaws.com/${resourceUrl}`;
            } else {
              // If it's just a filename, assume it's in the documents folder
              resourceUrl = `https://courses-skilllearn.s3.us-east-1.amazonaws.com/documents/${resourceUrl}`;
            }
          }
          return {
            ...resource,
            url: resourceUrl
          };
        });
        // Merge with content resources, avoiding duplicates
        resources = [...resources, ...legacyResources.filter((legacy: { name: string }) =>
          !resources.some(r => r.name === legacy.name)
        )];
      }

      return {
        ...lesson,
        video_url: videoUrl,
        resources: resources
      };
    });

    return NextResponse.json(processedLessons);

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 