"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { VideoPlayer } from '@/components/courses/video-player'
import { CourseNavigation } from '@/components/courses/course-navigation'
import { Separator } from '@/components/ui/separator'
import { Home, ChevronRight, BookOpen, Video, FileText } from 'lucide-react'
import { Course, Lesson } from '@/types/index'

const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
}

interface CourseContentProps {
  course: Course
  currentLesson?: Lesson
  lessons?: Lesson[]
  progress?: number
}

export function CourseContent({ course, currentLesson, lessons = [], progress = 0 }: CourseContentProps) {
  const [activeTab, setActiveTab] = useState('video')
  
  return (
    <div className="h-full flex flex-col bg-card">
      <motion.div 
        className="p-4 flex items-center justify-between border-b"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="flex items-center gap-2 text-sm text-muted-foreground"
          whileHover={{ x: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Home size={16} className="text-primary" />
          <span>Courses</span>
          <ChevronRight size={14} />
          <span className="font-medium text-foreground">{course.title}</span>
          {currentLesson && (
            <>
              <ChevronRight size={14} />
              <span className="font-medium text-foreground">{currentLesson.title}</span>
            </>
          )}
        </motion.div>
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <span className="text-sm text-muted-foreground">Overall Progress: {progress}%</span>
          <Progress value={progress} className="w-[100px]" />
        </motion.div>
      </motion.div>
      
      <div className="flex-1 overflow-auto p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {currentLesson?.title || course.title}
                </CardTitle>
                <CardDescription className="text-lg">
                  {currentLesson ? `Lesson ${currentLesson.order_index || 1}` : course.description}
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="video" 
                className="w-full"
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <Video size={16} />
                    <span>Video</span>
                  </TabsTrigger>
                  <TabsTrigger value="transcript" className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>Transcript</span>
                  </TabsTrigger>
                  <TabsTrigger value="assignment" className="flex items-center gap-2">
                    <BookOpen size={16} />
                    <span>Assignment</span>
                  </TabsTrigger>
                </TabsList>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                  >
                    <TabsContent value="video" className="pt-4">
                      <VideoPlayer 
                        videoUrl={currentLesson?.video_url} 
                        thumbnailUrl={currentLesson?.thumbnail_url}
                      />
                    </TabsContent>
                    <TabsContent value="transcript" className="pt-4 h-[280px] overflow-y-auto">
                      <motion.div 
                        className="space-y-4 text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {currentLesson?.description ? (
                          <p className="leading-relaxed">{currentLesson.description}</p>
                        ) : (
                          <p className="leading-relaxed">No transcript available for this lesson.</p>
                        )}
                      </motion.div>
                    </TabsContent>
                    <TabsContent value="assignment" className="pt-4">
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-lg font-medium text-primary">Assignment: Practice Exercise</h3>
                        <p className="text-sm">Complete the following exercises to reinforce your learning.</p>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <motion.li 
                            whileHover={{ x: 5 }}
                            className="cursor-pointer hover:text-primary transition-colors"
                          >
                            Review the lesson content
                          </motion.li>
                          <motion.li 
                            whileHover={{ x: 5 }}
                            className="cursor-pointer hover:text-primary transition-colors"
                          >
                            Complete the practice exercises
                          </motion.li>
                          <motion.li 
                            whileHover={{ x: 5 }}
                            className="cursor-pointer hover:text-primary transition-colors"
                          >
                            Submit your work for review
                          </motion.li>
                        </ol>
                        <motion.div 
                          className="flex justify-between pt-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <Button 
                            variant="outline"
                            className="hover:border-primary/50 transition-colors"
                          >
                            Previous Assignment
                          </Button>
                          <Button className="bg-primary hover:bg-primary/90 transition-colors">
                            Submit Assignment
                          </Button>
                        </motion.div>
                      </motion.div>
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
        
        <Separator className="my-4" />
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <CourseNavigation course={course} lessons={lessons} currentLessonId={currentLesson?.id} />
        </motion.div>
      </div>
    </div>
  )
}