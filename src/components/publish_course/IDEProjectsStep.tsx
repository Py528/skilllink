'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, Plus, X, Download, Folder, File, FolderOpen, 
  ChevronRight, ChevronDown, Upload, Trash2, 
  FileText, Terminal, Edit
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/publish_course/Card';
import { Button } from '@/components/publish_course/Button';
import { Input } from '@/components/publish_course/Input';
import { Select } from '@/components/publish_course/Select';

// ==================== TYPES ====================
interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
  isExpanded?: boolean;
  fileType?: string;
  isEditing?: boolean;
  // S3 Metadata
  lastModified?: Date | string;
  size?: number;
  storageClass?: string;
  path?: string;
}

interface IDEProject {
  id: string;
  lesson_title: string;
  name: string;
  template?: string;
  entry_file?: string;
  package_manager?: 'npm' | 'yarn' | 'pnpm' | 'pip' | 'poetry';
  env_vars_example?: string[];
  readme?: string;
  files: ProjectFile[];
}

interface IDEProjectsStepProps {
  ideProjects: IDEProject[];
  setIdeProjects: (projects: IDEProject[]) => void;
  modules: Array<{
    title: string;
    lessons: Array<{
      title: string;
      type: string;
    }>;
  }>;
}

interface ContextMenu {
  x: number;
  y: number;
  fileId?: string;
  projectIndex?: number;
}

// ==================== CONSTANTS ====================
const IDE_TEMPLATES = [
  { value: 'node', label: 'Node.js', description: 'Full-stack JavaScript runtime' },
  { value: 'react', label: 'React', description: 'Modern UI library' },
  { value: 'python', label: 'Python', description: 'Versatile programming language' },
  { value: 'vue', label: 'Vue.js', description: 'Progressive JavaScript framework' },
  { value: 'nextjs', label: 'Next.js', description: 'React production framework' }
];

const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  js: <Code className="w-4 h-4 text-yellow-400" />,
  jsx: <Code className="w-4 h-4 text-blue-400" />,
  ts: <Code className="w-4 h-4 text-blue-500" />,
  tsx: <Code className="w-4 h-4 text-blue-500" />,
  py: <Code className="w-4 h-4 text-green-400" />,
  json: <FileText className="w-4 h-4 text-orange-400" />,
  html: <FileText className="w-4 h-4 text-red-400" />,
  css: <FileText className="w-4 h-4 text-blue-300" />,
  md: <FileText className="w-4 h-4 text-gray-400" />,
  default: <File className="w-4 h-4 text-gray-400" />
};

const FILE_PLACEHOLDERS: Record<string, string> = {
  js: '// Write your JavaScript code here\nconsole.log("Hello World!");',
  jsx: '// Write your React component here\nimport React from "react";\n\nfunction Component() {\n  return <div>Hello World!</div>;\n}\n\nexport default Component;',
  ts: '// Write your TypeScript code here\nconsole.log("Hello World!");',
  tsx: '// Write your React TypeScript component here\nimport React from "react";\n\nfunction Component(): JSX.Element {\n  return <div>Hello World!</div>;\n}\n\nexport default Component;',
  py: '# Write your Python code here\nprint("Hello World!")',
  html: '<!-- Write your HTML here -->\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Page Title</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>',
  css: '/* Write your CSS here */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}',
  md: '# Write your markdown here\n\nThis is a **markdown** file.\n\n- List item 1\n- List item 2\n\n```javascript\nconsole.log("Code block");\n```',
  json: '{\n  "name": "project",\n  "version": "1.0.0",\n  "description": "Your project description"\n}',
  default: '// Write your code here\n// This file supports syntax highlighting'
};

const DEFAULT_PROJECT_STRUCTURES: Record<string, ProjectFile[]> = {
    node: [
    { 
      id: '', 
      name: 'package.json', 
      type: 'file', 
      content: '{\n  "name": "project",\n  "version": "1.0.0",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js"\n  }\n}', 
      fileType: 'json' 
    },
    { 
      id: '', 
      name: 'index.js', 
      type: 'file', 
      content: 'console.log("Hello World!");', 
      fileType: 'js' 
    },
    { 
      id: '', 
      name: 'README.md', 
      type: 'file', 
      content: '# Project\n\nThis is a Node.js project.', 
      fileType: 'md' 
    }
    ],
    react: [
    { 
      id: '', 
      name: 'package.json', 
      type: 'file', 
      content: '{\n  "name": "react-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0",\n    "react-dom": "^18.0.0"\n  }\n}', 
      fileType: 'json' 
    },
    { 
      id: '', 
      name: 'src', 
      type: 'folder', 
      children: [
        { 
          id: '', 
          name: 'App.jsx', 
          type: 'file', 
          content: 'import React from "react";\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Hello React!</h1>\n    </div>\n  );\n}\n\nexport default App;', 
          fileType: 'jsx' 
        },
        { 
          id: '', 
          name: 'index.js', 
          type: 'file', 
          content: 'import React from "react";\nimport ReactDOM from "react-dom";\nimport App from "./App";\n\nReactDOM.render(<App />, document.getElementById("root"));', 
          fileType: 'js' 
        }
      ], 
      isExpanded: false 
    },
    { 
      id: '', 
      name: 'README.md', 
      type: 'file', 
      content: '# React App\n\nThis is a React application.', 
      fileType: 'md' 
    }
    ],
    python: [
    { 
      id: '', 
      name: 'main.py', 
      type: 'file', 
      content: 'def main():\n    print("Hello World!")\n\nif __name__ == "__main__":\n    main()', 
      fileType: 'py' 
    },
    { 
      id: '', 
      name: 'requirements.txt', 
      type: 'file', 
      content: '# Add your dependencies here', 
      fileType: 'txt' 
    },
    { 
      id: '', 
      name: 'README.md', 
      type: 'file', 
      content: '# Python Project\n\nThis is a Python project.', 
      fileType: 'md' 
    }
  ]
};

// ==================== UTILITY FUNCTIONS ====================
const generateId = (): string => Math.random().toString(36).substr(2, 9);

const getFileExtension = (fileName: string): string => 
  fileName.split('.').pop()?.toLowerCase() || '';

const getFileIcon = (fileName: string): React.ReactNode => {
  const extension = getFileExtension(fileName);
  return FILE_TYPE_ICONS[extension] || FILE_TYPE_ICONS.default;
};

const getFilePlaceholder = (fileName: string): string => {
  const extension = getFileExtension(fileName);
  return FILE_PLACEHOLDERS[extension] || FILE_PLACEHOLDERS.default;
};

