"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FolderOpen, 
  File, 
  ChevronDown, 
  ChevronRight, 
  
  X, 
  RefreshCw, 
  GitBranch, 
  GitCommit, 
  Play, 
  Bug, 
  PackageOpen, 
  Plus,
  FileCode,
  FileJson,
  FileText,
  BookOpen,
  
  FileVideo,
  FileImage,
  FileArchive,
  FileAudio,
  AlertTriangle,
  Loader2,
  Cloud,
  CloudOff
} from 'lucide-react'
import { Course, Lesson } from '@/types/index'

interface IDESidebarProps {
  activeView: string
  course?: Course
  currentLesson?: Lesson
}

// Generate file system based on course and lesson data
const getFileSystem = (course?: Course, currentLesson?: Lesson) => {
  const courseStructure = {
    name: course?.title || 'Course',
    type: 'folder' as const,
    children: [
      {
        name: 'course-info',
        type: 'folder' as const,
        children: [
          { name: 'course-overview.md', type: 'file' as const, icon: FileText },
          { name: 'course-structure.json', type: 'file' as const, icon: FileJson },
        ],
      },
      {
        name: 'lessons',
        type: 'folder' as const,
        children: currentLesson ? [
          { 
            name: `${currentLesson.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`, 
            type: 'file' as const, 
            icon: BookOpen 
          }
        ] : [],
      },
      {
        name: 'resources',
        type: 'folder' as const,
        children: currentLesson?.resources?.map((resource) => {
          const extension = (resource as { name: string }).name.split('.').pop()?.toLowerCase();
          let icon = File;
          
          switch (extension) {
            case 'mp4':
            case 'mov':
            case 'avi':
            case 'webm':
              icon = FileVideo;
              break;
            case 'pdf':
              icon = FileText;
              break;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
              icon = FileImage;
              break;
            case 'zip':
            case 'rar':
            case '7z':
              icon = FileArchive;
              break;
            case 'mp3':
            case 'wav':
            case 'aac':
              icon = FileAudio;
              break;
            case 'txt':
            case 'md':
              icon = FileText;
              break;
            case 'js':
            case 'ts':
            case 'tsx':
            case 'jsx':
            case 'py':
            case 'html':
            case 'css':
              icon = FileCode;
              break;
            default:
              icon = File;
          }
          
          return {
            name: (resource as { name: string }).name,
            type: 'file' as const,
            icon,
            size: (resource as { size?: number }).size,
            url: (resource as { url?: string }).url
          };
        }) || [],
      },
    ],
  };

  return courseStructure;
};

