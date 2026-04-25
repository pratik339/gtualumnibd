import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roleLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; user?: User | null; needsEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; user?: User | null; isAdmin?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TIMEOUT_MS = 20000;

const toAuthError = (error: unknown, fallback: string) => {
  return error instanceof Error ? error : new Error(fallback);
};

const withAuthTimeout = async <T,>(operation: Promise<T>, message: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), AUTH_TIMEOUT_MS);
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

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
  const [roleLoading, setRoleLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminRole = async (userId: string): Promise<boolean> => {
    setRoleLoading(true);
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
        return false;
      }
      
      const hasAdminRole = !!data;
      setIsAdmin(hasAdminRole);
      return hasAdminRole;
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
      return false;
    } finally {
      setRoleLoading(false);
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
          setRoleLoading(false);
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
          setRoleLoading(false);
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
        setRoleLoading(false);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    try {
      const { data, error } = await withAuthTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        }),
        'Sign up is taking too long. Please check your connection and try again.'
      );

      return {
        error,
        user: data.user,
        needsEmailConfirmation: !!data.user && !data.session,
      };
    } catch (error) {
      return { error: toAuthError(error, 'Unable to create account. Please try again.') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      clearBrokenAuthStorage();

      const { data, error } = await withAuthTimeout(
        supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        }),
        'Sign in is taking too long. Please check your connection and try again.'
      );

      if (error) {
        return { error };
      }

      setSession(data.session);
      setUser(data.user);
      const hasAdminRole = data.user ? await checkAdminRole(data.user.id) : false;

      return { error: null, user: data.user, isAdmin: hasAdminRole };
    } catch (error) {
      clearBrokenAuthStorage();
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setRoleLoading(false);
      return { error: toAuthError(error, 'Unable to sign in. Please try again.') };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setRoleLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, roleLoading, isAdmin, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