const assignIds = (files: ProjectFile[]): ProjectFile[] => {
  return files.map(file => ({
    ...file,
    id: generateId(),
    children: file.children ? assignIds(file.children) : undefined
  }));
};

const createDefaultProjectStructure = (template: string): ProjectFile[] => {
  const structure = DEFAULT_PROJECT_STRUCTURES[template] || [];
  return assignIds(structure);
};

const findFileInTree = (files: ProjectFile[], fileId: string): ProjectFile | null => {
  for (const file of files) {
    if (file.id === fileId) return file;
    if (file.children) {
      const found = findFileInTree(file.children, fileId);
      if (found) return found;
    }
  }
  return null;
};

const updateFileInTree = (
  files: ProjectFile[], 
  fileId: string, 
  updater: (file: ProjectFile) => ProjectFile
): ProjectFile[] => {
  return files.map(file => {
    if (file.id === fileId) {
      return updater(file);
    }
    if (file.children) {
      return {
        ...file,
        children: updateFileInTree(file.children, fileId, updater)
      };
    }
    return file;
  });
};

const removeFileFromTree = (files: ProjectFile[], fileId: string): ProjectFile[] => {
  return files
    .filter(file => file.id !== fileId)
    .map(file => ({
      ...file,
      children: file.children ? removeFileFromTree(file.children, fileId) : undefined
    }));
};

