"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle, Circle, PlayCircle, BookOpen, Clock, BarChart } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Course, Lesson } from '@/types/index'

interface CourseNavigationProps {
  course: Course
  lessons: Lesson[]
  currentLessonId?: string
}

// Helper function to group lessons by sections (for now, we'll treat all lessons as one section)
const groupLessonsBySection = (lessons: Lesson[]) => {
  // For now, we'll create a single section with all lessons
  // In the future, this could be enhanced to group by actual sections
  return [{
    id: 'section-1',
    title: 'Course Content',
    progress: lessons.length > 0 ? Math.round((lessons.filter(l => l.is_preview).length / lessons.length) * 100) : 0,
    lessons: lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      duration: Math.floor(lesson.duration / 60) + ':' + (lesson.duration % 60).toString().padStart(2, '0'),
      completed: lesson.is_preview,
      current: false
    }))
  }]
}

const moduleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
}

const lessonVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.2,
    },
  }),
}

export function CourseNavigation({ course, lessons, currentLessonId }: CourseNavigationProps) {
  const [expandedModules, setExpandedModules] = useState(['section-1'])
  const [hoveredLesson, setHoveredLesson] = useState<string | null>(null)
  
  const courseModules = groupLessonsBySection(lessons)
  
  // Calculate total duration
  const totalDuration = lessons.reduce((total, lesson) => total + lesson.duration, 0)
  const totalHours = Math.floor(totalDuration / 3600)
  const totalMinutes = Math.floor((totalDuration % 3600) / 60)
  
  return (
    <motion.div 
      className="rounded-md border bg-card shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div 
        className="p-4 border-b flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-medium">Course Curriculum</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{totalHours}h {totalMinutes}m total</span>
        </div>
      </motion.div>
      
      <ScrollArea className="h-[300px]">
        <Accordion
          type="multiple"
          value={expandedModules}
          onValueChange={setExpandedModules}
          className="w-full"
        >
          {courseModules.map((module, moduleIndex) => (
            <motion.div
              key={module.id}
              variants={moduleVariants}
              initial="hidden"
              animate="visible"
              custom={moduleIndex}
            >
              <AccordionItem value={module.id}>
                <AccordionTrigger className="px-4 py-3 hover:no-underline group">
                  <motion.div 
                    className="flex-1 flex items-center gap-4"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-left">
                        <span className="font-medium">Section {moduleIndex + 1}:</span>
                        <span>{module.title}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Progress value={module.progress} className="h-1 w-24" />
                        <span className="text-xs text-muted-foreground">{module.progress}% complete</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BarChart className="w-4 h-4" />
                      <span>{module.lessons.length} lessons</span>
                    </div>
                  </motion.div>
                </AccordionTrigger>
                <AccordionContent>
                  <AnimatePresence>
                    {expandedModules.includes(module.id) && (
                      <motion.div 
                        className="space-y-1 px-2 py-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {module.lessons.map((lesson, lessonIndex) => (
                          <motion.div
                            key={lesson.id}
                            variants={lessonVariants}
                            initial="hidden"
                            animate="visible"
                            custom={lessonIndex}
                            className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm cursor-pointer
                              ${currentLessonId === lesson.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}
                              ${hoveredLesson === lesson.id ? 'shadow-md' : ''}`}
                            whileHover={{ 
                              x: 8, 
                              backgroundColor: currentLessonId === lesson.id ? 'rgba(var(--primary), 0.15)' : 'rgba(var(--muted), 1)',
                              transition: { duration: 0.2 } 
                            }}
                            onHoverStart={() => setHoveredLesson(lesson.id)}
                            onHoverEnd={() => setHoveredLesson(null)}
                          >
                            <motion.div
                              whileHover={{ scale: 1.2 }}
                              transition={{ duration: 0.2 }}
                            >
                              {lesson.completed ? (
                                <CheckCircle size={16} className="text-primary" />
                              ) : currentLessonId === lesson.id ? (
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  <PlayCircle size={16} className="text-primary" />
                                </motion.div>
                              ) : (
                                <Circle size={16} className="text-muted-foreground" />
                              )}
                            </motion.div>
                            <div className="flex-1">{lesson.title}</div>
                            <motion.div 
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Clock size={12} />
                              <span>{lesson.duration}</span>
                            </motion.div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </ScrollArea>
    </motion.div>
  )
}