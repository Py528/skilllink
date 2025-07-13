-- Migration: Add explicit RLS insert policy for courses

-- Enable RLS if not already enabled
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Allow instructors to insert their own courses
CREATE POLICY "Instructors can insert their own courses" ON public.courses
  FOR INSERT TO authenticated
  WITH CHECK (instructor_id = auth.uid()); 