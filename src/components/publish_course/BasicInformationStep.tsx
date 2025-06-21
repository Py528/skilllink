'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Plus } from 'lucide-react';
import { Input } from '@/components/publish_course/Input';
import { Textarea } from '@/components/publish_course/Textarea';
import { Select } from '@/components/publish_course/Select';
import { Button } from '@/components/publish_course/Button';
import { Badge } from './Badge';

interface FormData {
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnail: File | string | null;
  thumbnailPreview?: string;
  tags: string[];
}

interface BasicInformationStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  errors: Record<string, string>;
}

const categories = [
  { value: '', label: 'Select a category' },
  { value: 'programming', label: 'Programming' },
  { value: 'design', label: 'Design' },
  { value: 'business', label: 'Business' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'photography', label: 'Photography' },
  { value: 'music', label: 'Music' },
  { value: 'health', label: 'Health & Fitness' },
  { value: 'language', label: 'Language' }
];

const levels = [
  { value: '', label: 'Select level' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

export const BasicInformationStep: React.FC<BasicInformationStepProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  const [newTag, setNewTag] = React.useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      updateFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateFormData({
      ...formData,
      tags: formData.tags?.filter((tag: string) => tag !== tagToRemove) || []
    });
  };

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      updateFormData({
        ...formData,
        thumbnail: file,
        thumbnailPreview: previewUrl || undefined
      });
    }
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
        <h2 className="text-2xl font-bold text-white mb-2">Course Basic Information</h2>
        <p className="text-gray-400">Let&apos;s start with the fundamentals of your course</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <Input
            label="Course Title"
            placeholder="Enter your course title"
            value={formData.title || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormData({ ...formData, title: e.target.value })}
            error={errors.title}
          />

          <Textarea
            label="Course Description"
            placeholder="Describe what students will learn in this course"
            rows={6}
            value={formData.description || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData({ ...formData, description: e.target.value })}
            error={errors.description}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category"
              options={categories}
              value={formData.category || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFormData({ ...formData, category: e.target.value })}
              error={errors.category}
            />

            <Select
              label="Difficulty Level"
              options={levels}
              value={formData.level || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFormData({ ...formData, level: e.target.value })}
              error={errors.level}
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Course Thumbnail
            </label>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-gray-600 transition-colors bg-[#111111]/50 backdrop-blur-sm"
            >
              <AnimatePresence mode="wait">
                {formData.thumbnail ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative"
                  >
                    <img
                      src={typeof formData.thumbnail === 'string' ? formData.thumbnail : formData.thumbnailPreview}
                      alt="Course thumbnail"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => updateFormData({ ...formData, thumbnail: null, thumbnailPreview: undefined })}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">Upload course thumbnail</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Recommended: 1280x720px, JPG or PNG
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label
                      htmlFor="thumbnail-upload"
                      className="inline-flex items-center px-4 py-2 bg-[#0CF2A0] text-[#111111] rounded-xl hover:bg-[#0CF2A0]/90 transition-colors cursor-pointer font-semibold"
                    >
                      Choose File
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Add a tag"
                value={newTag}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1"
              />
              <Button type="button" onClick={handleAddTag} size="md">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {formData.tags?.map((tag: string, index: number) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};