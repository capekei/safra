import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan variables de entorno de Supabase');
}

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

// Typed Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>;

// Client for regular operations with proper typing
export const supabase: TypedSupabaseClient = createClient<Database>(supabaseUrl, supabaseKey);

// Admin client for service operations (user management, etc.)
export const supabaseAdmin: TypedSupabaseClient | null = supabaseServiceKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;