import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { SupabaseLoginForm } from "@/components/auth/SupabaseLoginForm";
import { Newspaper } from "lucide-react";
import { SEO } from "@/components/seo";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-nav";

export default function Login() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        setLocation('/admin/dashboard');
      } else {
        setLocation('/cuenta/panel');
      }
    }
  }, [isAuthenticated, isAdmin, setLocation]);

  const handleLoginSuccess = () => {
    // Redirect will be handled by the useEffect above
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SEO
        title="Iniciar Sesión - SafraReport"
        description="Acceso seguro para usuarios de SafraReport. Inicia sesión o crea tu cuenta."
      />
      <Header />
      <main className="flex-grow flex items-center justify-center pt-28 pb-12">
        <div className="w-full lg:grid lg:max-w-5xl lg:grid-cols-2 xl:min-h-[600px]">
          <div className="flex items-center justify-center py-12 px-4">
            <SupabaseLoginForm onSuccess={handleLoginSuccess} />
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
                <p>✓ Autenticación segura con Supabase</p>
                <p>✓ Acceso social con Google, Facebook y más</p>
                <p>✓ Protección de datos garantizada</p>
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