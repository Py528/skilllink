"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from './authUtils';

interface User {
  id: string;
  name: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // This would typically be a call to your auth API to check session
        // For now, we'll just check localStorage
        const storedUser = localStorage.getItem('skilllink_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      // In a real app, this would call your auth API
      const userData = await signInWithEmailAndPassword(email, password);
      
      setUser(userData);
      
      // Store user data if remember me is checked
      if (rememberMe) {
        localStorage.setItem('skilllink_user', JSON.stringify(userData));
      } else {
        // Use sessionStorage if remember me is not checked
        sessionStorage.setItem('skilllink_user', JSON.stringify(userData));
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // In a real app, this would call your auth API
      const userData = await createUserWithEmailAndPassword(name, email, password);
      
      setUser(userData);
      
      // Store user data
      localStorage.setItem('skilllink_user', JSON.stringify(userData));
      
      // Redirect to dashboard
      router.push('/dashboard');
      
      return userData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear user data
    setUser(null);
    localStorage.removeItem('skilllink_user');
    sessionStorage.removeItem('skilllink_user');
    
    // Redirect to home
    router.push('/');
  };

  const loginWithGithub = async () => {
    try {
      // In a real app, this would redirect to GitHub OAuth
      // For demo purposes, we'll just create a mock user
      const mockGithubUser = {
        id: 'github-123456',
        name: 'GitHub User',
        email: 'github@example.com',
      };
      
      setUser(mockGithubUser);
      localStorage.setItem('skilllink_user', JSON.stringify(mockGithubUser));
      
      // Redirect to dashboard
      router.push('/dashboard');
      
      return mockGithubUser;
    } catch (error) {
      console.error('GitHub login error:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    loginWithGithub
  };
}