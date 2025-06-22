"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { 
  FolderOpen, 
  File, 
  ChevronDown, 
  ChevronRight, 
  Search, 
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
  Video
} from 'lucide-react'
import { Course, Lesson } from '@/types/index'

interface IDESidebarProps {
  activeView: string
  course?: Course
  currentLesson?: Lesson
}

// Mock file system data - this could be enhanced to show course-specific files
const getFileSystem = (course?: Course, currentLesson?: Lesson) => ({
  name: course?.title || 'project',
  type: 'folder' as const,
  children: [
    {
      name: 'src',
      type: 'folder' as const,
      children: [
        {
          name: 'components',
          type: 'folder' as const,
          children: [
            { name: 'Button.tsx', type: 'file' as const, icon: FileCode },
            { name: 'Card.tsx', type: 'file' as const, icon: FileCode },
            { name: 'Input.tsx', type: 'file' as const, icon: FileCode },
          ],
        },
        { name: 'App.tsx', type: 'file' as const, icon: FileCode },
        { name: 'index.css', type: 'file' as const, icon: FileText },
        { name: 'main.tsx', type: 'file' as const, icon: FileCode },
      ],
    },
    { name: 'package.json', type: 'file' as const, icon: FileJson },
    { name: 'tsconfig.json', type: 'file' as const, icon: FileJson },
    { name: 'README.md', type: 'file' as const, icon: FileText },
    ...(currentLesson ? [{ 
      name: `${currentLesson.title}.md`, 
      type: 'file' as const, 
      icon: BookOpen 
    }] : []),
  ],
})

