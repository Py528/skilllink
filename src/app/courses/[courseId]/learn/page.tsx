'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { CourseInterfaceLayout } from '@/components/courses/course-interface-layout'
import { Course, Lesson, CourseResource } from '@/types/index'
import { Skeleton } from '@/components/ui/skeleton'
import supabase from '@/lib/supabaseClient'
import { enhancedToast } from '@/components/ui/enhanced-toast'

export default function CourseLearnPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSwitchingLesson, setIsSwitchingLesson] = useState(false)
  const searchParams = useSearchParams()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // --- COURSE FETCH LOGIC ---
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      
      try {
        setIsLoading(true);
        setError(null);

        // Fetch course data
        const courseResponse = await fetch(`${supabaseUrl}/rest/v1/courses?id=eq.${courseId}&select=*`, {
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!courseResponse.ok) {
          throw new Error('Failed to fetch course');
        }

        const courseData = await courseResponse.json();
        if (courseData && courseData.length > 0) {
          setCourse(courseData[0]);
        } else {
          setError('Course not found');
        }

        // Fetch lessons data
        const lessonsResponse = await fetch(`${supabaseUrl}/rest/v1/lessons?course_id=eq.${courseId}&select=*&order=order_index.asc`, {
          headers: {
            'apikey': supabaseKey!,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (lessonsResponse.ok) {
          const lessonsData = await lessonsResponse.json();
          setLessons(lessonsData || []);
          
          // Set current lesson from URL or first lesson
          const lessonId = searchParams.get('lesson');
          if (lessonId && lessonsData) {
            const lesson = lessonsData.find((l: Lesson) => l.id === lessonId);
            if (lesson) {
              setCurrentLesson(lesson);
            }
          } else if (lessonsData && lessonsData.length > 0) {
            setCurrentLesson(lessonsData[0]);
          }
        }

      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course data');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, searchParams, supabaseUrl, supabaseKey])

  // --- LESSON SWITCHING LOGIC ---
  const handleLessonChange = async (lessonId: string) => {
    if (isSwitchingLesson) return;
    
    setIsSwitchingLesson(true);
    
    try {
      const lesson = lessons.find(l => l.id === lessonId);
      if (lesson) {
        setCurrentLesson(lesson);
        
        // Update URL without page reload
        const newUrl = `/courses/${courseId}/learn?lesson=${lessonId}`;
        window.history.pushState({}, '', newUrl);
        
        // Scroll to top of content
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        enhancedToast.success(`Switched to: ${lesson.title}`);
      }
    } catch (error) {
      console.error('Error switching lesson:', error);
      enhancedToast.error('Failed to switch lesson');
    } finally {
      setIsSwitchingLesson(false);
    }
  };

  // Handle URL-based lesson selection
  useEffect(() => {
    const lessonId = searchParams.get('lesson');
    if (lessonId && lessons.length > 0) {
      const lesson = lessons.find(l => l.id === lessonId);
      if (lesson && lesson.id !== currentLesson?.id) {
        setCurrentLesson(lesson);
      }
    }
  }, [searchParams, lessons, currentLesson?.id]);

  // --- LESSONS FETCH LOGIC ---
  useEffect(() => {
    const fetchLessons = async () => {
      if (!courseId) {
        return;
      }
      try {
        console.log('Fetching lessons for course:', courseId);
        
        // First try to get lessons directly from the course (legacy approach)
        const directResult = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });

        if (directResult.error) {
          console.error('Error fetching direct lessons:', directResult.error);
          setError('Failed to load lessons: ' + directResult.error.message);
          return;
        }

        let lessonsData = directResult.data;

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
            setError('Failed to load course sections: ' + sectionsError.message);
            return;
          }

          console.log('Found sections:', sections);

          if (!sections || sections.length === 0) {
            console.log('No sections found for course');
            setLessons([]);
            return;
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
            setError('Failed to load lessons: ' + sectionLessonsError.message);
            return;
          }

          lessonsData = sectionLessonsData;
        }

        console.log('Found lessons:', lessonsData);

        if (!lessonsData || lessonsData.length === 0) {
          console.log('No lessons found');
          setLessons([]);
          return;
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
            
            // Keep the original S3 key format for signed URL generation
            // The video player will handle getting signed URLs
            if (videoUrl && !videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
              // If it's a relative path, keep it as is for signed URL generation
              if (!videoUrl.startsWith('videos/') && !videoUrl.startsWith('course_')) {
                videoUrl = `videos/${videoUrl}`;
              }
            }

          // Process resources from content field (bulk upload format)
          let resources: CourseResource[] = [];
          if (lesson.content && lesson.content.resources) {
            resources = lesson.content.resources.map((resource: { url: string; name: string; size: number; type: string; key?: string }) => {
              let resourceUrl = resource.url;
              // Keep original S3 key format for signed URL generation
              if (resourceUrl && !resourceUrl.startsWith('http://') && !resourceUrl.startsWith('https://')) {
                // If it's a relative path, keep it as is for signed URL generation
                if (!resourceUrl.startsWith('documents/') && !resourceUrl.startsWith('transcripts/') && 
                    !resourceUrl.startsWith('subtitles/') && !resourceUrl.startsWith('instructions/') &&
                    !resourceUrl.startsWith('course_')) {
                  resourceUrl = `documents/${resourceUrl}`;
                }
              }
              return {
                key: resource.key || resource.name,
                url: resourceUrl,
                name: resource.name,
                size: resource.size,
                type: resource.type
              };
            });
          }

          // Also process legacy resources field if it exists
          if (lesson.resources && Array.isArray(lesson.resources)) {
            const legacyResources: CourseResource[] = lesson.resources.map((resource: { url: string; name: string; size: number; type: string; key?: string }) => {
              let resourceUrl = resource.url;
              // Keep original S3 key format for signed URL generation
              if (resourceUrl && !resourceUrl.startsWith('http://') && !resourceUrl.startsWith('https://')) {
                // If it's a relative path, keep it as is for signed URL generation
                if (!resourceUrl.startsWith('documents/') && !resourceUrl.startsWith('transcripts/') && 
                    !resourceUrl.startsWith('subtitles/') && !resourceUrl.startsWith('instructions/') &&
                    !resourceUrl.startsWith('course_')) {
                  resourceUrl = `documents/${resourceUrl}`;
                }
              }
              return {
                key: resource.key || resource.name,
                url: resourceUrl,
                name: resource.name,
                size: resource.size,
                type: resource.type
              };
            });
            // Merge with content resources, avoiding duplicates
            resources = [...resources, ...legacyResources.filter(legacy => 
              !resources.some(r => r.name === legacy.name)
            )];
          }

          return {
            ...lesson,
            video_url: videoUrl,
            resources: resources
          };
        });

        console.log('Processed lessons:', processedLessons);
        console.log('First lesson video URL:', processedLessons[0]?.video_url);
        console.log('First lesson resources:', processedLessons[0]?.resources);
        
        // Test the first lesson's video URL
        if (processedLessons[0]?.video_url) {
          console.log('Testing video URL:', processedLessons[0].video_url);
          // Try to test if it's accessible
          try {
            const testUrl = processedLessons[0].video_url;
            if (testUrl.startsWith('https://courses-skilllearn.s3.us-east-1.amazonaws.com/')) {
              const response = await fetch(testUrl, { method: 'HEAD' });
              console.log('Direct S3 URL test:', response.status, response.statusText);
            }
          } catch (error) {
            console.log('Direct URL test failed (expected for private bucket):', error);
          }
        }
        
        setLessons(processedLessons);
        
        if (processedLessons.length > 0) {
          setCurrentLesson(processedLessons[0]);
        }
      } catch (err) {
        console.error('Unexpected error loading lessons:', err);
        setError('Unexpected error loading lessons: ' + (err as Error).message);
      }
    };
    
    if (courseId) fetchLessons();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="h-screen bg-background">
        <div className="flex items-center justify-center h-full">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Course</h1>
          <p className="text-muted-foreground">{error || 'Course not found'}</p>
        </div>
      </div>
    )
  }

  // Calculate progress based on completed lessons
  const progress = lessons.length > 0 
    ? Math.round((lessons.filter(l => l.is_preview).length / lessons.length) * 100)
    : 0

  console.log('Rendering course interface with:', { course, lessons, currentLesson, progress });

  return (
    <CourseInterfaceLayout
      course={course}
      currentLesson={currentLesson || undefined}
      lessons={lessons}
      progress={progress}
      onLessonChange={handleLessonChange}
      isSwitchingLesson={isSwitchingLesson}
    />
  )
} 