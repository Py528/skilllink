-- Fix video URL mapping for the course
-- The video exists in S3 but the database is pointing to the wrong folder

-- Update the lesson with the correct S3 path
UPDATE lessons 
SET video_url = 'course_1752811917716_0d5g65/videos/03_02_a-day-in-the-life-of-a-data-scientist.mp4'
WHERE video_url LIKE '%03_02_a-day-in-the-life-of-a-data-scientist.mp4%';

-- Update the course's content_folder_id to match the S3 folder
UPDATE courses 
SET content_folder_id = 'course_1752811917716_0d5g65'
WHERE id IN (
  SELECT course_id 
  FROM lessons 
  WHERE video_url LIKE '%03_02_a-day-in-the-life-of-a-data-scientist.mp4%'
);

-- Verify the changes
SELECT 
  c.id as course_id,
  c.title as course_title,
  c.content_folder_id,
  l.id as lesson_id,
  l.title as lesson_title,
  l.video_url
FROM courses c
JOIN lessons l ON c.id = l.course_id
WHERE l.video_url LIKE '%03_02_a-day-in-the-life-of-a-data-scientist.mp4%';
