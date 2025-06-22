'use client';

import React, { useState, useEffect } from 'react';
import { Download, ExternalLink, File, FileText, FileVideo, FilePdf, FileCode, Image, Eye } from 'lucide-react';
import { fetchLessonWithResources, CourseResource, formatFileSize, getFileTypeCategory, downloadResource, openResourceInNewTab, canPreviewResource } from '@/lib/courseUtils';

interface ResourceDisplayProps {
  lessonId: string;
}

// File type icons
const fileTypeIcons = {
  video: { icon: FileVideo, color: 'text-purple-400', bgColor: 'bg-purple-600/20' },
  pdf: { icon: FilePdf, color: 'text-red-400', bgColor: 'bg-red-600/20' },
  image: { icon: Image, color: 'text-blue-400', bgColor: 'bg-blue-600/20' },
  document: { icon: FileText, color: 'text-green-400', bgColor: 'bg-green-600/20' },
  code: { icon: FileCode, color: 'text-yellow-400', bgColor: 'bg-yellow-600/20' },
  other: { icon: File, color: 'text-gray-400', bgColor: 'bg-gray-600/20' }
};

export const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ lessonId }) => {
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true);
        const lessonData = await fetchLessonWithResources(lessonId);
        if (lessonData) {
          setLesson(lessonData);
        } else {
          setError('Failed to load lesson');
        }
      } catch (err) {
        setError('Error loading lesson');
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="p-4 bg-gray-800/50 rounded-xl">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-xl">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!lesson || !lesson.resources || lesson.resources.length === 0) {
    return (
      <div className="p-4 bg-gray-800/50 rounded-xl">
        <p className="text-gray-400">No resources available for this lesson.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-semibold text-white">Lesson Resources</h3>
        <span className="text-sm text-gray-400">({lesson.resources.length} files)</span>
      </div>

      <div className="grid gap-3">
        {lesson.resources.map((resource: CourseResource, index: number) => {
          const fileCategory = getFileTypeCategory(resource.name, resource.type);
          const config = fileTypeIcons[fileCategory as keyof typeof fileTypeIcons] || fileTypeIcons.other;
          const IconComponent = config.icon;

          return (
            <div
              key={resource.key}
              className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bgColor}`}>
                  <IconComponent className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{resource.name}</p>
                  <p className="text-sm text-gray-400">{formatFileSize(resource.size)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canPreviewResource(resource) && (
                  <button
                    onClick={() => openResourceInNewTab(resource)}
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={() => openResourceInNewTab(resource)}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  onClick={() => downloadResource(resource)}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 