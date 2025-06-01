CREATE POLICY "Users can manage their own lesson progress" ON lesson_progress
  FOR ALL USING (auth.uid() = user_id);