export function IDESidebar({ activeView, course, currentLesson }: IDESidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['Course', 'course-info', 'lessons', 'resources'])
  const [searchText, setSearchText] = useState('')
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set())
  const [fileErrors, setFileErrors] = useState<Map<string, string>>(new Map())
  const [searchResults, setSearchResults] = useState<Array<{ name: string; path: string; type: 'file'; matches: number }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [gitConnected, setGitConnected] = useState(false)
  const [gitBranch] = useState('main')
  const [lastCommit] = useState('Latest commit')
  
  const fileSystem = getFileSystem(course, currentLesson)
  
  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path) 
        : [...prev, path]
    )
  }

  // Simulate file fetching from S3/Supabase
  const fetchFileContent = async (filePath: string) => {
    setLoadingFiles(prev => new Set(prev).add(filePath))
    setFileErrors(prev => {
      const newMap = new Map(prev)
      newMap.delete(filePath)
      return newMap
    })

    try {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
      
      if (Math.random() < 0.3) {
        throw new Error('Failed to fetch from S3/Supabase')
      }

      console.log(`Opening file: ${filePath}`)
      
    } catch (error) {
      setFileErrors(prev => new Map(prev).set(filePath, error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoadingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(filePath)
        return newSet
      })
    }
  }

  // Search functionality
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockResults = [
        { name: 'course-overview.md', path: 'course-info/course-overview.md', type: 'file' as const, matches: 3 },
        { name: 'lesson-content.md', path: 'lessons/lesson-content.md', type: 'file' as const, matches: 1 },
        { name: 'video-resource.mp4', path: 'resources/video-resource.mp4', type: 'file' as const, matches: 1 }
      ].filter(result => 
        result.name.toLowerCase().includes(query.toLowerCase()) ||
        result.path.toLowerCase().includes(query.toLowerCase())
      )
      
      setSearchResults(mockResults)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }
  
  type FileItem = { name: string; type: 'file'; icon?: React.ComponentType<{ size?: number }>; size?: number; url?: string }
  type FolderItem = { name: string; type: 'folder'; children?: Array<FileItem | FolderItem> }
  type TreeItem = FileItem | FolderItem

  const FileSystemItem = ({ item, path = '', level = 0 }: { item: TreeItem; path?: string; level?: number }) => {
    const fullPath = path ? `${path}/${item.name}` : item.name
    const isExpanded = expandedFolders.includes(fullPath)
    const isLoading = loadingFiles.has(fullPath)
    const error = fileErrors.get(fullPath)
    
    return (
      <div>
        <motion.div 
          className={`flex items-center h-6 text-sm rounded-sm px-2 hover:bg-[var(--vscode-list-hoverBackground)] group cursor-pointer relative`}
          whileHover={{ x: 2 }}
          transition={{ duration: 0.1 }}
          style={{ paddingLeft: `${level * 16 + 4}px` }}
          onClick={() => {
            if (item.type === 'file') {
              fetchFileContent(fullPath)
            }
          }}
        >
          {item.type === 'folder' ? (
            <button
              className="h-4 w-4 p-0 mr-1 rounded-sm hover:bg-[var(--vscode-list-hoverBackground)]"
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(fullPath)
              }}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-5"></span>
          )}
          
          {item.type === 'folder' ? (
            <FolderOpen size={16} className="mr-1 text-[var(--vscode-icon-foreground)]" />
          ) : item.icon ? (
            <item.icon size={16} />
          ) : (
            <File size={16} className="mr-1 text-[var(--vscode-icon-foreground)]" />
          )}
          
          <span className="flex-1 truncate text-[var(--vscode-foreground)]">{item.name}</span>
          
          <div className="flex items-center gap-1">
            {isLoading && <Loader2 size={12} className="animate-spin text-[var(--vscode-progressBar-background)]" />}
            {error && <AlertTriangle size={12} className="text-[var(--vscode-errorForeground)]" />}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(item as any).size && (
              <span className="text-xs text-[var(--vscode-descriptionForeground)] ml-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {Math.floor((item as any).size / 1024)}KB
              </span>
            )}
          </div>
        </motion.div>
        
        {error && (
          <div className="absolute left-0 top-6 z-50 bg-[var(--vscode-errorBackground)] text-[var(--vscode-errorForeground)] text-xs p-2 rounded shadow-lg max-w-xs">
            <div className="flex items-center gap-1">
              <AlertTriangle size={12} />
              <span>Could not load from S3/Supabase</span>
            </div>
            <div className="mt-1 text-xs opacity-80">{error}</div>
            <button
              className="mt-2 px-2 py-1 bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] rounded text-xs hover:bg-[var(--vscode-button-hoverBackground)]"
              onClick={(e) => {
                e.stopPropagation()
                fetchFileContent(fullPath)
              }}
            >
              Retry
            </button>
          </div>
        )}
        
        {item.type === 'folder' && isExpanded && item.children && (
          <div>
            {item.children.map((child: TreeItem, index: number) => (
              <FileSystemItem key={index} item={child} path={fullPath} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }
  
  const renderExplorer = () => (
    <div className="h-full flex flex-col">
      <div className="p-2 text-sm font-medium flex items-center justify-between text-[var(--vscode-foreground)]">
        <span>EXPLORER</span>
        <div className="flex items-center gap-1">
          <button className="h-6 w-6 rounded-md hover:bg-[var(--vscode-toolbar-hoverBackground)] flex items-center justify-center">
            <Plus size={14} />
          </button>
          <button className="h-6 w-6 rounded-md hover:bg-[var(--vscode-toolbar-hoverBackground)] flex items-center justify-center">
            <RefreshCw size={14} />
          </button>
          <button className="h-6 w-6 rounded-md hover:bg-[var(--vscode-toolbar-hoverBackground)] flex items-center justify-center">
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="p-1">
          <FileSystemItem item={fileSystem} />
        </div>
      </div>
    </div>
  )
  
  const renderSearch = () => (
    <div className="h-full flex flex-col">
      <div className="p-2 text-sm font-medium flex items-center justify-between text-[var(--vscode-foreground)]">
        <span>SEARCH</span>
        <div className="flex items-center gap-1">
          <button 
            className="h-6 w-6 rounded-md hover:bg-[var(--vscode-toolbar-hoverBackground)] flex items-center justify-center"
            onClick={() => handleSearch(searchText)}
          >
            <RefreshCw size={14} />
          </button>
          <button className="h-6 w-6 rounded-md hover:bg-[var(--vscode-toolbar-hoverBackground)] flex items-center justify-center">
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
      
      <div className="p-2 space-y-2">
        <div className="flex items-center rounded-sm border border-[var(--vscode-input-border)] bg-[var(--vscode-input-background)]">
          <input 
            placeholder="Search in files"
            className="h-7 text-xs border-0 focus:outline-none px-2 bg-transparent text-[var(--vscode-input-foreground)] placeholder-[var(--vscode-input-placeholderForeground)]"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value)
              if (e.target.value.trim()) {
                handleSearch(e.target.value)
              } else {
                setSearchResults([])
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(searchText)
              }
            }}
          />
          {searchText && (
            <button 
              className="h-7 w-7 rounded-none hover:bg-[var(--vscode-toolbar-hoverBackground)] flex items-center justify-center"
              onClick={() => {
                setSearchText('')
                setSearchResults([])
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="space-y-1">
            {isSearching ? (
              <div className="flex items-center gap-2 text-xs text-[var(--vscode-descriptionForeground)] px-2">
                <Loader2 size={12} className="animate-spin" />
                <span>Searching...</span>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2 p-2 hover:bg-[var(--vscode-list-hoverBackground)] rounded-sm cursor-pointer"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.1 }}
                  onClick={() => fetchFileContent(result.path)}
                >
                  <File size={14} className="text-[var(--vscode-icon-foreground)]" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate text-[var(--vscode-foreground)]">{result.name}</div>
                    <div className="text-xs text-[var(--vscode-descriptionForeground)] truncate">{result.path}</div>
                  </div>
                  <div className="text-xs text-[var(--vscode-descriptionForeground)]">
                    {result.matches} match{result.matches !== 1 ? 'es' : ''}
                  </div>
                </motion.div>
              ))
            ) : searchText ? (
              <div className="text-xs text-[var(--vscode-descriptionForeground)] px-2">
                No results found for &quot;{searchText}&quot;
              </div>
            ) : (
              <div className="text-xs text-[var(--vscode-descriptionForeground)] px-2">
                Enter a search term to find files
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
  
  const renderSourceControl = () => {
    const connectGit = () => {
      console.log('Connecting to Git repository...')
      setGitConnected(true)
    }
    
    return (
      <div className="h-full flex flex-col">
        <div className="p-2 text-sm font-medium flex items-center justify-between text-[var(--vscode-foreground)]">
          <span>SOURCE CONTROL</span>
          <div className="flex items-center gap-1">
            <button 
              className="h-6 w-6 rounded-md hover:bg-[var(--vscode-toolbar-hoverBackground)] flex items-center justify-center"
              onClick={() => {
                if (gitConnected) {
                  console.log('Refreshing Git status...')
                } else {
                  connectGit()
                }
              }}
            >
              <RefreshCw size={14} />
            </button>
            <button className="h-6 w-6 rounded-md hover:bg-[var(--vscode-toolbar-hoverBackground)] flex items-center justify-center">
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
        
        <div className="p-2 space-y-2">
          {!gitConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-[var(--vscode-descriptionForeground)]">
                <CloudOff size={14} />
                <span>Git not connected</span>
              </div>
              <button 
                className="w-full h-8 text-xs bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] rounded hover:bg-[var(--vscode-button-hoverBackground)]"
                onClick={connectGit}
              >
                Connect to Git Repository
              </button>
              <div className="text-xs text-[var(--vscode-descriptionForeground)]">
                Connect to GitHub, GitLab, or other Git hosting service
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-[var(--vscode-foreground)]">
                <GitBranch size={14} />
                <span>{gitBranch}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--vscode-descriptionForeground)]">
                <GitCommit size={14} />
                <span>{lastCommit}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--vscode-testing-iconPassed)]">
                <Cloud size={14} />
                <span>Connected</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
  
  const renderRun = () => (
    <div className="h-full flex flex-col">
      <div className="p-2 text-sm font-medium flex items-center justify-between text-[var(--vscode-foreground)]">
        <span>RUN AND DEBUG</span>
        <div className="flex items-center gap-1">
          <button className="h-6 w-6 rounded-md hover:bg-[var(--vscode-toolbar-hoverBackground)] flex items-center justify-center">
            <Play size={14} />
          </button>
          <button className="h-6 w-6 rounded-md hover:bg-[var(--vscode-toolbar-hoverBackground)] flex items-center justify-center">
            <Bug size={14} />
          </button>
        </div>
      </div>
      
      <div className="p-2 space-y-2">
        <div className="text-xs text-[var(--vscode-descriptionForeground)]">
          No launch configuration
        </div>
      </div>
    </div>
  )
  
  const renderExtensions = () => (
    <div className="h-full flex flex-col">
      <div className="p-2 text-sm font-medium flex items-center justify-between text-[var(--vscode-foreground)]">
        <span>EXTENSIONS</span>
        <div className="flex items-center gap-1">
          <button className="h-6 w-6 rounded-md hover:bg-[var(--vscode-toolbar-hoverBackground)] flex items-center justify-center">
            <PackageOpen size={14} />
          </button>
          <button className="h-6 w-6 rounded-md hover:bg-[var(--vscode-toolbar-hoverBackground)] flex items-center justify-center">
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
      
      <div className="p-2 space-y-2">
        <div className="text-xs text-[var(--vscode-descriptionForeground)] mb-4">
          No extensions installed
        </div>
        
        <button 
          className="w-full h-8 text-xs bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] rounded hover:bg-[var(--vscode-button-hoverBackground)]"
          onClick={() => {
            console.log('Opening extension marketplace')
          }}
        >
          Browse Extensions
        </button>
        
        <div className="mt-4 space-y-2">
          <div className="text-xs font-medium text-[var(--vscode-descriptionForeground)]">Recommended</div>
          <div className="space-y-1">
            {[
              { name: 'TypeScript', description: 'TypeScript language support', installed: false },
              { name: 'Prettier', description: 'Code formatter', installed: false },
              { name: 'ESLint', description: 'JavaScript linter', installed: false },
            ].map((ext, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-2 hover:bg-[var(--vscode-list-hoverBackground)] rounded-sm cursor-pointer"
                whileHover={{ x: 2 }}
                transition={{ duration: 0.1 }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate text-[var(--vscode-foreground)]">{ext.name}</div>
                  <div className="text-xs text-[var(--vscode-descriptionForeground)] truncate">{ext.description}</div>
                </div>
                <button
                  className="h-6 text-xs bg-[var(--vscode-button-secondaryBackground)] text-[var(--vscode-button-secondaryForeground)] rounded px-2 hover:bg-[var(--vscode-button-secondaryHoverBackground)]"
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log(`Installing ${ext.name}`)
                  }}
                >
                  Install
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
  
  const renderView = () => {
    switch (activeView) {
      case 'explorer':
        return renderExplorer()
      case 'search':
        return renderSearch()
      case 'source-control':
        return renderSourceControl()
      case 'run':
        return renderRun()
      case 'extensions':
        return renderExtensions()
      default:
        return renderExplorer()
    }
  }
  
  return (
    <div className="h-full bg-[var(--vscode-sideBar-background)] text-[var(--vscode-sideBar-foreground)]">
      {renderView()}
    </div>
  )
}