#!/usr/bin/env node

/**
 * Fix Course S3 Mapping
 * 
 * This script fixes the mismatch between database course IDs and S3 folder structure.
 * The video exists in S3 but the database is pointing to the wrong folder.
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixCourseS3Mapping() {
  console.log('🔧 Fixing Course S3 Mapping...');
  console.log('================================');
  
  try {
    // Get all courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, content_folder_id');
    
    if (coursesError) {
      console.error('❌ Error fetching courses:', coursesError);
      return;
    }
    
    console.log(`📋 Found ${courses.length} courses in database`);
    
    // Get all lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, course_id, title, video_url');
    
    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return;
    }
    
    console.log(`📋 Found ${lessons.length} lessons in database`);
    
    // Find the course that has the video we're looking for
    const targetVideo = '03_02_a-day-in-the-life-of-a-data-scientist.mp4';
    const correctS3Folder = 'course_1752811917716_0d5g65';
    
    console.log(`🎯 Looking for video: ${targetVideo}`);
    console.log(`📁 Correct S3 folder: ${correctS3Folder}`);
    
    // Find lessons with the target video
    const lessonsWithTargetVideo = lessons.filter(lesson => 
      lesson.video_url && lesson.video_url.includes(targetVideo)
    );
    
    console.log(`🔍 Found ${lessonsWithTargetVideo.length} lessons with target video`);
    
    if (lessonsWithTargetVideo.length > 0) {
      const lesson = lessonsWithTargetVideo[0];
      console.log(`📝 Lesson found: ${lesson.title} (ID: ${lesson.id})`);
      console.log(`🔗 Current video URL: ${lesson.video_url}`);
      
      // Update the lesson with the correct S3 path
      const newVideoUrl = lesson.video_url.replace(
        /course_\d+_\w+\//,
        `${correctS3Folder}/`
      );
      
      console.log(`🔄 New video URL: ${newVideoUrl}`);
      
      // Update the lesson in the database
      const { error: updateError } = await supabase
        .from('lessons')
        .update({ video_url: newVideoUrl })
        .eq('id', lesson.id);
      
      if (updateError) {
        console.error('❌ Error updating lesson:', updateError);
      } else {
        console.log('✅ Successfully updated lesson video URL!');
      }
      
      // Also update the course's content_folder_id
      const { error: courseUpdateError } = await supabase
        .from('courses')
        .update({ content_folder_id: correctS3Folder })
        .eq('id', lesson.course_id);
      
      if (courseUpdateError) {
        console.error('❌ Error updating course folder ID:', courseUpdateError);
      } else {
        console.log('✅ Successfully updated course folder ID!');
      }
    } else {
      console.log('❌ No lessons found with the target video');
    }
    
    console.log('');
    console.log('🎉 Fix complete! Try refreshing your browser now.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixCourseS3Mapping();
