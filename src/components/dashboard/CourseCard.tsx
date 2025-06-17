import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users } from 'lucide-react';
import Image from 'next/image';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    instructor: {
      name: string;
      avatar: string;
    };
    duration: number;
    students: number;
    level: string;
    category: string;
    status?: 'published' | 'draft' | 'archived';
  };
  onClick?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-video relative">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4 space-y-4">
        {course.instructor && (
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={course.instructor.avatar}
                alt={course.instructor.name}
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
            <span className="text-sm text-gray-400">{course.instructor.name}</span>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
          <p className="text-sm text-gray-400 line-clamp-2">{course.description}</p>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{course.duration} hours</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{course.students} students</span>
          </div>
        </div>

        <div className="flex gap-2">
          <span className="px-2 py-1 rounded-full bg-gray-700 text-xs">
            {course.level}
          </span>
          <span className="px-2 py-1 rounded-full bg-gray-700 text-xs">
            {course.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
};