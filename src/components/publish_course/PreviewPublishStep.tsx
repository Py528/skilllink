import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Globe, Clock, Users, BookOpen, AlertCircle, Check, ChevronRight, Play, Download, Search, FileText, Video, HelpCircle, AlignCenter as Assignment, FileVideo, File, Image, FileCode, File as FilePdf, ExternalLink, BarChart3, PlayCircle, FileIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/publish_course/Card';
import { Badge } from '@/components/publish_course/Badge';
import { Button } from '@/components/publish_course/Button';
import { Select } from '@/components/publish_course/Select';
import { Input } from '@/components/publish_course/Input';
import { toast } from '@/components/ui/sonner';

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
  type: string;
  duration: string | number;
  description: string;
  videoFile?: File | UploadedFile;
  videoPreview?: string;
  resourceFiles: (File | UploadedFile)[];
  resourcePreviews?: string[];
  is_free?: boolean;
  is_preview?: boolean;
  content?: Record<string, unknown>;
}

interface Module {
  id: string;
  title: string;
  description?: string;
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

interface PreviewPublishStepProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  onPublish: () => void;
}

const publishOptions = [
  { value: 'now', label: 'Publish Now' },
  { value: 'schedule', label: 'Schedule for Later' },
  { value: 'draft', label: 'Save as Draft' }
];

const contentTypes = [
  { value: 'video', label: 'Video Lesson', icon: Video, color: 'text-purple-400' },
  { value: 'text', label: 'Text Lesson', icon: FileText, color: 'text-blue-400' },
  { value: 'quiz', label: 'Quiz', icon: HelpCircle, color: 'text-yellow-400' },
  { value: 'assignment', label: 'Assignment', icon: Assignment, color: 'text-green-400' }
];

const fileTypeIcons = {
  video: { icon: FileVideo, color: 'text-purple-400' },
  pdf: { icon: FilePdf, color: 'text-red-400' },
  image: { icon: Image, color: 'text-blue-400' },
  document: { icon: FileText, color: 'text-green-400' },
  code: { icon: FileCode, color: 'text-yellow-400' },
  other: { icon: File, color: 'text-gray-400' }
};

// Type guard for UploadedFile
function isUploadedFile(file: File | UploadedFile): file is UploadedFile {
  return (file as UploadedFile).url !== undefined;
}

