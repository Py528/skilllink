"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X, Braces, BookOpen, Video } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Course, Lesson } from '@/types/index'

interface IDEEditorProps {
  course?: Course
  currentLesson?: Lesson
}

// Mock file data - this could be enhanced to show course-specific files
const getFiles = (course?: Course, currentLesson?: Lesson) => [
  {
    id: 'app-tsx',
    name: 'App.tsx',
    language: 'typescript',
    content: `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="container">
      <h1>${course?.title || 'Advanced React Patterns'}</h1>
      
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      
      {/* Add your component here */}
      <div className="card">
        <p>Implement compound component pattern here</p>
      </div>
    </div>
  )
}

export default App`,
  },
  {
    id: 'compound-tsx',
    name: 'CompoundComponent.tsx',
    language: 'typescript',
    content: `import React, { createContext, useState, useContext } from 'react'

// Step 1: Create a context
const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (id: string) => void;
} | undefined>(undefined)

// Step 2: Create the parent component
export function Tabs({ children, defaultTab }: { 
  children: React.ReactNode; 
  defaultTab: string;
}) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs-container">
        {children}
      </div>
    </TabsContext.Provider>
  )
}

// Step 3: Create the TabList component
Tabs.List = function TabList({ children }: { children: React.ReactNode }) {
  return (
    <div className="tabs-list">
      {children}
    </div>
  )
}

// Step 4: Create the Tab component
Tabs.Tab = function Tab({ 
  children, 
  id 
}: { 
  children: React.ReactNode;
  id: string;
}) {
  const context = useContext(TabsContext)
  
  if (!context) {
    throw new Error('Tab must be used within a Tabs component')
  }
  
  const { activeTab, setActiveTab } = context
  const isActive = activeTab === id
  
  return (
    <button
      className={\`tab \${isActive ? 'active' : ''}\`}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  )
}

// Step 5: Create the TabPanel component
Tabs.Panel = function TabPanel({ 
  children, 
  id 
}: { 
  children: React.ReactNode;
  id: string;
}) {
  const context = useContext(TabsContext)
  
  if (!context) {
    throw new Error('TabPanel must be used within a Tabs component')
  }
  
  const { activeTab } = context
  
  if (activeTab !== id) {
    return null
  }
  
  return (
    <div className="tab-panel">
      {children}
    </div>
  )
}`,
  },
  ...(currentLesson ? [{
    id: 'lesson-content',
    name: `${currentLesson.title}.md`,
    language: 'markdown',
    content: `# ${currentLesson.title}

${currentLesson.description}

## Key Points

- This lesson covers important concepts
- Follow along with the video
- Complete the exercises

## Code Example

\`\`\`typescript
// Example code from the lesson
function example() {
  return "Hello World"
}
\`\`\`

## Next Steps

1. Watch the video
2. Read the documentation
3. Practice the concepts
4. Complete the assignment
`,
  }] : []),
]

export function IDEEditor({ course, currentLesson }: IDEEditorProps) {
  const [activeTab, setActiveTab] = useState('compound-tsx')
  const [openTabs, setOpenTabs] = useState(['app-tsx', 'compound-tsx'])
  const [mounted, setMounted] = useState(false)
  
  const files = getFiles(course, currentLesson)
  
  useEffect(() => {
    setMounted(true)
    // Add lesson content tab if available
    if (currentLesson && !openTabs.includes('lesson-content')) {
      setOpenTabs(prev => [...prev, 'lesson-content'])
      setActiveTab('lesson-content')
    }
  }, [currentLesson])

  const getFileById = (id: string) => {
    return files.find(file => file.id === id)
  }
  
  const closeTab = (id: string) => {
    const newOpenTabs = openTabs.filter(tabId => tabId !== id)
    setOpenTabs(newOpenTabs)
    
    if (activeTab === id && newOpenTabs.length > 0) {
      setActiveTab(newOpenTabs[0])
    }
  }
  
  const getLineNumbers = (content: string) => {
    const lines = content.split('\n')
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-right pr-2 text-muted-foreground select-none"
      >
        {lines.map((_, i) => (
          <div key={i} className="text-xs leading-5">
            {i + 1}
          </div>
        ))}
      </motion.div>
    )
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.ts')) {
      return <Braces size={14} className="mr-1 text-blue-500" />
    } else if (fileName.endsWith('.md')) {
      return <BookOpen size={14} className="mr-1 text-green-500" />
    } else if (fileName.endsWith('.mp4') || fileName.endsWith('.mov')) {
      return <Video size={14} className="mr-1 text-purple-500" />
    }
    return <Braces size={14} className="mr-1 text-blue-500" />
  }

  if (!mounted) return null
  
  return (
    <div className="h-full flex flex-col">
      <motion.div 
        className="flex bg-card border-b overflow-x-auto"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence>
          {openTabs.map(tabId => {
            const file = getFileById(tabId)
            if (!file) return null
            
            return (
              <motion.div
                key={tabId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center h-9 px-3 border-r cursor-pointer group ${
                  activeTab === tabId
                    ? 'bg-background text-foreground'
                    : 'text-muted-foreground hover:bg-background/50'
                }`}
                onClick={() => setActiveTab(tabId)}
              >
                <motion.div
                  whileHover={{ rotate: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {getFileIcon(file.name)}
                </motion.div>
                <span className="text-xs">{file.name}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="ml-2 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tabId)
                  }}
                >
                  <X size={14} />
                </motion.button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
      
      <ScrollArea className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            {openTabs.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center text-muted-foreground"
              >
                <p>No files open</p>
              </motion.div>
            ) : (
              <div className="font-mono text-sm">
                {activeTab && (
                  <div className="flex">
                    {getLineNumbers(getFileById(activeTab)?.content || '')}
                    <div className="flex-1 overflow-auto">
                      <SyntaxHighlighter
                        language={getFileById(activeTab)?.language || 'typescript'}
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          padding: 0,
                          background: 'transparent',
                        }}
                        showLineNumbers={false}
                        wrapLines={true}
                        lineProps={{
                          style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' }
                        }}
                      >
                        {getFileById(activeTab)?.content || ''}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>
    </div>
  )
}