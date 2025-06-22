'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock, Users, Star, Play } from 'lucide-react'
import supabase from '@/lib/supabaseClient'
import { Course } from '@/types/index'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (courseId) {
      fetchCourse()
    }
  }, [courseId])

  const fetchCourse = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (supabaseError) {
        throw supabaseError
      }

      // Process S3 thumbnail if needed
      let thumbnailUrl = data.thumbnail_url
      if (data.thumbnail_s3_key && !thumbnailUrl) {
        thumbnailUrl = `https://course-skilllearn.s3.us-east-1.amazonaws.com/${data.thumbnail_s3_key}`
      }

      setCourse({
        ...data,
        thumbnail_url: thumbnailUrl,
        // Ensure instructor_name has a fallback
        instructor_name: data.instructor_name || 'Unknown Instructor',
        // Map schema fields to component expectations
        student_count: data.total_enrollments || 0,
        rating: data.average_rating || 0,
        duration: data.estimated_duration ? `${Math.floor(data.estimated_duration / 60)}h ${data.estimated_duration % 60}m` : 'Not specified',
        level: data.difficulty_level || 'Beginner',
        category: data.category || 'Uncategorized',
        price: data.price || 0,
        created_at: data.created_at,
        updated_at: data.updated_at
      })
    } catch (err) {
      console.error('Error fetching course:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch course')
    } finally {
      setIsLoading(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
      case 'beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Intermediate':
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Advanced':
      case 'advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111111]">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="mb-6 h-10 w-32 bg-zinc-800" />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="mb-4 aspect-video w-full bg-zinc-800" />
              <Skeleton className="mb-4 h-10 w-3/4 bg-zinc-800" />
              <Skeleton className="mb-6 h-24 w-full bg-zinc-800" />
            </div>
            <div>
              <Skeleton className="h-64 w-full bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#111111]">
        <div className="container mx-auto px-4 py-8">
          <Link href="/courses">
            <Button variant="ghost" className="mb-6 text-zinc-400 hover:text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
          <Alert className="border-red-800 bg-red-900/20">
            <AlertDescription className="text-red-400">
              {error || 'Course not found'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#111111]">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/courses">
          <Button variant="ghost" className="mb-6 text-zinc-400 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Video/Image */}
            <div className="relative mb-6 aspect-video overflow-hidden rounded-lg">
              {course.thumbnail_url ? (
                <Image
                  src={course.thumbnail_url}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#23272f]">
                  <div className="text-8xl text-zinc-600">📚</div>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Link href={`/courses/${courseId}/learn`}>
                  <Button size="lg" className="bg-[#0CF2A0] text-black hover:bg-[#0CF2A0]/80">
                    <Play className="mr-2 h-5 w-5" />
                    Start Learning
                  </Button>
                </Link>
              </div>
            </div>

            {/* Course Title */}
            <h1 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
              {course.title}
            </h1>

            {/* Course Description */}
            <div className="mb-6">
              <h2 className="mb-3 text-xl font-semibold text-white">About this course</h2>
              <p className="text-zinc-400 leading-relaxed">
                {course.description || 'No description available'}
              </p>
            </div>

            {/* Instructor */}
            <div className="mb-6">
              <h2 className="mb-3 text-xl font-semibold text-white">Instructor</h2>
              <div className="flex items-center gap-4">
                {course.instructor_avatar ? (
                  <Image
                    src={course.instructor_avatar}
                    alt={course.instructor_name || 'Instructor'}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-[#0CF2A0]/20 flex items-center justify-center">
                    <span className="text-lg font-medium text-[#0CF2A0]">
                      {course.instructor_name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-white">{course.instructor_name || 'Unknown Instructor'}</h3>
                  <p className="text-sm text-zinc-400">Course Instructor</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-8 border-zinc-800 bg-[#1a1a1a]">
              <CardContent className="p-6">
                {/* Price */}
                {course.price && course.price > 0 && (
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-[#0CF2A0]">
                      ${course.price}
                    </div>
                  </div>
                )}

                {/* Enroll Button */}
                <Button className="mb-6 w-full bg-[#0CF2A0] text-black hover:bg-[#0CF2A0]/80">
                  {course.price && course.price > 0 ? 'Enroll Now' : 'Start Free Course'}
                </Button>

                {/* Course Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Level</span>
                    <Badge className={`${getLevelColor(course.level || 'Beginner')} border`}>
                      {course.level || 'Beginner'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Category</span>
                    <Badge className="bg-[#0CF2A0]/20 text-[#0CF2A0] border-[#0CF2A0]/30">
                      {course.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Clock className="h-4 w-4" />
                      <span>Duration</span>
                    </div>
                    <span className="text-white">{course.duration}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Users className="h-4 w-4" />
                      <span>Students</span>
                    </div>
                    <span className="text-white">{(course.student_count || 0).toLocaleString()}</span>
                  </div>

                  {course.rating && course.rating > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Star className="h-4 w-4" />
                        <span>Rating</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-white">{course.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}