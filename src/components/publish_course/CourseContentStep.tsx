'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GripVertical, Video, FileText, HelpCircle, AlignCenter as Assignment, Trash2, Edit3, Upload, X, File, Image, FileVideo, File as FilePdf, FileCode, Download, Eye, AlertCircle } from 'lucide-react';
import { Button } from "@/components/publish_course/Button";
import { Card, CardContent, CardHeader } from '@/components/publish_course/Card';
import { Input } from '@/components/publish_course/Input';
import { Select } from '@/components/publish_course/Select';
import { Badge } from '@/components/publish_course/Badge';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadProgress?: number;
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
  videoFile?: UploadedFile;
  resourceFiles: UploadedFile[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

interface CourseContentStepProps {
  formData: {
    modules: Module[];
  };
  updateFormData: (data: Partial<CourseContentStepProps['formData']>) => void;
}

const contentTypes = [
  { value: 'video', label: 'Video Lesson', icon: Video },
  { value: 'text', label: 'Text Lesson', icon: FileText },
  { value: 'quiz', label: 'Quiz', icon: HelpCircle },
  { value: 'assignment', label: 'Assignment', icon: Assignment }
];

// Supported file types and their configurations
const fileTypeConfig = {
  video: {
    accept: 'video/*',
    maxSize: 500 * 1024 * 1024, // 500MB
    icon: FileVideo,
    color: 'text-purple-400'
  },
  pdf: {
    accept: '.pdf',
    maxSize: 50 * 1024 * 1024, // 50MB
    icon: FilePdf,
    color: 'text-red-400'
  },
  image: {
    accept: 'image/*',
    maxSize: 10 * 1024 * 1024, // 10MB
    icon: Image,
    color: 'text-blue-400'
  },
  document: {
    accept: '.doc,.docx,.txt,.rtf',
    maxSize: 25 * 1024 * 1024, // 25MB
    icon: FileText,
    color: 'text-green-400'
  },
  code: {
    accept: '.py,.tsx,.jsx,.js,.ts,.env,.sql,.json,.xml,.html,.css',
    maxSize: 5 * 1024 * 1024, // 5MB
    icon: FileCode,
    color: 'text-yellow-400'
  },
  other: {
    accept: '*',
    maxSize: 25 * 1024 * 1024, // 25MB
    icon: File,
    color: 'text-gray-400'
  }
};

export const CourseContentStep: React.FC<CourseContentStepProps> = ({
  formData,
  updateFormData
}) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [editingModule, setEditingModule] = useState<number | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ moduleIndex: number; lessonIndex: number } | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [dragOver, setDragOver] = useState<string | null>(null);

  const modules = formData.modules || [];

  // Generate unique file ID
  const generateFileId = () => `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Get file type category based on file extension/mime type
  const getFileTypeCategory = (file: File): keyof typeof fileTypeConfig => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type.toLowerCase();

    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    if (extension === 'pdf' || mimeType === 'application/pdf') return 'pdf';
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension || '')) return 'document';
    if (['py', 'tsx', 'jsx', 'js', 'ts', 'env', 'sql', 'json', 'xml', 'html', 'css'].includes(extension || '')) return 'code';
    return 'other';
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Simulate file upload (replace with actual upload logic)
  const uploadFile = async (file: File): Promise<UploadedFile> => {
    return new Promise((resolve) => {
      // Simulate upload progress
      const fileId = generateFileId();
      let progress = 0;
      
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          clearInterval(interval);
          // Simulate successful upload
          resolve({
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file), // In production, this would be the actual uploaded file URL
          });
        }
      }, 200);
    });
  };

  // Handle file upload for lessons
  const handleFileUpload = async (
    moduleIndex: number, 
    lessonIndex: number, 
    files: FileList | File[], 
    isVideo: boolean = false
  ) => {
    const fileArray = Array.from(files);
    const uploadKey = `${moduleIndex}-${lessonIndex}`;
    
    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));

    try {
      const uploadPromises = fileArray.map(async (file) => {
        const fileCategory = getFileTypeCategory(file);
        const config = fileTypeConfig[fileCategory];

        // Validate file size
        if (file.size > config.maxSize) {
          throw new Error(`File ${file.name} is too large. Maximum size is ${formatFileSize(config.maxSize)}`);
        }

        return await uploadFile(file);
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      
      // Update lesson with uploaded files
      const updatedModules = modules.map((module: Module, mIndex: number) =>
        mIndex === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson: Lesson, lIndex: number) =>
                lIndex === lessonIndex
                  ? {
                      ...lesson,
                      ...(isVideo 
                        ? { videoFile: uploadedFiles[0] } // Only one video per lesson
                        : { resourceFiles: [...(lesson.resourceFiles || []), ...uploadedFiles] }
                      )
                    }
                  : lesson
              )
            }
          : module
      );

      updateFormData({ ...formData, modules: updatedModules });
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  // Remove uploaded file
  const removeFile = (moduleIndex: number, lessonIndex: number, fileId: string, isVideo: boolean = false) => {
    const updatedModules = modules.map((module: Module, mIndex: number) =>
      mIndex === moduleIndex
        ? {
            ...module,
            lessons: module.lessons.map((lesson: Lesson, lIndex: number) =>
              lIndex === lessonIndex
                ? {
                    ...lesson,
                    ...(isVideo 
                      ? { videoFile: undefined }
                      : { resourceFiles: lesson.resourceFiles?.filter(file => file.id !== fileId) || [] }
                    )
                  }
                : lesson
            )
          }
        : module
    );

    updateFormData({ ...formData, modules: updatedModules });
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent, lessonKey: string) => {
    e.preventDefault();
    setDragOver(lessonKey);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, moduleIndex: number, lessonIndex: number, isVideo: boolean = false) => {
    e.preventDefault();
    setDragOver(null);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(moduleIndex, lessonIndex, files, isVideo);
    }
  };

  // Render file upload area
  const renderFileUploadArea = (
    moduleIndex: number, 
    lessonIndex: number, 
    lesson: Lesson, 
    isVideo: boolean = false
  ) => {
    const uploadKey = `${moduleIndex}-${lessonIndex}`;
    const lessonKey = `${uploadKey}-${isVideo ? 'video' : 'resources'}`;
    const isUploading = uploadingFiles[uploadKey];
    const isDragOver = dragOver === lessonKey;

    return (
      <div className="space-y-3">
        {/* Video Upload Section */}
        {isVideo && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Video File
            </label>
            {lesson.videoFile ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between p-3 bg-[#111111]/50 rounded-xl border border-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  <FileVideo className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">{lesson.videoFile.name}</p>
                    <p className="text-sm text-gray-400">{formatFileSize(lesson.videoFile.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(lesson.videoFile!.url, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(moduleIndex, lessonIndex, lesson.videoFile!.id, true)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                  isDragOver 
                    ? 'border-[#0CF2A0] bg-[#0CF2A0]/10' 
                    : 'border-gray-700 hover:border-gray-600'
                } bg-[#111111]/50`}
                onDragOver={(e) => handleDragOver(e, lessonKey)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, moduleIndex, lessonIndex, true)}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Upload className="w-8 h-8 text-[#0CF2A0] mb-2" />
                    </motion.div>
                    <p className="text-[#0CF2A0]">Uploading video...</p>
                  </div>
                ) : (
                  <>
                    <FileVideo className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400 mb-2">Drop video file here or click to upload</p>
                    <p className="text-xs text-gray-500 mb-3">
                      Supported: MP4, MOV, AVI (Max: 500MB)
                    </p>
                    <input
                      type="file"
                      accept={fileTypeConfig.video.accept}
                      onChange={(e) => e.target.files && handleFileUpload(moduleIndex, lessonIndex, e.target.files, true)}
                      className="hidden"
                      id={`video-upload-${lessonKey}`}
                    />
                    <label
                      htmlFor={`video-upload-${lessonKey}`}
                      className="inline-flex items-center px-4 py-2 bg-[#0CF2A0] text-[#111111] rounded-xl hover:bg-[#0CF2A0]/90 transition-colors cursor-pointer font-semibold"
                    >
                      Choose Video
                    </label>
                  </>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Resource Files Upload Section */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Resource Files
            <span className="text-gray-400 text-xs ml-2">(PDFs, documents, code files, etc.)</span>
          </label>
          
          {/* Existing Resource Files */}
          {lesson.resourceFiles && lesson.resourceFiles.length > 0 && (
            <div className="space-y-2 mb-3">
              <AnimatePresence>
                {lesson.resourceFiles.map((file, index) => {
                  const fileCategory = getFileTypeCategory({ name: file.name, type: file.type } as File);
                  const IconComponent = fileTypeConfig[fileCategory].icon;
                  const iconColor = fileTypeConfig[fileCategory].color;

                  return (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-[#111111]/50 rounded-xl border border-gray-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-5 h-5 ${iconColor}`} />
                        <div>
                          <p className="text-white font-medium">{file.name}</p>
                          <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(moduleIndex, lessonIndex, file.id, false)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Upload Area for Resources */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 ${
              isDragOver && !isVideo
                ? 'border-[#0CF2A0] bg-[#0CF2A0]/10' 
                : 'border-gray-700 hover:border-gray-600'
            } bg-[#111111]/50`}
            onDragOver={(e) => handleDragOver(e, lessonKey)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, moduleIndex, lessonIndex, false)}
          >
            {isUploading ? (
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Upload className="w-6 h-6 text-[#0CF2A0] mb-2" />
                </motion.div>
                <p className="text-[#0CF2A0] text-sm">Uploading files...</p>
              </div>
            ) : (
              <>
                <File className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm mb-2">Drop files here or click to upload</p>
                <p className="text-xs text-gray-500 mb-3">
                  Multiple files supported (PDFs, docs, code files, images)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.py,.tsx,.jsx,.js,.ts,.env,.sql,.json,.xml,.html,.css,image/*"
                  onChange={(e) => e.target.files && handleFileUpload(moduleIndex, lessonIndex, e.target.files, false)}
                  className="hidden"
                  id={`resource-upload-${lessonKey}`}
                />
                <label
                  htmlFor={`resource-upload-${lessonKey}`}
                  className="inline-flex items-center px-3 py-1.5 bg-[#111111] text-gray-300 rounded-lg hover:bg-white/5 transition-colors cursor-pointer text-sm border border-gray-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Files
                </label>
              </>
            )}
          </motion.div>
        </div>
      </div>
    );
  };

  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      title: 'New Module',
      description: '',
      order_index: formData.modules.length,
      lessons: [],
    };
    updateFormData({ modules: [...formData.modules, newModule] });
    setExpandedModules(new Set([...expandedModules, newModule.id]));
    setEditingModule(formData.modules.length);
  };

  const updateModule = (moduleIndex: number, updatedModule: Partial<Module>) => {
    const updatedModules = modules.map((module: Module, index: number) =>
      index === moduleIndex ? { ...module, ...updatedModule } : module
    );
    updateFormData({ modules: updatedModules });
  };

  const deleteModule = (moduleIndex: number) => {
    const updatedModules = modules.filter((_: Module, index: number) => index !== moduleIndex);
    updateFormData({ modules: updatedModules });
    const newExpanded = new Set(expandedModules);
    newExpanded.delete(modules[moduleIndex].id);
    setExpandedModules(newExpanded);
  };

  const addLesson = (moduleIndex: number) => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: 'New Lesson',
      description: '',
      video_url: '',
      duration: 0,
      order_index: modules[moduleIndex].lessons.length,
      is_preview: false,
      content: {},
      resources: [],
      is_free: false,
      type: 'video',
      videoFile: undefined,
      resourceFiles: []
    };
    const updatedModules = modules.map((module: Module, index: number) =>
      index === moduleIndex
        ? { ...module, lessons: [...module.lessons, newLesson] }
        : module
    );
    updateFormData({ modules: updatedModules });
    setEditingLesson({ moduleIndex, lessonIndex: modules[moduleIndex].lessons.length });
  };

  const updateLesson = (moduleIndex: number, lessonIndex: number, updatedLesson: Partial<Lesson>) => {
    const updatedModules = modules.map((module: Module, index: number) =>
      index === moduleIndex
        ? {
            ...module,
            lessons: module.lessons.map((lesson: Lesson, lIndex: number) =>
              lIndex === lessonIndex ? { ...lesson, ...updatedLesson } : lesson
            )
          }
        : module
    );
    updateFormData({ modules: updatedModules });
  };

  const deleteLesson = (moduleIndex: number, lessonIndex: number) => {
    const updatedModules = modules.map((module: Module, index: number) =>
      index === moduleIndex
        ? {
            ...module,
            lessons: module.lessons.filter((_: Lesson, lIndex: number) => lIndex !== lessonIndex)
          }
        : module
    );
    updateFormData({ modules: updatedModules });
  };

  const getContentTypeIcon = (type: string) => {
    const contentType = contentTypes.find(ct => ct.value === type);
    return contentType?.icon || Video;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Course Content</h2>
          <p className="text-gray-400">Structure your course with modules and lessons</p>
        </div>
        <Button onClick={addModule}>
          <Plus className="w-4 h-4 mr-2" />
          Add Module
        </Button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {modules.map((module: Module, moduleIndex: number) => (
            <motion.div
              key={moduleIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: moduleIndex * 0.1 }}
            >
              <Card className="overflow-hidden" hover>
                <CardHeader className="bg-[#111111]/50 border-b border-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="w-5 h-5 text-gray-400" />
                      </motion.div>
                      {editingModule === moduleIndex ? (
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            value={module.title}
                            onChange={(e) => updateModule(moduleIndex, { ...module, title: e.target.value })}
                            placeholder="Module title"
                          />
                          <Input
                            value={module.description}
                            onChange={(e) => updateModule(moduleIndex, { ...module, description: e.target.value })}
                            placeholder="Module description"
                          />
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                          {module.description && (
                            <p className="text-sm text-gray-400">{module.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {module.lessons?.length || 0} lessons
                      </Badge>
                      {editingModule === moduleIndex ? (
                        <Button
                          size="sm"
                          onClick={() => setEditingModule(null)}
                        >
                          Save
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingModule(moduleIndex)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteModule(moduleIndex)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <AnimatePresence>
                      {module.lessons?.map((lesson: Lesson, lessonIndex: number) => {
                        const IconComponent = getContentTypeIcon(lesson.type || 'video');
                        const isEditingThisLesson = editingLesson?.moduleIndex === moduleIndex && editingLesson?.lessonIndex === lessonIndex;
                        
                        return (
                          <motion.div
                            key={lessonIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: lessonIndex * 0.05 }}
                            className="p-4 bg-[#111111]/50 rounded-xl border border-gray-800/50 hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  className="cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                </motion.div>
                                <IconComponent className="w-5 h-5 text-[#0CF2A0]" />
                                {isEditingThisLesson ? (
                                  <div className="flex gap-2 flex-wrap">
                                    <Input
                                      value={lesson.title}
                                      onChange={(e) => updateLesson(moduleIndex, lessonIndex, { ...lesson, title: e.target.value })}
                                      placeholder="Lesson title"
                                      className="w-48"
                                    />
                                    <Select
                                      options={contentTypes.map(ct => ({ value: ct.value, label: ct.label }))}
                                      value={lesson.type}
                                      onChange={(e) => updateLesson(moduleIndex, lessonIndex, { ...lesson, type: e.target.value })}
                                    />
                                    <Input
                                      value={lesson.duration.toString()}
                                      onChange={(e) => updateLesson(moduleIndex, lessonIndex, { ...lesson, duration: parseInt(e.target.value) || 0 })}
                                      placeholder="Duration"
                                      className="w-24"
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-white font-medium">{lesson.title}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="secondary" size="sm">
                                        {contentTypes.find(ct => ct.value === lesson.type)?.label}
                                      </Badge>
                                      {lesson.duration && (
                                        <span className="text-sm text-gray-400">{lesson.duration}</span>
                                      )}
                                      {/* File indicators */}
                                      {lesson.videoFile && (
                                        <Badge variant="primary" size="sm">
                                          <FileVideo className="w-3 h-3 mr-1" />
                                          Video
                                        </Badge>
                                      )}
                                      {lesson.resourceFiles && lesson.resourceFiles.length > 0 && (
                                        <Badge variant="secondary" size="sm">
                                          <File className="w-3 h-3 mr-1" />
                                          {lesson.resourceFiles.length} files
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {isEditingThisLesson ? (
                                  <Button
                                    size="sm"
                                    onClick={() => setEditingLesson(null)}
                                  >
                                    Save
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingLesson({ moduleIndex, lessonIndex })}
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteLesson(moduleIndex, lessonIndex)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* File Upload Section - Show when editing or when lesson has files */}
                            {(isEditingThisLesson || lesson.videoFile || (lesson.resourceFiles && lesson.resourceFiles.length > 0)) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="border-t border-gray-800/50 pt-4"
                              >
                                {renderFileUploadArea(moduleIndex, lessonIndex, lesson, lesson.type === 'video')}
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    <Button
                      variant="outline"
                      onClick={() => addLesson(moduleIndex)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lesson
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {modules.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="text-center py-12">
              <CardContent>
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No modules yet</h3>
                <p className="text-gray-400 mb-4">
                  Start building your course by adding your first module
                </p>
                <Button onClick={addModule}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Module
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* File Upload Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-blue-600/50 bg-blue-600/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">File Upload Guidelines</h4>
                <ul className="text-sm text-blue-300 space-y-1">
                  <li>• <strong>Videos:</strong> One per lesson, max 500MB (MP4, MOV, AVI)</li>
                  <li>• <strong>Resources:</strong> Multiple files allowed (PDFs, docs, code files, images)</li>
                  <li>• <strong>Drag & Drop:</strong> Supported for all file types</li>
                  <li>• <strong>File Limits:</strong> PDFs (50MB), Images (10MB), Documents (25MB), Code files (5MB)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};