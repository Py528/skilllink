'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File, 
  Video, 
  Image, 
  FileText, 
  Code, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader,
  Download
} from 'lucide-react';
import { s3Service, UploadProgress, UploadResult } from '../../services/s3Upload';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';

interface UploadedFile {
  id: string;
  file: File;
  result?: UploadResult;
  progress: UploadProgress;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface FileUploadProps {
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  onFilesUploaded?: (files: UploadResult[]) => void;
  folder?: string;
  multiple?: boolean;
  title?: string;
  description?: string;
}

const getFileIcon = (fileName: string, fileType: string) => {
  if (fileType.startsWith('video/')) return Video;
  if (fileType.startsWith('image/')) return Image;
  if (fileName.endsWith('.tsx') || fileName.endsWith('.ts') || fileName.endsWith('.js') || fileName.endsWith('.jsx')) return Code;
  if (fileName.endsWith('.py') || fileName.endsWith('.java') || fileName.endsWith('.cpp') || fileName.endsWith('.c')) return Code;
  if (fileType.startsWith('text/') || fileName.endsWith('.md') || fileName.endsWith('.txt')) return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileTypeColor = (fileName: string, fileType: string): string => {
  if (fileType.startsWith('video/')) return 'text-purple-400';
  if (fileType.startsWith('image/')) return 'text-blue-400';
  if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) return 'text-blue-500';
  if (fileName.endsWith('.py')) return 'text-yellow-400';
  if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) return 'text-yellow-300';
  if (fileName.endsWith('.java')) return 'text-orange-400';
  if (fileName.endsWith('.cpp') || fileName.endsWith('.c')) return 'text-red-400';
  return 'text-gray-400';
};

export const FileUpload: React.FC<FileUploadProps> = ({
  acceptedFileTypes = ['.mp4', '.mov', '.avi', '.tsx', '.ts', '.js', '.jsx', '.py', '.java', '.cpp', '.c', '.txt', '.md', '.pdf'],
  maxFileSize = 500, // 500MB default
  onFilesUploaded,
  folder = 'uploads',
  multiple = true,
  title = 'Upload Files',
  description = 'Drag and drop files here, or click to browse'
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      progress: { loaded: 0, total: file.size, percentage: 0 },
      status: 'uploading' as const,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Upload files
    const uploadPromises = newFiles.map(async (uploadFile) => {
      try {
        const result = await s3Service.uploadFile(
          uploadFile.file,
          folder,
          (progress) => {
            setUploadedFiles(prev => prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, progress }
                : f
            ));
          }
        );

        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, result, status: 'completed' }
            : f
        ));

        return result;
      } catch (error) {
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : f
        ));
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((result): result is UploadResult => result !== null);
    
    if (onFilesUploaded && successfulUploads.length > 0) {
      onFilesUploaded(successfulUploads);
    }
  }, [folder, onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize * 1024 * 1024,
    multiple,
  });

  const removeFile = async (id: string) => {
    const file = uploadedFiles.find(f => f.id === id);
    if (file?.result) {
      try {
        await s3Service.deleteFile(file.result.key);
      } catch (error) {
        console.error('Failed to delete file from S3:', error);
      }
    }
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const retryUpload = async (id: string) => {
    const file = uploadedFiles.find(f => f.id === id);
    if (!file) return;

    setUploadedFiles(prev => prev.map(f => 
      f.id === id 
        ? { ...f, status: 'uploading', error: undefined, progress: { loaded: 0, total: f.file.size, percentage: 0 } }
        : f
    ));

    try {
      const result = await s3Service.uploadFile(
        file.file,
        folder,
        (progress) => {
          setUploadedFiles(prev => prev.map(f => 
            f.id === id 
              ? { ...f, progress }
              : f
          ));
        }
      );

      setUploadedFiles(prev => prev.map(f => 
        f.id === id 
          ? { ...f, result, status: 'completed' }
          : f
      ));

      if (onFilesUploaded) {
        onFilesUploaded([result]);
      }
    } catch (error) {
      setUploadedFiles(prev => prev.map(f => 
        f.id === id 
          ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
          : f
      ));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div
          {...getRootProps()}
          className={`p-8 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer ${
            isDragActive 
              ? 'border-[#0CF2A0] bg-[#0CF2A0]/5' 
              : 'border-gray-600 hover:border-gray-500 bg-black/20'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-center">
            <motion.div
              animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-[#0CF2A0]/20 rounded-full mb-4"
            >
              <Upload className="w-8 h-8 text-[#0CF2A0]" />
            </motion.div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-gray-400 mb-4">{description}</p>
            <div className="text-sm text-gray-500">
              <p>Supported formats: {acceptedFileTypes.join(', ')}</p>
              <p>Maximum file size: {maxFileSize}MB</p>
            </div>
          </div>
        </div>
      </Card>

      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <h4 className="text-lg font-semibold text-white">Uploaded Files</h4>
            {uploadedFiles.map((uploadFile) => {
              const IconComponent = getFileIcon(uploadFile.file.name, uploadFile.file.type);
              const colorClass = getFileTypeColor(uploadFile.file.name, uploadFile.file.type);
              
              return (
                <motion.div
                  key={uploadFile.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <IconComponent className={`w-6 h-6 ${colorClass}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {uploadFile.file.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge size="sm" variant="secondary">
                                {formatFileSize(uploadFile.file.size)}
                              </Badge>
                              {uploadFile.status === 'completed' && (
                                <Badge size="sm" variant="success">
                                  Uploaded
                                </Badge>
                              )}
                              {uploadFile.status === 'error' && (
                                <Badge size="sm" variant="danger">
                                  Failed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {uploadFile.status === 'uploading' && (
                            <div className="flex items-center gap-2">
                              <Loader className="w-4 h-4 text-[#0CF2A0] animate-spin" />
                              <span className="text-sm text-gray-400">
                                {uploadFile.progress.percentage}%
                              </span>
                            </div>
                          )}
                          
                          {uploadFile.status === 'completed' && (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              {uploadFile.result && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => window.open(uploadFile.result!.url, '_blank')}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                            </>
                          )}
                          
                          {uploadFile.status === 'error' && (
                            <>
                              <AlertCircle className="w-5 h-5 text-red-500" />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => retryUpload(uploadFile.id)}
                              >
                                Retry
                              </Button>
                            </>
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(uploadFile.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {uploadFile.status === 'uploading' && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <motion.div
                              className="bg-gradient-to-r from-[#0CF2A0] to-[#00D4AA] h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadFile.progress.percentage}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {uploadFile.status === 'error' && uploadFile.error && (
                        <div className="mt-2">
                          <p className="text-sm text-red-400">{uploadFile.error}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 