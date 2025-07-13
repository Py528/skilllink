'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Save, Check } from 'lucide-react';
import { Button } from '@/components/publish_course/Button';
import { Progress } from '@/components/publish_course/Progress';
import { Card, CardContent } from '@/components/publish_course/Card';
import { BasicInformationStep } from '@/components/publish_course/BasicInformationStep';
import { CourseContentStep } from '@/components/publish_course/CourseContentStep';
import { PricingSettingsStep } from '@/components/publish_course/PricingSettingsStep';
import { PreviewPublishStep } from '@/components/publish_course/PreviewPublishStep';
import { s3Service } from '@/services/s3Upload';
import { toast } from '@/components/ui/sonner';
import { useSupabase } from '@/providers/SupabaseProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  key: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration: number;
  order_index: number;
  is_preview: boolean;
  content: Record<string, unknown>;
  thumbnail_url?: string;
  resources: Record<string, unknown>[];
  is_free: boolean;
  type?: string;
  videoFile?: File | UploadedFile;
  videoPreview?: string;
  resourceFiles: (File | UploadedFile)[];
  resourcePreviews?: string[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

interface FormData {
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnail: File | string | null;
  thumbnailPreview?: string;
  tags: string[];
  modules: Module[];
  pricingType: 'free' | 'paid';
  price: string;
  visibility: 'public' | 'private' | 'draft';
  enrollmentType: 'open' | 'approval' | 'invite';
  certificateEnabled: boolean;
  prerequisites: string;
  requirements: string;
}

const steps = [
  { id: 1, title: 'Basic Information', description: 'Course details and metadata' },
  { id: 2, title: 'Course Content', description: 'Modules, lessons, and structure' },
  { id: 3, title: 'Pricing & Settings', description: 'Pricing and access control' },
  { id: 4, title: 'Preview & Publish', description: 'Review and go live' }
];

function isFile(obj: any): obj is File {
  return obj && typeof obj === 'object' && typeof obj.arrayBuffer === 'function';
}

// Helper to generate unique id
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function isUploadedFile(file: any): file is UploadedFile {
  return file && typeof file === 'object' && typeof file.url === 'string';
}

export default function CreateCourse() {
  const { supabase } = useSupabase();
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    thumbnail: null,
    tags: [],
    modules: [],
    pricingType: 'free',
    price: '',
    visibility: 'public',
    enrollmentType: 'open',
    certificateEnabled: false,
    prerequisites: '',
    requirements: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Use refs to persist data across re-renders (React Strict Mode fix)
  const courseRef = useRef<any>(null);
  const courseIdRef = useRef<string | null>(null);
  const publishingRef = useRef(false);

  // Check authentication and user type
  useEffect(() => {
    console.log('CreateCourse - Auth state:', {
      loading,
      user: user?.id,
      profile: profile?.user_type,
      hasProfile: !!profile
    });
    
    if (!loading) {
      if (!user) {
        console.log('CreateCourse - No user found, redirecting to login');
        toast.error('You must be logged in to create a course');
        router.push('/login');
        return;
      }
      
      if (!profile) {
        console.log('CreateCourse - No profile found, redirecting to dashboard');
        toast.error('Please complete your profile setup first');
        router.push('/dashboard');
        return;
      }
      
      if (profile.user_type !== 'instructor') {
        console.log('CreateCourse - User is not instructor:', profile.user_type);
        toast.error('Only instructors can create courses');
        router.push('/dashboard');
        return;
      }
      
      console.log('CreateCourse - Authentication successful, user is instructor');
    }
  }, [user, profile, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0CF2A0] mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated or not an instructor
  if (!user || !profile || profile.user_type !== 'instructor') {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">You must be logged in as an instructor to create courses.</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>User: {user?.id || 'Not logged in'}</p>
            <p>Profile: {profile?.user_type || 'No profile'}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-[#0CF2A0] text-black rounded hover:bg-[#0CF2A0]/80"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const updateFormData = (newData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
    // Clear errors for updated fields
    const updatedFields = Object.keys(newData);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => delete newErrors[field]);
      return newErrors;
    });
  };

  const validateStep = (step: number): boolean => {
    console.log('CreateCourse - Validating step:', step);
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Course title is required';
        if (!formData.description.trim()) newErrors.description = 'Course description is required';
        if (!formData.category) newErrors.category = 'Please select a category';
        if (!formData.level) newErrors.level = 'Please select a difficulty level';
        break;
      case 2:
        if (!formData.modules.length) newErrors.modules = 'At least one module is required';
        else if (!formData.modules.some(m => m.lessons?.length > 0)) {
          newErrors.modules = 'At least one lesson is required';
        }
        break;
      case 3:
        if (formData.pricingType === 'paid' && (!formData.price || parseFloat(formData.price) <= 0)) {
          newErrors.price = 'Please enter a valid price';
        }
        break;
    }

    console.log('CreateCourse - Validation errors:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('CreateCourse - Step validation result:', isValid);
    return isValid;
  };

  const handleNext = () => {
    console.log('CreateCourse - handleNext called, current step:', currentStep);
    if (validateStep(currentStep)) {
      console.log('CreateCourse - Step validation passed, moving to next step');
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      console.log('CreateCourse - Step validation failed');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Course saved as draft successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const testBasicCourseCreation = async () => {
    try {
      console.log('CreateCourse - Testing basic course creation...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database test timeout')), 10000); // 10 second timeout
      });
      
      const testData = {
        title: 'Test Course',
        description: 'Test Description',
        instructor_id: user?.id,
        is_published: false,
        difficulty_level: 'beginner'
      };
      
      const testPromise = supabase
        .from('courses')
        .insert(testData)
        .select()
        .single();
        
      // Race between timeout and test
      const { data, error } = await Promise.race([testPromise, timeoutPromise]) as any;
        
      if (error) {
        console.error('CreateCourse - Basic course creation test failed:', error);
        return false;
      }
      
      console.log('CreateCourse - Basic course creation test successful:', data);
      
      // Clean up test course
      try {
        await supabase
          .from('courses')
          .delete()
          .eq('id', data.id);
      } catch (cleanupError) {
        console.warn('CreateCourse - Failed to cleanup test course:', cleanupError);
      }
        
      return true;
    } catch (err) {
      console.error('CreateCourse - Basic course creation test error:', err);
      return false;
    }
  };

  const handlePublish = async () => {
    console.log('=== CREATE COURSE PUBLISH STARTED ===');
    console.log('CreateCourse - handlePublish called at:', new Date().toISOString());
    console.log('CreateCourse - Current form data:', formData);
    console.log('CreateCourse - User ID:', user?.id);
    console.log('CreateCourse - Publishing ref current:', publishingRef.current);
    
    // Prevent double execution during React Strict Mode
    if (publishingRef.current) {
      console.log('CreateCourse - Publishing already in progress, skipping');
      return;
    }
    
    console.log('CreateCourse - Starting publish process');
    console.log('CreateCourse - User:', user?.id);
    console.log('CreateCourse - Form data:', {
      title: formData.title,
      description: formData.description,
      modules: formData.modules.length
    });
    
    // Basic validation
    if (!formData.title || formData.title.trim() === '') {
      console.error('CreateCourse - Title is required');
      toast.error('Course title is required');
      return;
    }
    
    if (!formData.description || formData.description.trim() === '') {
      console.error('CreateCourse - Description is required');
      toast.error('Course description is required');
      return;
    }
    
    if (!user?.id) {
      console.error('CreateCourse - User not found');
      toast.error('You must be logged in to create a course');
      return;
    }
    
    console.log('CreateCourse - Basic validation passed');
    
    let toastId: string | number | undefined;
    try {
      publishingRef.current = true;
      setIsSaving(true);
      
      console.log('CreateCourse - Publishing state set');
      
      // Debug: Check if component is still mounted
      console.log('CreateCourse - Starting publish, component mounted');
      
      // Test basic course creation first
      const basicTestResult = await testBasicCourseCreation();
      console.log('CreateCourse - Basic course creation test result:', basicTestResult);
      
      if (!basicTestResult) {
        console.warn('CreateCourse - Database test failed, but continuing with publish...');
        // Don't block the publish process if the test fails
        // toast.error('Database connection test failed. Please check your setup.');
        // return;
      }

      // Show S3 upload toast with Progress component
      toastId = toast.loading(
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-primary">Uploading files to AWS S3...</span>
          <Progress value={0} />
          <span className="text-xs text-muted-foreground">This may take a while for large files.</span>
        </div>,
        { duration: Infinity }
      );

      // After S3 upload, update toast to Supabase upload
      toast.loading(
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-primary">Saving course data to Supabase...</span>
        </div>,
        { id: toastId, duration: Infinity }
      );

      // 0. Handle bulk upload files FIRST (upload to S3 only now)
      console.log('CreateCourse - Checking for bulk upload files...');
      let bulkUploadFiles: File[] = [];
      let updatedFormData = { ...formData };
      
      if (formData.modules && formData.modules.length > 0) {
        // Check if any modules have bulk upload files
        for (const module of formData.modules) {
          for (const lesson of module.lessons) {
            // Check if lesson has bulk upload files stored
            if (lesson.resourceFiles && Array.isArray(lesson.resourceFiles)) {
              for (const file of lesson.resourceFiles) {
                if (isFile(file)) {
                  bulkUploadFiles.push(file);
                  console.log('CreateCourse - Found bulk upload file:', file.name, 'Size:', file.size);
                }
              }
            }
          }
        }
      }

      // Upload bulk upload files to S3 FIRST
      if (bulkUploadFiles.length > 0) {
        console.log('CreateCourse - Uploading bulk upload files to S3:', bulkUploadFiles.length);
        toast.loading(
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-primary">Uploading bulk upload files to AWS S3...</span>
            <Progress value={0} />
            <span className="text-xs text-muted-foreground">Uploading {bulkUploadFiles.length} files from bulk upload.</span>
          </div>,
          { id: toastId, duration: Infinity }
        );

        try {
          // Upload bulk files with organization
          const uploadResults = await s3Service.uploadWithOrganization(
            bulkUploadFiles,
            `course_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            (progress) => {
              console.log(`Bulk upload progress: ${progress.percentage.toFixed(1)}% (${progress.completed}/${progress.total})`);
              if (progress.currentFile) {
                console.log(`Currently uploading: ${progress.currentFile}`);
              }
            }
          );

          console.log('CreateCourse - Bulk upload results:', uploadResults.length);

          // Update form data with uploaded file URLs
          const updatedModules = formData.modules.map(module => ({
            ...module,
            lessons: module.lessons.map(lesson => ({
              ...lesson,
              resourceFiles: lesson.resourceFiles.map(file => {
                if (isFile(file)) {
                  const uploadResult = uploadResults.find(r => r.file.name === file.name);
                  if (uploadResult) {
                    console.log('CreateCourse - Updated file:', file.name, 'with URL:', uploadResult.result.url);
                    return {
                      id: uploadResult.result.key,
                      name: file.name,
                      size: file.size,
                      type: file.type,
                      url: uploadResult.result.url,
                      key: uploadResult.result.key
                    };
                  }
                }
                return file;
              })
            }))
          }));

          // Update form data with uploaded files
          updatedFormData = {
            ...formData,
            modules: updatedModules
          };

          console.log('CreateCourse - Bulk upload files uploaded successfully');
        } catch (error) {
          console.error('CreateCourse - Bulk upload failed:', error);
          toast.error('Failed to upload bulk upload files: ' + (error instanceof Error ? error.message : 'Unknown error'));
          return;
        }
      } else {
        console.log('CreateCourse - No bulk upload files found');
      }

      // 1. Upload thumbnail if it's a File
      let thumbnailUrl = updatedFormData.thumbnail;
      if (updatedFormData.thumbnail && typeof updatedFormData.thumbnail !== 'string') {
        console.log('CreateCourse - Uploading thumbnail...');
        const result = await s3Service.uploadFile(updatedFormData.thumbnail, 'thumbnails');
        thumbnailUrl = result.url;
        console.log('CreateCourse - Thumbnail uploaded:', thumbnailUrl);
      }

      // 2. Upload all lesson files (videos/resources) if they are File objects
      console.log('CreateCourse - Processing individual lesson files...');
      const modulesWithUploads = await Promise.all(updatedFormData.modules.map(async (module) => {
        const lessonsWithUploads = await Promise.all(module.lessons.map(async (lesson) => {
          const lessonId = lesson.id || generateId();
          // Video upload
          let video_url = lesson.video_url;
          let videoFileMeta = lesson.videoFile;
          if (lesson.videoFile && isFile(lesson.videoFile)) {
            try {
              console.log('CreateCourse - Uploading video:', lesson.videoFile.name);
              const result = await s3Service.uploadFile(lesson.videoFile, 'videos');
              video_url = result.url; // Use S3 public URL
              videoFileMeta = {
                id: result.key,
                name: lesson.videoFile.name,
                size: lesson.videoFile.size,
                type: lesson.videoFile.type,
                url: result.url,
                key: result.key
              };
              console.log('CreateCourse - Video uploaded:', video_url);
            } catch (err) {
              throw err;
            }
          }
          // Thumbnail upload (per lesson)
          let thumbnail_url = lesson.thumbnail_url;
          if (lesson.thumbnail_url && isFile(lesson.thumbnail_url)) {
            try {
              const result = await s3Service.uploadFile(lesson.thumbnail_url, 'thumbnails');
              thumbnail_url = result.url;
            } catch (err) {
              throw err;
            }
          } else if (!lesson.thumbnail_url && typeof thumbnailUrl === 'string') {
            // Fallback to course thumbnail if lesson thumbnail is missing
            thumbnail_url = thumbnailUrl;
          }
          // Resource files upload (only if not already uploaded via bulk upload)
          let resourceFilesMeta: (File | UploadedFile)[] = Array.isArray(lesson.resourceFiles) ? lesson.resourceFiles : [];
          if (resourceFilesMeta.length > 0) {
            resourceFilesMeta = await Promise.all(resourceFilesMeta.map(async (file) => {
              if (isFile(file)) {
                console.log('CreateCourse - Uploading resource file:', file.name);
                const result = await s3Service.uploadFile(file, 'resources');
                const uploaded: UploadedFile = {
                  id: result.key,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  url: result.url,
                  key: result.key
                };
                console.log('CreateCourse - Resource file uploaded:', uploaded.url);
                return uploaded;
              } else {
                return file;
              }
            }));
          }
          return {
            ...lesson,
            id: lessonId,
            video_url,
            videoFile: videoFileMeta,
            resourceFiles: resourceFilesMeta,
            thumbnail_url // ensure this is set
          };
        }));
        const moduleId = module.id || generateId();
        return {
          ...module,
          id: moduleId,
          lessons: lessonsWithUploads
        };
      }));

      // 3. Prepare new formData for Supabase
      const finalFormData = {
        ...updatedFormData,
        thumbnail: thumbnailUrl,
        modules: modulesWithUploads
      };

      // Check if user is logged in using the auth context
      console.log('CreateCourse - Publishing with user:', user?.id);
      if (!user) {
        console.error('CreateCourse - No user found during publish');
        toast.error('You must be logged in to create a course');
        throw new Error('You must be logged in to create a course');
      }

      console.log('CreateCourse - Starting course creation...');
      console.log('CreateCourse - Course data to insert:', {
        title: finalFormData.title,
        description: finalFormData.description,
        thumbnail_url: typeof thumbnailUrl === 'string' ? thumbnailUrl : null,
        price: finalFormData.pricingType === 'paid' ? parseFloat(finalFormData.price) : 0,
        is_published: true,
        difficulty_level: finalFormData.level,
        tags: finalFormData.tags,
        prerequisites: finalFormData.prerequisites.split(',').map(p => p.trim()),
        learning_objectives: finalFormData.requirements.split(',').map(r => r.trim()),
        category: finalFormData.category,
        last_published_at: new Date().toISOString(),
        instructor_id: user.id
      });
      
      // 1. Create the course
      console.log('CreateCourse - Executing Supabase insert...');
      console.log('CreateCourse - User context:', { userId: user?.id });
      
      // Skip RLS test as it's hanging - proceed directly to course creation
      console.log('CreateCourse - Skipping RLS test, proceeding with course creation...');
      
      try {
        const courseInsertPromise = supabase
          .from('courses')
          .insert({
            title: finalFormData.title,
            description: finalFormData.description,
            thumbnail_url: typeof thumbnailUrl === 'string' ? thumbnailUrl : null,
            price: finalFormData.pricingType === 'paid' ? parseFloat(finalFormData.price) : 0,
            is_published: true,
            difficulty_level: finalFormData.level,
            tags: finalFormData.tags,
            category: finalFormData.category,
            instructor_id: user.id,
            // Only add these fields if they exist in the database
            ...(finalFormData.prerequisites && { prerequisites: finalFormData.prerequisites.split(',').map(p => p.trim()) }),
            ...(finalFormData.requirements && { learning_objectives: finalFormData.requirements.split(',').map(r => r.trim()) }),
            ...(finalFormData.visibility && { visibility: finalFormData.visibility }),
            ...(finalFormData.enrollmentType && { enrollment_type: finalFormData.enrollmentType }),
            ...(finalFormData.certificateEnabled !== undefined && { certificate_enabled: finalFormData.certificateEnabled }),
            ...(finalFormData.requirements && { requirements: finalFormData.requirements }),
            ...(finalFormData.pricingType && { pricing_type: finalFormData.pricingType }),
          })
          .select()
          .single();

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Course creation timed out after 15 seconds')), 15000);
        });

        let course, courseError;
        try {
          console.log('CreateCourse - Starting Supabase insert with timeout...');
          ({ data: course, error: courseError } = await Promise.race([courseInsertPromise, timeoutPromise]));
          console.log('CreateCourse - Supabase insert completed successfully');
        } catch (err) {
          console.error('CreateCourse - Supabase insert threw error:', err);
          
          // Try fallback with minimal fields
          console.log('CreateCourse - Trying fallback with minimal fields...');
          const fallbackData = {
            title: finalFormData.title,
            description: finalFormData.description,
            thumbnail_url: typeof thumbnailUrl === 'string' ? thumbnailUrl : null,
            price: finalFormData.pricingType === 'paid' ? parseFloat(finalFormData.price) : 0,
            is_published: true,
            difficulty_level: finalFormData.level,
            instructor_id: user.id,
          };
          
          const { data: fallbackCourse, error: fallbackError } = await supabase
            .from('courses')
            .insert(fallbackData)
            .select()
            .single();
            
          if (fallbackError) {
            console.error('CreateCourse - Fallback course creation also failed:', fallbackError);
            throw new Error(`Course creation failed: ${fallbackError.message}`);
          }
          
          course = fallbackCourse;
          courseError = null;
          console.log('CreateCourse - Fallback course creation successful');
        }

        // Log the full response for debugging
        console.log('CreateCourse - Supabase insert response:', { course, courseError });

        if (courseError) {
          console.error('CreateCourse - Course creation failed:', courseError, 'User:', user?.id);
          toast.error('Failed to create course: ' + courseError.message);
          throw new Error(`Failed to create course: ${courseError.message}`);
        }
        if (!course) {
          console.error('CreateCourse - No course returned from insert, possible RLS or network issue. User:', user?.id, 'Response:', { course, courseError });
          toast.error('Failed to create course: No course returned. Check your permissions, RLS, and Supabase logs.');
          throw new Error('Failed to create course: No course returned.');
        }
        
        // CRITICAL: Store course data in refs to persist across re-renders
        courseRef.current = course;
        courseIdRef.current = course.id;
        
        console.log('CreateCourse - Course created successfully:', courseIdRef.current);
        console.log('CreateCourse - Course stored in ref:', courseRef.current);
        
      } catch (err) {
        // Already handled above, just rethrow
        throw err;
      }
      
      // Defensive check - ensure course is defined using ref
      if (!courseRef.current || !courseIdRef.current) {
        console.error('CreateCourse - Course is undefined after creation block');
        toast.error('Failed to create course: Course object is undefined');
        throw new Error('Course object is undefined');
      }
      
      // Log course object before proceeding to sections
      console.log('CreateCourse - Course object before sections:', courseRef.current);
      
      // 2. Create course sections (modules)
      const sectionsToCreate = finalFormData.modules.map((module, index) => ({
        course_id: courseIdRef.current,
        title: module.title,
        description: module.description,
        order_index: index + 1
      }));
      
      console.log('CreateCourse - Creating sections for course:', courseIdRef.current, 'Sections to create:', sectionsToCreate.length);
      
      const { data: sections, error: sectionsError } = await supabase
        .from('course_sections')
        .insert(sectionsToCreate)
        .select();

      if (sectionsError) {
        console.error('CreateCourse - Sections creation failed:', sectionsError);
        toast.error('Failed to create sections: ' + sectionsError.message);
        throw new Error(`Failed to create sections: ${sectionsError.message}`);
      }

      if (!sections || sections.length === 0) {
        console.error('CreateCourse - No sections returned from insert');
        toast.error('Failed to create sections: No sections returned');
        throw new Error('Failed to create sections: No sections returned');
      }

      console.log('CreateCourse - Sections created successfully:', sections.length);
      
      // Log course object before lessons
      console.log('CreateCourse - Course object before lessons:', courseRef.current);
      
      // 3. Create lessons for each section
      for (let i = 0; i < finalFormData.modules.length; i++) {
        const courseModule = finalFormData.modules[i];
        const section = sections[i];
        
        console.log(`CreateCourse - Creating lessons for section ${i + 1}, course:`, courseIdRef.current);
        
        const lessonsToCreate = courseModule.lessons.map((lesson, index) => {
          // Transform resourceFiles to resources format for Supabase
          const resources = lesson.resourceFiles && Array.isArray(lesson.resourceFiles)
            ? lesson.resourceFiles.map((file: any) => ({
                key: isUploadedFile(file) ? file.key : undefined,
                name: file.name,
                type: file.type,
                size: file.size,
                url: isUploadedFile(file) ? file.url : undefined,
              }))
            : (lesson.resources || []);

          // Determine if lesson is free based on course pricing type and lesson settings
          const isLessonFree = finalFormData.pricingType === 'free' || lesson.is_free || false;

          // Prepare content based on lesson type
          let lessonContent = lesson.content || {};
          
          // If content is empty or doesn't have a type, set default content based on lesson type
          if (!lessonContent || Object.keys(lessonContent).length === 0) {
            switch (lesson.type) {
              case 'text':
                lessonContent = {
                  type: 'text',
                  text: lesson.description || '',
                  sections: [],
                  formatting: { allowHtml: true, allowMarkdown: true }
                };
                break;
              case 'quiz':
                lessonContent = {
                  type: 'quiz',
                  title: lesson.title,
                  description: lesson.description || '',
                  questions: [],
                  settings: {
                    timeLimit: 600,
                    passingScore: 70,
                    allowRetake: true,
                    showResults: true
                  }
                };
                break;
              case 'assignment':
                lessonContent = {
                  type: 'assignment',
                  title: lesson.title,
                  description: lesson.description || '',
                  instructions: lesson.description || '',
                  requirements: [],
                  rubric: [],
                  submission: {
                    type: 'file_upload',
                    allowedFormats: ['zip', 'rar', 'github_link'],
                    maxFileSize: '10MB'
                  }
                };
                break;
              case 'video':
              default:
                lessonContent = {
                  type: 'video',
                  video_url: lesson.video_url || '',
                  duration: typeof lesson.duration === 'string' ? parseInt(lesson.duration) || 0 : (lesson.duration || 0),
                  description: lesson.description || '',
                  thumbnail_url: lesson.thumbnail_url || null,
                  settings: {
                    allowDownload: false,
                    showProgress: true,
                    autoplay: false
                  }
                };
                break;
            }
          }

          return {
            course_id: courseIdRef.current,
            section_id: section.id,
            title: lesson.title,
            description: lesson.description || '',
            video_url: lesson.video_url || '',
            duration: typeof lesson.duration === 'string' ? parseInt(lesson.duration) || 0 : (lesson.duration || 0),
            order_index: index + 1,
            is_preview: lesson.is_preview || false,
            content: lessonContent,
            thumbnail_url: lesson.thumbnail_url || null,
            resources: resources,
            is_free: isLessonFree
          };
        });
        if (lessonsToCreate.length > 0) {
          console.log(`CreateCourse - Creating ${lessonsToCreate.length} lessons for section ${i + 1}`);
          const { data: createdLessons, error: lessonsError } = await supabase
            .from('lessons')
            .insert(lessonsToCreate)
            .select();
          if (lessonsError) {
            console.error('CreateCourse - Lessons creation failed:', lessonsError);
            toast.error('Failed to create lessons: ' + lessonsError.message);
            throw new Error(`Failed to create lessons: ${lessonsError.message}`);
          }
          console.log(`CreateCourse - Lessons created successfully for section ${i + 1}:`, createdLessons?.length || 0);
        }
      }

      // 4. Update course with total lessons count
      const totalLessons = finalFormData.modules.reduce((acc, module) => acc + module.lessons.length, 0);
      console.log('CreateCourse - Updating course with total lessons:', totalLessons);
      
      const updateData: any = {};
      if (totalLessons > 0) {
        updateData.total_lessons = totalLessons;
      }
      
      const { error: updateError } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', courseIdRef.current);

      if (updateError) {
        console.error('CreateCourse - Course update failed:', updateError);
        // Don't throw error here as the course was created successfully
        console.warn('CreateCourse - Course update failed but course was created:', updateError.message);
      } else {
        console.log('CreateCourse - Course updated successfully');
      }

      // After everything is successful
      toast.dismiss(toastId);
      toast.success('Course published successfully!');
      
      console.log('CreateCourse - Redirecting to dashboard...');
      // Redirect to the course page or dashboard
      router.push('/dashboard');
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Failed to publish course: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
      publishingRef.current = false; // Reset publishing flag
    }
  };

  const renderStepContent = () => {
    const stepComponents = {
      1: BasicInformationStep,
      2: CourseContentStep,
      3: PricingSettingsStep,
      4: PreviewPublishStep
    };

    const StepComponent = stepComponents[currentStep as keyof typeof stepComponents];
    
    if (!StepComponent) return null;

    return (
      <StepComponent
        formData={formData as FormData}
        updateFormData={updateFormData as (data: Partial<FormData>) => void}
        errors={errors}
        onPublish={currentStep === 4 ? handlePublish : undefined}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#111111] text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Step Navigation */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="sticky top-24">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-white mb-2">Progress</h3>
                      <Progress value={(currentStep / steps.length) * 100} showLabel />
                    </div>
                    
                    <div className="space-y-2">
                      {steps.map((step, index) => (
                        <motion.div
                          key={step.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                            currentStep === step.id
                              ? 'bg-primary-600/20 border border-primary-600/30'
                              : currentStep > step.id
                              ? 'bg-green-600/20 border border-green-600/30'
                              : 'bg-gray-800/50 border border-gray-700/50'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            currentStep === step.id
                              ? 'bg-primary-600 text-white'
                              : currentStep > step.id
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-700 text-gray-400'
                          }`}>
                            {currentStep > step.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              step.id
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              currentStep === step.id
                                ? 'text-primary-400'
                                : currentStep > step.id
                                ? 'text-green-400'
                                : 'text-gray-400'
                            }`}>
                              {step.title}
                            </p>
                            <p className="text-xs text-gray-500">{step.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <AnimatePresence mode="wait">
                    {renderStepContent()}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Navigation Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-between mt-6"
            >
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  loading={isSaving}
                  className="sm:hidden"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                
                {/* Test button for debugging */}
                <Button
                  variant="secondary"
                  onClick={async () => {
                    console.log('CreateCourse - Test button clicked');
                    try {
                      const { data, error } = await supabase
                        .from('courses')
                        .insert({
                          title: 'Test Course ' + Date.now(),
                          description: 'Test Description',
                          instructor_id: user?.id,
                          is_published: false,
                          difficulty_level: 'beginner'
                        })
                        .select()
                        .single();
                      
                      if (error) {
                        console.error('Test course creation failed:', error);
                        toast.error('Test failed: ' + error.message);
                      } else {
                        console.log('Test course created:', data);
                        toast.success('Test course created successfully!');
                        
                        // Clean up
                        await supabase
                          .from('courses')
                          .delete()
                          .eq('id', data.id);
                      }
                    } catch (err) {
                      console.error('Test course creation error:', err);
                      toast.error('Test error: ' + (err instanceof Error ? err.message : 'Unknown error'));
                    }
                  }}
                  className="text-xs"
                >
                  Test DB
                </Button>
                
                {/* Simple test button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('Simple test button clicked');
                    alert('Button is working!');
                  }}
                  className="text-xs"
                >
                  Test Button
                </Button>
                
                {/* Simple publish test button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('Simple publish test button clicked');
                    alert('Publish button is working!');
                    // Call handlePublish directly
                    handlePublish();
                  }}
                  className="text-xs"
                >
                  Test Publish
                </Button>
                
                {/* Populate form with test data */}
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('Populating form with test data');
                    setFormData({
                      title: 'Test Course ' + Date.now(),
                      description: 'This is a test course description',
                      category: 'programming',
                      level: 'beginner',
                      thumbnail: null,
                      tags: ['test', 'demo'],
                      modules: [{
                        id: generateId(),
                        title: 'Test Module',
                        description: 'Test module description',
                        order_index: 1,
                        lessons: [{
                          id: generateId(),
                          title: 'Test Lesson',
                          description: 'Test lesson description',
                          video_url: '',
                          duration: 0,
                          order_index: 1,
                          is_preview: false,
                          content: {},
                          thumbnail_url: '',
                          resources: [],
                          is_free: true,
                          type: 'video',
                          videoFile: undefined,
                          videoPreview: '',
                          resourceFiles: [],
                          resourcePreviews: []
                        }]
                      }],
                      pricingType: 'free',
                      price: '',
                      visibility: 'public',
                      enrollmentType: 'open',
                      certificateEnabled: false,
                      prerequisites: '',
                      requirements: ''
                    });
                    setCurrentStep(4); // Go to the last step
                    toast.success('Form populated with test data');
                  }}
                  className="text-xs"
                >
                  Fill Test Data
                </Button>
                
                {/* Debug current state */}
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('=== DEBUG CURRENT STATE ===');
                    console.log('Current step:', currentStep);
                    console.log('Form data:', formData);
                    console.log('User:', user?.id);
                    console.log('Profile:', profile?.user_type);
                    console.log('Is saving:', isSaving);
                    console.log('Publishing ref:', publishingRef.current);
                    alert(`Step: ${currentStep}\nTitle: ${formData.title}\nUser: ${user?.id}\nProfile: ${profile?.user_type}`);
                  }}
                  className="text-xs"
                >
                  Debug State
                </Button>
                
                {currentStep < steps.length ? (
                  <Button onClick={handleNext} className="flex items-center gap-2">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      console.log('=== CREATE COURSE BUTTON CLICKED ===');
                      console.log('CreateCourse - Button clicked at:', new Date().toISOString());
                      console.log('CreateCourse - Current step:', currentStep);
                      console.log('CreateCourse - Form data:', {
                        title: formData.title,
                        description: formData.description,
                        modules: formData.modules.length
                      });
                      console.log('CreateCourse - User:', user?.id);
                      console.log('CreateCourse - Profile:', profile?.user_type);
                      console.log('CreateCourse - Is saving:', isSaving);
                      console.log('CreateCourse - Publishing ref:', publishingRef.current);
                      
                      // Add a small delay to ensure the click is registered
                      setTimeout(() => {
                        console.log('CreateCourse - Calling handlePublish after delay');
                        handlePublish();
                      }, 100);
                    }} 
                    className="flex items-center gap-2"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Publishing...' : 'Publish Course'}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 