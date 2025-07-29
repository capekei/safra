import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// In development mode, if Supabase vars are not configured, use mock client
const isDev = import.meta.env.NODE_ENV === 'development' || import.meta.env.DEV;

if (!supabaseUrl || !supabaseAnonKey) {
  if (isDev) {
    console.warn('⚠️ SafraReport: Variables de Supabase no configuradas. Usando modo desarrollo sin autenticación.');
  } else {
    throw new Error('Faltan variables de entorno de Supabase');
  }
}

// Create mock Supabase client for development when vars are missing
const createMockSupabaseClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Mock auth - no authentication available in development mode' } }),
    signInWithOAuth: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Mock auth - no authentication available in development mode' } }),
    signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Mock auth - no authentication available in development mode' } }),
    signOut: () => Promise.resolve({ error: null }),
    resetPasswordForEmail: () => Promise.resolve({ data: {}, error: null })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Mock database - no data available in development mode' } })
      })
    })
  })
});

export const supabase = (!supabaseUrl || !supabaseAnonKey) && isDev 
  ? createMockSupabaseClient() as any
  : createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
  last_sign_in?: string;
  is_active: boolean;
}

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  // Get additional user data from our database
  const { data: userData, error: dbError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (dbError || !userData) return null;
  return userData as User;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      }
    }
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error };
};

export const updatePassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({
    password
  });
  return { error };
};

export const signInWithOAuth = async (provider: 'google' | 'facebook' | 'twitter' | 'github') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
};