'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text,
  fullScreen = false,
}) => {
  const spinner = (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Skeleton loading components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse', className)}>
    <div className="bg-muted rounded-lg h-48 w-full mb-4" />
    <div className="space-y-2">
      <div className="bg-muted rounded h-4 w-3/4" />
      <div className="bg-muted rounded h-4 w-1/2" />
    </div>
  </div>
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className 
}) => (
  <div className={cn('animate-pulse space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={cn(
          'bg-muted rounded h-4',
          i === lines - 1 ? 'w-3/4' : 'w-full'
        )}
      />
    ))}
  </div>
);

export const SkeletonButton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse bg-muted rounded h-10 w-24', className)} />
);

// Loading states for specific components
export const CourseCardSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-muted rounded-lg h-48 w-full mb-4" />
    <div className="space-y-3">
      <div className="bg-muted rounded h-5 w-3/4" />
      <div className="bg-muted rounded h-4 w-1/2" />
      <div className="flex gap-2">
        <div className="bg-muted rounded-full h-6 w-16" />
        <div className="bg-muted rounded-full h-6 w-20" />
      </div>
    </div>
  </div>
);

export const VideoPlayerSkeleton: React.FC = () => (
  <div className="w-full max-w-6xl mx-auto">
    <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex flex-col items-center justify-center w-full h-[320px] bg-zinc-900 text-white rounded-2xl">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <span className="font-semibold">Loading video...</span>
        <span className="text-xs mt-2 text-muted-foreground">
          Getting secure access to video content
        </span>
      </div>
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="animate-pulse">
      <div className="bg-muted rounded h-8 w-64 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);
