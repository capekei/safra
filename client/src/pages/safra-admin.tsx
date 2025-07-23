import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/seo";
import { Shield, Loader2, Lock, User } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function SafraAdmin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (data.success) {
        // Store admin authentication
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Also set mockAuth for compatibility
        localStorage.setItem('mockAuth', JSON.stringify({ user: data.user }));

        toast({
          title: "Acceso concedido",
          description: "Bienvenido al panel de administración",
        });

        // Redirect to admin dashboard
        setTimeout(() => {
          setLocation(data.redirectUrl || '/admin/dashboard');
        }, 500);
      } else {
        toast({
          title: "Error de autenticación",
          description: data.message || "Credenciales inválidas",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Error",
        description: "Error al conectar con el servidor",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <SEO 
        title="Acceso Administrativo - SafraReport"
        description="Portal de acceso para administradores de SafraReport"
      />
      
      <div className="w-full max-w-sm">
        <div className="space-y-8">
          {/* Minimalist Logo */}
          <div className="text-center space-y-6">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-xl font-light text-gray-900">SafraReport Admin</h1>
              <p className="mt-1 text-sm text-gray-500">
                Ingresa tus credenciales
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div className="space-y-1">
              <Label htmlFor="username" className="text-sm font-normal text-gray-700">
                Usuario
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                required
                className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-gray-400 transition-colors"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm font-normal text-gray-700">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
                className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-gray-400 transition-colors"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-normal transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verificando...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </div>
          </form>

          {/* Footer Information */}
          <div className="space-y-4">
            <p className="text-center text-xs text-gray-500">
              Acceso exclusivo para administradores autorizados
            </p>
            
            {/* Dev hint */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                <span className="font-medium">Dev:</span> admin / admin123
              </p>
            </div>
            
            <div className="text-center">
              <a 
                href="/" 
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Volver al inicio
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}