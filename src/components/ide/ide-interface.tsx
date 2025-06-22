"use client"

import { useState, useEffect } from 'react'
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
  const [sidebarWidth, setSidebarWidth] = useState(300)
  const [terminalHeight, setTerminalHeight] = useState(200)
  const [isMinimized, setIsMinimized] = useState(false)
  
  return (
    <div className="h-full flex flex-col bg-[var(--vscode-editor-background)]">
      <div className="vscode-title-bar flex items-center px-2">
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
      
      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ width: 48 }}
              animate={{ width: 48 }}
              exit={{ width: 0 }}
              className="vscode-activity-bar"
            >
              <IDEActivityBar activeView={activeView} setActiveView={setActiveView} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex">
          <AnimatePresence>
            {!isMinimized && (
              <div className="w-80 vscode-sidebar">
                <IDESidebar activeView={activeView} course={course} currentLesson={currentLesson} />
              </div>
            )}
          </AnimatePresence>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 vscode-editor">
              <IDEEditor course={course} currentLesson={currentLesson} />
            </div>

            {showTerminal && (
              <div className="h-48 vscode-panel">
                <IDETerminal setShowTerminal={setShowTerminal} course={course} currentLesson={currentLesson} />
              </div>
            )}
          </div>
        </div>
      </div>

      <IDEStatusBar 
        setShowTerminal={setShowTerminal} 
        showTerminal={showTerminal}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
      />
    </div>
  )
}