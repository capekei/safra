import { ComponentType } from 'react';
import { useAuth } from '../hooks/useAuth';

export function withAdminAuth<P extends object>(Component: ComponentType<P>) {
  return function AdminAuthComponent(props: P) {
    const { user, isLoading } = useAuth();
    
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    if (!user || user.role !== 'admin') {
      return <div>Access Denied</div>;
    }
    
    return <Component {...props} />;
  };
}