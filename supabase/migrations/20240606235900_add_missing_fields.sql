-- Add missing fields to courses table to match component expectations
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS instructor_name text,
ADD COLUMN IF NOT EXISTS instructor_avatar text,
ADD COLUMN IF NOT EXISTS student_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS thumbnail_s3_key text,
ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'draft')),
ADD COLUMN IF NOT EXISTS enrollment_type text DEFAULT 'open' CHECK (enrollment_type IN ('open', 'approval', 'invite')),
ADD COLUMN IF NOT EXISTS certificate_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS requirements text,
ADD COLUMN IF NOT EXISTS pricing_type text DEFAULT 'free' CHECK (pricing_type IN ('free', 'paid'));

-- Add missing fields to lessons table
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'video' CHECK (type IN ('video', 'text', 'quiz', 'assignment')),
ADD COLUMN IF NOT EXISTS video_file jsonb,
ADD COLUMN IF NOT EXISTS resource_files jsonb DEFAULT '[]'::jsonb;

-- Add missing fields to course_sections table (modules)
ALTER TABLE public.course_sections 
ADD COLUMN IF NOT EXISTS lessons jsonb DEFAULT '[]'::jsonb;

-- Update existing courses to have instructor_name if instructor_id exists
UPDATE public.courses 
SET instructor_name = profiles.full_name 
FROM public.profiles 
WHERE courses.instructor_id = profiles.id 
AND courses.instructor_name IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_courses_instructor_name ON public.courses(instructor_name);
CREATE INDEX IF NOT EXISTS idx_courses_visibility ON public.courses(visibility);
CREATE INDEX IF NOT EXISTS idx_lessons_type ON public.lessons(type); 