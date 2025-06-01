CREATE POLICY "Lessons are viewable if course is published or user is instructor" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lessons.course_id 
      AND (courses.is_published = true OR courses.instructor_id = auth.uid())
    )
  );

CREATE POLICY "Instructors can manage lessons in their courses" ON lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lessons.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );
