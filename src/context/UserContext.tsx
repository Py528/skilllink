'use client';
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

export type UserRole = "instructor" | "learner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEMO_AVATARS = {
  instructor: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  learner: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser, profile, logout: authLogout } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  // Load role from localStorage if present
  useEffect(() => {
    const storedRole = localStorage.getItem('demo_user_role') as UserRole | null;
    if (storedRole && user) {
      setUser({ ...user, role: storedRole });
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (authUser && profile) {
      setUser({
        id: authUser.id,
        name: profile.full_name || authUser.email || 'Anonymous',
        email: authUser.email || '',
        role: profile.user_type,
        avatar: DEMO_AVATARS[profile.user_type] || DEMO_AVATARS.learner,
      });
    } else {
      setUser(null);
    }
  }, [authUser, profile]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  // Add setRole for demo switching
  const setRole = (role: UserRole) => {
    setUser((prev) => prev ? { ...prev, role } : prev);
    localStorage.setItem('demo_user_role', role);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, setRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};