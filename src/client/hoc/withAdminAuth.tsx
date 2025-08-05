// Higher-order component for admin authentication
import React from 'react';
import { Redirect } from 'wouter';

interface WithAdminAuthProps {
  // Add any props that might be passed to wrapped components
}

export function withAdminAuth<T extends WithAdminAuthProps>(
  WrappedComponent: React.ComponentType<T>
) {
  return function AdminProtectedComponent(props: T) {
    // Placeholder authentication check
    // This will be replaced with proper JWT auth validation
    const isAuthenticated = true; // Temporary - allow access for now
    
    if (!isAuthenticated) {
      return <Redirect to="/login" />;
    }
    
    return <WrappedComponent {...props} />;
  };
}

export default withAdminAuth;