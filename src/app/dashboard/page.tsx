// src/app/dashboard/page.tsx
"use client";

import { useAuth } from "@/components/auth/useAuth";
import InstructorDashboard from "@/components/dashboard/InstructorDashboard";
import LearnerDashboard from "@/components/dashboard/LearnerDashboard";
import RoleSelection from "@/components/auth/RoleSelection";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, profile, loading, updateUserType } = useAuth();

  const handleRoleSelection = async (role: 'instructor' | 'learner') => {
    try {
      await updateUserType(role);
    } catch (error) {
      console.error('Error updating user type:', error);
      throw error;
    }
  };
  console.log('DashboardPage rendered with user:', user, 'profile:', profile, 'loading:', loading);
  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    // This should be handled by the useAuth hook redirecting to login
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to access your dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Show role selection if user hasn't completed onboarding
  if (!profile || !profile.onboarding_completed) {
    return (
      <RoleSelection 
        onSelectRole={handleRoleSelection}
        loading={false}
      />
    );
  }

  // Route to appropriate dashboard based on user type
  if (profile.user_type === 'instructor') {
    return <InstructorDashboard user={user} profile={profile} />;
  } else {
    return <LearnerDashboard user={user} profile={profile} />;
  }
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}