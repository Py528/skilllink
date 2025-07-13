'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GripVertical, Video, FileText, HelpCircle, AlignCenter as Assignment, Trash2, Edit3, Upload, X, File, Image, FileVideo, File as FilePdf, FileCode, Download, Eye, AlertCircle } from 'lucide-react';
import { Button } from "@/components/publish_course/Button";
import { Card, CardContent, CardHeader } from '@/components/publish_course/Card';
import { Input } from '@/components/publish_course/Input';
import { Select } from '@/components/publish_course/Select';
import { Badge } from '@/components/publish_course/Badge';
import { s3Service } from '@/services/s3Upload';

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

interface CourseContentStepProps {
  formData: {
    modules: Module[];
  };
  updateFormData: (data: Partial<{ modules: Module[] }>) => void;
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
  audio: {
    accept: 'audio/*',
    maxSize: 100 * 1024 * 1024, // 100MB
    icon: FileVideo,
    color: 'text-green-400'
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
    accept: '.doc,.docx,.txt,.rtf,.odt,.pages',
    maxSize: 25 * 1024 * 1024, // 25MB
    icon: FileText,
    color: 'text-green-400'
  },
  spreadsheet: {
    accept: '.xls,.xlsx,.csv,.ods,.numbers',
    maxSize: 25 * 1024 * 1024, // 25MB
    icon: FileText,
    color: 'text-yellow-400'
  },
  presentation: {
    accept: '.ppt,.pptx,.odp,.key',
    maxSize: 50 * 1024 * 1024, // 50MB
    icon: FileText,
    color: 'text-orange-400'
  },
  code: {
    accept: '.py,.tsx,.jsx,.js,.ts,.env,.sql,.json,.xml,.html,.css,.php,.java,.cpp,.c,.cs,.rb,.go,.rs,.swift,.kt,.scala,.r,.matlab,.sh,.bat,.ps1,.yaml,.yml,.toml,.ini,.cfg,.conf,.md,.rst,.tex,.latex',
    maxSize: 5 * 1024 * 1024, // 5MB
    icon: FileCode,
    color: 'text-yellow-400'
  },
  archive: {
    accept: '.zip,.rar,.7z,.tar,.gz,.bz2',
    maxSize: 100 * 1024 * 1024, // 100MB
    icon: File,
    color: 'text-purple-400'
  },
  data: {
    accept: '.json,.xml,.csv,.tsv,.xlsx,.xls,.db,.sqlite,.sql',
    maxSize: 50 * 1024 * 1024, // 50MB
    icon: FileText,
    color: 'text-cyan-400'
  },
  other: {
    accept: '*',
    maxSize: 25 * 1024 * 1024, // 25MB
    icon: File,
    color: 'text-gray-400'
  }
};

// Utility to get video duration from a File
const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      reject(new Error('Failed to load video metadata'));
    };
    video.src = URL.createObjectURL(file);
  });
};

