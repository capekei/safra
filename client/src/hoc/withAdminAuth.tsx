import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'wouter';
import { useEffect } from 'react';

export function withAdminAuth<P extends object>(Component: React.ComponentType<P>) {
  return function WithAdminAuth(props: P) {
    const { user, isLoading } = useAuth();
    useEffect(() => {
      if (!isLoading && (!user || user.role !== 'admin')) {
        window.location.href = '/admin/login';
      }
    }, [user, isLoading]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!user || user.role !== 'admin') {
      return null;
    }

    return <Component {...props} />;
  };
}
