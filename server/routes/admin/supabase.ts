/**
 * Supabase client and types for admin routes
 */

import { supabase, supabaseAdmin, DatabaseUser, TypedSupabaseClient } from '../../supabase';

// Re-export for admin routes
export { supabase, supabaseAdmin, DatabaseUser, TypedSupabaseClient };

/**
 * Admin-specific database operations
 */
export class AdminSupabaseClient {
  static async getUserById(id: string): Promise<DatabaseUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    return data;
  }

  static async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user role:', error);
      return false;
    }
    
    return true;
  }

  static async deactivateUser(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', userId);
    
    if (error) {
      console.error('Error deactivating user:', error);
      return false;
    }
    
    return true;
  }
}
