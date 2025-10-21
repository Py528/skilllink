'use client';

import React, { useState } from 'react';
import { Play, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerFallbackProps {
  src: string;
  title?: string;
  onRetry?: () => void;
}

export const VideoPlayerFallback: React.FC<VideoPlayerFallbackProps> = ({ 
  src, 
  title = "Video Content",
  onRetry 
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      if (onRetry) {
        await onRetry();
      }
      // Simulate retry delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-white mb-2">
          {title}
        </h3>

        {/* Error Message */}
        <div className="max-w-md mb-6">
          <p className="text-gray-300 mb-2">
            Could not load video content
          </p>
          <p className="text-sm text-gray-400">
            This may be due to missing S3/Supabase configuration or network issues.
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-gray-300">Network: Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-gray-300">S3/Supabase: Disconnected</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Retry
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => window.open('/setup', '_blank')}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 px-6 py-2 rounded-lg"
          >
            Setup Guide
          </Button>
        </div>

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg text-left max-w-md">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Debug Information:</h4>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Video Source: {src || 'Not provided'}</div>
            <div>Environment: {process.env.NODE_ENV}</div>
            <div>Timestamp: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Play Button Overlay (for visual consistency) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
          <Play className="w-8 h-8 text-white ml-1" />
        </div>
      </div>
    </div>
  );
};


