'use client';

import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Lazy load heavy components
export const LazyVideoPlayer = lazy(() => import('@/components/courses/video-player'));
export const LazyIDEInterface = lazy(() => import('@/components/ide/ide-interface').then(module => ({ default: module.IDEInterface })));
export const LazyInstructorDashboard = lazy(() => import('@/components/dashboard/InstructorDashboard').then(module => ({ default: module.InstructorDashboard })));
export const LazyLearnerDashboard = lazy(() => import('@/components/dashboard/LearnerDashboard').then(module => ({ default: module.LearnerDashboard })));
export const LazyCourseCreation = lazy(() => import('@/app/courses/create/page'));
export const LazyBulkUpload = lazy(() => import('@/components/publish_course/BulkUploadStep').then(module => ({ default: module.BulkUploadStep })));

// Enhanced loading components
const VideoPlayerSkeleton = () => (
  <div className="w-full max-w-6xl mx-auto">
    <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex flex-col items-center justify-center w-full h-[320px] bg-zinc-900 text-white rounded-2xl">
        <Skeleton className="w-16 h-16 rounded-full mb-4" />
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  </div>
);

const IDESkeleton = () => (
  <div className="h-screen bg-gray-900 flex">
    <div className="w-64 bg-gray-800 p-4">
      <Skeleton className="h-8 w-full mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="flex-1 p-4">
      <Skeleton className="h-8 w-full mb-4" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

// Wrapper components with error boundaries and loading states
export const LazyVideoPlayerWrapper = (props: Record<string, unknown>) => (
  <ErrorBoundary context="VideoPlayer">
    <Suspense fallback={<VideoPlayerSkeleton />}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <LazyVideoPlayer {...(props as any)} />
    </Suspense>
  </ErrorBoundary>
);

export const LazyIDEInterfaceWrapper = (props: Record<string, unknown>) => (
  <ErrorBoundary context="IDEInterface">
    <Suspense fallback={<IDESkeleton />}>
      <LazyIDEInterface {...props} />
    </Suspense>
  </ErrorBoundary>
);

export const LazyInstructorDashboardWrapper = (props: Record<string, unknown>) => (
  <ErrorBoundary context="InstructorDashboard">
    <Suspense fallback={<DashboardSkeleton />}>
      <LazyInstructorDashboard {...props} />
    </Suspense>
  </ErrorBoundary>
);

export const LazyLearnerDashboardWrapper = (props: Record<string, unknown>) => (
  <ErrorBoundary context="LearnerDashboard">
    <Suspense fallback={<DashboardSkeleton />}>
      <LazyLearnerDashboard {...props} />
    </Suspense>
  </ErrorBoundary>
);

export const LazyCourseCreationWrapper = (props: Record<string, unknown>) => (
  <ErrorBoundary context="CourseCreation">
    <Suspense fallback={<DashboardSkeleton />}>
      <LazyCourseCreation {...props} />
    </Suspense>
  </ErrorBoundary>
);

export const LazyBulkUploadWrapper = (props: Record<string, unknown>) => (
  <ErrorBoundary context="BulkUpload">
    <Suspense fallback={<DashboardSkeleton />}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <LazyBulkUpload {...(props as any)} />
    </Suspense>
  </ErrorBoundary>
);
