'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Folder, File, Video, FileText, Image, 
  AlertCircle, CheckCircle, Loader2,
  ChevronDown, ChevronRight, Archive, Package
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/publish_course/Card';
import { Badge } from '@/components/publish_course/Badge';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  children?: FileNode[];
  fileType?: 'video' | 'transcript' | 'subtitle' | 'instruction' | 'other';
  status?: 'pending' | 'uploading' | 'completed' | 'error';
  progress?: number;
  s3Url?: string;
  s3Key?: string;
}

interface CourseStructure {
  sections: Array<{
    name: string;
    lessons: Array<{
      name: string;
      files: Array<{
        name: string;
        type: string;
        path: string;
        size: number;
        s3Url?: string;
        s3Key?: string;
      }>;
    }>;
  }>;
}

interface BulkUploadStepProps {
  onStructureCreated: (structure: CourseStructure) => void;
  onComplete: () => void;
}

const fileTypeConfig = {
  video: {
    extensions: ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.3gp'],
    icon: Video,
    color: 'text-purple-400',
    folder: 'videos'
  },
  audio: {
    extensions: ['.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a'],
    icon: FileText,
    color: 'text-green-400',
    folder: 'audio'
  },
  transcript: {
    extensions: ['.txt'],
    icon: FileText,
    color: 'text-blue-400',
    folder: 'transcripts'
  },
  subtitle: {
    extensions: ['.srt', '.vtt', '.sub'],
    icon: FileText,
    color: 'text-green-400',
    folder: 'subtitles'
  },
  instruction: {
    extensions: ['.html', '.htm'],
    icon: FileText,
    color: 'text-orange-400',
    folder: 'instructions'
  },
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'],
    icon: Image,
    color: 'text-pink-400',
    folder: 'images'
  },
  document: {
    extensions: ['.pdf', '.doc', '.docx', '.rtf', '.odt'],
    icon: FileText,
    color: 'text-yellow-400',
    folder: 'documents'
  },
  spreadsheet: {
    extensions: ['.xls', '.xlsx', '.csv', '.ods'],
    icon: FileText,
    color: 'text-cyan-400',
    folder: 'spreadsheets'
  },
  presentation: {
    extensions: ['.ppt', '.pptx', '.odp'],
    icon: FileText,
    color: 'text-orange-400',
    folder: 'presentations'
  },
  archive: {
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'],
    icon: Archive,
    color: 'text-purple-400',
    folder: 'archives'
  },
  code: {
    extensions: ['.py', '.tsx', '.jsx', '.js', '.ts', '.env', '.php', '.java', '.cpp', '.c', '.cs', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.r', '.matlab', '.sh', '.bat', '.ps1', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.md', '.rst', '.tex', '.latex'],
    icon: FileText,
    color: 'text-yellow-400',
    folder: 'code'
  }
};

