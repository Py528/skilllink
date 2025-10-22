'use client';

import { toast } from 'sonner';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const enhancedToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      action: options?.action,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    return toast.warning(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    return toast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, {
      description: options?.description,
      duration: options?.duration || 0,
    });
  },

  dismiss: (toastId?: string | number) => {
    return toast.dismiss(toastId);
  },
};

export const customToast = {
  courseCreated: (courseName: string) => {
    return enhancedToast.success('Course Created!', {
      title: 'Success',
      description: `"${courseName}" has been created successfully.`,
      duration: 5000,
    });
  },

  courseUpdated: (courseName: string) => {
    return enhancedToast.success('Course Updated!', {
      title: 'Success',
      description: `"${courseName}" has been updated successfully.`,
      duration: 4000,
    });
  },

  courseDeleted: (courseName: string) => {
    return enhancedToast.success('Course Deleted', {
      title: 'Success',
      description: `"${courseName}" has been deleted.`,
      duration: 3000,
    });
  },

  videoUploaded: (fileName: string) => {
    return enhancedToast.success('Video Uploaded!', {
      title: 'Success',
      description: `"${fileName}" has been uploaded successfully.`,
      duration: 4000,
    });
  },

  videoProcessing: (fileName: string) => {
    return enhancedToast.loading('Processing Video...', {
      title: 'Processing',
      description: `"${fileName}" is being processed. This may take a few minutes.`,
    });
  },

  videoProcessed: (fileName: string) => {
    return enhancedToast.success('Video Ready!', {
      title: 'Processing Complete',
      description: `"${fileName}" is now ready for viewing.`,
      duration: 4000,
    });
  },

  enrollmentSuccess: (courseName: string) => {
    return enhancedToast.success('Enrolled Successfully!', {
      title: 'Welcome to the Course',
      description: `You've been enrolled in "${courseName}". Start learning now!`,
      duration: 5000,
      action: {
        label: 'Start Learning',
        onClick: () => {
          window.location.href = '/dashboard';
        },
      },
    });
  },

  progressSaved: (progress: number) => {
    return enhancedToast.success('Progress Saved!', {
      title: 'Progress Updated',
      description: `Your progress has been saved (${progress}% complete).`,
      duration: 3000,
    });
  },

  achievementUnlocked: (achievement: string) => {
    return enhancedToast.success('Achievement Unlocked!', {
      title: '🎉 Congratulations!',
      description: `You've unlocked: "${achievement}"`,
      duration: 6000,
    });
  },

  networkError: () => {
    return enhancedToast.error('Connection Error', {
      title: 'Network Issue',
      description: 'Please check your internet connection and try again.',
      duration: 5000,
      action: {
        label: 'Retry',
        onClick: () => {
          window.location.reload();
        },
      },
    });
  },

  authError: (message: string) => {
    return enhancedToast.error('Authentication Error', {
      title: 'Login Failed',
      description: message,
      duration: 5000,
    });
  },

  authSuccess: (userName: string) => {
    return enhancedToast.success('Welcome Back!', {
      title: 'Login Successful',
      description: `Welcome back, ${userName}!`,
      duration: 3000,
    });
  },
};

export const useToast = () => {
  return {
    success: enhancedToast.success,
    error: enhancedToast.error,
    warning: enhancedToast.warning,
    info: enhancedToast.info,
    loading: enhancedToast.loading,
    custom: customToast,
  };
};

export default enhancedToast;
