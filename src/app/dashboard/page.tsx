// src/app/dashboard/page.tsx
"use client";

import { useAuth } from "@/providers/AuthProvider";
import { InstructorDashboard } from "@/components/dashboard/InstructorDashboard";
import { LearnerDashboard } from "@/components/dashboard/LearnerDashboard";
import RoleSelection from "@/components/auth/RoleSelection";
import { DashboardSkeleton as CommonDashboardSkeleton } from "@/components/common/SkeletonLoader";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { customToast } from "@/components/ui/enhanced-toast";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function DashboardPage() {
  const { profile, loading, updateUserType, refreshProfile } = useAuth();
  const { user } = useUser();
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const handleRoleSelection = async (role: 'instructor' | 'learner') => {
    try {
      setIsUpdatingRole(true);
      
      await updateUserType(role);
      
      // Force refresh the profile to get updated data
      if (refreshProfile) {
        await refreshProfile();
      }
      
      customToast.authSuccess(`You're now set up as a ${role}`);
    } catch (error) {
      console.error('Error updating user type:', error);
      customToast.authError('Failed to update your role. Please try again or contact support if the issue persists.');
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
    return <CommonDashboardSkeleton />;
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
    return (
      <ErrorBoundary>
        <RoleSelection 
          onSelectRole={handleRoleSelection}
          loading={isUpdatingRole}
        />
      </ErrorBoundary>
    );
  }

  // Route to appropriate dashboard based on user role from UserContext
  if (user.role === 'instructor') {
    return (
      <ErrorBoundary>
        <InstructorDashboard />
      </ErrorBoundary>
    );
  } else if (user.role === 'learner') {
    return (
      <ErrorBoundary>
        <LearnerDashboard />
      </ErrorBoundary>
    );
  } else {
    // Fallback - show role selection if user_type is unexpected
    return (
      <ErrorBoundary>
        <RoleSelection 
          onSelectRole={handleRoleSelection}
          loading={isUpdatingRole}
        />
      </ErrorBoundary>
    );
  }
}
