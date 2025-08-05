import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Newspaper, Eye, EyeOff, AlertCircle } from "lucide-react";
import { SEO } from "@/components/seo";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading, error, login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user has admin role
      const isAdmin = user.role === 'admin' || user.role === 'super_admin';
      if (isAdmin) {
        setLocation('/admin/dashboard');
      } else {
        setLocation('/cuenta/panel');
      }
    }
  }, [isAuthenticated, user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);

    try {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        setLoginError(result.error || 'Error al iniciar sesión');
      }
      // Success redirect is handled by useEffect
    } catch (error) {
      setLoginError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear errors when user starts typing
    if (loginError) setLoginError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SEO
        title="Iniciar Sesión - SafraReport"
        description="Acceso seguro para administradores de SafraReport. Inicia sesión con tu cuenta de administrador."
      />
      <Header />
      <main className="flex-grow flex items-center justify-center pt-28 pb-12">
        <div className="w-full lg:grid lg:max-w-5xl lg:grid-cols-2 xl:min-h-[600px]">
          <div className="flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Acceso para administradores de SafraReport
                </p>
              </div>

              {(loginError || error) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {loginError || error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="admin@safrareport.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Tu contraseña segura"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !formData.email || !formData.password}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-gray-500">
                <p>¿Problemas para acceder?</p>
                <p>Contacta al administrador del sistema</p>
              </div>
            </div>
          </div>
          <div className="hidden bg-muted lg:flex items-center justify-center p-12 relative overflow-hidden rounded-r-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
            <div className="relative z-10 text-center">
              <Newspaper className="h-24 w-24 mx-auto text-green-600" />
              <h2 className="mt-6 text-4xl font-bold text-gray-800">SafraReport</h2>
              <p className="mt-4 text-lg text-gray-600">
                Tu fuente de noticias confiable de la República Dominicana.
              </p>
              <div className="mt-6 space-y-2 text-sm text-gray-500">
                <p>✓ Autenticación segura con bcrypt</p>
                <p>✓ Sesiones protegidas con JWT</p>
                <p>✓ Acceso administrativo controlado</p>
              </div>
            </div>
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-green-500/20 rounded-full blur-3xl opacity-80" />
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-green-500/20 rounded-full blur-3xl opacity-80" />
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}