// Utility to format seconds as mm:ss
const formatDuration = (seconds: number | undefined) => {
  if (!seconds || isNaN(seconds)) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Utility to generate a SHA-256 hash for a file
const getFileHash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

// Type guard for UploadedFile
function isUploadedFile(file: File | UploadedFile): file is UploadedFile {
  return (file as UploadedFile).url !== undefined;
}

export const CourseContentStep: React.FC<CourseContentStepProps> = ({
  formData,
  updateFormData
}) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [editingModule, setEditingModule] = useState<number | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ moduleIndex: number; lessonIndex: number } | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, number>>({});
  const [dragOver, setDragOver] = useState<string | null>(null);

  const modules = formData.modules || [];

  // Generate unique file ID
  const generateFileId = () => `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Get file type category based on file extension/mime type
  const getFileTypeCategory = (file: File): keyof typeof fileTypeConfig => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type.toLowerCase();

    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('image/')) return 'image';
    if (extension === 'pdf' || mimeType === 'application/pdf') return 'pdf';
    if (['doc', 'docx', 'txt', 'rtf', 'odt', 'pages'].includes(extension || '')) return 'document';
    if (['xls', 'xlsx', 'csv', 'ods', 'numbers'].includes(extension || '')) return 'spreadsheet';
    if (['ppt', 'pptx', 'odp', 'key'].includes(extension || '')) return 'presentation';
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension || '')) return 'archive';
    if (['json', 'xml', 'csv', 'tsv', 'db', 'sqlite', 'sql'].includes(extension || '')) return 'data';
    if (['py', 'tsx', 'jsx', 'js', 'ts', 'env', 'sql', 'json', 'xml', 'html', 'css', 'php', 'java', 'cpp', 'c', 'cs', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'r', 'matlab', 'sh', 'bat', 'ps1', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'md', 'rst', 'tex', 'latex'].includes(extension || '')) return 'code';
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

  // Upload file to S3 for videos, simulate for others
  const uploadFile = async (file: File, isVideo: boolean = false, progressCallback?: (progress: { percentage: number }) => void): Promise<UploadedFile> => {
    const fileId = generateFileId();
    // Hash the file name for privacy
    const hash = await getFileHash(file);
    const ext = file.name.split('.').pop();
    const safeName = ext ? `${hash}.${ext}` : hash;
    const folder = isVideo ? 'videos' : 'resources';
    const hashedFile = new window.File([file], safeName, { type: file.type });
    const result = await s3Service.uploadFile(hashedFile, folder, progressCallback);
    return {
      id: fileId,
      name: file.name, // Show original name in UI
      size: file.size,
      type: file.type,
      url: result.url,
      key: result.key,
    };
  };

  // Handle file upload for lessons
  const handleFileSelect = async (
    moduleIndex: number,
    lessonIndex: number,
    files: FileList | File[],
    isVideo: boolean = false
  ) => {
    const fileArray = Array.from(files);
    if (isVideo && fileArray[0]) {
      // Extract video duration
      const duration = await getVideoDuration(fileArray[0]);
      const updatedModules = modules.map((module: Module, mIndex: number) =>
        mIndex === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson: Lesson, lIndex: number) =>
                lIndex === lessonIndex
                  ? {
                      ...lesson,
                      videoFile: fileArray[0],
                      videoPreview: URL.createObjectURL(fileArray[0]),
                      duration: Math.round(duration),
                    }
                  : lesson
              )
            }
          : module
      );
      updateFormData({ ...formData, modules: updatedModules });
      return;
    }
    // Resource file logic
    const updatedModules = modules.map((module: Module, mIndex: number) =>
      mIndex === moduleIndex
        ? {
            ...module,
            lessons: module.lessons.map((lesson: Lesson, lIndex: number) =>
              lIndex === lessonIndex
                ? {
                    ...lesson,
                    resourceFiles: [...(lesson.resourceFiles || []), ...fileArray],
                    resourcePreviews: [
                      ...(lesson.resourcePreviews || []),
                      ...fileArray.map(f => URL.createObjectURL(f))
                    ]
                  }
                : lesson
            )
          }
        : module
    );
    updateFormData({ ...formData, modules: updatedModules });
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
      handleFileSelect(moduleIndex, lessonIndex, files, isVideo);
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
    const uploadProgress = uploadingFiles[uploadKey] || 0;
    const isUploading = uploadProgress > 0 && uploadProgress < 100;
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
                    <p className="text-white font-medium">{lesson.videoFile.name || lesson.videoFile?.name}</p>
                    <p className="text-sm text-gray-400">{lesson.videoFile.size ? formatFileSize(lesson.videoFile.size) : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => lesson.videoPreview && window.open(lesson.videoPreview, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => isUploadedFile(lesson.videoFile!) ? removeFile(moduleIndex, lessonIndex, lesson.videoFile!.id, true) : removeFile(moduleIndex, lessonIndex, '', true)}
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
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(null);
                  handleFileSelect(moduleIndex, lessonIndex, e.dataTransfer.files, true);
                }}
              >
                <FileVideo className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 mb-2">Drop video file here or click to upload</p>
                <p className="text-xs text-gray-500 mb-3">
                  Supported: MP4, MOV, AVI (Max: 500MB)
                </p>
                <input
                  type="file"
                  accept={fileTypeConfig.video.accept}
                  onChange={(e) => e.target.files && handleFileSelect(moduleIndex, lessonIndex, e.target.files, true)}
                  className="hidden"
                  id={`video-upload-${lessonKey}`}
                />
                <label
                  htmlFor={`video-upload-${lessonKey}`}
                  className="inline-flex items-center px-4 py-2 bg-[#0CF2A0] text-[#111111] rounded-xl hover:bg-[#0CF2A0]/90 transition-colors cursor-pointer font-semibold"
                >
                  Choose Video
                </label>
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
                          {!isUploadedFile(file) && lesson.resourcePreviews && lesson.resourcePreviews[index] && (
                            <a href={lesson.resourcePreviews[index]} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 underline">Preview</a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => isUploadedFile(file) && window.open(file.url, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => isUploadedFile(file) ? removeFile(moduleIndex, lessonIndex, file.id, false) : removeFile(moduleIndex, lessonIndex, '', false)}
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
                  accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.pages,.xls,.xlsx,.csv,.ods,.numbers,.ppt,.pptx,.odp,.key,.zip,.rar,.7z,.tar,.gz,.bz2,.json,.xml,.tsv,.db,.sqlite,.sql,.py,.tsx,.jsx,.js,.ts,.env,.php,.java,.cpp,.c,.cs,.rb,.go,.rs,.swift,.kt,.scala,.r,.matlab,.sh,.bat,.ps1,.yaml,.yml,.toml,.ini,.cfg,.conf,.md,.rst,.tex,.latex,image/*,audio/*"
                  onChange={(e) => e.target.files && handleFileSelect(moduleIndex, lessonIndex, e.target.files, false)}
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
      content: {
        type: 'video',
        transcript: '',
        chapters: [],
        notes: ''
      },
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
            lessons: module.lessons.map((lesson: Lesson, lIndex: number) => {
              if (lIndex !== lessonIndex) return lesson;
              // Only update the changed fields
              const newLesson = { ...lesson };
              if (updatedLesson.content !== undefined) newLesson.content = updatedLesson.content;
              if (updatedLesson.is_free !== undefined) newLesson.is_free = updatedLesson.is_free;
              if (updatedLesson.is_preview !== undefined) newLesson.is_preview = updatedLesson.is_preview;
              if (updatedLesson.title !== undefined) newLesson.title = updatedLesson.title;
              if (updatedLesson.description !== undefined) newLesson.description = updatedLesson.description;
              if (updatedLesson.type !== undefined) newLesson.type = updatedLesson.type;
              if (updatedLesson.duration !== undefined) newLesson.duration = updatedLesson.duration;
              if (updatedLesson.videoFile !== undefined) newLesson.videoFile = updatedLesson.videoFile;
              if (updatedLesson.video_url !== undefined) newLesson.video_url = updatedLesson.video_url;
              if (updatedLesson.resourceFiles !== undefined) newLesson.resourceFiles = updatedLesson.resourceFiles;
              if (updatedLesson.resources !== undefined) newLesson.resources = updatedLesson.resources;
              if (updatedLesson.order_index !== undefined) newLesson.order_index = updatedLesson.order_index;
              return newLesson;
            })
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
                                  <div className="flex gap-2 flex-wrap items-center">
                                    <Input
                                      value={lesson.title}
                                      onChange={(e) => updateLesson(moduleIndex, lessonIndex, { ...lesson, title: e.target.value })}
                                      placeholder="Lesson title"
                                      className="w-48"
                                    />
                                    <Input
                                      value={lesson.description}
                                      onChange={(e) => updateLesson(moduleIndex, lessonIndex, { ...lesson, description: e.target.value })}
                                      placeholder="Lesson description"
                                      className="w-64"
                                    />
                                    <Select
                                      options={contentTypes.map(ct => ({ value: ct.value, label: ct.label }))}
                                      value={lesson.type}
                                      onChange={(e) => updateLesson(moduleIndex, lessonIndex, { ...lesson, type: e.target.value })}
                                    />
                                    {/* Only show duration input for non-video lessons */}
                                    {lesson.type !== 'video' && (
                                      <Input
                                        value={lesson.duration.toString()}
                                        onChange={(e) => updateLesson(moduleIndex, lessonIndex, { ...lesson, duration: parseInt(e.target.value) || 0 })}
                                        placeholder="Duration"
                                        className="w-24"
                                      />
                                    )}
                                    {/* Show video duration for video lessons if available */}
                                    {lesson.type === 'video' && lesson.duration && (
                                      <span className="text-sm text-gray-400 ml-2">Duration: {formatDuration(lesson.duration)}</span>
                                    )}
                                    {/* is_free toggle */}
                                    <label className="flex items-center gap-1 text-xs text-white">
                                      <input
                                        type="checkbox"
                                        checked={lesson.is_free}
                                        onChange={e => updateLesson(moduleIndex, lessonIndex, { ...lesson, is_free: e.target.checked })}
                                        className="mr-1"
                                      />
                                      Free Lesson
                                    </label>
                                    {/* is_preview toggle */}
                                    <label className="flex items-center gap-1 text-xs text-white">
                                      <input
                                        type="checkbox"
                                        checked={lesson.is_preview}
                                        onChange={e => updateLesson(moduleIndex, lessonIndex, { ...lesson, is_preview: e.target.checked })}
                                        className="mr-1"
                                      />
                                      Previewable
                                    </label>
                                    {/* Content input for text/quiz/assignment */}
                                    {(lesson.type === 'text' || lesson.type === 'quiz' || lesson.type === 'assignment') && (
                                      <div className="w-full space-y-2">
                                        {lesson.type === 'text' && (
                                          <textarea
                                        value={typeof lesson.content === 'object' && typeof lesson.content.text === 'string' ? lesson.content.text : ''}
                                            onChange={e => updateLesson(moduleIndex, lessonIndex, { 
                                              content: { 
                                                type: 'text',
                                                text: e.target.value,
                                                sections: [],
                                                formatting: { allowHtml: true, allowMarkdown: true }
                                              } 
                                            })}
                                            placeholder="Enter the text content for this lesson..."
                                            className="w-full p-3 bg-[#111111] border border-gray-700 rounded-lg text-white resize-none"
                                            rows={4}
                                          />
                                        )}
                                        
                                        {lesson.type === 'quiz' && (
                                          <div className="space-y-2">
                                            <input
                                              value={typeof lesson.content === 'object' && typeof lesson.content.title === 'string' ? lesson.content.title : ''}
                                              onChange={e => updateLesson(moduleIndex, lessonIndex, { 
                                                content: { 
                                                  ...lesson.content,
                                                  type: 'quiz',
                                                  title: e.target.value,
                                                  questions: lesson.content?.questions || []
                                                } 
                                              })}
                                              placeholder="Quiz title"
                                              className="w-full p-2 bg-[#111111] border border-gray-700 rounded-lg text-white"
                                            />
                                            <textarea
                                              value={typeof lesson.content === 'object' && typeof lesson.content.description === 'string' ? lesson.content.description : ''}
                                              onChange={e => updateLesson(moduleIndex, lessonIndex, { 
                                                content: { 
                                                  ...lesson.content,
                                                  type: 'quiz',
                                                  description: e.target.value
                                                } 
                                              })}
                                              placeholder="Quiz description"
                                              className="w-full p-2 bg-[#111111] border border-gray-700 rounded-lg text-white resize-none"
                                              rows={2}
                                            />
                                            <div className="text-xs text-gray-400">
                                              Quiz questions can be configured after lesson creation
                                            </div>
                                          </div>
                                        )}
                                        
                                        {lesson.type === 'assignment' && (
                                          <div className="space-y-2">
                                            <input
                                              value={typeof lesson.content === 'object' && typeof lesson.content.title === 'string' ? lesson.content.title : ''}
                                              onChange={e => updateLesson(moduleIndex, lessonIndex, { 
                                                content: { 
                                                  ...lesson.content,
                                                  type: 'assignment',
                                                  title: e.target.value
                                                } 
                                              })}
                                              placeholder="Assignment title"
                                              className="w-full p-2 bg-[#111111] border border-gray-700 rounded-lg text-white"
                                            />
                                            <textarea
                                              value={typeof lesson.content === 'object' && typeof lesson.content.instructions === 'string' ? lesson.content.instructions : ''}
                                              onChange={e => updateLesson(moduleIndex, lessonIndex, { 
                                                content: { 
                                                  ...lesson.content,
                                                  type: 'assignment',
                                                  instructions: e.target.value
                                                } 
                                              })}
                                              placeholder="Assignment instructions"
                                              className="w-full p-2 bg-[#111111] border border-gray-700 rounded-lg text-white resize-none"
                                              rows={3}
                                            />
                                            <div className="text-xs text-gray-400">
                                              Assignment details can be configured after lesson creation
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-white font-medium">{lesson.title}</span>
                                    {lesson.description && (
                                      <p className="text-sm text-gray-400 mt-1">{lesson.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="secondary" size="sm">
                                        {contentTypes.find(ct => ct.value === lesson.type)?.label}
                                      </Badge>
                                      {/* Show video duration for video lessons if available */}
                                      {lesson.type === 'video' && lesson.duration && (
                                        <span className="text-sm text-gray-400">{formatDuration(lesson.duration)}</span>
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
                  <li>• <strong>Audio:</strong> Multiple files allowed, max 100MB (MP3, WAV, AAC)</li>
                  <li>• <strong>Documents:</strong> PDFs (50MB), Word docs (25MB), Text files (25MB)</li>
                  <li>• <strong>Spreadsheets:</strong> Excel, CSV, Numbers files (25MB)</li>
                  <li>• <strong>Presentations:</strong> PowerPoint, Keynote files (50MB)</li>
                  <li>• <strong>Code Files:</strong> All programming languages (5MB)</li>
                  <li>• <strong>Archives:</strong> ZIP, RAR, 7Z files (100MB)</li>
                  <li>• <strong>Images:</strong> All formats (10MB)</li>
                  <li>• <strong>Data Files:</strong> JSON, XML, SQL, databases (50MB)</li>
                  <li>• <strong>Drag & Drop:</strong> Supported for all file types</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};