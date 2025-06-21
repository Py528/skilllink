'use client';

import React from 'react';
import { ResourceDisplay } from '@/components/courses/ResourceDisplay';

// Example usage of the ResourceDisplay component
export default function ExampleCoursePage() {
  // This would be the lesson ID from your course
  const lessonId = "8f7f5c6c-c269-40fb-bcc9-f566ed56fc5a"; // Replace with actual lesson ID

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Course Lesson</h1>
        
        {/* Video Player Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Video Content</h2>
          <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center">
            <p className="text-gray-400">Video player would go here</p>
          </div>
        </div>

        {/* Lesson Description */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Lesson Description</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300">
              This is the lesson description. It would be fetched from the lesson data.
            </p>
          </div>
        </div>

        {/* Resources Section */}
        <div className="mb-8">
          <ResourceDisplay lessonId={lessonId} />
        </div>

        {/* Additional Content */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Additional Content</h2>
          <div className="bg-gray-800/50 rounded-xl p-6">
            <p className="text-gray-300">
              Any additional lesson content would go here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Alternative: Direct Supabase query example
export function DirectSupabaseExample() {
  const [resources, setResources] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchResources = async () => {
      try {
        // Direct Supabase query to get lesson with resources
        const { data, error } = await fetch('/api/lessons/8f7f5c6c-c269-40fb-bcc9-f566ed56fc5a', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (error) {
          console.error('Error fetching lesson:', error);
          return;
        }

        const lessonData = await data.json();
        setResources(lessonData.resources || []);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  if (loading) {
    return <div>Loading resources...</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Lesson Resources</h3>
      {resources.map((resource, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg mb-2">
          <div>
            <p className="text-white font-medium">{resource.name}</p>
            <p className="text-sm text-gray-400">{resource.size} bytes</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.open(resource.url, '_blank')}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View
            </button>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = resource.url;
                link.download = resource.name;
                link.click();
              }}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 