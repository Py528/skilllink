import { createBrowserClient } from '@supabase/ssr';

export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  instructor_id?: string;
  price?: number;
  is_published?: boolean;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration?: number;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  instructor?: {
    name: string;
    avatar: string;
  };
  // Additional fields for display
  duration?: string;
  students?: number;
  rating?: number;
  lessons?: number;
  category?: string;
}

export interface CourseWithInstructor extends Course {
  instructor: {
    name: string;
    avatar: string;
  };
}

class CoursesService {
  private supabase;

  constructor() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }

    this.supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  async getAllPublishedCourses(): Promise<CourseWithInstructor[]> {
    try {
      console.log('Fetching published courses from Supabase...');
      
      const { data: courses, error } = await this.supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!courses_instructor_id_fkey(
            full_name,
            avatar_url
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching courses:', error);
        throw new Error('Failed to fetch courses');
      }

      console.log(`Found ${courses?.length || 0} published courses`);

      // Transform the data to match our interface
      const transformedCourses = courses?.map(course => {
        console.log('Course data:', {
          id: course.id,
          title: course.title,
          thumbnail_url: course.thumbnail_url,
          instructor: course.instructor
        });
        
        return {
          ...course,
          instructor: {
            name: course.instructor?.full_name || 'Unknown Instructor',
            avatar: course.instructor?.avatar_url || '/default-avatar.svg'
          },
          duration: course.estimated_duration ? `${course.estimated_duration}h` : 'N/A',
          students: 0, // This would need to be calculated from enrollments table
          rating: 4.5, // This would need to be calculated from reviews table
          lessons: 0, // This would need to be calculated from lessons table
          category: course.tags?.[0] || 'General'
        };
      }) || [];

      console.log('Transformed courses:', transformedCourses);
      return transformedCourses;
    } catch (error) {
      console.error('Error in getAllPublishedCourses:', error);
      return [];
    }
  }

  async getCoursesByInstructor(instructorId: string): Promise<CourseWithInstructor[]> {
    try {
      const { data: courses, error } = await this.supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!courses_instructor_id_fkey(
            full_name,
            avatar_url
          )
        `)
        .eq('instructor_id', instructorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching instructor courses:', error);
        throw new Error('Failed to fetch instructor courses');
      }

      return courses?.map(course => ({
        ...course,
        instructor: {
          name: course.instructor?.full_name || 'Unknown Instructor',
          avatar: course.instructor?.avatar_url || '/default-avatar.svg'
        },
        duration: course.estimated_duration ? `${course.estimated_duration}h` : 'N/A',
        students: 0,
        rating: 4.5,
        lessons: 0,
        category: course.tags?.[0] || 'General'
      })) || [];
    } catch (error) {
      console.error('Error in getCoursesByInstructor:', error);
      return [];
    }
  }

  async getCourseById(courseId: string): Promise<CourseWithInstructor | null> {
    try {
      const { data: course, error } = await this.supabase
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
        return null;
      }

      return {
        ...course,
        instructor: {
          name: course.instructor?.full_name || 'Unknown Instructor',
          avatar: course.instructor?.avatar_url || '/default-avatar.svg'
        },
        duration: course.estimated_duration ? `${course.estimated_duration}h` : 'N/A',
        students: 0,
        rating: 4.5,
        lessons: 0,
        category: course.tags?.[0] || 'General'
      };
    } catch (error) {
      console.error('Error in getCourseById:', error);
      return null;
    }
  }
}

export const coursesService = new CoursesService(); 