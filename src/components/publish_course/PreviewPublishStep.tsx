import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Globe, Clock, Users, BookOpen, AlertCircle, Check } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/publish_course/Card';
import { Badge } from '@/components/publish_course/Badge';
import { Button } from '@/components/publish_course/Button';
import { Select } from '@/components/publish_course/Select';

interface PreviewPublishStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  errors: any;
  onPublish: () => void;
}

const publishOptions = [
  { value: 'now', label: 'Publish Now' },
  { value: 'schedule', label: 'Schedule for Later' },
  { value: 'draft', label: 'Save as Draft' }
];

export const PreviewPublishStep: React.FC<PreviewPublishStepProps> = ({
  formData,
  updateFormData,
  errors,
  onPublish
}) => {
  const [publishType, setPublishType] = React.useState('now');
  const [scheduleDate, setScheduleDate] = React.useState('');

  // Validation checklist
  const checklist = [
    { id: 'title', label: 'Course title', completed: !!formData.title },
    { id: 'description', label: 'Course description', completed: !!formData.description },
    { id: 'category', label: 'Category selected', completed: !!formData.category },
    { id: 'level', label: 'Difficulty level', completed: !!formData.level },
    { id: 'thumbnail', label: 'Course thumbnail', completed: !!formData.thumbnail },
    { id: 'modules', label: 'At least one module', completed: formData.modules?.length > 0 },
    { id: 'lessons', label: 'At least one lesson', completed: formData.modules?.some((m: any) => m.lessons?.length > 0) },
    { id: 'pricing', label: 'Pricing configuration', completed: !!formData.pricingType }
  ];

  const completedItems = checklist.filter(item => item.completed).length;
  const totalItems = checklist.length;
  const isReadyToPublish = completedItems === totalItems;

  const totalLessons = formData.modules?.reduce((total: number, module: any) => 
    total + (module.lessons?.length || 0), 0
  ) || 0;

  const handlePublish = () => {
    const publishData = {
      ...formData,
      publishType,
      scheduleDate: publishType === 'schedule' ? scheduleDate : null,
      publishedAt: publishType === 'now' ? new Date().toISOString() : null
    };
    updateFormData(publishData);
    onPublish();
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
        <h2 className="text-2xl font-bold text-white mb-2">Preview & Publish</h2>
        <p className="text-gray-400">Review your course and publish when ready</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Course Preview
          </h3>
          
          <Card className="overflow-hidden" hover>
            {formData.thumbnail && (
              <div className="aspect-video bg-[#111111]">
                <img
                  src={formData.thumbnail}
                  alt={formData.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-lg font-semibold text-white line-clamp-2">
                  {formData.title || 'Untitled Course'}
                </h4>
                <Badge variant={formData.pricingType === 'free' ? 'success' : 'primary'} className="ml-2">
                  {formData.pricingType === 'free' ? 'Free' : `$${formData.price || '0'}`}
                </Badge>
              </div>
              
              <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                {formData.description || 'No description provided'}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{formData.modules?.length || 0} modules</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="capitalize">{formData.level || 'Any level'}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.tags?.slice(0, 3).map((tag: string, index: number) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Badge variant="secondary" size="sm">
                      {tag}
                    </Badge>
                  </motion.div>
                ))}
                {formData.tags?.length > 3 && (
                  <Badge variant="secondary" size="sm">
                    +{formData.tags.length - 3} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Publish Checklist */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Check className="w-5 h-5" />
            Publish Checklist
            <Badge variant={isReadyToPublish ? 'success' : 'warning'} className="ml-2">
              {completedItems}/{totalItems}
            </Badge>
          </h3>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {checklist.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div 
                      animate={item.completed ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        item.completed ? 'bg-[#0CF2A0]' : 'bg-[#111111] border border-gray-700'
                      }`}
                    >
                      {item.completed && <Check className="w-3 h-3 text-[#111111]" />}
                    </motion.div>
                    <span className={`text-sm ${
                      item.completed ? 'text-[#0CF2A0]' : 'text-gray-400'
                    }`}>
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <AnimatePresence>
            {!isReadyToPublish && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-yellow-600/50 bg-yellow-600/10">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-400 mb-1">
                          Course Not Ready
                        </h4>
                        <p className="text-sm text-yellow-300">
                          Complete all checklist items before publishing your course.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Publishing Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Publishing Options
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Publishing Action"
                options={publishOptions}
                value={publishType}
                onChange={(e) => setPublishType(e.target.value)}
              />
              
              <AnimatePresence>
                {publishType === 'schedule' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-white mb-2">
                      Schedule Date
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#111111] border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/50 focus:border-[#0CF2A0] hover:border-gray-600 transition-all duration-200"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Publish Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center"
      >
        <Button
          onClick={handlePublish}
          disabled={!isReadyToPublish && publishType !== 'draft'}
          size="lg"
          className="px-8"
        >
          {publishType === 'now' && 'Publish Course Now'}
          {publishType === 'schedule' && 'Schedule Course'}
          {publishType === 'draft' && 'Save as Draft'}
        </Button>
      </motion.div>
    </motion.div>
  );
};