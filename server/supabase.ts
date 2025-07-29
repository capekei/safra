import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Supabase configuration - support both client and server env var names
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '❌ Missing Supabase configuration!\n' +
    'Required environment variables:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY\n' +
    '- SUPABASE_SERVICE_ROLE_KEY (for admin operations)\n' +
    'Check your render.yaml configuration.'
  );
}

// Initialize Supabase clients
const supabaseClient = createClient(supabaseUrl, supabaseKey);
const supabaseAdminClient = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

if (!supabaseAdminClient) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not configured - admin operations will be limited');
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
