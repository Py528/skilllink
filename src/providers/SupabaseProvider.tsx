import { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient, Session, User } from '@supabase/supabase-js';

interface SupabaseContextType {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize the client so it's not recreated on every render
  const supabase = useMemo(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    try {
      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      return client;
    } catch (error) {
      throw error;
    }
  }, []);

  useEffect(() => {
    // Add a timeout to prevent infinite hanging
    const timeout = setTimeout(() => {
      setIsInitialized(true);
    }, 5000); // 5 seconds

    // Get current session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        clearTimeout(timeout);
        
        if (error) {
          setIsInitialized(true);
        }
        
        setSession(session ?? null);
        setUser(session?.user ?? null);
        setIsInitialized(true);
      })
      .catch((error) => {
        clearTimeout(timeout);
        setIsInitialized(true);
      });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session ?? null);
      setUser(session?.user ?? null);
    });

    return () => {
      clearTimeout(timeout);
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Don't render children until initialized to prevent hanging
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111111] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0CF2A0] mx-auto mb-4"></div>
          <p>Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <SupabaseContext.Provider value={{ supabase, session, user }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
} 