"use client"

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Maximize2, Minimize2 } from 'lucide-react'
import { Course, Lesson } from '@/types/index'

interface IDETerminalProps {
  setShowTerminal: (show: boolean) => void
  course?: Course
  currentLesson?: Lesson
}

export function IDETerminal({ setShowTerminal, course, currentLesson }: IDETerminalProps) {
  const [command, setCommand] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [output, setOutput] = useState<string[]>([
    '🚀 Initializing IDE Terminal...',
    '📡 Checking connections...',
    '✅ Supabase: Connected',
    '✅ S3 Storage: Connected', 
    '✅ Git: Not connected (use "git connect" to connect)',
    '> node --version',
    'v18.15.0',
    '> npm --version',
    '9.6.4',
    course ? `> echo "Welcome to ${course.title}"` : '> echo "Welcome to the course"',
    course ? `Welcome to ${course.title}` : 'Welcome to the course',
    currentLesson ? `> echo "Current lesson: ${currentLesson.title}"` : '> echo "No lesson selected"',
    currentLesson ? `Current lesson: ${currentLesson.title}` : 'No lesson selected',
    '',
    '💡 Available commands: help, clear, course, lesson, git connect, exit',
    '> ',
  ])
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [output])
  
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (command.trim()) {
      setCommandHistory(prev => [...prev, command])
      
      let response: string[] = []
      
      if (command === 'clear') {
        setOutput([])
      } else if (command === 'help') {
        response = [
          'Available commands:',
          '  help - Show this help menu',
          '  clear - Clear the terminal',
          '  ls - List files',
          '  cd - Change directory',
          '  course - Show course information',
          '  lesson - Show current lesson information',
          '  git connect - Connect to Git repository',
          '  status - Show connection status',
          '  exit - Close terminal',
        ]
      } else if (command === 'ls') {
        response = [
          'node_modules/',
          'public/',
          'src/',
          'package.json',
          'tsconfig.json',
          'README.md',
          ...(currentLesson ? [`${currentLesson.title}.md`] : []),
        ]
      } else if (command === 'course') {
        if (course) {
          response = [
            `Course: ${course.title}`,
            `Description: ${course.description || 'No description available'}`,
            `Instructor: ${course.instructor_name || 'Unknown'}`,
            `Level: ${course.level || 'Not specified'}`,
            `Duration: ${course.duration || 'Not specified'}`,
            `Students: ${course.student_count || 0}`,
          ]
        } else {
          response = ['No course information available']
        }
      } else if (command === 'lesson') {
        if (currentLesson) {
          response = [
            `Lesson: ${currentLesson.title}`,
            `Description: ${currentLesson.description}`,
            `Duration: ${Math.floor(currentLesson.duration / 60)}:${(currentLesson.duration % 60).toString().padStart(2, '0')}`,
            `Order: ${currentLesson.order_index}`,
            `Preview: ${currentLesson.is_preview ? 'Yes' : 'No'}`,
          ]
        } else {
          response = ['No lesson selected']
        }
      } else if (command === 'git connect') {
        response = [
          '🔗 Connecting to Git repository...',
          'Please choose connection method:',
          '  1. GitHub OAuth',
          '  2. GitLab OAuth', 
          '  3. Remote URL',
          '',
          'Opening Git connection dialog...',
          '✅ Git connection initiated'
        ]
      } else if (command === 'status') {
        response = [
          '📊 IDE Status:',
          '  ✅ Supabase: Connected',
          '  ✅ S3 Storage: Connected',
          '  ❌ Git: Not connected',
          '  📁 Course: ' + (course ? course.title : 'None selected'),
          '  📚 Lesson: ' + (currentLesson ? currentLesson.title : 'None selected'),
          '  💾 Auto-save: Enabled',
          '  🔄 Sync: Active'
        ]
      } else if (command === 'exit') {
        setShowTerminal(false)
      } else {
        response = [`Command not found: ${command}`]
      }
      
      setOutput(prev => [...prev, `> ${command}`, ...response, '> '])
      setCommand('')
    }
  }
  
  return (
    <div className="h-full flex flex-col bg-[var(--vscode-panel-background)] border-t border-[var(--vscode-panel-border)]">
      <div className="flex items-center justify-between bg-[var(--vscode-panelTitle-background)] border-b border-[var(--vscode-panel-border)] px-3 h-9">
        <div className="flex items-center">
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 text-xs bg-[var(--vscode-tab-activeBackground)] text-[var(--vscode-tab-activeForeground)] rounded-t">
              TERMINAL
            </button>
            <button className="px-2 py-1 text-xs text-[var(--vscode-tab-inactiveForeground)] hover:text-[var(--vscode-tab-activeForeground)] hover:bg-[var(--vscode-tab-hoverBackground)] rounded-t">
              PROBLEMS
            </button>
            <button className="px-2 py-1 text-xs text-[var(--vscode-tab-inactiveForeground)] hover:text-[var(--vscode-tab-activeForeground)] hover:bg-[var(--vscode-tab-hoverBackground)] rounded-t">
              OUTPUT
            </button>
          </div>
        </div>
        
        <div className="flex items-center">
          <button className="h-6 w-6 hover:bg-[var(--vscode-toolbar-hoverBackground)] rounded flex items-center justify-center">
            <Plus size={14} />
          </button>
          <button className="h-6 w-6 hover:bg-[var(--vscode-toolbar-hoverBackground)] rounded flex items-center justify-center">
            <Maximize2 size={14} />
          </button>
          <button 
            className="h-6 w-6 hover:bg-[var(--vscode-toolbar-hoverBackground)] rounded flex items-center justify-center" 
            onClick={() => setShowTerminal(false)}
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      <div 
        className="flex-1 p-2 font-mono text-sm bg-[var(--vscode-terminal-background)] text-[var(--vscode-terminal-foreground)] overflow-auto"
        ref={scrollAreaRef}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {output.map((line, index) => (
            <div key={index} className="whitespace-pre text-[var(--vscode-terminal-foreground)]">
              {line}
              {line === '> ' && index === output.length - 1 && (
                <form onSubmit={handleCommandSubmit} className="inline">
                  <input
                    type="text"
                    ref={inputRef}
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    className="bg-transparent border-none outline-none focus:ring-0 p-0 w-full text-[var(--vscode-terminal-foreground)]"
                    autoFocus
                  />
                </form>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}