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
import { Home, ChevronRight, BookOpen, Video, FileText, Download, ExternalLink, FileVideo, File, Image, FileCode, Clock, Star, CheckCircle, Loader2 } from 'lucide-react'
import { Course, Lesson, CourseResource } from '@/types/index'

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
  onLessonChange?: (lessonId: string) => void
  isSwitchingLesson?: boolean
}

export function CourseContent({ course, currentLesson, lessons = [], progress = 0, onLessonChange, isSwitchingLesson = false }: CourseContentProps) {
  const [activeTab, setActiveTab] = useState('video')
  
  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Enhanced file type detection for bulk upload format
  const getFileTypeIcon = (fileName: string, fileType?: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    // If fileType is provided from bulk upload, use it
    if (fileType) {
      switch (fileType) {
        case 'video':
          return { icon: FileVideo, color: 'text-purple-400' };
        case 'document':
          return { icon: File, color: 'text-red-400' };
        case 'image':
          return { icon: Image, color: 'text-blue-400' };
        case 'code':
          return { icon: FileCode, color: 'text-yellow-400' };
        case 'transcript':
        case 'subtitle':
        case 'instruction':
          return { icon: FileText, color: 'text-green-400' };
        default:
          return { icon: File, color: 'text-gray-400' };
      }
    }
    
    // Fallback to extension-based detection
    switch (extension) {
      case 'pdf':
        return { icon: File, color: 'text-red-400' };
      case 'doc':
      case 'docx':
        return { icon: FileText, color: 'text-blue-400' };
      case 'txt':
        return { icon: FileText, color: 'text-green-400' };
      case 'srt':
      case 'vtt':
        return { icon: FileText, color: 'text-purple-400' };
      case 'html':
      case 'htm':
        return { icon: FileText, color: 'text-orange-400' };
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return { icon: Image, color: 'text-blue-400' };
      case 'py':
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'html':
      case 'css':
        return { icon: FileCode, color: 'text-yellow-400' };
      default:
        return { icon: File, color: 'text-gray-400' };
    }
  };

  // Get file type category for better organization
  const getFileTypeCategory = (fileName: string, fileType?: string): string => {
    if (fileType) {
      return fileType;
    }
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(extension || '')) return 'video';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
    if (['pdf'].includes(extension || '')) return 'document';
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension || '')) return 'document';
    if (['srt', 'vtt'].includes(extension || '')) return 'subtitle';
    if (['html', 'htm'].includes(extension || '')) return 'instruction';
    if (['py', 'js', 'ts', 'jsx', 'tsx', 'html', 'css'].includes(extension || '')) return 'code';
    return 'document';
  };

  // Group resources by type for better organization
  const groupResourcesByType = (resources: CourseResource[]) => {
    const grouped = {
      videos: [] as CourseResource[],
      documents: [] as CourseResource[],
      images: [] as CourseResource[],
      subtitles: [] as CourseResource[],
      instructions: [] as CourseResource[],
      code: [] as CourseResource[],
      other: [] as CourseResource[]
    };

    resources.forEach(resource => {
      const category = getFileTypeCategory(resource.name, resource.type);
      switch (category) {
        case 'video':
          grouped.videos.push(resource);
          break;
        case 'document':
          grouped.documents.push(resource);
          break;
        case 'image':
          grouped.images.push(resource);
          break;
        case 'subtitle':
          grouped.subtitles.push(resource);
          break;
        case 'instruction':
          grouped.instructions.push(resource);
          break;
        case 'code':
          grouped.code.push(resource);
          break;
        default:
          grouped.other.push(resource);
      }
    });

    return grouped;
  };

  console.log('CourseContent rendering with:', { currentLesson, lessons, isSwitchingLesson });
  
  // Add lesson info display
  const getLessonInfo = () => {
    if (!currentLesson) return null;
    
    const duration = currentLesson.duration || 0;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    return (
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4" />
          <span>Lesson {currentLesson.order_index || 1}</span>
        </div>
        {currentLesson.is_preview && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Completed</span>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col bg-card">
        <motion.div 
          className={`p-4 flex items-center justify-between border-b transition-opacity duration-300 ${isSwitchingLesson ? 'opacity-50' : 'opacity-100'}`}
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
          className={`transition-opacity duration-300 ${isSwitchingLesson ? 'opacity-50' : 'opacity-100'}`}
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
              {getLessonInfo()}
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
                  <TabsTrigger value="resources" className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>Resources</span>
                  </TabsTrigger>
                  <TabsTrigger value="transcript" className="flex items-center gap-2">
                    <BookOpen size={16} />
                    <span>Transcript</span>
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
                      {isSwitchingLesson ? (
                        <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                            <p className="text-muted-foreground">Switching lesson...</p>
                          </div>
                        </div>
                      ) : currentLesson?.video_url ? (
                        <VideoPlayer 
                          src={currentLesson.video_url} 
                          poster={currentLesson.thumbnail_url || ''}
                          title={currentLesson.title || ''}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                          <div className="text-center">
                            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">No video available for this lesson</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              The video player will automatically get secure access to private S3 content
                            </p>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="resources" className="pt-4">
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {currentLesson?.resources && currentLesson.resources.length > 0 ? (
                          <div className="space-y-6">
                            <h3 className="text-lg font-medium text-primary">Lesson Resources</h3>
                            
                            {(() => {
                              const groupedResources = groupResourcesByType(currentLesson.resources);
                              const sections = [];
                              
                              // Videos section
                              if (groupedResources.videos.length > 0) {
                                sections.push(
                                  <div key="videos" className="space-y-3">
                                    <h4 className="text-md font-medium text-purple-600 flex items-center gap-2">
                                      <FileVideo size={16} />
                                      Videos ({groupedResources.videos.length})
                                    </h4>
                                    <div className="grid gap-3">
                                      {groupedResources.videos.map((resource, index) => {
                                        const { icon: Icon, color } = getFileTypeIcon(resource.name, resource.type);
                                        return (
                                          <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                                          >
                                            <div className="flex items-center gap-3">
                                              <Icon size={20} className={color} />
                                              <div>
                                                <p className="font-medium text-sm">{resource.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                  {resource.size ? formatFileSize(resource.size) : 'Unknown size'}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {resource.url && (
                                                <>
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => window.open(resource.url, '_blank')}
                                                  >
                                                    <ExternalLink className="w-4 h-4" />
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                      const link = document.createElement('a');
                                                      link.href = resource.url;
                                                      link.download = resource.name;
                                                      link.click();
                                                    }}
                                                  >
                                                    <Download className="w-4 h-4" />
                                                  </Button>
                                                </>
                                              )}
                                            </div>
                                          </motion.div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              }
                              
                              // Documents section
                              if (groupedResources.documents.length > 0) {
                                sections.push(
                                  <div key="documents" className="space-y-3">
                                    <h4 className="text-md font-medium text-red-600 flex items-center gap-2">
                                      <File size={16} />
                                      Documents ({groupedResources.documents.length})
                                    </h4>
                                    <div className="grid gap-3">
                                      {groupedResources.documents.map((resource, index) => {
                                        const { icon: Icon, color } = getFileTypeIcon(resource.name, resource.type);
                                        return (
                                          <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                                          >
                                            <div className="flex items-center gap-3">
                                              <Icon size={20} className={color} />
                                              <div>
                                                <p className="font-medium text-sm">{resource.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                  {resource.size ? formatFileSize(resource.size) : 'Unknown size'}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {resource.url && (
                                                <>
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => window.open(resource.url, '_blank')}
                                                  >
                                                    <ExternalLink className="w-4 h-4" />
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                      const link = document.createElement('a');
                                                      link.href = resource.url;
                                                      link.download = resource.name;
                                                      link.click();
                                                    }}
                                                  >
                                                    <Download className="w-4 h-4" />
                                                  </Button>
                                                </>
                                              )}
                                            </div>
                                          </motion.div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              }
                              
                              // Other sections (subtitles, instructions, code, etc.)
                              const otherSections = [
                                { key: 'subtitles', title: 'Subtitles', icon: FileText, color: 'text-purple-600', resources: groupedResources.subtitles },
                                { key: 'instructions', title: 'Instructions', icon: FileText, color: 'text-orange-600', resources: groupedResources.instructions },
                                { key: 'code', title: 'Code Files', icon: FileCode, color: 'text-yellow-600', resources: groupedResources.code },
                                { key: 'images', title: 'Images', icon: Image, color: 'text-blue-600', resources: groupedResources.images },
                                { key: 'other', title: 'Other Files', icon: File, color: 'text-gray-600', resources: groupedResources.other }
                              ];
                              
                              otherSections.forEach(section => {
                                if (section.resources.length > 0) {
                                  sections.push(
                                    <div key={section.key} className="space-y-3">
                                      <h4 className={`text-md font-medium ${section.color} flex items-center gap-2`}>
                                        <section.icon size={16} />
                                        {section.title} ({section.resources.length})
                                      </h4>
                                      <div className="grid gap-3">
                                        {section.resources.map((resource, index) => {
                                          const { icon: Icon, color } = getFileTypeIcon(resource.name, resource.type);
                                          return (
                                            <motion.div
                                              key={index}
                                              initial={{ opacity: 0, x: -10 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{ delay: index * 0.1 }}
                                              className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                                            >
                                              <div className="flex items-center gap-3">
                                                <Icon size={20} className={color} />
                                                <div>
                                                  <p className="font-medium text-sm">{resource.name}</p>
                                                  <p className="text-xs text-muted-foreground">
                                                    {resource.size ? formatFileSize(resource.size) : 'Unknown size'}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                {resource.url && (
                                                  <>
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      onClick={() => window.open(resource.url, '_blank')}
                                                    >
                                                      <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.href = resource.url;
                                                        link.download = resource.name;
                                                        link.click();
                                                      }}
                                                    >
                                                      <Download className="w-4 h-4" />
                                                    </Button>
                                                  </>
                                                )}
                                              </div>
                                            </motion.div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                }
                              });
                              
                              return sections;
                            })()}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">No resources available for this lesson</p>
                          </div>
                        )}
                      </motion.div>
                    </TabsContent>
                    
                    <TabsContent value="transcript" className="pt-4 h-[280px] overflow-y-auto">
                      <motion.div 
                        className="space-y-4 text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {currentLesson?.description ? (
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium text-primary">Lesson Description</h3>
                            <p className="leading-relaxed">{currentLesson.description}</p>
                            
                            {currentLesson.content && (
                              <div className="mt-4">
                                <h4 className="font-medium text-primary mb-2">Additional Content</h4>
                                <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                                  {JSON.stringify(currentLesson.content, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">No transcript or description available for this lesson</p>
                          </div>
                        )}
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
          <CourseNavigation 
            course={course} 
            lessons={lessons} 
            currentLessonId={currentLesson?.id}
            onLessonChange={onLessonChange}
            isSwitchingLesson={isSwitchingLesson}
          />
        </motion.div>
      </div>
    </div>
  )
}