export const BulkUploadStep: React.FC<BulkUploadStepProps> = ({
  onStructureCreated,
  onComplete
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileTree, setFileTree] = useState<FileNode | null>(null);
  const [courseStructure, setCourseStructure] = useState<CourseStructure | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [courseFolderId, setCourseFolderId] = useState<string>('');

  // Generate unique course folder ID
  const generateCourseFolderId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `course_${timestamp}_${random}`;
  };

  // Detect file type based on extension
  const getFileType = (filename: string): string => {
    const ext = filename.toLowerCase().split('.').pop() || '';
    for (const [type, config] of Object.entries(fileTypeConfig)) {
      if (config.extensions.includes(`.${ext}`)) {
        return type;
      }
    }
    return 'other';
  };

  // Parse folder structure from uploaded files
  const parseFolderStructure = (files: FileList): FileNode => {
    const root: FileNode = {
      name: 'Course Root',
      type: 'folder',
      path: '',
      children: []
    };

    const fileMap = new Map<string, FileNode>();

    Array.from(files).forEach(file => {
      const pathParts = file.webkitRelativePath.split('/');
      let currentPath = '';
      
      pathParts.forEach((part, index) => {
        const isFile = index === pathParts.length - 1;
        const fullPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!fileMap.has(fullPath)) {
          const node: FileNode = {
            name: part,
            type: isFile ? 'file' : 'folder',
            path: fullPath,
            size: isFile ? file.size : undefined,
            children: isFile ? undefined : [],
            fileType: isFile ? getFileType(part) as keyof typeof fileTypeConfig : undefined,
            status: 'pending'
          };
          fileMap.set(fullPath, node);
        }
        
        // Always add the current node as a child of its parent (if parent exists)
        if (fileMap.has(currentPath)) {
          const parent = fileMap.get(currentPath)!;
          if (parent.children && !parent.children.find(child => child.name === part)) {
            parent.children.push(fileMap.get(fullPath)!);
          }
        }
        
        currentPath = fullPath;
      });
    });

    // Find the root folder (first level folder)
    const rootFolders = Array.from(fileMap.values()).filter(node => 
      node.type === 'folder' && !node.path.includes('/')
    );

    root.children = rootFolders;
    return root;
  };

  // Extract course structure from file tree
  const extractCourseStructure = (fileTree: FileNode): CourseStructure => {
    const sections: CourseStructure['sections'] = [];

    fileTree.children?.forEach(sectionNode => {
      if (sectionNode.type === 'folder') {
        const section = {
          name: sectionNode.name,
          lessons: [] as CourseStructure['sections'][0]['lessons']
        };

        sectionNode.children?.forEach(lessonNode => {
          if (lessonNode.type === 'folder') {
            const lesson = {
              name: lessonNode.name,
              files: [] as CourseStructure['sections'][0]['lessons'][0]['files']
            };

            // Recursively collect all files in lesson folder
            const collectFiles = (node: FileNode) => {
              if (node.type === 'file') {
                lesson.files.push({
                  name: node.name,
                  type: node.fileType || 'other',
                  path: node.path,
                  size: node.size || 0
                });
              } else if (node.children) {
                node.children.forEach(collectFiles);
              }
            };

            collectFiles(lessonNode);
            section.lessons.push(lesson);
          }
        });

        sections.push(section);
      }
    });

    return { sections };
  };

  // Update file status in tree
  const updateFileStatus = (node: FileNode, path: string, status: FileNode['status'], s3Url?: string, s3Key?: string): FileNode => {
    if (node.path === path) {
      return { ...node, status, s3Url, s3Key };
    }
    if (node.children) {
      return {
        ...node,
        children: node.children.map(child => updateFileStatus(child, path, status, s3Url, s3Key))
      };
    }
    return node;
  };

  // Extract ZIP file contents
  const extractZipFile = async (zipFile: File): Promise<FileList> => {
    return new Promise((resolve, reject) => {
      const JSZip = require('jszip');
      const zip = new JSZip();
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const zipData = await zip.loadAsync(e.target?.result);
          const files: File[] = [];
          
          // Extract all files from ZIP
          for (const [relativePath, zipEntry] of Object.entries(zipData.files)) {
            if (!zipEntry.dir) {
              const content = await zipEntry.async('blob');
              const file = new File([content], zipEntry.name, { type: 'application/octet-stream' });
              (file as any).webkitRelativePath = relativePath;
              files.push(file);
            }
          }
          
          // Convert to FileList
          const dataTransfer = new DataTransfer();
          files.forEach(file => dataTransfer.items.add(file));
          resolve(dataTransfer.files);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read ZIP file'));
      reader.readAsArrayBuffer(zipFile);
    });
  };

  // Handle ZIP file upload
  const handleZipUpload = async (zipFile: File) => {
    setUploading(true);
    
    try {
      console.log('Processing ZIP file:', zipFile.name);
      
      // Extract ZIP contents
      const extractedFiles = await extractZipFile(zipFile);
      console.log('Extracted files:', extractedFiles.length);
      
      await handleFileUpload(extractedFiles);
      
    } catch (error) {
      console.error('ZIP upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  // Handle file upload (without S3 upload - files will be uploaded later)
  const handleFileUpload = useCallback(async (files: FileList) => {
    setUploading(true);
    
    try {
      // Generate unique course folder ID
      const folderId = generateCourseFolderId();
      setCourseFolderId(folderId);
      console.log('Course folder ID:', folderId);

      // Parse the folder structure
      const structure = parseFolderStructure(files);
      setFileTree(structure);

      // Extract course structure
      const courseStructure = extractCourseStructure(structure);
      setCourseStructure(courseStructure);

      // Store files for later upload (don't upload to S3 now)
      const filesArray = Array.from(files);
      const courseStructureWithFiles = {
        ...courseStructure,
        _files: filesArray, // Store files for later upload
        _courseFolderId: folderId
      };
      
      setCourseStructure(courseStructureWithFiles);

      // Notify parent component with structure (files will be uploaded later)
      onStructureCreated(courseStructureWithFiles);
      setUploadSuccess(true);
      onComplete();

    } catch (error) {
      console.error('File processing failed:', error);
    } finally {
      setUploading(false);
    }
  }, [onStructureCreated, onComplete, parseFolderStructure, extractCourseStructure]);

  // Toggle folder expansion
  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  // Render file tree
  const renderFileTree = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isFolder = node.type === 'folder';
    const padding = level * 20;

    return (
      <div key={node.path} style={{ paddingLeft: padding }}>
        <div className="flex items-center gap-2 py-1 hover:bg-white/5 rounded px-2">
          {isFolder ? (
            <button
              onClick={() => toggleFolder(node.path)}
              className="flex items-center gap-2 text-left w-full"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              <Folder className="w-4 h-4 text-blue-400" />
              <span className="text-white">{node.name}</span>
              {node.children && (
                <Badge variant="secondary" size="sm">
                  {node.children.length} items
                </Badge>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full">
              {node.fileType && fileTypeConfig[node.fileType as keyof typeof fileTypeConfig] ? (
                (() => {
                  const IconComponent = fileTypeConfig[node.fileType as keyof typeof fileTypeConfig].icon;
                  const color = fileTypeConfig[node.fileType as keyof typeof fileTypeConfig].color;
                  return <IconComponent className={`w-4 h-4 ${color}`} />;
                })()
              ) : (
                <File className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-white flex-1">{node.name}</span>
              {node.size && (
                <span className="text-xs text-gray-400">
                  {(node.size / 1024 / 1024).toFixed(1)}MB
                </span>
              )}
              {node.status && (
                <div className="flex items-center gap-1">
                  {node.status === 'pending' && (
                    <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  )}
                  {node.status === 'uploading' && (
                    <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                  )}
                  {node.status === 'completed' && (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  )}
                  {node.status === 'error' && (
                    <AlertCircle className="w-3 h-3 text-red-400" />
                  )}
                </div>
              )}
              {node.status === 'uploading' && uploadProgress[node.name] !== undefined && (
                <div className="w-16 bg-gray-700 rounded-full h-1">
                  <div 
                    className="bg-blue-400 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress[node.name]}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderFileTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const items = e.dataTransfer.items;
    if (items) {
      // Handle folder upload (webkitdirectory)
      const files: File[] = [];
      const processEntry = async (entry: FileSystemEntry, path: string = '') => {
        if (entry.isFile) {
          const file = await new Promise<File>((resolve) => {
            (entry as FileSystemFileEntry).file(resolve);
          });
          file.webkitRelativePath = path + entry.name;
          files.push(file);
        } else if (entry.isDirectory) {
          const reader = (entry as FileSystemDirectoryEntry).createReader();
          const entries = await new Promise<FileSystemEntry[]>((resolve) => {
            reader.readEntries(resolve);
          });
          for (const childEntry of entries) {
            await processEntry(childEntry, path + entry.name + '/');
          }
        }
      };

      const processItems = async () => {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.webkitGetAsEntry) {
            const entry = item.webkitGetAsEntry();
            if (entry) {
              await processEntry(entry);
            }
          }
        }
        
        if (files.length > 0) {
          const fileList = new DataTransfer();
          files.forEach(file => fileList.items.add(file));
          handleFileUpload(fileList.files);
        }
      };

      processItems();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Bulk Course Upload</h2>
        <p className="text-gray-400">
          Upload your entire course folder or zip file to automatically create the course structure
        </p>
        {courseFolderId && (
          <div className="mt-2 p-2 bg-[#0CF2A0]/10 border border-[#0CF2A0]/30 rounded-lg">
            <p className="text-sm text-[#0CF2A0]">
              Course Folder: <code className="bg-[#111111] px-2 py-1 rounded">{courseFolderId}</code>
            </p>
          </div>
        )}
      </div>

      {/* Upload Area */}
      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
              isDragOver 
                ? 'border-[#0CF2A0] bg-[#0CF2A0]/10' 
                : 'border-gray-700 hover:border-gray-600'
            } bg-[#111111]/50`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-12 h-12 text-[#0CF2A0] mb-4" />
                </motion.div>
                <h3 className="text-lg font-semibold text-white mb-2">Processing Course Files</h3>
                <p className="text-gray-400">Uploading and organizing your course structure...</p>
                {courseFolderId && (
                  <p className="text-sm text-[#0CF2A0] mt-2">
                    Creating folder: <code>{courseFolderId}</code>
                  </p>
                )}
              </div>
            ) : (
              <>
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Drag & Drop Your Course Folder
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Upload your entire course directory or zip file. The system will automatically detect 
                  the folder structure and organize your content into sections and lessons.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="text-left">
                    <h4 className="font-semibold text-white mb-2">Supported Structure:</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Section folders (e.g., "01_introduction")</li>
                      <li>• Lesson folders (e.g., "01_welcome")</li>
                      <li>• Video files (.mp4, .mov, .avi)</li>
                      <li>• Transcripts (.txt)</li>
                      <li>• Subtitles (.srt, .vtt)</li>
                      <li>• Instructions (.html)</li>
                    </ul>
                  </div>
                  
                  <div className="text-left">
                    <h4 className="font-semibold text-white mb-2">S3 Organization:</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• Unique course folder created</li>
                      <li>• Files organized by type</li>
                      <li>• Videos in /videos/ subfolder</li>
                      <li>• Resources in /documents/ subfolder</li>
                      <li>• Transcripts in /transcripts/ subfolder</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <div>
                    <input
                      type="file"
                      webkitdirectory=""
                      multiple
                      accept="video/*,audio/*,image/*,.pdf,.doc,.docx,.txt,.rtf,.odt,.pages,.xls,.xlsx,.csv,.ods,.numbers,.ppt,.pptx,.odp,.key,.zip,.rar,.7z,.tar,.gz,.bz2,.json,.xml,.tsv,.db,.sqlite,.sql,.py,.tsx,.jsx,.js,.ts,.env,.php,.java,.cpp,.c,.cs,.rb,.go,.rs,.swift,.kt,.scala,.r,.matlab,.sh,.bat,.ps1,.yaml,.yml,.toml,.ini,.cfg,.conf,.md,.rst,.tex,.latex,.srt,.vtt,.html"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      className="hidden"
                      id="folder-upload"
                    />
                    <label
                      htmlFor="folder-upload"
                      className="inline-flex items-center px-4 py-2 bg-[#0CF2A0] text-[#111111] rounded-lg hover:bg-[#0CF2A0]/90 transition-colors cursor-pointer font-semibold"
                    >
                      <Folder className="w-4 h-4 mr-2" />
                      Choose Folder
                    </label>
                  </div>
                  
                  <div>
                    <input
                      type="file"
                      accept=".zip"
                      onChange={(e) => e.target.files && handleZipUpload(e.target.files[0])}
                      className="hidden"
                      id="zip-upload"
                    />
                    <label
                      htmlFor="zip-upload"
                      className="inline-flex items-center px-4 py-2 bg-[#111111] text-gray-300 border border-gray-700 rounded-lg hover:bg-white/5 transition-colors cursor-pointer font-semibold"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Choose ZIP
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Tree Preview */}
      {fileTree && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Course Structure Preview</h3>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              {renderFileTree(fileTree)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Structure Summary */}
      {courseStructure && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Course Summary</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-[#111111]/50 rounded-lg">
                <div className="text-2xl font-bold text-white">{courseStructure.sections.length}</div>
                <div className="text-sm text-gray-400">Sections</div>
              </div>
              <div className="text-center p-4 bg-[#111111]/50 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {courseStructure.sections.reduce((acc, section) => acc + section.lessons.length, 0)}
                </div>
                <div className="text-sm text-gray-400">Lessons</div>
              </div>
              <div className="text-center p-4 bg-[#111111]/50 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {courseStructure.sections.reduce((acc, section) => 
                    acc + section.lessons.reduce((acc2, lesson) => acc2 + lesson.files.length, 0), 0
                  )}
                </div>
                <div className="text-sm text-gray-400">Files</div>
              </div>
            </div>
            
            {uploadSuccess && (
              <div className="mt-4 p-4 bg-green-600/20 border border-green-600/50 rounded-lg">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Upload Successful!</span>
                </div>
                <p className="text-green-300 text-sm mt-1">
                  Your course structure has been created and files uploaded to S3. You can now continue editing or proceed to the next step.
                </p>
                {courseFolderId && (
                  <p className="text-green-300 text-sm mt-2">
                    Files organized in S3 folder: <code className="bg-[#111111] px-2 py-1 rounded">{courseFolderId}</code>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}; 