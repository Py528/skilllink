import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Star } from 'lucide-react';
import Image from 'next/image';
import { CourseWithInstructor } from '../../services/coursesService';

interface CourseCardProps {
  course: CourseWithInstructor;
  onClick?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
  // Handle thumbnail URL - if it's an AWS S3 URL, use it directly, otherwise use a fallback
  const thumbnailUrl = imageError || !course.thumbnail_url ? '/default-course-thumbnail.svg' : course.thumbnail_url;
  
  // Handle instructor avatar - if it's an AWS S3 URL, use it directly, otherwise use a fallback
  const instructorAvatar = avatarError || !course.instructor?.avatar ? '/default-avatar.svg' : course.instructor.avatar;

  const handleImageError = () => {
    setImageError(true);
  };

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="aspect-video relative">
        <Image
          src={thumbnailUrl}
          alt={course.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={handleImageError}
        />
        {course.price && course.price > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
            ${course.price}
          </div>
        )}
      </div>
      <div className="p-4 space-y-4">
        {course.instructor && (
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={instructorAvatar}
                alt={course.instructor.name}
                fill
                className="object-cover"
                sizes="32px"
                onError={handleAvatarError}
              />
            </div>
            <span className="text-sm text-gray-400">{course.instructor.name}</span>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-1 text-white">{course.title}</h3>
          <p className="text-sm text-gray-400 line-clamp-2">{course.description}</p>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{course.duration || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{course.students || 0} students</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
        <div className="flex gap-2">
            <span className="px-2 py-1 rounded-full bg-gray-700 text-xs text-white capitalize">
              {course.difficulty_level || 'beginner'}
          </span>
            {course.category && (
              <span className="px-2 py-1 rounded-full bg-gray-700 text-xs text-white">
            {course.category}
          </span>
            )}
          </div>
          {course.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-400">{course.rating}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};