const addFileToTree = (
  files: ProjectFile[], 
  newFile: ProjectFile, 
  parentId?: string
): ProjectFile[] => {
  if (!parentId) {
    return [...files, newFile];
  }
  
  return files.map(file => {
    if (file.id === parentId && file.type === 'folder') {
      return {
        ...file,
        children: [...(file.children || []), newFile]
      };
    }
    if (file.children) {
      return {
        ...file,
        children: addFileToTree(file.children, newFile, parentId)
      };
    }
    return file;
  });
};

  const countFiles = (files: ProjectFile[]): number => {
    return files.reduce((count, file) => {
      if (file.type === 'file') {
        return count + 1;
      }
      return count + (file.children ? countFiles(file.children) : 0);
    }, 0);
  };

  // Flatten file tree for table view
  const flattenFileTree = (files: ProjectFile[], path = ''): ProjectFile[] => {
    const result: ProjectFile[] = [];
    
    files.forEach(file => {
      const fullPath = path ? `${path}/${file.name}` : file.name;
      const fileWithPath = { ...file, path: fullPath };
      result.push(fileWithPath);
      
      if (file.type === 'folder' && file.children) {
        result.push(...flattenFileTree(file.children, fullPath));
      }
    });
    
    return result;
  };

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Format date
  const formatDate = (date?: Date | string): string => {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get file type display
  const getFileTypeDisplay = (file: ProjectFile): string => {
    if (file.type === 'folder') return 'Folder';
    const ext = getFileExtension(file.name);
    if (!ext) return 'File';
    return ext.toUpperCase();
  };

// ==================== COMPONENT ====================
export const IDEProjectsStep: React.FC<IDEProjectsStepProps> = ({ 
  ideProjects, 
  setIdeProjects, 
  modules 
}) => {
  // Core State
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<{projectIndex: number, fileId: string} | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [dragOverFile, setDragOverFile] = useState<string | null>(null);
  
  // UX Enhancement State
  const [searchQuery, setSearchQuery] = useState('');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [recentlyDeleted, setRecentlyDeleted] = useState<{type: 'project' | 'file', name: string, data: { project: IDEProject, index: number }} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  
  // Adaptive Layout State
  const [layoutMode, setLayoutMode] = useState<'explorer' | 'editor' | 'split'>('split');
  const [sidebarWidth] = useState(320);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // File View Mode
  const [fileViewMode, setFileViewMode] = useState<'tree' | 'table'>('tree');
  
  // Persistence State
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [newProject, setNewProject] = useState<Partial<IDEProject>>({
    name: '',
    lesson_title: '',
    template: '',
    entry_file: '',
    package_manager: 'npm',
    env_vars_example: [],
    readme: '',
    files: []
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Persistence key for localStorage
  const STORAGE_KEY = 'ide-projects-state';
  
  // Persistence functions
  const saveToStorage = useCallback((data: {
    projects: IDEProject[];
    selectedProject: number | null;
    selectedFile: {projectIndex: number, fileId: string} | null;
    layoutMode: 'explorer' | 'editor' | 'split';
    fileViewMode: 'tree' | 'table';
  }) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }, []);
  
  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return null;
    }
  }, []);
  
  // Initialize from storage on mount
  React.useEffect(() => {
    if (!isInitialized) {
      const stored = loadFromStorage();
      if (stored && stored.projects) {
        setIdeProjects(stored.projects);
        if (stored.selectedProject !== undefined) {
          setSelectedProject(stored.selectedProject);
        }
        if (stored.selectedFile) {
          setSelectedFile(stored.selectedFile);
        }
        if (stored.layoutMode) {
          setLayoutMode(stored.layoutMode);
        }
        if (stored.fileViewMode) {
          setFileViewMode(stored.fileViewMode);
        }
      }
      setIsInitialized(true);
    }
  }, [isInitialized, loadFromStorage, setIdeProjects]);
  
  // Save to storage whenever state changes
  React.useEffect(() => {
    if (isInitialized) {
      saveToStorage({
        projects: ideProjects,
        selectedProject,
        selectedFile,
        layoutMode,
        fileViewMode
      });
    }
  }, [ideProjects, selectedProject, selectedFile, layoutMode, fileViewMode, isInitialized, saveToStorage]);

  // Memoized values
  const availableLessons = useMemo(() => 
    modules.flatMap(module => 
      module.lessons.map(lesson => ({
        title: lesson.title,
        moduleTitle: module.title,
        type: lesson.type
      }))
    ), [modules]
  );

  const selectedFileData = useMemo(() => {
    if (!selectedFile) return null;
    const project = ideProjects[selectedFile.projectIndex];
    if (!project) return null;
    return findFileInTree(project.files, selectedFile.fileId);
  }, [selectedFile, ideProjects]);

  // Enhanced filtering and search
  const filteredProjects = useMemo(() => {
    if (!searchQuery) return ideProjects;
    return ideProjects.filter(project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.lesson_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.template?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [ideProjects, searchQuery]);

  const filteredFiles = useMemo(() => {
    if (selectedProject === null || !searchQuery) return selectedProject !== null ? ideProjects[selectedProject]?.files || [] : [];
    const project = ideProjects[selectedProject];
    if (!project) return [];
    
    const filterFiles = (files: ProjectFile[]): ProjectFile[] => {
      return files.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (file.children && filterFiles(file.children).length > 0)
      ).map(file => ({
        ...file,
        children: file.children ? filterFiles(file.children) : undefined
      }));
    };
    
    return filterFiles(project.files);
  }, [selectedProject, searchQuery, ideProjects]);

  // Keyboard shortcuts
  const keyboardShortcuts = useMemo(() => ({
    'Ctrl+N': 'New Project',
    'Ctrl+F': 'Search',
    'Delete': 'Delete Selected',
    'F2': 'Rename',
    'Escape': 'Close/Cancel',
    'Ctrl+Z': 'Undo Last Action',
    'Ctrl+S': 'Save File',
    'Ctrl+E': 'Export All'
  }), []);

  // Project operations
  const updateProject = useCallback((index: number, updates: Partial<IDEProject>) => {
    setIdeProjects(
      ideProjects.map((project, i) => 
        i === index ? { ...project, ...updates } : project
      )
    );
  }, [ideProjects, setIdeProjects]);

  const addProject = useCallback(() => {
    if (!newProject.name || !newProject.lesson_title) return;
    
    setIsLoading(true);
    setLastAction('Creating project...');
    
    // Simulate async operation for better UX
    setTimeout(() => {
      const project: IDEProject = {
        id: generateId(),
        lesson_title: newProject.lesson_title || '',
        name: newProject.name || '',
        template: newProject.template,
        entry_file: newProject.entry_file,
        package_manager: newProject.package_manager || 'npm',
        env_vars_example: newProject.env_vars_example || [],
        readme: newProject.readme || '',
        files: newProject.template ? createDefaultProjectStructure(newProject.template) : []
      };
      
      setIdeProjects([...ideProjects, project]);
      setNewProject({
        name: '',
        lesson_title: '',
        template: '',
        entry_file: '',
        package_manager: 'npm',
        env_vars_example: [],
        readme: '',
        files: []
      });
      setShowNewProjectForm(false);
      setSelectedProject(ideProjects.length);
      setLastAction(`Project "${project.name}" created successfully`);
      setIsLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setLastAction(null), 3000);
    }, 500);
  }, [newProject, ideProjects, setIdeProjects]);

  const deleteProject = useCallback((index: number) => {
    const project = ideProjects[index];
    const fileCount = countFiles(project.files);
    
    if (!window.confirm(
      `Delete project "${project.name}"? This will remove ${fileCount} file${fileCount !== 1 ? 's' : ''}.`
    )) {
      return;
    }
    
    // Store for undo
    setRecentlyDeleted({
      type: 'project',
      name: project.name,
      data: { project, index }
    });
    
    setIdeProjects(ideProjects.filter((_, i) => i !== index));
    setLastAction(`Project "${project.name}" deleted`);
    
    if (selectedProject === index) {
      setSelectedProject(null);
      setSelectedFile(null);
    } else if (selectedProject !== null && selectedProject > index) {
      setSelectedProject(selectedProject - 1);
    }
    
    // Clear undo after 5 seconds
    setTimeout(() => setRecentlyDeleted(null), 5000);
  }, [ideProjects, selectedProject, setIdeProjects]);

  const undoLastAction = useCallback(() => {
    if (!recentlyDeleted) return;
    
    if (recentlyDeleted.type === 'project') {
      const { project, index } = recentlyDeleted.data;
      const newProjects = [...ideProjects];
      newProjects.splice(index, 0, project);
      setIdeProjects(newProjects);
      setLastAction(`Project "${project.name}" restored`);
    }
    
    setRecentlyDeleted(null);
    setTimeout(() => setLastAction(null), 3000);
  }, [recentlyDeleted, ideProjects, setIdeProjects]);

  // File operations
  const addFile = useCallback((projectIndex: number, parentId?: string) => {
    const newFile: ProjectFile = {
      id: generateId(),
      name: 'new-file.txt',
      type: 'file',
      content: '',
      fileType: 'txt',
      isEditing: true,
      // Default metadata for new files
      lastModified: new Date(),
      size: 0,
      storageClass: 'STANDARD'
    };
    
    const project = ideProjects[projectIndex];
    const updatedFiles = addFileToTree(project.files, newFile, parentId);
    updateProject(projectIndex, { files: updatedFiles });
    
    setLastAction('📄 File created - double-click to rename');
    setTimeout(() => setLastAction(null), 3000);
  }, [ideProjects, updateProject]);

  const addFolder = useCallback((projectIndex: number, parentId?: string) => {
    const newFolder: ProjectFile = {
      id: generateId(),
      name: 'new-folder',
      type: 'folder',
      children: [],
      isExpanded: false,
      isEditing: true,
      // Default metadata for folders
      lastModified: new Date(),
      size: 0,
      storageClass: 'STANDARD'
    };
    
    const project = ideProjects[projectIndex];
    const updatedFiles = addFileToTree(project.files, newFolder, parentId);
    updateProject(projectIndex, { files: updatedFiles });
    
    setLastAction('📁 Folder created - double-click to rename');
    setTimeout(() => setLastAction(null), 3000);
  }, [ideProjects, updateProject]);

  const deleteFile = useCallback((projectIndex: number, fileId: string) => {
    const project = ideProjects[projectIndex];
    const fileToDelete = findFileInTree(project.files, fileId);
    
    if (!fileToDelete) return;
    
    const message = fileToDelete.type === 'folder' 
      ? `Delete folder "${fileToDelete.name}" and all its contents?`
      : `Delete "${fileToDelete.name}"?`;
    
    if (!window.confirm(`${message} This cannot be undone.`)) return;

    const updatedFiles = removeFileFromTree(project.files, fileId);
    updateProject(projectIndex, { files: updatedFiles });
    
    if (selectedFile?.projectIndex === projectIndex && selectedFile?.fileId === fileId) {
      setSelectedFile(null);
    }
  }, [ideProjects, selectedFile, updateProject]);

  const toggleFileExpanded = useCallback((projectIndex: number, fileId: string) => {
    const project = ideProjects[projectIndex];
    const updatedFiles = updateFileInTree(project.files, fileId, file => ({
      ...file,
      isExpanded: !file.isExpanded
    }));
    updateProject(projectIndex, { files: updatedFiles });
  }, [ideProjects, updateProject]);

  const renameFile = useCallback((projectIndex: number, fileId: string, newName: string) => {
    if (!newName.trim()) return;
    
    const project = ideProjects[projectIndex];
    const updatedFiles = updateFileInTree(project.files, fileId, file => ({
      ...file,
      name: newName,
      isEditing: false,
      fileType: file.type === 'file' ? getFileExtension(newName) : undefined
    }));
    updateProject(projectIndex, { files: updatedFiles });
  }, [ideProjects, updateProject]);

  const updateFileContent = useCallback((projectIndex: number, fileId: string, content: string) => {
    const project = ideProjects[projectIndex];
    const updatedFiles = updateFileInTree(project.files, fileId, file => ({
            ...file,
      content
    }));
    updateProject(projectIndex, { files: updatedFiles });
  }, [ideProjects, updateProject]);

  const startEditing = useCallback((projectIndex: number, fileId: string) => {
    const project = ideProjects[projectIndex];
    const updatedFiles = updateFileInTree(project.files, fileId, file => ({
      ...file,
      isEditing: true
    }));
    updateProject(projectIndex, { files: updatedFiles });
  }, [ideProjects, updateProject]);

  // File upload
  const handleFileUpload = useCallback((projectIndex: number, files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const newFile: ProjectFile = {
          id: generateId(),
          name: file.name,
          type: 'file',
          content,
          fileType: getFileExtension(file.name),
          // Capture file metadata
          size: file.size,
          lastModified: file.lastModified ? new Date(file.lastModified) : new Date(),
          storageClass: 'STANDARD', // Default storage class, can be updated after S3 upload
          path: file.name
        };
        
        const project = ideProjects[projectIndex];
        updateProject(projectIndex, { files: [...project.files, newFile] });
        
        setLastAction(`Uploaded ${file.name} (${formatFileSize(file.size)})`);
        setTimeout(() => setLastAction(null), 2000);
      };
      reader.readAsText(file);
    });
  }, [ideProjects, updateProject]);

  // Export
  const exportAllProjects = useCallback(() => {
    const data = JSON.stringify(ideProjects, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ide_projects_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [ideProjects]);

  const exportFile = useCallback((fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // File tree renderer
  const renderFileTree = useCallback((
    files: ProjectFile[], 
    projectIndex: number, 
    depth = 0
  ): React.ReactNode => {
    return files.map((file, index) => {
      const isLast = index === files.length - 1;
      const isSelected = selectedFile?.projectIndex === projectIndex && selectedFile?.fileId === file.id;
      const isDragOver = dragOverFile === file.id;
      
      return (
        <div key={file.id}>
          <motion.div 
            className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-800/50 rounded-lg cursor-pointer group transition-all duration-200 ${
              isSelected ? 'bg-blue-900/30 border-l-2 border-blue-400' : ''
            } ${isDragOver ? 'bg-blue-500/20' : ''}`}
            style={{ paddingLeft: `${depth * 20 + 12}px`, position: 'relative' }}
            onClick={() => file.type === 'file' && setSelectedFile({ projectIndex, fileId: file.id })}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY, fileId: file.id, projectIndex });
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (file.type === 'folder') setDragOverFile(file.id);
            }}
            onDragLeave={() => setDragOverFile(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverFile(null);
            }}
            whileHover={{ x: 2 }}
            transition={{ duration: 0.1 }}
          >
            {depth > 0 && (
              <div 
                className="absolute left-0 top-0 bottom-0 w-4 pointer-events-none"
                style={{ left: `${(depth - 1) * 20 + 12}px` }}
              >
                <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-600"></div>
                <div 
                  className={`absolute top-1/2 h-px bg-gray-600 ${isLast ? 'w-2' : 'w-4'}`}
                  style={{ left: '8px' }}
                ></div>
              </div>
            )}

          {file.type === 'folder' ? (
              <>
            <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFileExpanded(projectIndex, file.id);
                  }}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              {file.isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              {file.isExpanded ? (
                    <FolderOpen className="w-5 h-5 text-blue-400" />
              ) : (
                    <Folder className="w-5 h-5 text-blue-400" />
              )}
            </button>
                {file.isEditing ? (
                  <Input
                    value={file.name}
                    onChange={(e) => {
                      const updatedFiles = updateFileInTree(
                        ideProjects[projectIndex].files,
                        file.id,
                        f => ({ ...f, name: e.target.value })
                      );
                      updateProject(projectIndex, { files: updatedFiles });
                    }}
                    onBlur={() => renameFile(projectIndex, file.id, file.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') renameFile(projectIndex, file.id, file.name);
                      if (e.key === 'Escape') deleteFile(projectIndex, file.id);
                    }}
                    className="flex-1 text-sm bg-transparent border-none p-0 h-auto"
                    autoFocus
                  />
                ) : (
          <span 
            className="flex-1 text-sm text-gray-300 hover:text-white cursor-pointer"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startEditing(projectIndex, file.id);
            }}
          >
            {file.name}
          </span>
                )}
                {file.children && (
                  <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded">
                    {file.children.length}
                  </span>
                )}
              </>
            ) : (
              <>
                <div className="w-5 h-5 flex items-center justify-center text-gray-400">
                  {getFileIcon(file.name)}
                </div>
                {file.isEditing ? (
                  <Input
                    value={file.name}
                    onChange={(e) => {
                      const updatedFiles = updateFileInTree(
                        ideProjects[projectIndex].files,
                        file.id,
                        f => ({ ...f, name: e.target.value })
                      );
                      updateProject(projectIndex, { files: updatedFiles });
                    }}
                    onBlur={() => renameFile(projectIndex, file.id, file.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') renameFile(projectIndex, file.id, file.name);
                      if (e.key === 'Escape') deleteFile(projectIndex, file.id);
                    }}
                    className="flex-1 text-sm bg-transparent border-none p-0 h-auto"
                    autoFocus
                  />
                ) : (
                  <span 
                    className="flex-1 text-sm text-gray-300 hover:text-white cursor-pointer"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startEditing(projectIndex, file.id);
                    }}
                  >
                    {file.name}
                  </span>
                )}
                <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.content?.length || 0} chars
                </span>
              </>
            )}
            
            {/* Enhanced delete button with better visibility */}
            <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFile(projectIndex, file.id);
                }}
                className="h-6 w-6 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors duration-200 flex items-center justify-center"
                title={`Delete ${file.name}`}
            >
              <Trash2 className="w-3 h-3" />
              </button>
          </div>
          </motion.div>
        
        {file.type === 'folder' && file.isExpanded && file.children && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderFileTree(file.children, projectIndex, depth + 1)}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      );
    });
  }, [
    selectedFile, 
    dragOverFile, 
    ideProjects, 
    toggleFileExpanded, 
    renameFile, 
    deleteFile, 
    startEditing, 
    updateProject
  ]);

  // Event handlers
  const handleProjectClick = useCallback((index: number) => {
    setSelectedProject(prev => prev === index ? null : index);
  }, []);

  const handleNewProjectSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    addProject();
  }, [addProject]);

  // Enhanced keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          setContextMenu(null);
          setShowNewProjectForm(false);
          setShowKeyboardShortcuts(false);
          break;
        case 'Delete':
          if (selectedFile) {
            deleteFile(selectedFile.projectIndex, selectedFile.fileId);
          }
          break;
        case 'F2':
          if (selectedFile) {
            startEditing(selectedFile.projectIndex, selectedFile.fileId);
          }
          break;
        default:
          if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
              case 'n':
                e.preventDefault();
                setShowNewProjectForm(true);
                break;
              case 'f':
                e.preventDefault();
                searchInputRef.current?.focus();
                break;
              case 'z':
                e.preventDefault();
                undoLastAction();
                break;
              case 's':
                e.preventDefault();
                if (selectedFileData) {
                  setLastAction('File saved');
                  setTimeout(() => setLastAction(null), 2000);
                }
                break;
              case 'e':
                e.preventDefault();
                exportAllProjects();
                break;
              case '/':
                e.preventDefault();
                setShowKeyboardShortcuts(true);
                break;
            }
          }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedFile, selectedFileData, deleteFile, startEditing, undoLastAction, exportAllProjects]);

  // Click outside to close context menu
  React.useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // Show loading state while initializing from storage
  if (!isInitialized) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading IDE Projects...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      {/* Modern Header Bar */}
      <div className="bg-[#1a1a1a]/80 backdrop-blur-sm border-b border-gray-800/50 -mx-6 px-6 py-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Terminal className="w-4 h-4 text-white" />
              </div>
        <div>
                <h1 className="text-xl font-semibold text-white">IDE Projects</h1>
                <p className="text-sm text-gray-400">Manage coding projects for your lessons</p>
        </div>
            </div>
            
            {/* Layout Controls */}
            {selectedProject !== null && (
              <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
          <Button 
                  onClick={() => setLayoutMode('explorer')}
                  variant={layoutMode === 'explorer' ? 'primary' : 'ghost'}
            size="sm"
                  className="px-3 py-1.5 text-xs"
                  title="File Explorer Only"
          >
                  <Folder className="w-3 h-3 mr-1" />
                  Explorer
          </Button>
                <Button
                  onClick={() => setLayoutMode('split')}
                  variant={layoutMode === 'split' ? 'primary' : 'ghost'}
                  size="sm"
                  className="px-3 py-1.5 text-xs"
                  title="Split View"
                >
                  <div className="w-3 h-3 mr-1 flex">
                    <div className="w-1.5 h-3 bg-current rounded-l"></div>
                    <div className="w-1.5 h-3 bg-current rounded-r"></div>
                  </div>
                  Split
          </Button>
          <Button 
                  onClick={() => setLayoutMode('editor')}
                  variant={layoutMode === 'editor' ? 'primary' : 'ghost'}
            size="sm"
                  className="px-3 py-1.5 text-xs"
                  title="Editor Only"
          >
                  <FileText className="w-3 h-3 mr-1" />
                  Editor
          </Button>
        </div>
            )}
      </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
          </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
        </div>
            
          <Button
              onClick={() => setShowKeyboardShortcuts(true)}
              variant="ghost"
            size="sm"
              className="text-gray-400 hover:text-white"
              title="Keyboard Shortcuts (Ctrl+/)"
          >
              ⌘
          </Button>
            <Button onClick={exportAllProjects} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button
            onClick={() => setShowNewProjectForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25"
              disabled={isLoading}
          >
              {isLoading ? (
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
            <Plus className="w-4 h-4 mr-2" />
              )}
            New Project
          </Button>
        </div>
      </div>

        {/* Status Bar */}
        {(lastAction || recentlyDeleted) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center justify-between bg-gray-800/30 border border-gray-700/50 rounded-lg px-4 py-2"
          >
            <div className="flex items-center gap-2">
              {lastAction && (
                <span className="text-sm text-gray-300">{lastAction}</span>
              )}
              {recentlyDeleted && (
                <span className="text-sm text-yellow-400">
                  {recentlyDeleted.name} deleted
                </span>
              )}
                </div>
            {recentlyDeleted && (
                <Button
                onClick={undoLastAction}
                variant="outline"
                  size="sm"
                className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black"
                >
                Undo
                </Button>
            )}
          </motion.div>
        )}
              </div>

      {/* Adaptive Main Layout */}
      <div className="flex-1 min-h-0">
        {selectedProject === null ? (
          /* Empty State - No Project Selected */
          <div className="h-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Terminal className="w-12 h-12 text-blue-400" />
                  </div>
              <h3 className="text-xl font-semibold text-white mb-2">Welcome to IDE Projects</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Create and manage coding projects for your lessons. Start by creating your first project or selecting an existing one.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => setShowNewProjectForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
                {ideProjects.length > 0 && (
                  <Button
                    onClick={() => handleProjectClick(0)}
                    variant="outline"
                  >
                    View Existing Projects
                  </Button>
                )}
                  </div>
            </motion.div>
                  </div>
        ) : (
          /* Project Selected - Adaptive Layout */
          <div className="h-full flex gap-6">
            {/* Projects Sidebar - Collapsible */}
            <motion.div
              initial={false}
              animate={{ width: isSidebarCollapsed ? 0 : sidebarWidth }}
              className="overflow-hidden"
            >
              <Card className="h-full shadow-xl border-gray-800/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Projects</h3>
                      <Button
                      onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                    >
                      {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 overflow-y-auto">
                  {filteredProjects.map((project, index) => {
                    const originalIndex = ideProjects.findIndex(p => p.id === project.id);
                    const isSelected = selectedProject === originalIndex;
                    return (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`group cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50 shadow-lg shadow-blue-500/10' 
                            : 'bg-gray-800/30 hover:bg-gray-700/50 border border-transparent hover:border-gray-700/50'
                        } rounded-xl p-4`}
                        onClick={() => handleProjectClick(originalIndex)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate mb-1">{project.name}</h4>
                            <p className="text-xs text-gray-400 truncate">{project.lesson_title}</p>
                          </div>
                  <Button
                    size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProject(originalIndex);
                            }}
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                  </Button>
                </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {countFiles(project.files)} file{countFiles(project.files) !== 1 ? 's' : ''}
                            </span>
                            {project.template && (
                              <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full">
                                {project.template}
                              </span>
                            )}
              </div>
                          {isSelected && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          )}
              </div>
                      </motion.div>
                    );
                  })}
                  
                  {filteredProjects.length === 0 && ideProjects.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <div className="text-gray-400 mb-2">🔍</div>
                      <p className="text-sm text-gray-500 mb-3">No projects match your search</p>
                <Button
                        onClick={() => setSearchQuery('')}
                  variant="outline"
                        size="sm"
                >
                        Clear Search
                </Button>
          </motion.div>
        )}
                  
                  {ideProjects.length === 0 && (
            <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <Terminal className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No projects yet</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Adaptive Content Area */}
            <div className="flex-1 min-h-0">
              {layoutMode === 'explorer' ? (
                /* File Explorer Only */
                <Card className="h-full shadow-xl border-gray-800/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">File Explorer</h3>
                        <div className="flex items-center gap-2 text-sm text-blue-400">
                          <span>→</span>
                          <span className="font-medium">{ideProjects[selectedProject]?.name}</span>
                          <span className="text-gray-500">({countFiles(ideProjects[selectedProject]?.files || [])} files)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-2">
                      <Button
                        size="sm"
                            variant="outline" 
                            onClick={() => addFile(selectedProject)}
                            className="hover:bg-blue-500/20 hover:border-blue-500/50"
                      >
                            <File className="w-4 h-4 mr-1" /> File
                      </Button>
                      <Button
                        size="sm"
                            variant="outline" 
                            onClick={() => addFolder(selectedProject)}
                            className="hover:bg-green-500/20 hover:border-green-500/50"
                      >
                            <Folder className="w-4 h-4 mr-1" /> Folder
                      </Button>
                      <Button
                        size="sm"
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()}
                            className="hover:bg-purple-500/20 hover:border-purple-500/50"
                          >
                            <Upload className="w-4 h-4 mr-1" /> Upload
                      </Button>
                    </div>
                        <div className="h-6 w-px bg-gray-700"></div>
                        <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
                          <Button
                            size="sm"
                            variant={fileViewMode === 'tree' ? 'primary' : 'ghost'}
                            onClick={() => setFileViewMode('tree')}
                            className="px-2 py-1 text-xs"
                            title="Tree View"
                          >
                            <Folder className="w-3 h-3 mr-1" />
                            Tree
                          </Button>
                          <Button
                            size="sm"
                            variant={fileViewMode === 'table' ? 'primary' : 'ghost'}
                            onClick={() => setFileViewMode('table')}
                            className="px-2 py-1 text-xs"
                            title="Table View"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Table
                          </Button>
                    </div>
                    </div>
                    </div>
                  </CardHeader>
                  <CardContent className="overflow-y-auto">
                        <div className="bg-[#0a0a0a] border border-gray-700/50 rounded-xl p-4 min-h-[500px]">
                      {filteredFiles.length > 0 ? (
                        fileViewMode === 'table' ? (
                          /* Table View with S3 Metadata */
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-700/50">
                                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Modified</th>
                                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Size</th>
                                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Storage Class</th>
                                </tr>
                              </thead>
                              <tbody>
                                {flattenFileTree(filteredFiles).map((file) => {
                                  const isSelected = selectedFile?.projectIndex === selectedProject && selectedFile?.fileId === file.id;
                                  return (
                                    <motion.tr
                                      key={file.id}
                                      className={`border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-colors ${
                                        isSelected ? 'bg-blue-900/20' : ''
                                      }`}
                                      onClick={() => file.type === 'file' && setSelectedFile({ projectIndex: selectedProject, fileId: file.id })}
                                      whileHover={{ backgroundColor: 'rgba(31, 41, 55, 0.3)' }}
                                    >
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                          {file.type === 'folder' ? (
                                            <FolderOpen className="w-4 h-4 text-blue-400" />
                                          ) : (
                                            getFileIcon(file.name)
                                          )}
                                          <span className="text-white">{file.name}</span>
                  </div>
                                      </td>
                                      <td className="py-3 px-4 text-gray-400">
                                        {getFileTypeDisplay(file)}
                                      </td>
                                      <td className="py-3 px-4 text-gray-400">
                                        {formatDate(file.lastModified)}
                                      </td>
                                      <td className="py-3 px-4 text-gray-400">
                                        {formatFileSize(file.size)}
                                      </td>
                                      <td className="py-3 px-4">
                                        <span className="px-2 py-1 rounded text-xs bg-gray-800/50 text-gray-300">
                                          {file.storageClass || 'STANDARD'}
                                        </span>
                                      </td>
                                    </motion.tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          /* Tree View */
                          renderFileTree(filteredFiles, selectedProject)
                        )
                      ) : ideProjects[selectedProject].files.length > 0 ? (
                        <div className="text-center py-12">
                          <div className="text-gray-400 mb-3 text-2xl">🔍</div>
                          <p className="text-gray-500 mb-4">No files match your search</p>
                    <Button
                            onClick={() => setSearchQuery('')}
                      variant="outline"
                      size="sm"
                          >
                            Clear Search
                    </Button>
                  </div>
                      ) : (
                        <div 
                          className="text-center py-16 border-2 border-dashed border-gray-600/50 rounded-xl hover:border-blue-500/50 transition-all duration-200"
                          onDrop={(e) => {
                            e.preventDefault();
                            handleFileUpload(selectedProject, e.dataTransfer.files);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add('border-blue-500/50', 'bg-blue-500/5');
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.classList.remove('border-blue-500/50', 'bg-blue-500/5');
                          }}
                        >
                          <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                            <Upload className="w-10 h-10 text-blue-400" />
                          </div>
                          <h4 className="text-lg font-semibold text-white mb-2">Add Files to Your Project</h4>
                          <p className="text-gray-400 mb-6">Drop files here or use the buttons above to get started</p>
                          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                            <span>• Supports multiple files</span>
                            <span>• Drag & drop enabled</span>
                            <span>• Auto-detects file types</span>
          </div>
        </div>
      )}
                    </div>
                  </CardContent>
                </Card>
              ) : layoutMode === 'editor' ? (
                /* File Editor Only */
                <Card className="h-full shadow-xl border-gray-800/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
              <div>
                        <h3 className="text-lg font-semibold text-white">
                          {selectedFileData ? 'File Editor' : 'Select a file to edit'}
                        </h3>
                        {selectedFileData && selectedFile && (
                          <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                            <span className="text-blue-400">{ideProjects[selectedFile.projectIndex]?.name}</span>
                            <span>/</span>
                            <span>{selectedFileData.name}</span>
              </div>
                        )}
                      </div>
                      {selectedFileData && selectedFile && (
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => exportFile(selectedFileData.name, selectedFileData.content || '')}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteFile(selectedFile.projectIndex, selectedFile.fileId)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
              </Button>
            </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="overflow-y-auto">
                    {selectedFileData && selectedFile ? (
                      <div className="space-y-4">
                      <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-white">File Content</label>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{selectedFileData.content?.length || 0} characters</span>
                              <span>{selectedFileData.content?.split('\n').length || 1} lines</span>
                      </div>
                      </div>
                          <textarea
                            value={selectedFileData.content || ''}
                            onChange={(e) => updateFileContent(selectedFile.projectIndex, selectedFile.fileId, e.target.value)}
                            className="w-full h-[600px] p-4 bg-[#0a0a0a] border border-gray-700/50 rounded-xl text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            placeholder={getFilePlaceholder(selectedFileData.name)}
                            spellCheck={false}
                        />
                      </div>
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-2xl p-8 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                          <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No File Selected</h3>
                        <p className="text-gray-400 mb-6">Select a file from the explorer to start editing</p>
                          <Button
                          onClick={() => setLayoutMode('split')}
                        variant="outline"
                      >
                          Switch to Split View
                      </Button>
                    </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                /* Split View - Default */
                <div className="h-full flex gap-6">
              {/* File Explorer */}
                  <div className="flex-1">
                    <Card className="h-full shadow-xl border-gray-800/50">
                      <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-white">File Explorer</h3>
                            <div className="flex items-center gap-2 text-sm text-blue-400">
                              <span>→</span>
                              <span className="font-medium">{ideProjects[selectedProject]?.name}</span>
                              <span className="text-gray-500">({countFiles(ideProjects[selectedProject]?.files || [])} files)</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addFile(selectedProject)}
                                className="hover:bg-blue-500/20 hover:border-blue-500/50"
                        >
                                <File className="w-4 h-4 mr-1" /> File
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addFolder(selectedProject)}
                                className="hover:bg-green-500/20 hover:border-green-500/50"
                        >
                                <Folder className="w-4 h-4 mr-1" /> Folder
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                                className="hover:bg-purple-500/20 hover:border-purple-500/50"
                        >
                                <Upload className="w-4 h-4 mr-1" /> Upload
                        </Button>
                            </div>
                            <div className="h-6 w-px bg-gray-700"></div>
                            <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
                              <Button
                                size="sm"
                                variant={fileViewMode === 'tree' ? 'primary' : 'ghost'}
                                onClick={() => setFileViewMode('tree')}
                                className="px-2 py-1 text-xs"
                                title="Tree View"
                              >
                                <Folder className="w-3 h-3 mr-1" />
                                Tree
                              </Button>
                              <Button
                                size="sm"
                                variant={fileViewMode === 'table' ? 'primary' : 'ghost'}
                                onClick={() => setFileViewMode('table')}
                                className="px-2 py-1 text-xs"
                                title="Table View"
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                Table
                              </Button>
                            </div>
                      </div>
                    </div>
                  </CardHeader>
                      <CardContent className="overflow-y-auto">
                        <div className="bg-[#0a0a0a] border border-gray-700/50 rounded-xl p-4 min-h-[400px]">
                          {filteredFiles.length > 0 ? (
                            fileViewMode === 'table' ? (
                              /* Table View with S3 Metadata */
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-gray-700/50">
                                      <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">Name</th>
                                      <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">Type</th>
                                      <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">Last Modified</th>
                                      <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">Size</th>
                                      <th className="text-left py-2 px-3 text-gray-400 font-medium text-xs">Storage Class</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {flattenFileTree(filteredFiles).map((file) => {
                                      const isSelected = selectedFile?.projectIndex === selectedProject && selectedFile?.fileId === file.id;
                                      return (
                                        <motion.tr
                                          key={file.id}
                                          className={`border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-colors ${
                                            isSelected ? 'bg-blue-900/20' : ''
                                          }`}
                                          onClick={() => file.type === 'file' && setSelectedFile({ projectIndex: selectedProject, fileId: file.id })}
                                          whileHover={{ backgroundColor: 'rgba(31, 41, 55, 0.3)' }}
                                        >
                                          <td className="py-2 px-3">
                                            <div className="flex items-center gap-2">
                                              {file.type === 'folder' ? (
                                                <FolderOpen className="w-4 h-4 text-blue-400" />
                                              ) : (
                                                getFileIcon(file.name)
                                              )}
                                              <span className="text-white text-xs">{file.name}</span>
                                            </div>
                                          </td>
                                          <td className="py-2 px-3 text-gray-400 text-xs">
                                            {getFileTypeDisplay(file)}
                                          </td>
                                          <td className="py-2 px-3 text-gray-400 text-xs">
                                            {formatDate(file.lastModified)}
                                          </td>
                                          <td className="py-2 px-3 text-gray-400 text-xs">
                                            {formatFileSize(file.size)}
                                          </td>
                                          <td className="py-2 px-3">
                                            <span className="px-2 py-0.5 rounded text-xs bg-gray-800/50 text-gray-300">
                                              {file.storageClass || 'STANDARD'}
                                            </span>
                                          </td>
                                        </motion.tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              /* Tree View */
                              renderFileTree(filteredFiles, selectedProject)
                            )
                          ) : ideProjects[selectedProject].files.length > 0 ? (
                        <div className="text-center py-8">
                              <div className="text-gray-400 mb-2">🔍</div>
                              <p className="text-sm text-gray-500">No files match your search</p>
                              <Button
                                onClick={() => setSearchQuery('')}
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                Clear Search
                              </Button>
                            </div>
                          ) : (
                            <div 
                              className="text-center py-12 border-2 border-dashed border-gray-600/50 rounded-xl hover:border-blue-500/50 transition-all duration-200"
                              onDrop={(e) => {
                                e.preventDefault();
                                handleFileUpload(selectedProject, e.dataTransfer.files);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.add('border-blue-500/50', 'bg-blue-500/5');
                              }}
                              onDragLeave={(e) => {
                                e.currentTarget.classList.remove('border-blue-500/50', 'bg-blue-500/5');
                              }}
                            >
                              <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Upload className="w-8 h-8 text-blue-400" />
                              </div>
                              <h4 className="text-lg font-semibold text-white mb-2">Add Files to Your Project</h4>
                              <p className="text-sm text-gray-400 mb-4">Drop files here or use the buttons above to get started</p>
                              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                                <span>• Supports multiple files</span>
                                <span>• Drag & drop enabled</span>
                                <span>• Auto-detects file types</span>
                              </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                  </div>

                  {/* File Editor */}
                  <div className="flex-1">
                    <Card className="h-full shadow-xl border-gray-800/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {selectedFileData ? 'File Editor' : 'Select a file to edit'}
                            </h3>
                            {selectedFileData && selectedFile && (
                              <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                <span className="text-blue-400">{ideProjects[selectedFile.projectIndex]?.name}</span>
                                <span>/</span>
                                <span>{selectedFileData.name}</span>
              </div>
                            )}
            </div>
                          {selectedFileData && selectedFile && (
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => exportFile(selectedFileData.name, selectedFileData.content || '')}>
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => deleteFile(selectedFile.projectIndex, selectedFile.fileId)} className="text-red-400 hover:text-red-300">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
            </div>
                      </CardHeader>
                      <CardContent className="overflow-y-auto">
                        {selectedFileData && selectedFile ? (
                          <div className="space-y-4">
            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-white">File Content</label>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>{selectedFileData.content?.length || 0} characters</span>
                                  <span>{selectedFileData.content?.split('\n').length || 1} lines</span>
            </div>
          </div>
                              <textarea
                                value={selectedFileData.content || ''}
                                onChange={(e) => updateFileContent(selectedFile.projectIndex, selectedFile.fileId, e.target.value)}
                                className="w-full h-64 p-3 bg-[#0a0a0a] border border-gray-700/50 rounded-xl text-white font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                placeholder={getFilePlaceholder(selectedFileData.name)}
                                spellCheck={false}
                              />
            </div>
            </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-2xl p-6 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                              <FileText className="w-8 h-8 text-gray-400" />
          </div>
                            <p className="text-gray-500">Select a file to edit its content</p>
            </div>
                        )}
                      </CardContent>
                    </Card>
            </div>
          </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      <AnimatePresence>
        {showNewProjectForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewProjectForm(false)}
          >
            <motion.form
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleNewProjectSubmit}
            >
              <div className="flex items-center justify-between mb-6">
            <div>
                  <h3 className="text-xl font-bold text-white">Create New Project</h3>
                  <p className="text-gray-400">Set up a new coding project</p>
            </div>
                <Button
                  type="button"
                  onClick={() => setShowNewProjectForm(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-5 h-5" />
                </Button>
          </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Lesson</label>
                  <Select
                    value={newProject.lesson_title || ''}
                    onChange={(e) => setNewProject({ ...newProject, lesson_title: e.target.value })}
                    options={[
                      { value: '', label: 'Select a lesson' },
                      ...availableLessons.map((lesson) => ({
                        value: lesson.title,
                        label: `${lesson.title} (${lesson.moduleTitle}) - ${lesson.type}`
                      }))
                    ]}
                    placeholder="Choose a coding lesson"
                    required
                  />
                  {availableLessons.length === 0 && (
                    <p className="text-sm text-yellow-400 mt-1">
                      No lessons found. Add lessons in the Course Content step first.
                    </p>
                  )}
            </div>
                
            <div>
                  <label className="block text-sm font-medium text-white mb-2">Project Name</label>
                  <Input
                    value={newProject.name || ''}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="e.g., React Todo App"
                    required
                  />
            </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Template (Optional)</label>
                  <Select
                    value={newProject.template || ''}
                    onChange={(e) => setNewProject({ ...newProject, template: e.target.value })}
                    options={[
                      { value: '', label: 'Start from scratch' },
                      ...IDE_TEMPLATES.map(template => ({
                        value: template.value,
                        label: `${template.label} - ${template.description}`
                      }))
                    ]}
                  />
          </div>
            </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  onClick={() => setShowNewProjectForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!newProject.name || !newProject.lesson_title}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                >
                  Create Project
                </Button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-lg z-50 py-2 min-w-[180px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onMouseLeave={() => setContextMenu(null)}
          >
            {contextMenu.fileId && contextMenu.projectIndex !== undefined && (
              <>
                <div className="px-3 py-1 text-xs text-gray-400 border-b border-gray-700 mb-1">
                  {contextMenu.fileId}
                </div>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  onClick={() => {
                    addFile(contextMenu.projectIndex!, contextMenu.fileId);
                    setContextMenu(null);
                  }}
                >
                  <File className="w-4 h-4" />
                  New File
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  onClick={() => {
                    addFolder(contextMenu.projectIndex!, contextMenu.fileId);
                    setContextMenu(null);
                  }}
                >
                  <Folder className="w-4 h-4" />
                  New Folder
                </button>
                <div className="h-px bg-gray-700 my-1"></div>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-blue-400 hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  onClick={() => {
                    startEditing(contextMenu.projectIndex!, contextMenu.fileId!);
                    setContextMenu(null);
                  }}
                >
                  <Edit className="w-4 h-4" />
                  Rename
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-green-400 hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  onClick={() => {
                    // Copy file path to clipboard
                    navigator.clipboard.writeText(contextMenu.fileId!);
                    setLastAction('Path copied to clipboard');
                    setTimeout(() => setLastAction(null), 2000);
                    setContextMenu(null);
                  }}
                >
                  <FileText className="w-4 h-4" />
                  Copy Path
                </button>
                <div className="h-px bg-gray-700 my-1"></div>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  onClick={() => {
                    deleteFile(contextMenu.projectIndex!, contextMenu.fileId!);
                    setContextMenu(null);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showKeyboardShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowKeyboardShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
            <div>
                  <h3 className="text-xl font-bold text-white">Keyboard Shortcuts</h3>
                  <p className="text-gray-400">Speed up your workflow</p>
            </div>
                <Button
                  onClick={() => setShowKeyboardShortcuts(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-5 h-5" />
                </Button>
          </div>

              <div className="space-y-3">
                {Object.entries(keyboardShortcuts).map(([shortcut, description]) => (
                  <div key={shortcut} className="flex items-center justify-between py-2">
                    <span className="text-gray-300">{description}</span>
                    <kbd className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-gray-300">
                      {shortcut}
                    </kbd>
        </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500 text-center">
                  Press <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-xs">Esc</kbd> to close
                </p>
      </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => selectedProject !== null && handleFileUpload(selectedProject, e.target.files)}
        className="hidden"
      />
    </motion.div>
  );
};