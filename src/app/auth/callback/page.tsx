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
        console.log('Auth callback: Starting authentication process...');
        console.log('Supabase client:', supabase);
        console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***exists***' : '***missing***');
        
        // Try to get the session first
        console.log('Auth callback: About to call getSession()...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Auth callback: getSession() completed');
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }
        
        if (session) {
          console.log('Auth callback: Session found, redirecting to dashboard...');
          router.push('/dashboard');
          return;
        }

        console.log('Auth callback: No session found, checking URL parameters...');

        // If no session, try to handle the URL parameters
        const params = new URLSearchParams(window.location.search);
        const hash = new URLSearchParams(window.location.hash.replace('#', '?'));
        
        // Check for error first
        const error = params.get('error') || hash.get('error');
        if (error) {
          console.error('Auth callback: Error in URL:', error);
          setError(error);
          return;
        }
        
        // Try code exchange
        const code = params.get('code');
        if (code) {
          console.log('Auth callback: Found code, attempting exchange...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Auth callback: Exchange error:', exchangeError);
            throw exchangeError;
          }
          
          if (data.session) {
            console.log('Auth callback: Session created, redirecting to dashboard...');
            router.push('/dashboard');
            return;
          }
        }

        // Try access token from hash
        const accessToken = hash.get('access_token');
        if (accessToken) {
          console.log('Auth callback: Found access token, setting session...');
          const { error: tokenError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hash.get('refresh_token') || '',
          });
            
          if (tokenError) {
            console.error('Auth callback: Token error:', tokenError);
            throw tokenError;
          }

          console.log('Auth callback: Session set, redirecting to dashboard...');
          router.push('/dashboard');
          return;
        }

        // If we get here, no valid auth data was found
        console.error('Auth callback: No valid authentication data found');
        setError('No valid authentication data found');
        
      } catch (error) {
        console.error('Auth callback: Unexpected error:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsProcessing(false);
      }
    };

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.error('Auth callback: Timeout reached');
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