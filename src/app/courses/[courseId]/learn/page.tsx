'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CourseInterfaceLayout } from '@/components/courses/course-interface-layout'
import { Course, Lesson } from '@/types/index'
import { Skeleton } from '@/components/ui/skeleton'

export default function CourseLearnPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  useEffect(() => {
    if (courseId) {
      fetchCourseData()
    }
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch course data using direct fetch
      const courseResponse = await fetch(`${supabaseUrl}/rest/v1/courses?id=eq.${courseId}&select=*`, {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!courseResponse.ok) {
        throw new Error(`HTTP error! status: ${courseResponse.status}`)
      }

      const courseData = await courseResponse.json()

      if (!courseData || courseData.length === 0) {
        throw new Error('Course not found')
      }

      const courseInfo = courseData[0]

      // Process course data
      let thumbnailUrl = courseInfo.thumbnail_url
      if (courseInfo.thumbnail_s3_key && !thumbnailUrl) {
        thumbnailUrl = `https://courses-skilllearn.s3.us-east-1.amazonaws.com/${courseInfo.thumbnail_s3_key}`
      }
      
      // Handle relative thumbnail paths
      if (thumbnailUrl && !thumbnailUrl.startsWith('http://') && !thumbnailUrl.startsWith('https://')) {
        if (thumbnailUrl.startsWith('thumbnails/') || thumbnailUrl.startsWith('images/')) {
          thumbnailUrl = `https://courses-skilllearn.s3.us-east-1.amazonaws.com/${thumbnailUrl}`
        } else {
          // If it's just a filename, assume it's in the thumbnails folder
          thumbnailUrl = `https://courses-skilllearn.s3.us-east-1.amazonaws.com/thumbnails/${thumbnailUrl}`
        }
      }

      const processedCourse: Course = {
        ...courseInfo,
        thumbnail_url: thumbnailUrl,
        instructor_name: courseInfo.instructor_name || 'Unknown Instructor',
        student_count: courseInfo.total_enrollments || 0,
        rating: courseInfo.average_rating || 0,
        duration: courseInfo.estimated_duration ? `${Math.floor(courseInfo.estimated_duration / 60)}h ${courseInfo.estimated_duration % 60}m` : 'Not specified',
        level: courseInfo.difficulty_level || 'Beginner',
        category: courseInfo.category || 'Uncategorized',
        price: courseInfo.price || 0,
        created_at: courseInfo.created_at,
        updated_at: courseInfo.updated_at
      }

      setCourse(processedCourse)

      // Fetch lessons using direct fetch
      const lessonsData = await fetchCourseLessonsWithResources(courseId)
      setLessons(lessonsData)

      // Set first lesson as current if available
      if (lessonsData.length > 0) {
        setCurrentLesson(lessonsData[0])
      }

    } catch (err) {
      console.error('Error fetching course data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch course data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCourseLessonsWithResources = async (courseId: string): Promise<Lesson[]> => {
    try {
      // First get all sections for the course
      const sectionsResponse = await fetch(`${supabaseUrl}/rest/v1/course_sections?course_id=eq.${courseId}&select=id`, {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!sectionsResponse.ok) {
        return []
      }

      const sections = await sectionsResponse.json()

      if (!sections || sections.length === 0) {
        return []
      }

      // Get all lessons for all sections
      const sectionIds = sections.map((section: any) => section.id)
      const lessonsResponse = await fetch(`${supabaseUrl}/rest/v1/lessons?section_id=in.(${sectionIds.join(',')})&select=*&order=order_index.asc`, {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!lessonsResponse.ok) {
        return []
      }

      const lessons = await lessonsResponse.json()
      return lessons || []
    } catch (error) {
      console.error('Error fetching lessons:', error)
      return []
    }
  }

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

  return (
    <CourseInterfaceLayout
      course={course}
      currentLesson={currentLesson || undefined}
      lessons={lessons}
      progress={progress}
    />
  )
} 