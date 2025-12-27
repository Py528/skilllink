"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle, Circle, PlayCircle, BookOpen, Clock, BarChart, Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Course, Lesson } from '@/types/index'
import supabase from '@/lib/supabaseClient'
import { enhancedToast } from '@/components/ui/enhanced-toast'

interface CourseNavigationProps {
  course: Course
  lessons: Lesson[]
  currentLessonId?: string
  onLessonChange?: (lessonId: string) => void
  isSwitchingLesson?: boolean
}

interface CourseSection {
  id: string
  title: string
  description?: string
  order_index: number
  lessons: Lesson[]
  progress: number
}

// Helper function to group lessons by sections
const groupLessonsBySection = async (courseId: string, lessons: Lesson[]): Promise<CourseSection[]> => {
  try {
    // Fetch sections for the course
    const { data: sections, error: sectionsError } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
      return [];
    }

    if (!sections || sections.length === 0) {
      // If no sections, create a default section with all lessons
      return [{
        id: 'default-section',
        title: 'Course Content',
        description: 'All course lessons',
        order_index: 1,
        lessons: lessons,
        progress: lessons.length > 0 ? Math.round((lessons.filter(l => l.is_preview).length / lessons.length) * 100) : 0
      }];
    }

    // Group lessons by section and capture unassigned lessons to avoid dropping any
    const sectionIds = new Set((sections || []).map(s => s.id));
    const grouped: CourseSection[] = sections.map(section => {
      const sectionLessons = lessons.filter(lesson => lesson.section_id === section.id);
      const progress = sectionLessons.length > 0 
        ? Math.round((sectionLessons.filter(l => l.is_preview).length / sectionLessons.length) * 100) 
        : 0;

      return {
        id: section.id,
        title: section.title,
        description: section.description,
        order_index: section.order_index,
        lessons: sectionLessons,
        progress
      };
    });

    // Add a fallback section for any lessons that don't match a known section
    const unassignedLessons = lessons.filter(l => !l.section_id || !sectionIds.has(l.section_id));
    if (unassignedLessons.length > 0) {
      grouped.push({
        id: 'unassigned-section',
        title: 'Other Lessons',
        description: 'Lessons not assigned to a section',
        order_index: (sections[sections.length - 1]?.order_index || 0) + 1,
        lessons: unassignedLessons,
        progress: Math.round((unassignedLessons.filter(l => l.is_preview).length / unassignedLessons.length) * 100)
      });
    }

    return grouped;
  } catch (error) {
    console.error('Error grouping lessons by section:', error);
    return [];
  }
};

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

export function CourseNavigation({ course, lessons, currentLessonId, onLessonChange, isSwitchingLesson = false }: CourseNavigationProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const [hoveredLesson, setHoveredLesson] = useState<string | null>(null)
  const [courseSections, setCourseSections] = useState<CourseSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const loadCourseSections = async () => {
      setIsLoading(true);
      const sections = await groupLessonsBySection(course.id, lessons);
      setCourseSections(sections);
      
      // Expand the first section by default
      if (sections.length > 0) {
        setExpandedModules([sections[0].id]);
      }
      
      setIsLoading(false);
    };

    if (course.id && lessons.length > 0) {
      loadCourseSections();
    }
  }, [course.id, lessons]);

  // Calculate total duration
  const totalDuration = lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0)
  const totalHours = Math.floor(totalDuration / 3600)
  const totalMinutes = Math.floor((totalDuration % 3600) / 60)
  
  const handleLessonClick = (lessonId: string) => {
    if (isSwitchingLesson || lessonId === currentLessonId) return;
    
    console.log('Lesson clicked:', lessonId);
    
    if (onLessonChange) {
      onLessonChange(lessonId);
    } else {
      enhancedToast.error('Lesson switching not available');
    }
  };
  
  if (isLoading) {
    return (
      <motion.div 
        className="rounded-md border bg-card shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-medium">Course Curriculum</h3>
          </div>
        </div>
        <div className="p-4 text-center text-muted-foreground">
          Loading course structure...
        </div>
      </motion.div>
    );
  }
  
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
      
      <ScrollArea className="max-h-[60vh]">
        {courseSections.length > 0 ? (
          <Accordion
            type="multiple"
            value={expandedModules}
            onValueChange={setExpandedModules}
            className="w-full"
          >
            {courseSections.map((section, sectionIndex) => (
              <motion.div
                key={section.id}
                variants={moduleVariants}
                initial="hidden"
                animate="visible"
                custom={sectionIndex}
              >
                <AccordionItem value={section.id}>
                  <AccordionTrigger className="px-4 py-3 hover:no-underline group">
                    <motion.div 
                      className="flex-1 flex items-center gap-4"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-left">
                          <span className="font-medium">Section {section.order_index}:</span>
                          <span>{section.title}</span>
                        </div>
                        {section.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {section.description}
                          </div>
                        )}
                        <div className="mt-1 flex items-center gap-2">
                          <Progress value={section.progress} className="h-1 w-24" />
                          <span className="text-xs text-muted-foreground">{section.progress}% complete</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BarChart className="w-4 h-4" />
                        <span>{section.lessons.length} lessons</span>
                      </div>
                    </motion.div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <AnimatePresence>
                      {expandedModules.includes(section.id) && (
                        <motion.div 
                          className="space-y-1 px-2 py-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {section.lessons.map((lesson, lessonIndex) => (
                            <motion.div
                              key={lesson.id}
                              variants={lessonVariants}
                              initial="hidden"
                              animate="visible"
                              custom={lessonIndex}
                              className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm cursor-pointer transition-all duration-200
                                ${currentLessonId === lesson.id ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'hover:bg-muted/50'}
                                ${hoveredLesson === lesson.id ? 'shadow-md bg-muted/30' : ''}
                                ${isSwitchingLesson ? 'opacity-50 cursor-not-allowed' : ''}`}
                              whileHover={{ 
                                x: 8, 
                                backgroundColor: currentLessonId === lesson.id ? 'rgba(var(--primary), 0.15)' : 'rgba(var(--muted), 1)',
                                transition: { duration: 0.2 } 
                              }}
                              onHoverStart={() => setHoveredLesson(lesson.id)}
                              onHoverEnd={() => setHoveredLesson(null)}
                              onClick={() => !isSwitchingLesson && handleLessonClick(lesson.id)}
                            >
                              <motion.div
                                whileHover={{ scale: 1.2 }}
                                transition={{ duration: 0.2 }}
                              >
                                {isSwitchingLesson && currentLessonId === lesson.id ? (
                                  <Loader2 size={16} className="text-primary animate-spin" />
                                ) : lesson.is_preview ? (
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
                              <div className="flex-1">
                                <div className="font-medium">{lesson.title}</div>
                                {lesson.description && (
                                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {lesson.description}
                                  </div>
                                )}
                              </div>
                              <motion.div 
                                className="flex items-center gap-2 text-xs text-muted-foreground"
                                whileHover={{ scale: 1.1 }}
                              >
                                <Clock size={12} />
                                <span>
                                  {lesson.duration 
                                    ? `${Math.floor(lesson.duration / 60)}:${(lesson.duration % 60).toString().padStart(2, '0')}`
                                    : '0:00'
                                  }
                                </span>
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
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p>No course content available</p>
          </div>
        )}
      </ScrollArea>
    </motion.div>
  )
}