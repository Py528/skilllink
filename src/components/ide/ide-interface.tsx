"use client"

import { useState } from 'react'
import './ide.css'
import { motion, AnimatePresence } from 'framer-motion'
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
  
  return (
    <div className="h-full flex flex-col bg-[var(--vscode-editor-background)]">
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
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
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
        <div className="flex-1 flex">
          {/* Sidebar */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ width: 320 }}
                animate={{ width: 320 }}
                exit={{ width: 0 }}
                className="border-r border-[var(--vscode-sideBar-border)]"
              >
                <IDESidebar activeView={activeView} course={course} currentLesson={currentLesson} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Editor and Terminal */}
          <div className="flex-1 flex flex-col">
            {/* Editor */}
            <div className="flex-1 border-b border-[var(--vscode-panel-border)]">
              <IDEEditor course={course} currentLesson={currentLesson} />
            </div>

            {/* Terminal */}
            {showTerminal && (
              <div className="h-48">
                <IDETerminal setShowTerminal={setShowTerminal} course={course} currentLesson={currentLesson} />
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
      />
    </div>
  )
}