export function IDESidebar({ activeView, course, currentLesson }: IDESidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['project', 'src', 'components'])
  const [searchText, setSearchText] = useState('')
  
  const fileSystem = getFileSystem(course, currentLesson)
  
  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path) 
        : [...prev, path]
    )
  }
  
  const FileSystemItem = ({ item, path = '', level = 0 }: any) => {
    const fullPath = path ? `${path}/${item.name}` : item.name
    const isExpanded = expandedFolders.includes(fullPath)
    
    return (
      <div>
        <motion.div 
          className={`flex items-center h-6 text-sm rounded-sm px-2 hover:bg-accent group cursor-pointer`}
          whileHover={{ x: 2 }}
          transition={{ duration: 0.1 }}
          style={{ paddingLeft: `${level * 16 + 4}px` }}
        >
          {item.type === 'folder' ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 mr-1 rounded-sm hover:bg-accent/50"
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(fullPath)
              }}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </Button>
          ) : (
            <span className="w-5"></span>
          )}
          
          {item.type === 'folder' ? (
            <FolderOpen size={16} className="mr-1 text-amber-500" />
          ) : item.icon ? (
            <item.icon size={16} className="mr-1 text-blue-500" />
          ) : (
            <File size={16} className="mr-1 text-blue-500" />
          )}
          
          <span className="flex-1 truncate">{item.name}</span>
        </motion.div>
        
        {item.type === 'folder' && isExpanded && item.children && (
          <div>
            {item.children.map((child: any, index: number) => (
              <FileSystemItem key={index} item={child} path={fullPath} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }
  
  const renderExplorer = () => (
    <div className="h-full flex flex-col">
      <div className="p-2 text-sm font-medium flex items-center justify-between">
        <span>EXPLORER</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md">
            <Plus size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md">
            <RefreshCw size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md">
            <ChevronDown size={14} />
          </Button>
        </div>
      </div>
      
      <Accordion type="single" collapsible defaultValue="project">
        <AccordionItem value="project">
          <AccordionTrigger className="w-full">
            <div className="flex items-center justify-between p-1 px-2 hover:bg-accent rounded-sm">
              <span className="text-xs font-medium">
                {course ? course.title.toUpperCase() : 'PROJECT'}
              </span>
              <ChevronDown size={14} />
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-[calc(100vh-160px)]">
              <div className="p-1">
                <FileSystemItem item={fileSystem} />
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
  
  const renderSearch = () => (
    <div className="h-full flex flex-col">
      <div className="p-2 text-sm font-medium flex items-center justify-between">
        <span>SEARCH</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md">
            <RefreshCw size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md">
            <ChevronDown size={14} />
          </Button>
        </div>
      </div>
      
      <div className="p-2 space-y-2">
        <div className="flex items-center rounded-sm border bg-background">
          <Input 
            placeholder="Search in files"
            className="h-7 text-xs border-0 focus-visible:ring-0 px-2"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {searchText && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-none" 
              onClick={() => setSearchText('')}
            >
              <X size={14} />
            </Button>
          )}
        </div>
        
        <div className="flex flex-col text-xs space-y-1">
          <div className="flex items-center gap-1">
            <span className="font-medium">Match Case</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Match Whole Word</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Use Regular Expression</span>
          </div>
        </div>
      </div>
      
      <div className="p-2 text-sm text-muted-foreground italic">
        {searchText ? 'No results found' : 'Type to search'}
      </div>
    </div>
  )
  
  const renderSourceControl = () => (
    <div className="h-full flex flex-col">
      <div className="p-2 text-sm font-medium flex items-center justify-between">
        <span>SOURCE CONTROL</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md">
            <RefreshCw size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md">
            <ChevronDown size={14} />
          </Button>
        </div>
      </div>
      
      <div className="p-4 flex flex-col items-center justify-center text-center h-40 gap-2">
        <GitBranch size={24} className="text-muted-foreground" />
        <div className="text-sm text-muted-foreground">No changes detected</div>
        <div className="text-xs text-muted-foreground">Any changes to files will appear here</div>
      </div>
      
      <div className="mt-auto p-2 border-t">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <GitBranch size={14} />
            <span>main</span>
          </div>
          <div className="flex items-center gap-1">
            <GitCommit size={14} />
            <span>0 changes</span>
          </div>
        </div>
      </div>
    </div>
  )
  
  const renderRun = () => (
    <div className="h-full flex flex-col">
      <div className="p-2 text-sm font-medium flex items-center justify-between">
        <span>RUN AND DEBUG</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md">
            <Play size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md">
            <ChevronDown size={14} />
          </Button>
        </div>
      </div>
      
      <div className="p-4 flex flex-col items-center justify-center text-center h-40 gap-2">
        <Bug size={24} className="text-muted-foreground" />
        <div className="text-sm text-muted-foreground">No debug configurations</div>
        <Button variant="outline" className="text-xs h-7 mt-2">Create a launch.json file</Button>
      </div>
    </div>
  )
  
  const renderExtensions = () => (
    <div className="h-full flex flex-col">
      <div className="p-2 text-sm font-medium flex items-center justify-between">
        <span>EXTENSIONS</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md">
            <RefreshCw size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md">
            <ChevronDown size={14} />
          </Button>
        </div>
      </div>
      
      <div className="p-2">
        <Input 
          placeholder="Search Extensions"
          className="h-7 text-xs"
        />
      </div>
      
      <div className="p-2 space-y-4">
        <div>
          <h4 className="text-xs font-medium mb-2">INSTALLED</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-1 hover:bg-accent rounded-sm">
              <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                <FileCode size={16} />
              </div>
              <div>
                <div className="text-xs font-medium">TypeScript</div>
                <div className="text-xs text-muted-foreground">v2.0.1</div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-1 hover:bg-accent rounded-sm">
              <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                <PackageOpen size={16} />
              </div>
              <div>
                <div className="text-xs font-medium">ES7+ React Snippets</div>
                <div className="text-xs text-muted-foreground">v1.2.3</div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-xs font-medium mb-2">RECOMMENDED</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-1 hover:bg-accent rounded-sm">
              <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                <FileCode size={16} />
              </div>
              <div>
                <div className="text-xs font-medium">ESLint</div>
                <div className="text-xs text-muted-foreground">JavaScript linting</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  
  return (
    <div className="h-full bg-background border-r">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {activeView === 'explorer' && renderExplorer()}
          {activeView === 'search' && renderSearch()}
          {activeView === 'source-control' && renderSourceControl()}
          {activeView === 'run' && renderRun()}
          {activeView === 'extensions' && renderExtensions()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}