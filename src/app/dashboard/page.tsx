// src/app/dashboard/page.tsx
"use client";

import { useAuth } from "@/providers/AuthProvider";
import { InstructorDashboard } from "@/components/dashboard/InstructorDashboard";
import { LearnerDashboard } from "@/components/dashboard/LearnerDashboard";
import RoleSelection from "@/components/auth/RoleSelection";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user, profile, loading, updateUserType, refreshProfile } = useAuth();
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const handleRoleSelection = async (role: 'instructor' | 'learner') => {
    try {
      setIsUpdatingRole(true);
      console.log('Updating user type to:', role);
      
      await updateUserType(role);
      
      // Force refresh the profile to get updated data
      if (refreshProfile) {
        await refreshProfile();
      }
      
      console.log('Role updated successfully');
    } catch (error) {
      console.error('Error updating user type:', error);
      throw error;
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('DashboardPage state:', {
      user: user?.id,
      profile: profile,
      loading,
      onboardingCompleted: profile?.onboarding_completed,
      userType: profile?.user_type
    });
  }, [user, profile, loading]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
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

  // Show role selection if:
  // 1. No profile exists, OR
  // 2. Onboarding not completed, OR  
  // 3. No user_type set
  const needsRoleSelection = !profile || 
                            !profile.onboarding_completed || 
                            !profile.user_type ||
                            profile.user_type === null;

  if (needsRoleSelection) {
    console.log('Showing role selection because:', {
      noProfile: !profile,
      onboardingNotCompleted: profile && !profile.onboarding_completed,
      noUserType: profile && (!profile.user_type || profile.user_type === null)
    });

    return (
      <RoleSelection 
        onSelectRole={handleRoleSelection}
        loading={isUpdatingRole}
      />
    );
  }

  // Route to appropriate dashboard based on user type
  console.log('Routing to dashboard for user type:', profile.user_type);
  
  if (profile.user_type === 'instructor') {
    return <InstructorDashboard user={user} profile={profile} />;
  } else if (profile.user_type === 'learner') {
    return <LearnerDashboard user={user} profile={profile} />;
  } else {
    // Fallback - show role selection if user_type is unexpected
    console.warn('Unexpected user_type:', profile.user_type);
    return (
      <RoleSelection 
        onSelectRole={handleRoleSelection}
        loading={isUpdatingRole}
      />
    );
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