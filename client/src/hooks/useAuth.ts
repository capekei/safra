import { useSupabaseAuth } from './useSupabaseAuth';

// Re-export Supabase auth with the same interface for backward compatibility
export function useAuth() {
  const {
    user,
    loading: isLoading,
    error,
    isAuthenticated,
    isAdmin,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    signInWithOAuth,
  } = useSupabaseAuth();

  // Transform user object for backward compatibility
  const transformedUser = user ? {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    profileImageUrl: user.profile_image_url,
    role: user.role,
    createdAt: user.created_at,
  } : null;

  return {
    user: transformedUser,
    isLoading,
    isAuthenticated,
    isError: !!error,
    isAdmin,
    error,
    // Auth methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    signInWithOAuth,
  };
}
