'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
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
  modules: any[];
  pricingType: 'free' | 'paid';
  price: string;
  visibility: string;
  enrollmentType: string;
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
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    level: '',
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Course published successfully!');
      // Redirect to course page or dashboard
    } catch (error) {
      console.error('Error publishing course:', error);
      alert('Failed to publish course. Please try again.');
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      // Redirect to dashboard or course list
      window.history.back();
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
                    <div className="space-y-2">
                      {steps.map((step, index) => (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className={`p-3 rounded-xl border transition-all duration-200 ${
                            currentStep === step.id
                              ? 'border-[#0CF2A0] bg-[#0CF2A0]/10'
                              : currentStep > step.id
                              ? 'border-green-500/50 bg-green-600/10'
                              : 'border-gray-800/50 bg-[#111111]/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <motion.div 
                              animate={currentStep === step.id ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 0.5, repeat: currentStep === step.id ? Infinity : 0, repeatDelay: 2 }}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                currentStep === step.id
                                  ? 'bg-[#0CF2A0] text-[#111111]'
                                  : currentStep > step.id
                                  ? 'bg-green-600 text-white'
                                  : 'bg-[#111111] text-gray-400 border border-gray-700'
                              }`}
                            >
                              {currentStep > step.id ? '✓' : step.id}
                            </motion.div>
                            <div>
                              <div className={`text-sm font-medium ${
                                currentStep >= step.id ? 'text-white' : 'text-gray-400'
                              }`}>
                                {step.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                {step.description}
                              </div>
                            </div>
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