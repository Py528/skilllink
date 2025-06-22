'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CourseInterfaceLayout } from '@/components/courses/course-interface-layout'
import { Course, Lesson } from '@/types/index'
import { fetchCourseLessonsWithResources } from '@/lib/courseUtils'
import supabase from '@/lib/supabaseClient'
import { Skeleton } from '@/components/ui/skeleton'

export default function CourseLearnPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (courseId) {
      fetchCourseData()
    }
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch course data
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (courseError) {
        throw courseError
      }

      // Process course data
      let thumbnailUrl = courseData.thumbnail_url
      if (courseData.thumbnail_s3_key && !thumbnailUrl) {
        thumbnailUrl = `https://course-skilllearn.s3.us-east-1.amazonaws.com/${courseData.thumbnail_s3_key}`
      }
      
      // Handle relative thumbnail paths
      if (thumbnailUrl && !thumbnailUrl.startsWith('http://') && !thumbnailUrl.startsWith('https://')) {
        if (thumbnailUrl.startsWith('thumbnails/') || thumbnailUrl.startsWith('images/')) {
          thumbnailUrl = `https://course-skilllearn.s3.us-east-1.amazonaws.com/${thumbnailUrl}`
        } else {
          // If it's just a filename, assume it's in the thumbnails folder
          thumbnailUrl = `https://course-skilllearn.s3.us-east-1.amazonaws.com/thumbnails/${thumbnailUrl}`
        }
      }

      const processedCourse: Course = {
        ...courseData,
        thumbnail_url: thumbnailUrl,
        instructor_name: courseData.instructor_name || 'Unknown Instructor',
        student_count: courseData.total_enrollments || 0,
        rating: courseData.average_rating || 0,
        duration: courseData.estimated_duration ? `${Math.floor(courseData.estimated_duration / 60)}h ${courseData.estimated_duration % 60}m` : 'Not specified',
        level: courseData.difficulty_level || 'Beginner',
        category: courseData.category || 'Uncategorized',
        price: courseData.price || 0,
        created_at: courseData.created_at,
        updated_at: courseData.updated_at
      }

      setCourse(processedCourse)

      // Fetch lessons
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