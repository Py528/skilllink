'use client';
import React from 'react';
import { SupabaseProvider } from './SupabaseProvider';
import { ThemeProvider } from '../context/ThemeContext';
import { UserProvider } from '../context/UserContext';
import { AuthProvider } from './AuthProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <ThemeProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </ThemeProvider>
      </AuthProvider>
    </SupabaseProvider>
  );
}; 