import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast({
          title: "Acceso Denegado",
          description: "Debes iniciar sesión para acceder al panel de administración",
          variant: "destructive",
        });
        // Redirect to login with return URL
        window.location.href = `/api/login?returnTo=/admin/dashboard`;
      } else if (user?.role !== 'admin') {
        toast({
          title: "Sin Permisos",
          description: "No tienes permisos para acceder al panel de administración",
          variant: "destructive",
        });
        setLocation('/cuenta');
      }
    }
  }, [isAuthenticated, isLoading, user, setLocation, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}