import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";
import { User, LogIn, LogOut, Mail, Calendar, Shield, LayoutDashboard, FileText, Star, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Cuenta() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // User is not logged in, no need to redirect
    }
  }, [isAuthenticated, isLoading]);

  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleLogout = async () => {
    try {
      // Clear mock auth first
      localStorage.removeItem('mockAuth');
      
      // Try to logout from the server session
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Always redirect to home after logout attempt
      window.location.href = '/';
    } catch (error) {
      console.log('Logout error (redirecting anyway):', error);
      // Even if there's an error, redirect to home
      window.location.href = '/';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
          <GlassCard className="p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </GlassCard>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Mi Cuenta - SafraReport"
        description="Gestiona tu cuenta de usuario en SafraReport"
      />
      <Header />
      
      <main className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
        {!isAuthenticated ? (
          // Not logged in state
          <GlassCard className="p-8 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mi Cuenta</h1>
                <p className="mt-2 text-gray-600">
                  Inicia sesión para ver tu perfil y gestionar tu cuenta
                </p>
              </div>

              <Button
                onClick={handleLogin}
                className="w-full py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
              >
                <LogIn className="h-5 w-5" />
                Iniciar Sesión
              </Button>

              <p className="text-sm text-gray-500">
                Al iniciar sesión podrás acceder a funciones personalizadas
              </p>
            </div>
          </GlassCard>
        ) : (
          // Logged in state
          <div className="space-y-6">
            <GlassCard className="p-8">
              <div className="flex items-start gap-6">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : 'Mi Cuenta'}
                  </h1>
                  
                  <div className="mt-4 space-y-2 text-gray-600">
                    {user?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                    )}
                    
                    {user?.createdAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Miembro desde {new Date(user.createdAt).toLocaleDateString('es-DO')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Admin Access - Only show if user has admin privileges */}
            {user?.role === 'admin' && (
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Panel de Administración</h3>
                      <p className="text-sm text-gray-600">Acceso exclusivo para administradores</p>
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        // Auto-login admin user since they already have access
                        const response = await fetch('/api/auth/admin', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            username: 'admin',
                            password: 'admin123'
                          }),
                        });

                        const data = await response.json();
                        if (data.success) {
                          localStorage.setItem('adminToken', data.token);
                          localStorage.setItem('adminUser', JSON.stringify(data.user));
                          window.location.href = '/admin/dashboard';
                        } else {
                          alert('Error de acceso al panel administrativo');
                        }
                      } catch (error) {
                        console.error('Error:', error);
                        alert('Error de conexión');
                      }
                    }}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Acceder
                  </Button>
                </div>
              </GlassCard>
            )}

            {/* User Actions */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mi Contenido</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  onClick={() => window.location.href = '/cuenta/panel'}
                  variant="outline"
                  className="justify-start gap-3"
                >
                  <User className="h-4 w-4" />
                  Mi Panel de Control
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/clasificados/nuevo'}
                  variant="outline"
                  className="justify-start gap-3"
                >
                  <LogIn className="h-4 w-4" />
                  Publicar Clasificado
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/resenas/nueva'}
                  variant="outline"
                  className="justify-start gap-3"
                >
                  <LogIn className="h-4 w-4" />
                  Escribir Reseña
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/cuenta/preferencias'}
                  variant="outline"
                  className="justify-start gap-3"
                >
                  <LogIn className="h-4 w-4" />
                  Personalizar Noticias
                </Button>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Opciones de Cuenta</h2>
              
              <div className="space-y-4">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-start gap-3 text-gray-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>
            </GlassCard>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}