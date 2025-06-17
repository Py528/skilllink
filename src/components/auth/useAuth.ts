"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  user_type: 'instructor' | 'learner';
  onboarding_completed?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      setProfile(profile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    }
  }, []);

  useEffect(() => {
    // Check initial session
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          // Don't wait for profile fetch, do it in background
          fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, router]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data.user;
  };

  const register = async (name: string, email: string, password: string, userType: 'instructor' | 'learner' = 'learner') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          user_type: userType,
        }
      }
    });

    if (error) throw error;
    return data.user;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const loginWithGithub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: false,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) throw error;
    return data;
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: false,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) throw error;
    return data;
  };

  const updateUserType = async (userType: 'instructor' | 'learner') => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        user_type: userType,
        onboarding_completed: true 
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  return {
    user,
    profile,
    loading,
    error,
    login,
    register,
    logout,
    loginWithGithub,
    loginWithGoogle,
    updateUserType,
  };
}