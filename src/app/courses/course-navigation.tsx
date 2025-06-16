"use client";

import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Circle, Lock, XCircle } from 'lucide-react';

type Module = {
  id: number;
  title: string;
  lessons: Lesson[];
};

type Lesson = {
  id: number;
  title: string;
  duration: string;
  completed?: boolean;
  locked?: boolean;
  videoUrl: string;
  content: {
    description: string;
    codeSnippets: { language: string; code: string }[];
    assignment: string;
  };
};

type CourseNavigationProps = {
  modules: Module[];
  currentModuleIndex: number;
  currentLessonIndex: number;
  onSelectLesson: (moduleIndex: number, lessonIndex: number) => void;
  onClose: () => void;
};

export function CourseNavigation({ 
  modules, 
  currentModuleIndex, 
  currentLessonIndex, 
  onSelectLesson,
  onClose
}: CourseNavigationProps) {
  const expandedModules = modules.map((_, i) => `module-${i}`);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center justify-between border-b border-border">
        <h2 className="font-medium">Course Content</h2>
        <button 
          onClick={onClose}
          className="lg:hidden rounded-full p-1 hover:bg-muted"
        >
          <XCircle size={20} />
        </button>
      </div>
      <ScrollArea className="flex-1">
        <Accordion 
          type="multiple" 
          defaultValue={expandedModules}
          className="w-full"
        >
          {modules.map((module, moduleIndex) => (
            <AccordionItem 
              key={module.id} 
              value={`module-${moduleIndex}`}
              className="border-b"
            >
              <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors">
                <div className="flex items-center">
                  <span className="text-left">{module.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="py-1">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const isActive = moduleIndex === currentModuleIndex && lessonIndex === currentLessonIndex;
                    const isLocked = lesson.locked;
                    const isCompleted = lesson.completed;
                    
                    return (
                      <motion.li 
                        key={lesson.id}
                        whileHover={!isLocked ? { x: 5 } : {}}
                        className={`
                          relative px-4 py-2 mx-1 rounded-md text-sm flex items-center justify-between 
                          ${isActive ? 'bg-primary/10 text-primary font-medium' : ''}
                          ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/50'}
                        `}
                        onClick={() => !isLocked && onSelectLesson(moduleIndex, lessonIndex)}
                      >
                        <div className="flex items-center space-x-2 overflow-hidden">
                          {isLocked ? (
                            <Lock size={16} className="flex-shrink-0" />
                          ) : isCompleted ? (
                            <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle size={16} className="flex-shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                      </motion.li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
}