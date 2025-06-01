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
    // Prevent multiple executions
    if (processed) return;

    const handleAuth = async () => {
      setProcessed(true);
      log('🚀 Starting auth callback...');
      log(`📍 Current URL: ${window.location.href}`);
      
      try {
        // Check URL parameters (for authorization code flow)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        // Check URL hash (for implicit flow - current case)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        log(`🔍 URL Code: ${code ? 'EXISTS' : 'MISSING'}`);
        log(`🔍 URL Error: ${error || 'NONE'}`);
        log(`🔍 Hash Access Token: ${accessToken ? 'EXISTS' : 'MISSING'}`);
        
        if (error) {
          log(`❌ Auth error: ${error} - ${errorDescription}`);
          setTimeout(() => {
            router.push(`/login?error=${error}`);
          }, 2000);
          return;
        }
        
        // Handle authorization code flow
        if (code) {
          log('🔄 Using authorization code flow...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            log(`❌ Exchange error: ${exchangeError.message}`);
            setTimeout(() => {
              router.push('/login?error=exchange_failed');
            }, 2000);
            return;
          }
          
          if (!data.user) {
            log('❌ No user data received');
            setTimeout(() => {
              router.push('/login?error=no_user_data');
            }, 2000);
            return;
          }
          
          log('✅ Code exchange successful!');
          log(`👤 User: ${data.user.email}`);
          log(`🆔 User ID: ${data.user.id}`);
        }
        // Handle implicit flow (current case)
        else if (accessToken) {
          log('🔄 Using implicit flow with existing tokens...');
          
          // Supabase should automatically handle the session from the URL hash
          // Let's check if we have a session
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            log(`❌ Session error: ${sessionError.message}`);
            setTimeout(() => {
              router.push('/login?error=session_failed');
            }, 2000);
            return;
          }
          
          if (!sessionData.session || !sessionData.session.user) {
            log('❌ No active session found, trying to set session from hash...');
            
            // Try to get session from URL (Supabase should handle this automatically)
            const { data: hashSessionData, error: hashSessionError } = await supabase.auth.getSession();
            
            if (hashSessionError || !hashSessionData.session) {
              log(`❌ Failed to create session from hash: ${hashSessionError?.message || 'No session'}`);
              setTimeout(() => {
                router.push('/login?error=session_creation_failed');
              }, 2000);
              return;
            }
          }
          
          const currentSession = sessionData.session;
          log('✅ Session validated successfully!');
          log(`👤 User: ${currentSession.user.email}`);
          log(`🆔 User ID: ${currentSession.user.id}`);
        }
        else {
          log('❌ No auth code or access token found');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }
        
        // Get the current session to work with
        const { data: finalSession } = await supabase.auth.getSession();
        const user = finalSession.session?.user;
        
        if (!user) {
          log('❌ No user in final session');
          setTimeout(() => {
            router.push('/login?error=no_final_user');
          }, 2000);
          return;
        }
        
        // Optional: Create/update user profile here if needed
        try {
          // Check if profile exists, create if not
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create one
            log('📝 Creating user profile...');
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
                user_type: 'learner' // Default role
              });
            
            if (createError) {
              log(`⚠️ Profile creation warning: ${createError.message}`);
            } else {
              log('✅ Profile created successfully!');
            }
          } else if (profile) {
            log('✅ Profile already exists');
            
            // Update profile with latest info if needed
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                email: user.email,
                full_name: user.user_metadata?.full_name || profile.full_name,
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || profile.avatar_url,
              })
              .eq('id', user.id);
            
            if (updateError) {
              log(`⚠️ Profile update warning: ${updateError.message}`);
            } else {
              log('✅ Profile updated successfully!');
            }
          }
        } catch (profileErr) {
          log(`⚠️ Profile handling warning: ${profileErr instanceof Error ? profileErr.message : 'Unknown error'}`);
          // Don't fail the auth flow for profile issues
        }
        
        log('🎯 Redirecting to dashboard...');
        
        // Notify opener and close the popup if it exists
        if (window.opener && window.opener !== window) {
          window.opener.postMessage('github-auth-success', window.origin);
          window.close();
          return;
        }

        // Clean the URL hash to remove tokens from browser history
        if (window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Clean redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
        
      } catch (err) {
        log(`❌ Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setTimeout(() => {
          router.push('/login?error=callback_failed');
        }, 2000);
      }
    };

    handleAuth();
  }, [router, processed]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full space-y-8 text-center p-8">
        <div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Completing Sign In...
          </h2>
          <p className="mt-2 text-gray-600">
            Please wait while we verify your authentication and set up your profile.
          </p>
        </div>
        
        {/* Real-time debug logs */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-sm mb-2">🔧 Debug Log:</h3>
          <div className="text-xs text-gray-600 font-mono">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-400">Initializing...</div>
            )}
          </div>
        </div>
        
        {/* Manual fallback */}
        <div className="mt-4">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Taking too long? Click here to go back to login
          </button>
        </div>
      </div>
    </div>
  );
}