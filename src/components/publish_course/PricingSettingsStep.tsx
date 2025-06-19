'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, Lock, Unlock, BookOpen } from 'lucide-react';
import { Input } from '@/components/publish_course/Input';
import { Select } from '@/components/publish_course/Select';
import { Card, CardContent, CardHeader } from '@/components/publish_course/Card';
import { Textarea } from '@/components/publish_course/Textarea';

interface FormData {
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnail: string | null;
  tags: string[];
  modules: Array<{
    title: string;
    description: string;
    order_index: number;
    lessons: Array<{
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

interface PricingSettingsStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  errors: Record<string, string>;
  onPublish?: () => void;
}

const visibilityOptions = [
  { value: 'public', label: 'Public - Anyone can find and enroll' },
  { value: 'private', label: 'Private - Only invited students' },
  { value: 'draft', label: 'Draft - Not visible to students' }
];

const enrollmentOptions = [
  { value: 'open', label: 'Open - Anyone can enroll' },
  { value: 'approval', label: 'Approval Required' },
  { value: 'invite', label: 'Invite Only' }
];

export const PricingSettingsStep: React.FC<PricingSettingsStepProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  const handlePricingTypeChange = (type: 'free' | 'paid') => {
    updateFormData({
      ...formData,
      pricingType: type,
      price: type === 'free' ? '0' : formData.price || ''
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Pricing & Settings</h2>
        <p className="text-gray-400">Configure how students will access your course</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pricing Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pricing
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={`cursor-pointer transition-all duration-200 ${formData.pricingType === 'free' ? 'ring-2 ring-[#0CF2A0] bg-[#0CF2A0]/10' : ''}`}
              onClick={() => handlePricingTypeChange('free')}
            >
              <Card 
                className="w-full"
              >
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-full mx-auto mb-2">
                    <Unlock className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-1">Free Course</h4>
                  <p className="text-sm text-gray-400">
                    Students can access for free
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={`cursor-pointer transition-all duration-200 ${formData.pricingType === 'paid' ? 'ring-2 ring-[#0CF2A0] bg-[#0CF2A0]/10' : ''}`}
              onClick={() => handlePricingTypeChange('paid')}
            >
              <Card 
                className="w-full"
              >
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-[#0CF2A0] rounded-full mx-auto mb-2">
                    <DollarSign className="w-6 h-6 text-[#111111]" />
                  </div>
                  <h4 className="font-semibold text-white mb-1">Paid Course</h4>
                  <p className="text-sm text-gray-400">
                    Students pay to access
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {formData.pricingType === 'paid' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Input
                label="Course Price"
                type="number"
                placeholder="0.00"
                value={formData.price || ''}
                onChange={(e) => updateFormData({ ...formData, price: e.target.value })}
                error={errors.price}
                className="font-mono"
              />
            </motion.div>
          )}
        </motion.div>

        {/* Visibility & Enrollment */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Access Control
          </h3>

          <Select
            label="Course Visibility"
            options={visibilityOptions}
            value={formData.visibility || 'public'}
            onChange={(e) => updateFormData({ ...formData, visibility: e.target.value as 'public' | 'private' | 'draft' })}
            error={errors.visibility}
          />

          <Select
            label="Enrollment Type"
            options={enrollmentOptions}
            value={formData.enrollmentType || 'open'}
            onChange={(e) => updateFormData({ ...formData, enrollmentType: e.target.value as 'open' | 'approval' | 'invite' })}
            error={errors.enrollmentType}
          />

          <div className="flex items-center gap-4">
            <motion.label 
              whileHover={{ scale: 1.02 }}
              className="flex items-center cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.certificateEnabled || false}
                onChange={(e) => updateFormData({ ...formData, certificateEnabled: e.target.checked })}
                className="mr-2 rounded border-gray-700 bg-[#111111] text-[#0CF2A0] focus:ring-[#0CF2A0]/50"
              />
              <span className="text-sm text-white">Enable certificates</span>
            </motion.label>
          </div>
        </motion.div>
      </div>

      {/* Prerequisites */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5" />
          Prerequisites & Requirements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea
            label="Prerequisites"
            placeholder="What should students know before taking this course?"
            rows={4}
            value={formData.prerequisites || ''}
            onChange={(e) => updateFormData({ ...formData, prerequisites: e.target.value })}
            error={errors.prerequisites}
          />
          <Textarea
            label="Requirements"
            placeholder="What will students need to complete this course?"
            rows={4}
            value={formData.requirements || ''}
            onChange={(e) => updateFormData({ ...formData, requirements: e.target.value })}
            error={errors.requirements}
          />
        </div>
      </motion.div>

      {/* Course Settings Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Course Settings Summary</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0CF2A0]">
                  {formData.pricingType === 'free' ? 'Free' : `$${formData.price || '0'}`}
                </div>
                <div className="text-sm text-gray-400">Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0CF2A0]">
                  {formData.visibility === 'public' ? <Unlock className="w-6 h-6 mx-auto" /> : <Lock className="w-6 h-6 mx-auto" />}
                </div>
                <div className="text-sm text-gray-400 capitalize">{formData.visibility || 'Public'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0CF2A0]">
                  <Users className="w-6 h-6 mx-auto" />
                </div>
                <div className="text-sm text-gray-400 capitalize">{formData.enrollmentType || 'Open'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0CF2A0]">
                  {formData.certificateEnabled ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-400">Certificate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}; 