"use client"

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    '> node --version',
    'v18.15.0',
    '> npm --version',
    '9.6.4',
    course ? `> echo "Welcome to ${course.title}"` : '> echo "Welcome to the course"',
    course ? `Welcome to ${course.title}` : 'Welcome to the course',
    currentLesson ? `> echo "Current lesson: ${currentLesson.title}"` : '> echo "No lesson selected"',
    currentLesson ? `Current lesson: ${currentLesson.title}` : 'No lesson selected',
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
    <div className="h-full flex flex-col bg-background border-t">
      <div className="flex items-center justify-between bg-card border-b px-3 h-9">
        <div className="flex items-center">
          <Tabs defaultValue="terminal">
            <TabsList className="h-7">
              <TabsTrigger value="terminal" className="text-xs h-6">TERMINAL</TabsTrigger>
              <TabsTrigger value="problems" className="text-xs h-6">PROBLEMS</TabsTrigger>
              <TabsTrigger value="output" className="text-xs h-6">OUTPUT</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Maximize2 size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={() => setShowTerminal(false)}
          >
            <X size={14} />
          </Button>
        </div>
      </div>
      
      <ScrollArea 
        className="flex-1 p-2 font-mono text-sm bg-background"
        ref={scrollAreaRef}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {output.map((line, index) => (
            <div key={index} className="whitespace-pre">
              {line}
              {line === '> ' && index === output.length - 1 && (
                <form onSubmit={handleCommandSubmit} className="inline">
                  <input
                    type="text"
                    ref={inputRef}
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    className="bg-transparent border-none outline-none focus:ring-0 p-0 w-full"
                    autoFocus
                  />
                </form>
              )}
            </div>
          ))}
        </motion.div>
      </ScrollArea>
    </div>
  )
}