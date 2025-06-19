'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Save, Check } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/publish_course/Button';
import { Progress } from '@/components/publish_course/Progress';
import { Card, CardContent } from '@/components/publish_course/Card';
import { BasicInformationStep } from '@/components/publish_course/BasicInformationStep';
import { CourseContentStep } from '@/components/publish_course/CourseContentStep';
import { PricingSettingsStep } from '@/components/publish_course/PricingSettingsStep';
import { PreviewPublishStep } from '@/components/publish_course/PreviewPublishStep';

interface FormData {
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnail: string | null;
  tags: string[];
  modules: Array<{
    id: string;
    title: string;
    description: string;
    order_index: number;
    lessons: Array<{
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
    }>;
  }>;
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

export default function CreateCourse() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
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
      alert('Course saved as draft successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsSaving(true);
      console.log('Starting course creation with data:', formData);

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be logged in to create a course');
      }

      // 1. Create the course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: formData.title,
          description: formData.description,
          thumbnail_url: formData.thumbnail,
          price: formData.pricingType === 'paid' ? parseFloat(formData.price) : 0,
          is_published: true,
          difficulty_level: formData.level,
          tags: formData.tags,
          prerequisites: formData.prerequisites.split(',').map(p => p.trim()),
          learning_objectives: formData.requirements.split(',').map(r => r.trim()),
          category: formData.category,
          last_published_at: new Date().toISOString(),
          instructor_id: user.id
        })
        .select()
        .single();

      if (courseError) {
        console.error('Error creating course:', courseError);
        throw new Error(`Failed to create course: ${courseError.message}`);
      }

      console.log('Course created successfully:', course);

      // 2. Create course sections (modules)
      const sectionsToCreate = formData.modules.map((module, index) => ({
        course_id: course.id,
        title: module.title,
        description: module.description,
        order_index: index + 1
      }));

      console.log('Creating sections:', sectionsToCreate);

      const { data: sections, error: sectionsError } = await supabase
        .from('course_sections')
        .insert(sectionsToCreate)
        .select();

      if (sectionsError) {
        console.error('Error creating sections:', sectionsError);
        throw new Error(`Failed to create sections: ${sectionsError.message}`);
      }

      console.log('Sections created successfully:', sections);

      // 3. Create lessons for each section
      for (let i = 0; i < formData.modules.length; i++) {
        const courseModule = formData.modules[i];
        const section = sections[i];

        const lessonsToCreate = courseModule.lessons.map((lesson, index) => ({
          course_id: course.id,
          section_id: section.id,
          title: lesson.title,
          description: lesson.description || '',
          video_url: lesson.video_url || '',
          duration: typeof lesson.duration === 'string' ? parseInt(lesson.duration) || 0 : (lesson.duration || 0),
          order_index: index + 1,
          is_preview: lesson.is_preview || false,
          content: lesson.content || {},
          thumbnail_url: lesson.thumbnail_url || null,
          resources: lesson.resources || [],
          is_free: lesson.is_free || false
        }));

        if (lessonsToCreate.length > 0) {
          const { error: lessonsError } = await supabase
            .from('lessons')
            .insert(lessonsToCreate);

          if (lessonsError) {
            console.error('Error creating lessons:', lessonsError);
            throw new Error(`Failed to create lessons: ${lessonsError.message}`);
          }
        }
      }

      // 4. Update course with total lessons count
      const totalLessons = formData.modules.reduce((acc, module) => acc + module.lessons.length, 0);
      const { error: updateError } = await supabase
        .from('courses')
        .update({ total_lessons: totalLessons })
        .eq('id', course.id);

      if (updateError) {
        console.error('Error updating course:', updateError);
        throw new Error(`Failed to update course: ${updateError.message}`);
      }

      console.log('Course published successfully');
      alert('Course published successfully!');
      // TODO: Add redirect logic based on user preference
      // Possible options:
      // - Redirect to course page: window.location.href = `/courses/${course.id}`;
      // - Redirect to dashboard: window.location.href = '/dashboard';
      // - Stay on current page and show success message
    } catch (error) {
      console.error('Detailed error:', error);
      alert(`Failed to publish course: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        formData={formData}
        updateFormData={updateFormData}
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
                    <div className="space-y-3">
                      {steps.map((step) => (
                        <div
                          key={step.id}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer
                            ${currentStep === step.id ? 'bg-[#0CF2A0]/20 border border-[#0CF2A0]' : 'border border-transparent hover:bg-gray-700'}
                            ${currentStep > step.id ? 'opacity-75' : ''}
                          `}
                          onClick={() => {
                              setCurrentStep(step.id);
                          }}
                        >
                          <div className={`size-8 rounded-full flex items-center justify-center font-bold text-sm
                            ${currentStep === step.id ? 'bg-[#0CF2A0] text-[#111111]' : 'bg-gray-700 text-gray-300'}
                          `}>
                            {currentStep > step.id ? (
                              <Check className="size-4" />
                            ) : (
                              step.id
                            )}
                          </div>
                          <div>
                            <p className={`font-semibold ${currentStep === step.id ? 'text-[#0CF2A0]' : 'text-white'}`}>{step.title}</p>
                            <p className="text-xs text-gray-400">{step.description}</p>
                          </div>
                        </div>
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