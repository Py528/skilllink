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
      const start = Date.now();
      const { data: courses, error } = await this.supabase
        .from('courses')
        .select(`
          id, title, description, thumbnail_url, instructor_id, price, is_published, difficulty_level, estimated_duration, tags, created_at, updated_at, category,
          instructor:profiles!courses_instructor_id_fkey(full_name, avatar_url)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) {
        console.error('Error fetching courses:', error);
        throw new Error('Failed to fetch courses');
      }

      console.log('Fetched courses in', Date.now() - start, 'ms');

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

  async getLessonsByCourseId(courseId: string): Promise<any[]> {
    try {
      const { data: lessons, error } = await this.supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching lessons:', error);
        throw new Error('Failed to fetch lessons');
      }

      return lessons || [];
    } catch (error) {
      console.error('Error in getLessonsByCourseId:', error);
      return [];
    }
  }

  async updateLesson(lessonId: string, updates: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('lessons')
        .update(updates)
        .eq('id', lessonId);

      if (error) {
        console.error('Error updating lesson:', error);
        throw new Error('Failed to update lesson');
      }
    } catch (error) {
      console.error('Error in updateLesson:', error);
      throw error;
    }
  }

  async updateLessons(lessons: any[]): Promise<void> {
    try {
      const updatePromises = lessons.map(lesson => 
        this.supabase
          .from('lessons')
          .update({
            video_url: lesson.video_url,
            thumbnail_url: lesson.thumbnail_url,
            resources: lesson.resources
          })
          .eq('id', lesson.id)
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error in updateLessons:', error);
      throw error;
    }
  }
}

export const coursesService = new CoursesService(); 