"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';
import { ParticleBackground } from '@/components/hero/ParticleBackground';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');
  
  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'callback_failed':
        return 'Authentication callback failed. Please try signing in again.';
      case 'exchange_failed':
        return 'Failed to complete sign in. Please try again.';
      case 'access_denied':
        return 'Access was denied. Please try again.';
      case 'no_user_data':
        return 'No user data received. Please try signing in again.';
      case 'session_failed':
        return 'Session validation failed. Please try again.';
      case 'no_session':
        return 'No active session found. Please sign in again.';
      default:
        return errorCode ? `Authentication error: ${errorCode}` : '';
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col relative">
      {/* Particle background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <ParticleBackground />
        <div
          className="absolute inset-0 z-10 pointer-events-none mix-blend-screen"
          style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, #0a0a0a 90%)`,
          }}
        />
      </div>

      <main className="flex-grow flex items-center justify-center px-4 py-12 relative z-20">
        <div className="w-full max-w-md">
          {/* Error display */}
          {urlError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-6">
              <div className="text-sm text-red-700">
                {getErrorMessage(urlError)}
              </div>
            </div>
          )}
          <RegisterForm />
        </div>
      </main>
    </div>
  );
}