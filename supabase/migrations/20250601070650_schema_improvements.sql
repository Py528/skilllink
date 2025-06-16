-- Add new columns to courses table
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS total_lessons integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_enrollments integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS prerequisites text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS learning_objectives text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_published_at timestamp with time zone;

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    parent_id uuid REFERENCES public.categories(id),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT categories_pkey PRIMARY KEY (id)
);

-- Add category_id to courses
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id);

-- Create course_reviews table
CREATE TABLE IF NOT EXISTS public.course_reviews (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid REFERENCES public.courses(id),
    user_id uuid REFERENCES public.profiles(id),
    rating integer CHECK (rating >= 1 AND rating <= 5),
    review_text text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT course_reviews_pkey PRIMARY KEY (id),
    CONSTRAINT unique_course_review UNIQUE (course_id, user_id)
);

-- Create course_sections table
CREATE TABLE IF NOT EXISTS public.course_sections (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid REFERENCES public.courses(id),
    title text NOT NULL,
    description text,
    order_index integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT course_sections_pkey PRIMARY KEY (id),
    CONSTRAINT course_sections_order_index_check CHECK (order_index > 0)
);

-- Add section_id to lessons
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES public.course_sections(id),
ADD COLUMN IF NOT EXISTS thumbnail_url text,
ADD COLUMN IF NOT EXISTS resources jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_free boolean DEFAULT false;

-- Improve enrollments table
ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS last_accessed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS completion_certificate_url text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending'::text,
ADD COLUMN IF NOT EXISTS payment_id text;

-- Add payment_status check constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'enrollments_payment_status_check'
    ) THEN
        ALTER TABLE public.enrollments
        ADD CONSTRAINT enrollments_payment_status_check 
        CHECK (payment_status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'refunded'::text]));
    END IF;
END $$;

-- Add unique constraint to enrollments
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_enrollment'
    ) THEN
        ALTER TABLE public.enrollments
        ADD CONSTRAINT unique_enrollment UNIQUE (user_id, course_id);
    END IF;
END $$;

-- Create course_prerequisites table
CREATE TABLE IF NOT EXISTS public.course_prerequisites (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid REFERENCES public.courses(id),
    prerequisite_course_id uuid REFERENCES public.courses(id),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT course_prerequisites_pkey PRIMARY KEY (id),
    CONSTRAINT unique_prerequisite UNIQUE (course_id, prerequisite_course_id)
);

-- Improve media table
ALTER TABLE public.media
ADD COLUMN IF NOT EXISTS file_name text,
ADD COLUMN IF NOT EXISTS file_size bigint,
ADD COLUMN IF NOT EXISTS mime_type text,
ADD COLUMN IF NOT EXISTS storage_path text,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Update existing media types to match new constraint
UPDATE public.media
SET type = 'image'
WHERE type NOT IN ('image', 'video', 'document', 'audio')
AND type IS NOT NULL;

-- Add type check to media table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'media_type_check'
    ) THEN
        ALTER TABLE public.media
        ADD CONSTRAINT media_type_check 
        CHECK (type IS NULL OR type = ANY (ARRAY['image'::text, 'video'::text, 'document'::text, 'audio'::text]));
    END IF;
END $$;

-- Create RLS policies for new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_prerequisites ENABLE ROW LEVEL SECURITY;

-- Add policies for categories
CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Categories are insertable by instructors"
ON public.categories FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND user_type = 'instructor'
    )
);

-- Add policies for course_reviews
CREATE POLICY "Reviews are viewable by everyone"
ON public.course_reviews FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own reviews"
ON public.course_reviews FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reviews"
ON public.course_reviews FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Add policies for course_sections
CREATE POLICY "Sections are viewable by everyone"
ON public.course_sections FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Sections are manageable by course instructors"
ON public.course_sections FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.courses
        WHERE id = course_sections.course_id
        AND instructor_id = auth.uid()
    )
);

-- Add policies for course_prerequisites
CREATE POLICY "Prerequisites are viewable by everyone"
ON public.course_prerequisites FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Prerequisites are manageable by course instructors"
ON public.course_prerequisites FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.courses
        WHERE id = course_prerequisites.course_id
        AND instructor_id = auth.uid()
    )
); 