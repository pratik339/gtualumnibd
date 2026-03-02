import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
        return;
      }
      
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    }
  };

  const clearBrokenAuthStorage = () => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;
    if (!projectId) return;

    const tokenKey = `sb-${projectId}-auth-token`;
    const lockKey = `lock:sb-${projectId}-auth-token`;

    // Clear stale lock that can block auth initialization
    localStorage.removeItem(lockKey);

    const rawToken = localStorage.getItem(tokenKey);
    if (!rawToken) return;

    try {
      const parsed = JSON.parse(rawToken);
      const refreshToken = parsed?.refresh_token;
      if (typeof refreshToken !== 'string' || refreshToken.length < 30) {
        localStorage.removeItem(tokenKey);
      }
    } catch {
      localStorage.removeItem(tokenKey);
    }
  };

  useEffect(() => {
    clearBrokenAuthStorage();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }

        if (event === 'SIGNED_OUT') {
          clearBrokenAuthStorage();
        }
      }
    );

    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Error restoring auth session:', error);
          clearBrokenAuthStorage();
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          checkAdminRole(session.user.id);
        }
      })
      .catch((error) => {
        console.error('Unexpected auth initialization error:', error);
        clearBrokenAuthStorage();
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
