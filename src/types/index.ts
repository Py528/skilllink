// types/index.ts
export interface Course {
  id: string
  title: string
  description?: string
  instructor_name?: string
  instructor_avatar?: string
  instructor_id?: string
  duration?: string
  student_count?: number
  total_enrollments?: number
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'beginner' | 'intermediate' | 'advanced'
  difficulty_level?: string
  category?: string
  thumbnail_url?: string
  thumbnail_s3_key?: string
  price?: number
  rating?: number
  average_rating?: number
  created_at?: string
  updated_at?: string
  // Additional schema fields
  is_published?: boolean
  estimated_duration?: number
  tags?: string[]
  prerequisites?: string[]
  learning_objectives?: string[]
  is_featured?: boolean
  last_published_at?: string
  category_id?: string
  visibility?: 'public' | 'private' | 'draft'
  enrollment_type?: 'open' | 'approval' | 'invite'
  certificate_enabled?: boolean
  requirements?: string
  pricing_type?: 'free' | 'paid'
  total_lessons?: number
  total_reviews?: number
}

export interface Lesson {
  id: string
  title: string
  description: string
  video_url: string
  duration: number
  order_index: number
  is_preview: boolean
  content: Record<string, unknown>
  thumbnail_url?: string
  resources: CourseResource[]
  is_free: boolean
  section_id: string
}

export interface CourseResource {
  key: string
  url: string
  name: string
  size: number
  type: string
}

export interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export interface FAQ {
  q: string;
  a: string;
}

export interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity: { x: number; y: number };
}

export interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  hasDropdown?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export interface DropdownMenuProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export interface DropdownItemProps {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export interface RotatingTextProps {
  texts: string[];
  mainClassName: string;
  initial?: { y: string; opacity: number };
  animate?: { y: number; opacity: number };
  exit?: { y: string; opacity: number };
  transition?: object;
  rotationInterval?: number;
}