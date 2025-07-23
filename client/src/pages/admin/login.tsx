import { useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { LogIn, Shield } from "lucide-react";
import { SEO } from "@/components/seo";

export default function AdminLogin() {
  useEffect(() => {
    // Check if user is already logged in
    fetch("/api/auth/user")
      .then((res) => {
        if (res.ok) {
          window.location.href = "/admin/dashboard";
        }
      })
      .catch(() => {
        // User not logged in, stay on login page
      });
  }, []);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <SEO 
        title="Administración - SafraReport"
        description="Portal de administración de SafraReport"
      />
      
      <GlassCard className="w-full max-w-md p-8">
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="mt-2 text-gray-600">
              Inicia sesión para acceder al panel de control
            </p>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
          >
            <LogIn className="h-5 w-5" />
            Iniciar Sesión con Replit
          </Button>

          <p className="text-sm text-gray-500">
            Acceso exclusivo para administradores autorizados
          </p>
        </div>
      </GlassCard>
    </div>
  );
}