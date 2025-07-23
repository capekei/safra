import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";
import { LogIn, Mail, Chrome, Loader2 } from "lucide-react";
import { FaFacebook, FaGoogle, FaApple } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const [loading, setLoading] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const handleSocialLogin = async (provider: string) => {
    setLoading(provider);
    
    try {
      // Generate demo user data based on provider
      const demoUsers = {
        google: {
          email: 'usuario.google@gmail.com',
          firstName: 'Usuario',
          lastName: 'Google',
          profileImageUrl: 'https://ui-avatars.com/api/?name=Usuario+Google&background=EA4335&color=fff'
        },
        facebook: {
          email: 'usuario.facebook@fb.com',
          firstName: 'Usuario',
          lastName: 'Facebook',
          profileImageUrl: 'https://ui-avatars.com/api/?name=Usuario+Facebook&background=1877F2&color=fff'
        },
        twitter: {
          email: 'usuario.x@twitter.com',
          firstName: 'Usuario',
          lastName: 'X',
          profileImageUrl: 'https://ui-avatars.com/api/?name=Usuario+X&background=000000&color=fff'
        },
        apple: {
          email: 'usuario.apple@icloud.com',
          firstName: 'Usuario',
          lastName: 'Apple',
          profileImageUrl: 'https://ui-avatars.com/api/?name=Usuario+Apple&background=000000&color=fff'
        },
        email: {
          email: 'usuario@safrareport.com',
          firstName: 'Usuario',
          lastName: 'SafraReport',
          profileImageUrl: 'https://ui-avatars.com/api/?name=Usuario+SafraReport&background=0D9B5C&color=fff'
        }
      };
      
      const userData = demoUsers[provider as keyof typeof demoUsers] || demoUsers.email;
      
      // Call unified auth API
      const response = await fetch('/api/auth/social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          ...userData,
          providerId: `${provider}_${Date.now()}`
        })
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Store auth data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Also set mockAuth for compatibility
        localStorage.setItem('mockAuth', JSON.stringify({ user: data.user }));
        
        // Show success message
        setTimeout(() => {
          setLocation(data.redirectUrl || '/cuenta/panel');
        }, 500);
      } else {
        throw new Error(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Error al iniciar sesión. Por favor, intente nuevamente.');
      setLoading(null);
    }
  };

  const socialProviders = [
    { id: 'google', name: 'Google', icon: FaGoogle, color: 'hover:bg-red-50 hover:border-red-200 hover:text-red-600' },
    { id: 'facebook', name: 'Facebook', icon: FaFacebook, color: 'hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600' },
    { id: 'twitter', name: 'X', icon: FaXTwitter, color: 'hover:bg-gray-100 hover:border-gray-300 hover:text-gray-900' },
    { id: 'apple', name: 'Apple', icon: FaApple, color: 'hover:bg-gray-100 hover:border-gray-300 hover:text-gray-900' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Iniciar Sesión - SafraReport"
        description="Accede a tu cuenta en SafraReport para gestionar tu perfil y contenido"
      />
      <Header />
      
      <main className="pt-32 pb-20 px-4 max-w-md mx-auto">
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <LogIn className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h1>
            <p className="mt-2 text-gray-600">
              Elige tu método preferido para acceder
            </p>
          </div>

          <div className="space-y-3">
            {socialProviders.map((provider) => {
              const Icon = provider.icon;
              return (
                <Button
                  key={provider.id}
                  onClick={() => handleSocialLogin(provider.id)}
                  disabled={loading !== null}
                  variant="outline"
                  className={`w-full py-6 text-base font-medium border-gray-200 text-gray-700 ${provider.color} transition-all duration-200 flex items-center justify-center gap-3`}
                >
                  {loading === provider.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                  Continuar con {provider.name}
                </Button>
              );
            })}
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o</span>
            </div>
          </div>

          <Button
            onClick={() => handleSocialLogin('email')}
            disabled={loading !== null}
            variant="outline"
            className="w-full py-6 text-base font-medium border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-3"
          >
            {loading === 'email' ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Mail className="h-5 w-5" />
            )}
            Continuar con Email
          </Button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Al continuar, aceptas nuestros términos de servicio y política de privacidad
          </p>
        </GlassCard>

        {/* Admin Access Hint */}
        <div className="mt-4 text-center space-y-2">
          <a 
            href="/safra-admin" 
            className="block text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            ¿Eres administrador?
          </a>
          <a 
            href="/admin-test" 
            className="block text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            (Test Admin Access)
          </a>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}