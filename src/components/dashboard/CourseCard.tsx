import React from "react";
import { motion } from "framer-motion";
import { Card } from "../common/Card";
import { Progress } from "../common/Progress";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { BookOpen, Clock, Star } from "lucide-react";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    instructor: {
      name: string;
      avatar: string;
    };
    duration: string;
    progress: number;
    rating: number;
    lessons: number;
    level: "beginner" | "intermediate" | "advanced";
    category: string;
  };
  onClick?: () => void;
}

export const LearnerCourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const levelColorMap = {
    beginner: "success" as const,
    intermediate: "warning" as const,
    advanced: "error" as const,
  };

  return (
    <Card
      hoverable
      className="h-full flex flex-col"
      onClick={onClick}
    >
      <div className="relative h-40 overflow-hidden rounded-t-2xl">
        <img
          src={course.coverImage}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/80 to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-4 flex justify-between items-center w-full">
          <Badge variant={levelColorMap[course.level]}>
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          </Badge>
          
          <div className="flex items-center bg-secondary-900/60 text-white rounded-full px-2 py-0.5 text-xs">
            <Star size={12} className="text-warning-400 mr-1" fill="currentColor" />
            <span>{course.rating}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <Badge variant="secondary" className="mb-2">
            {course.category}
          </Badge>
          <h3 className="text-lg font-bold line-clamp-2 mb-1">{course.title}</h3>
          <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
            <img 
              src={course.instructor.avatar} 
              alt={course.instructor.name}
              className="w-5 h-5 rounded-full mr-1"
            />
            <span>{course.instructor.name}</span>
          </div>
        </div>
        
        <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="mt-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-secondary-600 dark:text-secondary-400">
            <div className="flex items-center">
              <BookOpen size={14} className="mr-1" />
              <span>{course.lessons} lessons</span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{course.duration}</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1 text-xs">
              <span>Your progress</span>
              <span>{course.progress}%</span>
            </div>
            <Progress 
              value={course.progress} 
              max={100} 
              color={course.progress === 100 ? "success" : "primary"}
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
          >
            {course.progress > 0 ? "Continue Learning" : "Start Learning"}
          </Button>
        </div>
      </div>
    </Card>
  );
};