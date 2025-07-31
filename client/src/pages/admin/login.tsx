import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/seo";
import { Shield, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(credentials.username, credentials.password);
      
      if (result.success) {
        toast({
          title: "Acceso concedido",
          description: "Bienvenido al panel de administración",
        });
        
        setTimeout(() => {
          setLocation('/admin/dashboard');
        }, 500);
      } else {
        toast({
          title: "Error de autenticación",
          description: result.error || "Credenciales inválidas",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al servidor",
        variant: "destructive"
      });
    }

    setLoading(false);
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