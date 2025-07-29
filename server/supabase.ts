import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create mock client for development mode
const createMockClient = () => ({
  auth: {
    signUp: () => Promise.resolve({ data: null, error: { message: 'Development mode' } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Development mode' } }),
    getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Development mode' } }),
    signOut: () => Promise.resolve({ error: null }),
    resetPasswordForEmail: () => Promise.resolve({ error: null }),
    exchangeCodeForSession: () => Promise.resolve({ data: null, error: { message: 'Development mode' } }),
    admin: {
      deleteUser: () => Promise.resolve({ error: null })
    }
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Development mode' } })
      })
    }),
    insert: () => Promise.resolve({ data: null, error: { message: 'Development mode' } }),
    update: () => Promise.resolve({ data: null, error: { message: 'Development mode' } })
  })
});

// Initialize clients based on environment
let supabaseClient: any;
let supabaseAdminClient: any;

if (!supabaseUrl || !supabaseKey) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Supabase variables not found, using development mode with mock client');
    supabaseClient = createMockClient();
    supabaseAdminClient = createMockClient();
  } else {
    throw new Error('Faltan variables de entorno de Supabase');
  }
} else {
  // Production Supabase clients
  supabaseClient = createClient(supabaseUrl, supabaseKey);
  supabaseAdminClient = supabaseServiceKey 
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    : null;
}

// Export the clients
export const supabase = supabaseClient;
export const supabaseAdmin = supabaseAdminClient;
export type TypedSupabaseClient = SupabaseClient;

// Database types for TypeScript
export interface DatabaseUser {
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

export interface Database {
  public: {
    Tables: {
      users: {
        Row: DatabaseUser;
        Insert: Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseUser, 'id' | 'created_at'>>;
      };
      profiles: {
        Row: {
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
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          profile_image_url?: string;
          role?: 'user' | 'admin';
          is_active?: boolean;
        };
        Update: {
          email?: string;
          first_name?: string;
          last_name?: string;
          profile_image_url?: string;
          role?: 'user' | 'admin';
          is_active?: boolean;
          last_sign_in?: string;
        };
      };
      storage_objects: {
        Row: {
          id: string;
          bucket_id: string;
          name: string;
          owner: string;
          created_at: string;
          updated_at: string;
          last_accessed_at: string;
          metadata: Record<string, any>;
        };
        Insert: {
          id?: string;
          bucket_id: string;
          name: string;
          owner?: string;
          metadata?: Record<string, any>;
        };
        Update: {
          name?: string;
          owner?: string;
          metadata?: Record<string, any>;
        };
      };
    };
  };
}
