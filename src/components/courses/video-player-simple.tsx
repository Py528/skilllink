'use client';

import React from 'react';
import { Play, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = () => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex flex-col items-center justify-center w-full h-[320px] bg-zinc-900 text-white rounded-2xl">
          <div className="relative mb-4">
            <Play className="w-16 h-16 text-[#0CF2A0]" />
          </div>
          <h3 className="font-bold text-xl mb-2 text-center">Video Player</h3>
          <p className="text-sm text-center max-w-md text-gray-400 mb-6 px-2">
            Enhanced video player with progress tracking and keyboard shortcuts
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <AlertCircle className="h-4 w-4" />
            <span>Video player temporarily simplified for Phase 2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
