'use client';
import React from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { UserProvider } from '../context/UserContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </ThemeProvider>
  );
}; 