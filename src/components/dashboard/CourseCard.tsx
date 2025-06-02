import React from "react";
import { Card } from "../common/Card";
import { Progress } from "../common/Progress";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { BookOpen, Clock, Star, Users, TrendingUp, Settings } from "lucide-react";

interface LearnerCourseCardProps {
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

interface InstructorCourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    duration: string;
    students: number;
    rating: number;
    lessons: number;
    level: "beginner" | "intermediate" | "advanced";
    category: string;
    revenue: number;
    status: "published" | "draft" | "archived";
  };
  onEdit?: () => void;
  onViewAnalytics?: () => void;
}

// Helper function to safely capitalize strings
const capitalizeString = (str: string | undefined | null): string => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const LearnerCourseCard: React.FC<LearnerCourseCardProps> = ({ course, onClick }) => {
  const levelColorMap = {
    beginner: "success" as const,
    intermediate: "warning" as const,
    advanced: "error" as const,
  };

  // Provide fallback values
  const safeLevel = course.level || 'beginner';
  const safeTitle = course.title || 'Untitled Course';
  const safeDescription = course.description || 'No description available';
  const safeCoverImage = course.coverImage || '/placeholder-course.jpg';
  const safeInstructor = course.instructor || { name: 'Unknown Instructor', avatar: '/placeholder-avatar.jpg' };
  const safeCategory = course.category || 'General';
  const safeDuration = course.duration || '0h';
  const safeLessons = course.lessons || 0;
  const safeRating = course.rating || 0;
  const safeProgress = course.progress || 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={onClick}>
      <div className="relative">
        <img
          src={safeCoverImage}
          alt={safeTitle}
          className="w-full h-48 object-cover"
        />
        
        <div className="absolute top-4 left-4">
          <Badge variant={levelColorMap[safeLevel]}>
            {capitalizeString(safeLevel)}
          </Badge>
        </div>

        <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded flex items-center gap-1">
          <Star className="w-4 h-4 fill-current" />
          {safeRating}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <img
            src={safeInstructor.avatar}
            alt={safeInstructor.name}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <Badge variant="outline" className="mb-1">
              {safeCategory}
            </Badge>
            <h3 className="text-xl font-semibold mb-1 line-clamp-2">
              {safeTitle}
            </h3>
            <p className="text-sm text-gray-500">
              by {safeInstructor.name}
            </p>
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {safeDescription}
        </p>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {safeLessons} lessons
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {safeDuration}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Your progress</span>
              <span className="font-medium">{safeProgress}%</span>
            </div>
            <Progress value={safeProgress} className="h-2" />
          </div>

          <Button 
            variant="primary" 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            {safeProgress > 0 ? "Continue Learning" : "Start Learning"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export const InstructorCourseCard: React.FC<InstructorCourseCardProps> = ({ 
  course, 
  onEdit, 
  onViewAnalytics 
}) => {
  const levelColorMap = {
    beginner: "success" as const,
    intermediate: "warning" as const,
    advanced: "error" as const,
  };

  const statusColorMap = {
    published: "success" as const,
    draft: "warning" as const,
    archived: "secondary" as const,
  };

  // Provide fallback values to prevent undefined errors
  const safeLevel = course.level || 'beginner';
  const safeStatus = course.status || 'draft';
  const safeTitle = course.title || 'Untitled Course';
  const safeDescription = course.description || 'No description available';
  const safeCoverImage = course.coverImage || '/placeholder-course.jpg';
  const safeCategory = course.category || 'General';
  const safeLessons = course.lessons || 0;
  const safeStudents = course.students || 0;
  const safeRating = course.rating || 0;
  const safeRevenue = course.revenue || 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={safeCoverImage}
          alt={safeTitle}
          className="w-full h-48 object-cover"
        />
        
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant={levelColorMap[safeLevel]}>
            {capitalizeString(safeLevel)}
          </Badge>
          <Badge variant={statusColorMap[safeStatus]}>
            {capitalizeString(safeStatus)}
          </Badge>
        </div>

        <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          {safeRating}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <Badge variant="outline" className="mb-2">
            {safeCategory}
          </Badge>
          
          <h3 className="text-xl font-semibold mb-2 line-clamp-2">
            {safeTitle}
          </h3>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {safeDescription}
        </p>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {safeLessons} lessons
              </div>
              
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {safeStudents} students
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Revenue: <span className="font-semibold text-green-600">${safeRevenue}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className="flex-1"
            >
              <Settings className="w-4 h-4 mr-1" />
              Edit Course
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={onViewAnalytics}
              className="flex-1"
            >
              View Analytics
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};