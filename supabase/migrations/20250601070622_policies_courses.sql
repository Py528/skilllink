CREATE POLICY "Published courses are viewable by everyone" ON courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Instructors can manage their own courses" ON courses
  FOR ALL USING (auth.uid() = instructor_id);
