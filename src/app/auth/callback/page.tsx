"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabase } from '@/providers/SupabaseProvider';

export default function AuthCallback() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Try to get the session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (session) {
          router.push('/dashboard');
          return;
        }

        // If no session, try to handle the URL parameters
        const params = new URLSearchParams(window.location.search);
        const hash = new URLSearchParams(window.location.hash.replace('#', '?'));
        
        // Check for error first
        const error = params.get('error') || hash.get('error');
        if (error) {
          setError(error);
          return;
        }
        
        // Try code exchange
        const code = params.get('code');
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            throw exchangeError;
          }
          
          if (data.session) {
            router.push('/dashboard');
            return;
          }
        }

        // Try access token from hash
        const accessToken = hash.get('access_token');
        if (accessToken) {
          const { error: tokenError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hash.get('refresh_token') || '',
          });
            
          if (tokenError) {
            throw tokenError;
          }

          router.push('/dashboard');
          return;
        }

        // If we get here, no valid auth data was found
        setError('No valid authentication data found');
        
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsProcessing(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setError('Authentication timeout. Please try again.');
      setIsProcessing(false);
    }, 10000); // 10 seconds

    handleAuth();

    return () => clearTimeout(timeout);
  }, [router, supabase]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111111] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <Link href="/login" className="text-[#0CF2A0] hover:text-[#0CF2A0]/80 mt-4 inline-block">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#111111] text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing Login...</h1>
        <p className="text-gray-400">Please wait while we complete your authentication.</p>
        {isProcessing && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0CF2A0] mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}