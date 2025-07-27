import { useState, useEffect } from 'react';
import { supabase, User } from '@/lib/supabase';
import { AuthError } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}

export function useSupabaseAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setAuthState({ user: null, loading: false, error });
        return;
      }

      if (session?.user) {
        // Get user profile from database
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (dbError) {
          console.error('Error fetching user profile:', dbError);
          setAuthState({ user: null, loading: false, error: null });
          return;
        }

        setAuthState({ user: userData, loading: false, error: null });
      } else {
        setAuthState({ user: null, loading: false, error: null });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Get user profile from database
          const { data: userData, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (dbError) {
            console.error('Error fetching user profile:', dbError);
            setAuthState({ user: null, loading: false, error: null });
            return;
          }

          setAuthState({ user: userData, loading: false, error: null });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({ user: null, loading: false, error: null });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Optionally refresh user data on token refresh
          const { data: userData, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!dbError && userData) {
            setAuthState(prev => ({ ...prev, user: userData }));
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthState(prev => ({ ...prev, loading: false, error }));
      return { data: null, error };
    }

    // User state will be updated by the auth state change listener
    return { data, error: null };
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (authError) {
      setAuthState(prev => ({ ...prev, loading: false, error: authError }));
      return { data: null, error: authError };
    }

    if (!authData.user) {
      const error = new Error('No se pudo crear el usuario') as AuthError;
      setAuthState(prev => ({ ...prev, loading: false, error }));
      return { data: null, error };
    }

    // The user profile will be created by the server-side trigger or API
    return { data: authData, error: null };
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      setAuthState(prev => ({ ...prev, loading: false, error }));
      return { error };
    }

    // User state will be updated by the auth state change listener
    return { error: null };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password
    });
    return { error };
  };

  const signInWithOAuth = async (provider: 'google' | 'facebook' | 'twitter' | 'github') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { data, error };
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    isAdmin: authState.user?.role === 'admin',
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    signInWithOAuth,
  };
}