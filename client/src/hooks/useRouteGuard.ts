import { useLocation } from "wouter";
import { useAuth } from "./useAuth";
import { isProtectedUserRoute, isProtectedAdminRoute } from "@/lib/routeUtils";
import { useEffect } from "react";

/**
 * Hook to handle route protection and redirects
 */
export function useRouteGuard() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Redirect unauthenticated users from protected routes
    if (isProtectedUserRoute(location) && !isAuthenticated) {
      setLocation('/login');
      return;
    }

    // Redirect non-admin users from admin routes
    if (isProtectedAdminRoute(location)) {
      if (!user) {
        setLocation('/admin/login');
        return;
      }
      
      if (user.role !== 'admin') {
        setLocation('/admin/login');
        return;
      }
    }

    // Redirect authenticated users away from login pages
    if (isAuthenticated && location === '/login') {
      setLocation('/cuenta/panel');
      return;
    }

    // Redirect authenticated admin away from admin login
    if (user?.role === 'admin' && location === '/admin/login') {
      setLocation('/admin/dashboard');
      return;
    }
  }, [location, user, isAuthenticated, isLoading, setLocation]);

  return {
    location,
    user,
    isAuthenticated,
    isLoading
  };
}