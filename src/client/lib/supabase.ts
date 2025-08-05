// Supabase client placeholder - migration to JWT auth in progress
import { createClient } from '@supabase/supabase-js';

// Placeholder Supabase client for backward compatibility
// This will be replaced with direct JWT authentication
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Placeholder auth methods for compatibility
export const auth = {
  signInWithPassword: async () => ({ data: null, error: new Error('Migrating to JWT auth') }),
  signUp: async () => ({ data: null, error: new Error('Migrating to JWT auth') }),
  signOut: async () => ({ error: new Error('Migrating to JWT auth') }),
  getSession: async () => ({ data: { session: null }, error: null }),
};