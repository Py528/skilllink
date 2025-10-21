'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, children }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    >
      {children}
    </div>
  );
};

// Pre-built skeleton components for common UI patterns
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 space-y-4', className)}>
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-20 w-full" />
    <div className="flex space-x-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-16" />
    </div>
  </div>
);

export const CourseCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-4 space-y-3', className)}>
    <Skeleton className="h-32 w-full rounded-lg" />
    <Skeleton className="h-5 w-4/5" />
    <Skeleton className="h-4 w-3/4" />
    <div className="flex items-center space-x-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const VideoPlayerSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-64 w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="flex space-x-2">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-16" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={colIndex} 
            className="h-4 flex-1" 
          />
        ))}
      </div>
    ))}
  </div>
);

export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

