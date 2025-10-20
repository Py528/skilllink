"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Download, ExternalLink } from 'lucide-react'
import MonacoEditor from 'react-monaco-editor'
import { Course, Lesson } from '@/types/index'

interface IDEEditorProps {
  course?: Course
  currentLesson?: Lesson
}

// Generate files based on course and lesson data
const getFiles = (course?: Course, currentLesson?: Lesson) => {
  const files = [];

  // Add course overview file
  if (course) {
    files.push({
      id: 'course-overview',
      name: 'course-overview.md',
      language: 'markdown',
      content: `# ${course.title}

## Course Overview

**Instructor:** ${course.instructor_name || 'Unknown Instructor'}
**Duration:** ${course.duration || 'Not specified'}
**Level:** ${course.level || 'Beginner'}
**Category:** ${course.category || 'Uncategorized'}

## Description

${course.description || 'No description available'}

## Course Statistics

- **Total Lessons:** ${course.total_lessons || 0}
- **Student Count:** ${course.student_count || 0}
- **Rating:** ${course.rating || 0}/5
- **Price:** ${course.price === 0 ? 'Free' : `$${course.price}`}

## Learning Objectives

1. Master the core concepts
2. Apply knowledge through practical exercises
3. Complete hands-on projects
4. Build a portfolio of work

## Prerequisites

- Basic understanding of the subject
- Willingness to learn and practice
- Access to required tools and resources

## Course Structure

This course is organized into modules, each containing multiple lessons designed to build upon previous knowledge and prepare you for the next level of learning.

---

*Last updated: ${course.updated_at ? new Date(course.updated_at).toLocaleDateString() : 'Unknown'}*
`
    });
  }

  // Add lesson content file
  if (currentLesson) {
    files.push({
      id: 'lesson-content',
      name: `${currentLesson.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`,
      language: 'markdown',
      content: `# ${currentLesson.title}

## Lesson Overview

**Duration:** ${currentLesson.duration ? `${Math.floor(currentLesson.duration / 60)}:${(currentLesson.duration % 60).toString().padStart(2, '0')}` : 'Not specified'}
**Type:** ${currentLesson.content?.type || 'Video Lesson'}
**Order:** ${currentLesson.order_index || 1}

## Description

${currentLesson.description || 'No description available'}

## Video Content

${currentLesson.video_url ? `**Video URL:** ${currentLesson.video_url}` : 'No video available for this lesson'}

## Resources

${currentLesson.resources && currentLesson.resources.length > 0 
  ? currentLesson.resources.map((resource, index) => 
      `${index + 1}. **${resource.name}** (${resource.size ? `${Math.floor(resource.size / 1024)}KB` : 'Unknown size'})
         - Type: ${resource.type || 'Unknown'}
         - URL: ${resource.url || 'Not available'}`
    ).join('\n\n')
  : 'No additional resources available for this lesson'
}

## Key Points

- This lesson covers important concepts
- Follow along with the video content
- Complete any provided exercises
- Review the resources for additional learning

## Next Steps

1. Watch the video content
2. Review the provided resources
3. Complete any assignments
4. Move to the next lesson when ready

---

*Lesson ID: ${currentLesson.id}*
`
    });
  }

  return files;
};

export function IDEEditor({ course, currentLesson }: IDEEditorProps) {
  const [activeTab, setActiveTab] = useState('course-overview')
  const [openTabs, setOpenTabs] = useState(['course-overview'])
  const [mounted, setMounted] = useState(false)
  const editorRef = useRef<any>(null)
  
  const files = getFiles(course, currentLesson)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const getFileById = (id: string) => {
    return files.find(file => file.id === id)
  }
  
  const closeTab = (id: string) => {
    const newTabs = openTabs.filter(tabId => tabId !== id)
    setOpenTabs(newTabs)
    if (activeTab === id && newTabs.length > 0) {
      setActiveTab(newTabs[newTabs.length - 1])
    }
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.includes('.md')) return '📝'
    if (fileName.includes('.json')) return '🔧'
    if (fileName.includes('.js')) return '📄'
    if (fileName.includes('.ts')) return '📄'
    return '📄'
  }

  const currentFile = getFileById(activeTab)

  if (!mounted) return null

  return (
    <div className="h-full flex flex-col bg-[var(--vscode-editor-background)]">
      {/* Tab Bar */}
      <div className="flex items-center bg-[var(--vscode-tab-activeBackground)] border-b border-[var(--vscode-tab-border)]">
        <div className="flex overflow-x-auto">
          {openTabs.map(tabId => {
            const file = getFileById(tabId)
            if (!file) return null
            
            return (
              <motion.div
                key={tabId}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-r border-[var(--vscode-tab-border)] min-w-0 ${
                  activeTab === tabId 
                    ? 'bg-[var(--vscode-tab-activeBackground)] text-[var(--vscode-tab-activeForeground)]' 
                    : 'bg-[var(--vscode-tab-inactiveBackground)] text-[var(--vscode-tab-inactiveForeground)] hover:bg-[var(--vscode-tab-hoverBackground)]'
                }`}
                onClick={() => setActiveTab(tabId)}
                whileHover={{ backgroundColor: 'var(--vscode-tab-hoverBackground)' }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-sm">{getFileIcon(file.name)}</span>
                <span className="text-xs truncate max-w-[120px]">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tabId)
                  }}
                  className="ml-2 hover:bg-[var(--vscode-tab-hoverBackground)] rounded p-1"
                >
                  <X size={12} />
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentFile && (
            <motion.div
              key={activeTab}
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between px-4 py-2 bg-[var(--vscode-editor-background)] border-b border-[var(--vscode-panel-border)]">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{getFileIcon(currentFile.name)}</span>
                  <span className="text-sm font-medium">{currentFile.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--vscode-descriptionForeground)]">
                  <span>{currentFile.content.split('\n').length} lines</span>
                  <span>{currentFile.language}</span>
                </div>
              </div>
              
              <div className="h-full">
                <MonacoEditor
                  ref={editorRef}
                  height="100%"
                  language={currentFile.language}
                  value={currentFile.content}
                  theme="vs-dark"
                  options={{
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    automaticLayout: true,
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    lineHeight: 22,
                    fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
                    wordWrap: 'on',
                    renderWhitespace: 'selection',
                    renderControlCharacters: true,
                    bracketPairColorization: { enabled: true },
                    guides: {
                      bracketPairs: true,
                      indentation: true
                    }
                  }}
                  onChange={(value) => {
                    // Handle content changes
                    console.log('Content changed:', value)
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}