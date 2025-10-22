"use client"

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CourseContent } from '@/components/courses/course-content'
import { IDEInterface } from '@/components/ide/ide-interface'
import { enhancedToast } from '@/components/ui/enhanced-toast'
import { Course, Lesson } from '@/types/index'
import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'

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
  onLessonChange?: (lessonId: string) => void
  isSwitchingLesson?: boolean
}

export function CourseInterfaceLayout({ course, currentLesson, lessons = [], progress = 0, onLessonChange, isSwitchingLesson = false }: CourseInterfaceLayoutProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [leftWidthPct, setLeftWidthPct] = useState<number>(50)
  const isDraggingRef = useRef(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const rafIdRef = useRef<number | null>(null)
  const pendingPctRef = useRef<number | null>(null)

  // load persisted split
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('courseIdeSplitPct') : null
    if (saved) {
      const n = Number(saved)
      if (!Number.isNaN(n) && n >= 20 && n <= 80) setLeftWidthPct(n)
    }
  }, [])
  
  useEffect(() => {
    setIsMounted(true)
    
    // Show welcome toast with animation
    setTimeout(() => {
      enhancedToast.success("Welcome to the course learning interface", {
        description: "Explore the VS Code-like environment to enhance your learning experience. Click lessons in the navigation to switch between them!",
        duration: 5000,
        action: {
          label: "View Shortcuts",
          onClick: () => {
            enhancedToast.info("Keyboard Shortcuts", {
              description: "Space: Play/Pause, Arrow Keys: Skip/Volume, M: Mute, F: Fullscreen, Click lessons to switch",
              duration: 4000,
            });
          },
        },
      })
    }, 800)
  }, [])

  // persist split
  useEffect(() => {
    if (!isMounted) return
    window.localStorage.setItem('courseIdeSplitPct', String(leftWidthPct))
  }, [leftWidthPct, isMounted])

  const onMouseDown = () => {
    isDraggingRef.current = true
    setIsDragging(true)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
  }

  const onMouseUp = () => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    setIsDragging(false)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    pendingPctRef.current = null
  }

  const computePctFromClientX = (clientX: number) => {
    if (!containerRef.current) return leftWidthPct
    const rect = containerRef.current.getBoundingClientRect()
    const minPct = 20
    const maxPct = 80
    const relativeX = clientX - rect.left
    const pct = (relativeX / rect.width) * 100
    return Math.min(Math.max(pct, minPct), maxPct)
  }

  const flushRaf = () => {
    if (pendingPctRef.current === null) return
    setLeftWidthPct(pendingPctRef.current)
    pendingPctRef.current = null
    rafIdRef.current = null
  }

  const scheduleUpdate = (pct: number) => {
    pendingPctRef.current = pct
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(flushRaf)
    }
  }

  const onMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return
    const clamped = computePctFromClientX(e.clientX)
    scheduleUpdate(clamped)
  }

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  // Touch support
  const onTouchStart = () => {
    isDraggingRef.current = true
    setIsDragging(true)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
  }

  const onTouchMove = (e: TouchEvent) => {
    if (!isDraggingRef.current) return
    const touch = e.touches[0]
    if (!touch) return
    const clamped = computePctFromClientX(touch.clientX)
    scheduleUpdate(clamped)
  }

  const onTouchEnd = () => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    setIsDragging(false)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    pendingPctRef.current = null
  }

  useEffect(() => {
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchEnd)
    return () => {
      window.removeEventListener('touchmove', onTouchMove as unknown as EventListener)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [])

  const onKeyDownHandle = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 5 : 2
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setLeftWidthPct(v => Math.max(20, v - step))
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setLeftWidthPct(v => Math.min(80, v + step))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setLeftWidthPct(20)
    } else if (e.key === 'End') {
      e.preventDefault()
      setLeftWidthPct(80)
    }
  }

  const onDoubleClick = () => setLeftWidthPct(50)

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
        className="absolute top-4 right-4 z-50 flex items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            enhancedToast.info("Course Interface Help", {
              description: "• Use keyboard shortcuts for video control\n• Click lessons in the navigation to switch\n• Explore resources and transcripts\n• Use the IDE for hands-on practice",
              duration: 6000,
            });
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="w-4 h-4" />
        </Button>
      </motion.div>
      
      <div ref={containerRef} className="flex h-full w-full">
        {isDragging && (
          <div className="absolute inset-0 z-40" style={{ cursor: 'col-resize' }} />
        )}
        <motion.div
          variants={slideIn}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`${isDragging ? '' : 'transition-all duration-200 ease-in-out'} ${isSwitchingLesson ? 'opacity-75' : 'opacity-100'}`}
          style={{ width: `${leftWidthPct}%` }}
        >
          <CourseContent 
            course={course} 
            currentLesson={currentLesson} 
            lessons={lessons} 
            progress={progress}
            onLessonChange={onLessonChange}
            isSwitchingLesson={isSwitchingLesson}
          />
        </motion.div>
        
        {/* Drag Handle */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panels"
          aria-valuemin={20}
          aria-valuemax={80}
          aria-valuenow={Math.round(leftWidthPct)}
          tabIndex={0}
          onKeyDown={onKeyDownHandle}
          onDoubleClick={onDoubleClick}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          className="relative group cursor-col-resize select-none z-50"
          style={{ width: 6 }}
        >
          <div className="absolute inset-0 bg-border group-hover:bg-primary/70 transition-colors" />
          <div className="absolute inset-y-0 -left-2 -right-2" />
        </div>
        
        <motion.div
          variants={slideIn}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, delay: 0.4 }}
          className={`transition-opacity duration-200 ${isSwitchingLesson ? 'opacity-50' : 'opacity-100'}`}
          style={{ width: `${100 - leftWidthPct}%` }}
        >
          <IDEInterface course={course} currentLesson={currentLesson} />
        </motion.div>
      </div>
    </motion.div>
  )
}