"use client"

import { useState, useEffect, useRef } from 'react'
import './ide.css'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, Folder, Terminal, Monitor, ChevronUp, ChevronDown, Square, Maximize2 } from 'lucide-react'
import { IDEActivityBar } from '@/components/ide/ide-activity-bar'
import { IDESidebar } from '@/components/ide/ide-sidebar'
import { IDEEditor } from '@/components/ide/ide-editor'
import { IDEStatusBar } from '@/components/ide/ide-status-bar'
import { IDETerminal } from '@/components/ide/ide-terminal'
import { Course, Lesson } from '@/types/index'

interface IDEInterfaceProps {
  course?: Course
  currentLesson?: Lesson
}

export function IDEInterface({ course, currentLesson }: IDEInterfaceProps) {
  const [activeView, setActiveView] = useState('explorer')
  const [showTerminal, setShowTerminal] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [terminalHeight, setTerminalHeight] = useState(200)
  const [showSidebar, setShowSidebar] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Debug logging
  useEffect(() => {
    console.log('IDE Interface mounted with:', { course: course?.title, lesson: currentLesson?.title })
    
    // Test IDE functionality
    const testIDE = () => {
      console.log('IDE Test Results:')
      console.log('- Sidebar visible:', showSidebar)
      console.log('- Terminal visible:', showTerminal)
      console.log('- Active view:', activeView)
      console.log('- Sidebar width:', sidebarWidth)
      console.log('- Terminal height:', terminalHeight)
    }
    
    // Run test after a short delay
    const timer = setTimeout(testIDE, 1000)
    return () => clearTimeout(timer)
  }, [course, currentLesson, showSidebar, showTerminal, activeView, sidebarWidth, terminalHeight])
  
  const sidebarResizeRef = useRef(false)
  const terminalResizeRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load saved preferences
  useEffect(() => {
    const savedSidebarWidth = localStorage.getItem('ide-sidebar-width')
    const savedTerminalHeight = localStorage.getItem('ide-terminal-height')
    const savedShowSidebar = localStorage.getItem('ide-show-sidebar')
    const savedShowTerminal = localStorage.getItem('ide-show-terminal')
    
    if (savedSidebarWidth) setSidebarWidth(Number(savedSidebarWidth))
    if (savedTerminalHeight) setTerminalHeight(Number(savedTerminalHeight))
    if (savedShowSidebar) setShowSidebar(savedShowSidebar === 'true')
    if (savedShowTerminal) setShowTerminal(savedShowTerminal === 'true')
  }, [])

  // Save preferences
  useEffect(() => {
    localStorage.setItem('ide-sidebar-width', String(sidebarWidth))
  }, [sidebarWidth])

  useEffect(() => {
    localStorage.setItem('ide-terminal-height', String(terminalHeight))
  }, [terminalHeight])

  useEffect(() => {
    localStorage.setItem('ide-show-sidebar', String(showSidebar))
  }, [showSidebar])

  useEffect(() => {
    localStorage.setItem('ide-show-terminal', String(showTerminal))
  }, [showTerminal])

  // Sidebar resize handlers
  const onSidebarMouseDown = () => {
    sidebarResizeRef.current = true
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
  }

  const onTerminalMouseDown = () => {
    terminalResizeRef.current = true
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'row-resize'
  }

  const onMouseUp = () => {
    sidebarResizeRef.current = false
    terminalResizeRef.current = false
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }

  const onMouseMove = (e: MouseEvent) => {
    if (sidebarResizeRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const newWidth = e.clientX - rect.left - 48 // Account for activity bar
      const minWidth = 200
      const maxWidth = Math.min(600, rect.width * 0.6)
      setSidebarWidth(Math.min(Math.max(newWidth, minWidth), maxWidth))
    }
    
    if (terminalResizeRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const newHeight = rect.height - e.clientY + rect.top - 32 // Account for status bar
      const minHeight = 100
      const maxHeight = rect.height * 0.7
      setTerminalHeight(Math.min(Math.max(newHeight, minHeight), maxHeight))
    }
  }

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault()
            setShowSidebar(!showSidebar)
            break
          case '`':
            e.preventDefault()
            setShowTerminal(!showTerminal)
            break
          case 'j':
            e.preventDefault()
            setIsMinimized(!isMinimized)
            break
          case 'f11':
            e.preventDefault()
            setIsFullscreen(!isFullscreen)
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSidebar, showTerminal, isMinimized, isFullscreen])
  
  return (
    <div 
      ref={containerRef}
      className={`h-full flex flex-col bg-[var(--vscode-editor-background)] ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
    >
      {/* Title Bar */}
      <div className="h-8 bg-[var(--vscode-titleBar-activeBackground)] border-b border-[var(--vscode-titleBar-border)] flex items-center px-2">
        <div className="flex-1 flex items-center gap-2 text-xs text-[var(--vscode-titleBar-activeForeground)]">
          <span>Course Learning Interface</span>
          {course && (
            <>
              <span>-</span>
              <span>{course.title}</span>
            </>
          )}
          {currentLesson && (
            <>
              <span>-</span>
              <span>{currentLesson.title}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-1 hover:bg-[var(--vscode-toolbar-hoverBackground)] rounded text-xs"
            title="Toggle Sidebar (Ctrl+B)"
          >
            {showSidebar ? <FolderOpen size={14} /> : <Folder size={14} />}
          </button>
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className="p-1 hover:bg-[var(--vscode-toolbar-hoverBackground)] rounded text-xs"
            title="Toggle Terminal (Ctrl+`)"
          >
            {showTerminal ? <Terminal size={14} /> : <Monitor size={14} />}
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-[var(--vscode-toolbar-hoverBackground)] rounded text-xs"
            title="Minimize (Ctrl+J)"
          >
            {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 hover:bg-[var(--vscode-toolbar-hoverBackground)] rounded text-xs"
            title="Fullscreen (F11)"
          >
            {isFullscreen ? <Square size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Activity Bar */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ width: 48 }}
              animate={{ width: 48 }}
              exit={{ width: 0 }}
              className="border-r border-[var(--vscode-activityBar-border)]"
            >
              <IDEActivityBar activeView={activeView} setActiveView={setActiveView} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar and Editor */}
        <div className="flex-1 flex min-h-0">
          {/* Sidebar */}
          <AnimatePresence>
            {!isMinimized && showSidebar && (
              <motion.div
                initial={{ width: sidebarWidth }}
                animate={{ width: sidebarWidth }}
                exit={{ width: 0 }}
                className="border-r border-[var(--vscode-sideBar-border)] relative"
                style={{ width: sidebarWidth }}
              >
                <IDESidebar activeView={activeView} course={course} currentLesson={currentLesson} />
                
                {/* Sidebar Resize Handle */}
                <div
                  onMouseDown={onSidebarMouseDown}
                  className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--vscode-focusBorder)] opacity-0 hover:opacity-100 transition-opacity"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Editor and Terminal */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Editor */}
            <div className="flex-1 border-b border-[var(--vscode-panel-border)] min-h-0 overflow-hidden">
              <IDEEditor course={course} currentLesson={currentLesson} />
            </div>

            {/* Terminal */}
            {showTerminal && (
              <div 
                className="border-t border-[var(--vscode-panel-border)] relative"
                style={{ height: terminalHeight }}
              >
                <IDETerminal setShowTerminal={setShowTerminal} course={course} currentLesson={currentLesson} />
                
                {/* Terminal Resize Handle */}
                <div
                  onMouseDown={onTerminalMouseDown}
                  className="absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-[var(--vscode-focusBorder)] opacity-0 hover:opacity-100 transition-opacity"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <IDEStatusBar 
        setShowTerminal={setShowTerminal} 
        showTerminal={showTerminal}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
      />
    </div>
  )
}