export const PreviewPublishStep: React.FC<PreviewPublishStepProps> = ({
  formData,
  updateFormData,
  onPublish
}) => {
  const [publishType, setPublishType] = React.useState('now');
  const [scheduleDate, setScheduleDate] = React.useState('');
  const [expandedLessons, setExpandedLessons] = React.useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState('all');
  const [publishStatus, setPublishStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  // Calculate course statistics
  const modules: Module[] = formData.modules || [];
  const totalLessons = modules.reduce((total: number, module: Module) => 
    total + (module.lessons?.length || 0), 0
  );
  
  // Calculate total video duration in seconds
  const totalVideoDurationSeconds = modules.reduce((total: number, module: Module) => {
    return total + (module.lessons?.reduce((lessonTotal: number, lesson: Lesson) => {
      if (lesson.type === 'video' && lesson.duration) {
        if (typeof lesson.duration === 'string') {
          // mm:ss or seconds string
          if (lesson.duration.includes(':')) {
            const [mm, ss] = lesson.duration.split(':').map(Number);
            return lessonTotal + mm * 60 + (ss || 0);
          } else if (lesson.duration.toLowerCase().includes('min')) {
            return lessonTotal + parseInt(lesson.duration) * 60;
          } else if (!isNaN(Number(lesson.duration))) {
            return lessonTotal + Number(lesson.duration);
          }
        } else if (typeof lesson.duration === 'number') {
          return lessonTotal + lesson.duration;
        }
      }
      return lessonTotal;
    }, 0) || 0);
  }, 0);

  const totalResourceFiles = modules.reduce((total: number, module: Module) => {
    return total + (module.lessons?.reduce((lessonTotal: number, lesson: Lesson) => {
      return lessonTotal + (lesson.resourceFiles?.length || 0);
    }, 0) || 0);
  }, 0);

  // Format duration with units (e.g., 1m 00s, 2h 03m 15s, 45s)
  const formatDuration = (secondsOrString: number | string | undefined): string => {
    let seconds = 0;
    if (typeof secondsOrString === 'number') {
      seconds = secondsOrString;
    } else if (typeof secondsOrString === 'string') {
      // If string is in mm:ss format
      if (secondsOrString.includes(':')) {
        const [mm, ss] = secondsOrString.split(':').map(Number);
        seconds = mm * 60 + (ss || 0);
      } else if (secondsOrString.toLowerCase().includes('min')) {
        seconds = parseInt(secondsOrString) * 60;
      } else if (!isNaN(Number(secondsOrString))) {
        seconds = Number(secondsOrString);
      }
    }
    if (!seconds || isNaN(seconds) || seconds < 0) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.round(seconds % 60);
    let result = '';
    if (h > 0) result += `${h}h `;
    if (m > 0 || h > 0) result += `${m}m `;
    result += `${s.toString().padStart(2, '0')}s`;
    return result.trim();
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file type category
  const getFileTypeCategory = (fileName: string, mimeType: string): keyof typeof fileTypeIcons => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    if (extension === 'pdf' || mimeType === 'application/pdf') return 'pdf';
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension || '')) return 'document';
    if (['py', 'tsx', 'jsx', 'js', 'ts', 'env', 'sql', 'json', 'xml', 'html', 'css'].includes(extension || '')) return 'code';
    return 'other';
  };

  // Toggle lesson expansion
  const toggleLesson = (moduleIndex: number, lessonIndex: number) => {
    const lessonKey = `${moduleIndex}-${lessonIndex}`;
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonKey)) {
      newExpanded.delete(lessonKey);
    } else {
      newExpanded.add(lessonKey);
    }
    setExpandedLessons(newExpanded);
  };

  // Filter modules and lessons based on search and filter
  const filteredModules = modules.map((module: Module) => {
    // Filter lessons by search and filterType
    const filteredLessons = module.lessons.filter((lesson: Lesson) => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || lesson.type === filterType;
      return matchesSearch && matchesType;
    });
    // Also match module if its title/description matches search
    const moduleMatches = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return {
      ...module,
      lessons: filteredLessons,
      _show: moduleMatches || filteredLessons.length > 0
    };
  }).filter(m => m._show);

  // Validation checklist
  const checklist = [
    { id: 'title', label: 'Course title', completed: !!formData.title },
    { id: 'description', label: 'Course description', completed: !!formData.description },
    { id: 'category', label: 'Category selected', completed: !!formData.category },
    { id: 'level', label: 'Difficulty level', completed: !!formData.level },
    { id: 'thumbnail', label: 'Course thumbnail', completed: !!formData.thumbnail },
    { id: 'modules', label: 'At least one module', completed: modules.length > 0 },
    { id: 'lessons', label: 'At least one lesson', completed: totalLessons > 0 },
    { id: 'pricing', label: 'Pricing configuration', completed: !!formData.pricingType }
  ];

  const completedItems = checklist.filter(item => item.completed).length;
  const totalItems = checklist.length;
  const isReadyToPublish = completedItems === totalItems;

  React.useEffect(() => {
    if (publishStatus === 'success') {
      setTimeout(() => {
        toast('Course published!', {
          description: 'Your course was published successfully.',
          duration: 5000,
        });
      }, 800);
    } else if (publishStatus === 'error') {
      setTimeout(() => {
        toast('Publish failed', {
          description: 'There was an error publishing your course.',
          duration: 5000,
        });
      }, 800);
    }
  }, [publishStatus]);

  const handlePublish = async () => {
    // Transform modules/lessons for Supabase
    const transformedModules = (formData.modules || []).map((mod) => ({
      ...mod,
      lessons: (mod.lessons || []).map((lesson) => {
        // Transform resourceFiles to resources format for Supabase
        const resources = Array.isArray(lesson.resourceFiles)
          ? lesson.resourceFiles.map((file, idx) => {
              if (isUploadedFile(file)) {
                return {
                  key: file.key,
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  url: file.url,
                };
              } else {
                return {
                  key: undefined,
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  url: lesson.resourcePreviews && lesson.resourcePreviews[idx] ? lesson.resourcePreviews[idx] : undefined,
                };
              }
            })
          : [];
        
        return {
          ...lesson,
          description: lesson.description || '',
          is_free: lesson.is_free || false,
          is_preview: lesson.is_preview || false,
          content: (lesson.type === 'text' || lesson.type === 'quiz' || lesson.type === 'assignment') ? lesson.content : {},
          resources: resources,
        videoFile: undefined,
        resourceFiles: undefined,
        };
      }),
    }));
    // Data to send to Supabase (no UI-only fields)
    const publishData = {
      ...formData,
      modules: transformedModules,
      thumbnail_url: formData.thumbnail,
      publishType,
      scheduleDate: publishType === 'schedule' ? scheduleDate : null,
      publishedAt: publishType === 'now' ? new Date().toISOString() : null
    };
    // Data to update form state (keep thumbnail for UI)
    const formStateData = {
      ...formData,
      modules: transformedModules,
      // keep 'thumbnail' for UI
    };
    try {
      // Replace this with your actual save logic
      // Example: const { data, error } = await supabase.from('courses').insert([publishData]);
      // For now, just simulate:
      // Simulate response:
      setPublishStatus('success');
    } catch (err) {
      console.error('[PUBLISH] Exception during publish:', err);
      setPublishStatus('error');
    }
    // Ensure all modules/lessons have resourceFiles as array
    const safeModules = (formStateData.modules || []).map((mod) => ({
      ...mod,
      lessons: (mod.lessons || []).map((lesson) => ({
        ...lesson,
        resourceFiles: Array.isArray(lesson.resourceFiles) ? lesson.resourceFiles : [],
      })),
    }));
    updateFormData({ ...formStateData, modules: safeModules });
    onPublish();
  };

  // Render lesson content preview
  const renderLessonPreview = (lesson: Lesson, moduleIndex: number, lessonIndex: number) => {
    const lessonKey = `${moduleIndex}-${lessonIndex}`;
    const isExpanded = expandedLessons.has(lessonKey);
    const contentType = contentTypes.find(ct => ct.value === lesson.type);
    const IconComponent = contentType?.icon || Video;
    const iconColor = contentType?.color || 'text-gray-400';

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-gray-800/50 rounded-xl overflow-hidden bg-[#111111]/30"
      >
        <motion.div
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => toggleLesson(moduleIndex, lessonIndex)}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </motion.div>
            <IconComponent className={`w-5 h-5 ${iconColor}`} />
            <div>
              <h5 className="font-medium text-white">{lesson.title}</h5>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" size="sm">
                  {contentType?.label}
                </Badge>
                {lesson.duration && (
                  <span className="text-xs text-gray-400">{formatDuration(lesson.duration)}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lesson.videoFile && (
              <Badge variant="primary" size="sm">
                <PlayCircle className="w-3 h-3 mr-1" />
                Video
              </Badge>
            )}
            {lesson.resourceFiles && lesson.resourceFiles.length > 0 && (
              <Badge variant="secondary" size="sm">
                <FileIcon className="w-3 h-3 mr-1" />
                {lesson.resourceFiles.length}
              </Badge>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-800/50 p-4 bg-[#111111]/50"
            >
              <div className="space-y-4">
                {/* Lesson Description */}
                {lesson.description && (
                  <div>
                    <h6 className="text-sm font-medium text-white mb-2">Description</h6>
                    <p className="text-sm text-gray-400">{lesson.description}</p>
                  </div>
                )}

                {/* Video Preview */}
                {lesson.videoFile && (
                  <div>
                    <h6 className="text-sm font-medium text-white mb-2">Video Content</h6>
                    <div className="bg-[#111111] rounded-lg p-4 border border-gray-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                            <PlayCircle className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{lesson.videoFile.name}</p>
                            <p className="text-sm text-gray-400">{formatFileSize(lesson.videoFile.size)}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => isUploadedFile(lesson.videoFile!) ? window.open(lesson.videoFile!.url, '_blank') : (lesson.videoPreview ? window.open(lesson.videoPreview, '_blank') : undefined)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resource Files */}
                {lesson.resourceFiles && lesson.resourceFiles.length > 0 && (
                  <div>
                    <h6 className="text-sm font-medium text-white mb-2">
                      Resource Files ({lesson.resourceFiles.length})
                    </h6>
                    <div className="space-y-2">
                      {lesson.resourceFiles.map((file, fileIndex) => {
                        const fileCategory = getFileTypeCategory(file.name, file.type);
                        const fileIcon = fileTypeIcons[fileCategory];
                        const IconComponent = fileIcon.icon;

                        return (
                          <motion.div
                            key={isUploadedFile(file) ? file.id : `file-${fileIndex}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: fileIndex * 0.05 }}
                            className="flex items-center justify-between p-3 bg-[#111111] rounded-lg border border-gray-800/50 hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <IconComponent className={`w-5 h-5 ${fileIcon.color}`} />
                              <div>
                                <p className="text-white font-medium text-sm">{file.name}</p>
                                <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => isUploadedFile(file) ? window.open(file.url, '_blank') : (lesson.resourcePreviews && lesson.resourcePreviews[fileIndex] ? window.open(lesson.resourcePreviews[fileIndex], '_blank') : undefined)}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = file.url;
                                  link.download = file.name;
                                  link.click();
                                }}
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Text Lesson Preview */}
                {lesson.type === 'text' && (
                  <div>
                    <h6 className="text-sm font-medium text-white mb-2">Text Content Preview</h6>
                    <div className="bg-[#111111] rounded-lg p-4 border border-gray-800/50">
                      <p className="text-gray-400 text-sm italic">
                        Text lesson content would be displayed here...
                      </p>
                    </div>
                  </div>
                )}

                {/* Quiz/Assignment Preview */}
                {(lesson.type === 'quiz' || lesson.type === 'assignment') && (
                  <div>
                    <h6 className="text-sm font-medium text-white mb-2">
                      {lesson.type === 'quiz' ? 'Quiz' : 'Assignment'} Details
                    </h6>
                    <div className="bg-[#111111] rounded-lg p-4 border border-gray-800/50">
                      <p className="text-gray-400 text-sm italic">
                        {lesson.type === 'quiz' ? 'Quiz questions and settings' : 'Assignment instructions and requirements'} would be configured here...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
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
        <p className="text-gray-400">Review your course structure and publish when ready</p>
      </div>

      {/* Course Statistics Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Course Overview
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0CF2A0]">{modules.length}</div>
                <div className="text-sm text-gray-400">Modules</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0CF2A0]">{totalLessons}</div>
                <div className="text-sm text-gray-400">Lessons</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0CF2A0]">
                  {formatDuration(totalVideoDurationSeconds)}
                </div>
                <div className="text-sm text-gray-400">Video Content</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#0CF2A0]">{totalResourceFiles}</div>
                <div className="text-sm text-gray-400">Resources</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Preview (move to left) */}
        <div className="space-y-6 lg:col-span-1 order-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5" />
              Course Preview
            </h3>
            <Card className="overflow-hidden" hover>
              {formData.thumbnail && (
                <div className="aspect-video bg-[#111111]">
                  <img
                    src={typeof formData.thumbnail === 'string' ? formData.thumbnail : formData.thumbnailPreview || undefined}
                    alt={formData.title || 'Untitled Course'}
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
                    <span>{modules.length} modules</span>
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
                  {Array.isArray(formData.tags) && formData.tags.slice(0, 3).map((tag: string, index: number) => (
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
                  {Array.isArray(formData.tags) && formData.tags.length > 3 && (
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
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
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
                  className="mt-4"
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

        {/* Course Structure (move to right) */}
        <div className="space-y-4 lg:col-span-2 order-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Course Structure
            </h3>
            {/* Search and Filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search modules/lessons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
              <Select
                options={[
                  { value: 'all', label: 'All Types' },
                  ...contentTypes.map(ct => ({ value: ct.value, label: ct.label }))
                ]}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {filteredModules.map((module: Module) => {
                const moduleLessons = module.lessons || [];
                return (
                  <motion.div
                    key={module.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden">
                      <motion.div
                        className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-[#111111]/10"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-[#0CF2A0]" />
                          <div>
                            <h4 className="font-semibold text-white">{module.title}</h4>
                            {module.description && (
                              <p className="text-sm text-gray-400 mt-1">{module.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {moduleLessons.length} lessons
                          </Badge>
                          <Badge variant="primary" size="sm">
                            Module
                          </Badge>
                        </div>
                      </motion.div>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 space-y-3 bg-[#111111]/20"
                      >
                        {moduleLessons.length > 0 ? (
                          moduleLessons.map((lesson: Lesson, lessonIndex: number) => (
                            <div key={lessonIndex}>
                              {renderLessonPreview(lesson, 0, lessonIndex)}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-400">No lessons in this module yet</p>
                          </div>
                        )}
                      </motion.div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filteredModules.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="text-center py-12">
                  <CardContent>
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {searchQuery ? 'No matching content found' : 'No modules created yet'}
                    </h3>
                    <p className="text-gray-400">
                      {searchQuery 
                        ? 'Try adjusting your search terms or filters'
                        : 'Go back to Course Content to add your first module'
                      }
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Publishing Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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
        transition={{ delay: 0.5 }}
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