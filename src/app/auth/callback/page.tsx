"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);
  const [processed, setProcessed] = useState(false);

  const log = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    if (processed) return;

    const handleAuth = async () => {
      setProcessed(true);
      try {
        log('🔄 Starting authentication callback...');
        
        // Try to get the session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session) {
          log('✅ Session found, redirecting...');
          router.push('/dashboard');
          return;
        }

        // If no session, try to handle the URL parameters
        const params = new URLSearchParams(window.location.search);
        const hash = new URLSearchParams(window.location.hash.replace('#', '?'));
        
        // Check for error first
        const error = params.get('error') || hash.get('error');
        if (error) {
          log(`❌ Authentication error: ${error}`);
            router.push(`/login?error=${error}`);
          return;
        }
        
        // Try code exchange
        const code = params.get('code');
        if (code) {
          log('🔄 Found authorization code, exchanging...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            throw exchangeError;
          }
          
          if (data.session) {
            log('✅ Code exchange successful');
            router.push('/dashboard');
            return;
          }
        }

        // Try access token from hash
        const accessToken = hash.get('access_token');
        if (accessToken) {
          log('🔄 Found access token, setting session...');
          const { error: tokenError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hash.get('refresh_token') || '',
          });
            
          if (tokenError) {
            throw tokenError;
          }

          log('✅ Session set successfully');
          router.push('/dashboard');
          return;
        }

        // If we get here, no valid auth data was found
        log('❌ No valid authentication data found');
        router.push('/login?error=no_auth_data');
        
      } catch (error) {
        log(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          router.push('/login?error=callback_failed');
      }
    };

    handleAuth();
  }, [router, processed]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
      <div className="p-6 max-w-sm w-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
            Processing Login...
          </h2>
          <div className="space-y-2">
            {logs.map((log, i) => (
              <p key={i} className="text-sm text-secondary-600 dark:text-secondary-400">
                {log}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}