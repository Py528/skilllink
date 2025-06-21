'use client';
import React from 'react';
import { SupabaseProvider } from './SupabaseProvider';
import { ThemeProvider } from '../context/ThemeContext';
import { UserProvider } from '../context/UserContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <SupabaseProvider>
      <ThemeProvider>
        <UserProvider>
          {children}
        </UserProvider>
      </ThemeProvider>
    </SupabaseProvider>
  );
}; 