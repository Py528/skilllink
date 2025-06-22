"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CourseContent } from '@/components/courses/course-content'
import { IDEInterface } from '@/components/ide/ide-interface'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '@/components/theme-toggle'
import { toast } from 'sonner'
import { Course, Lesson } from '@/types/index'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
}

interface CourseInterfaceLayoutProps {
  course: Course
  currentLesson?: Lesson
  lessons?: Lesson[]
  progress?: number
}

export function CourseInterfaceLayout({ course, currentLesson, lessons = [], progress = 0 }: CourseInterfaceLayoutProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { theme } = useTheme()
  
  useEffect(() => {
    setIsMounted(true)
    
    // Show welcome toast with animation
    setTimeout(() => {
      toast("Welcome to the course learning interface", {
        description: "Explore the VS Code-like environment to enhance your learning experience",
        duration: 5000,
      })
    }, 800)
  }, [])

  // Don't render until client-side to avoid hydration issues
  if (!isMounted) return null

  return (
    <motion.div 
      className="h-screen w-full overflow-hidden bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="absolute top-4 right-4 z-50"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <ThemeToggle />
      </motion.div>
      
      <div className="flex h-full w-full">
        <motion.div
          variants={slideIn}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, delay: 0.2 }}
          className="w-1/2 transition-all duration-200 ease-in-out"
        >
          <CourseContent 
            course={course} 
            currentLesson={currentLesson} 
            lessons={lessons} 
            progress={progress} 
          />
        </motion.div>
        
        <div className="w-px bg-border transition-colors duration-200 ease-in-out hover:bg-primary" />
        
        <motion.div
          variants={slideIn}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, delay: 0.4 }}
          className="w-1/2"
        >
          <IDEInterface course={course} currentLesson={currentLesson} />
        </motion.div>
      </div>
    </motion.div>
  )
}