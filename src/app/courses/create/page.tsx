'use client';

import React, { useState, useEffect } from 'react';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
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

  const handlePublish = async () => {
    let toastId: string | number | undefined;
    try {
      setIsSaving(true);
      // Show S3 upload toast with Progress component
      let s3Progress = 0;
      toastId = toast.loading(
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-primary">Uploading files to AWS S3...</span>
          <Progress value={0} />
          <span className="text-xs text-muted-foreground">This may take a while for large files.</span>
        </div>,
        { duration: Infinity }
      );

      // Simulate S3 upload progress (replace with real progress if available)
      for (let i = 1; i <= 100; i += 10) {
        s3Progress = i;
        toast.loading(
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-primary">Uploading files to AWS S3... {s3Progress}%</span>
            <Progress value={s3Progress} />
            <span className="text-xs text-muted-foreground">This may take a while for large files.</span>
          </div>,
          { id: toastId, duration: Infinity }
        );
        await new Promise(res => setTimeout(res, 50)); // Simulate progress
      }

      // After S3 upload, update toast to Supabase upload
      toast.loading(
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-primary">Saving course data to Supabase...</span>
        </div>,
        { id: toastId, duration: Infinity }
      );

      // 1. Upload thumbnail if it's a File
      let thumbnailUrl = formData.thumbnail;
      if (formData.thumbnail && typeof formData.thumbnail !== 'string') {
        const result = await s3Service.uploadFile(formData.thumbnail, 'thumbnails');
        thumbnailUrl = result.url;
      }

      // 2. Upload all lesson files (videos/resources) if they are File objects
      const modulesWithUploads = await Promise.all(formData.modules.map(async (module) => {
        const lessonsWithUploads = await Promise.all(module.lessons.map(async (lesson) => {
          const lessonId = lesson.id || generateId();
          // Video upload
          let video_url = lesson.video_url;
          let videoFileMeta = lesson.videoFile;
          if (lesson.videoFile && isFile(lesson.videoFile)) {
            try {
              const result = await s3Service.uploadFile(lesson.videoFile, 'videos');
              video_url = result.key;
              videoFileMeta = {
                id: result.key,
                name: lesson.videoFile.name,
                size: lesson.videoFile.size,
                type: lesson.videoFile.type,
                url: result.url,
                key: result.key
              };
            } catch (err) {
              throw err;
            }
          }
          // Resource files upload
          let resourceFilesMeta: (File | UploadedFile)[] = Array.isArray(lesson.resourceFiles) ? lesson.resourceFiles : [];
          if (resourceFilesMeta.length > 0) {
            resourceFilesMeta = await Promise.all(resourceFilesMeta.map(async (file) => {
              if (isFile(file)) {
                const result = await s3Service.uploadFile(file, 'resources');
                const uploaded: UploadedFile = {
                  id: result.key,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  url: result.url,
                  key: result.key
                };
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
            resourceFiles: resourceFilesMeta
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
        ...formData,
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

      // 1. Create the course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
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
        })
        .select()
        .single();

      if (courseError) {
        toast.error('Failed to create course: ' + courseError.message);
        throw new Error(`Failed to create course: ${courseError.message}`);
      }

      // 2. Create course sections (modules)
      const sectionsToCreate = finalFormData.modules.map((module, index) => ({
        course_id: course.id,
        title: module.title,
        description: module.description,
        order_index: index + 1
      }));
      const { data: sections, error: sectionsError } = await supabase
        .from('course_sections')
        .insert(sectionsToCreate)
        .select();

      if (sectionsError) {
        toast.error('Failed to create sections: ' + sectionsError.message);
        throw new Error(`Failed to create sections: ${sectionsError.message}`);
      }

      // 3. Create lessons for each section
      for (let i = 0; i < finalFormData.modules.length; i++) {
        const courseModule = finalFormData.modules[i];
        const section = sections[i];
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
            course_id: course.id,
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
          const { error: lessonsError } = await supabase
            .from('lessons')
            .insert(lessonsToCreate);
          if (lessonsError) {
            toast.error('Failed to create lessons: ' + lessonsError.message);
            throw new Error(`Failed to create lessons: ${lessonsError.message}`);
          }
        }
      }

      // 4. Update course with total lessons count
      const totalLessons = finalFormData.modules.reduce((acc, module) => acc + module.lessons.length, 0);
      const { error: updateError } = await supabase
        .from('courses')
        .update({ total_lessons: totalLessons })
        .eq('id', course.id);

      if (updateError) {
        toast.error('Failed to update course: ' + updateError.message);
        throw new Error(`Failed to update course: ${updateError.message}`);
      }

      // After everything is successful
      toast.dismiss(toastId);
      toast.success('Course published successfully!');
      
      // Redirect to the course page or dashboard
      router.push('/dashboard');
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Failed to publish course: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
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
                
                {currentStep < steps.length ? (
                  <Button onClick={handleNext} className="flex items-center gap-2">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button onClick={handlePublish} className="flex items-center gap-2">
                    Publish Course
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