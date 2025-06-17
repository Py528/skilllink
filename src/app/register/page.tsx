"use client";

import { useSearchParams } from 'next/navigation';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ParticleBackground } from '@/components/hero/ParticleBackground';

function getErrorMessage(error: string) {
  switch (error) {
    case 'OAuthSignin':
      return 'Error occurred during OAuth sign-in.';
    case 'OAuthCallback':
      return 'Error occurred during OAuth callback.';
    case 'OAuthCreateAccount':
      return 'Could not create OAuth account.';
    case 'EmailCreateAccount':
      return 'Could not create email account.';
    case 'Callback':
      return 'Error occurred during callback.';
    case 'Default':
    default:
      return 'An error occurred during sign up.';
  }
}

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const urlError = searchParams?.get('error');

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col relative overflow-y-auto">
      {/* Fixed position background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticleBackground />
        <div
          className="absolute inset-0 z-10 pointer-events-none mix-blend-screen"
          style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, #0a0a0a 90%)`,
          }}
        />
      </div>

      {/* Scrollable content */}
      <main className="relative z-20 flex-grow flex items-center justify-center px-4 py-12">
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