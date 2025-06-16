'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GripVertical, Video, FileText, HelpCircle, AlignCenter as Assignment, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/publish_course/Button';
import { Card, CardContent, CardHeader } from '@/components/publish_course/Card';
import { Input } from '@/components/publish_course/Input';
import { Select } from '@/components/publish_course/Select';
import { Badge } from '@/components/publish_course/Badge';

interface CourseContentStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  errors: any;
}

const contentTypes = [
  { value: 'video', label: 'Video Lesson', icon: Video },
  { value: 'text', label: 'Text Lesson', icon: FileText },
  { value: 'quiz', label: 'Quiz', icon: HelpCircle },
  { value: 'assignment', label: 'Assignment', icon: Assignment }
];

export const CourseContentStep: React.FC<CourseContentStepProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  const [editingModule, setEditingModule] = React.useState<number | null>(null);
  const [editingLesson, setEditingLesson] = React.useState<{ moduleIndex: number; lessonIndex: number } | null>(null);

  const modules = formData.modules || [];

  const addModule = () => {
    const newModule = {
      title: 'New Module',
      description: '',
      lessons: []
    };
    updateFormData({
      ...formData,
      modules: [...modules, newModule]
    });
    setEditingModule(modules.length);
  };

  const updateModule = (moduleIndex: number, updatedModule: any) => {
    const updatedModules = modules.map((module: any, index: number) =>
      index === moduleIndex ? updatedModule : module
    );
    updateFormData({
      ...formData,
      modules: updatedModules
    });
  };

  const deleteModule = (moduleIndex: number) => {
    const updatedModules = modules.filter((_: any, index: number) => index !== moduleIndex);
    updateFormData({
      ...formData,
      modules: updatedModules
    });
  };

  const addLesson = (moduleIndex: number) => {
    const newLesson = {
      title: 'New Lesson',
      type: 'video',
      duration: '',
      description: ''
    };
    const updatedModules = modules.map((module: any, index: number) =>
      index === moduleIndex
        ? { ...module, lessons: [...module.lessons, newLesson] }
        : module
    );
    updateFormData({
      ...formData,
      modules: updatedModules
    });
    setEditingLesson({ moduleIndex, lessonIndex: modules[moduleIndex].lessons.length });
  };

  const updateLesson = (moduleIndex: number, lessonIndex: number, updatedLesson: any) => {
    const updatedModules = modules.map((module: any, index: number) =>
      index === moduleIndex
        ? {
            ...module,
            lessons: module.lessons.map((lesson: any, lIndex: number) =>
              lIndex === lessonIndex ? updatedLesson : lesson
            )
          }
        : module
    );
    updateFormData({
      ...formData,
      modules: updatedModules
    });
  };

  const deleteLesson = (moduleIndex: number, lessonIndex: number) => {
    const updatedModules = modules.map((module: any, index: number) =>
      index === moduleIndex
        ? {
            ...module,
            lessons: module.lessons.filter((_: any, lIndex: number) => lIndex !== lessonIndex)
          }
        : module
    );
    updateFormData({
      ...formData,
      modules: updatedModules
    });
  };

  const getContentTypeIcon = (type: string) => {
    const contentType = contentTypes.find(ct => ct.value === type);
    return contentType?.icon || Video;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Course Content</h2>
          <p className="text-gray-400">Structure your course with modules and lessons</p>
        </div>
        <Button onClick={addModule}>
          <Plus className="w-4 h-4 mr-2" />
          Add Module
        </Button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {modules.map((module: any, moduleIndex: number) => (
            <motion.div
              key={moduleIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: moduleIndex * 0.1 }}
            >
              <Card className="overflow-hidden" hover>
                <CardHeader className="bg-[#111111]/50 border-b border-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="w-5 h-5 text-gray-400" />
                      </motion.div>
                      {editingModule === moduleIndex ? (
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            value={module.title}
                            onChange={(e) => updateModule(moduleIndex, { ...module, title: e.target.value })}
                            placeholder="Module title"
                          />
                          <Input
                            value={module.description}
                            onChange={(e) => updateModule(moduleIndex, { ...module, description: e.target.value })}
                            placeholder="Module description"
                          />
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-lg font-semibold text-white">{module.title}</h3>
                          {module.description && (
                            <p className="text-sm text-gray-400">{module.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {module.lessons?.length || 0} lessons
                      </Badge>
                      {editingModule === moduleIndex ? (
                        <Button
                          size="sm"
                          onClick={() => setEditingModule(null)}
                        >
                          Save
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingModule(moduleIndex)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteModule(moduleIndex)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <AnimatePresence>
                      {module.lessons?.map((lesson: any, lessonIndex: number) => {
                        const IconComponent = getContentTypeIcon(lesson.type);
                        return (
                          <motion.div
                            key={lessonIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: lessonIndex * 0.05 }}
                            className="flex items-center justify-between p-3 bg-[#111111]/50 rounded-xl border border-gray-800/50 hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="w-4 h-4 text-gray-400" />
                              </motion.div>
                              <IconComponent className="w-5 h-5 text-[#0CF2A0]" />
                              {editingLesson?.moduleIndex === moduleIndex && editingLesson?.lessonIndex === lessonIndex ? (
                                <div className="flex gap-2">
                                  <Input
                                    value={lesson.title}
                                    onChange={(e) => updateLesson(moduleIndex, lessonIndex, { ...lesson, title: e.target.value })}
                                    placeholder="Lesson title"
                                    className="w-48"
                                  />
                                  <Select
                                    options={contentTypes.map(ct => ({ value: ct.value, label: ct.label }))}
                                    value={lesson.type}
                                    onChange={(e) => updateLesson(moduleIndex, lessonIndex, { ...lesson, type: e.target.value })}
                                  />
                                  <Input
                                    value={lesson.duration}
                                    onChange={(e) => updateLesson(moduleIndex, lessonIndex, { ...lesson, duration: e.target.value })}
                                    placeholder="Duration"
                                    className="w-32"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <h4 className="text-sm font-medium text-white">{lesson.title}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" size="sm">
                                      {lesson.type}
                                    </Badge>
                                    {lesson.duration && (
                                      <span className="text-xs text-gray-400">{lesson.duration}</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {editingLesson?.moduleIndex === moduleIndex && editingLesson?.lessonIndex === lessonIndex ? (
                                <Button
                                  size="sm"
                                  onClick={() => setEditingLesson(null)}
                                >
                                  Save
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingLesson({ moduleIndex, lessonIndex })}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteLesson(moduleIndex, lessonIndex)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addLesson(moduleIndex)}
                      className="w-full mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lesson
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}; 