import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
  Newspaper,
  Users,
  FileText,
  Star,
  ShieldCheck,
  BarChart3,
  LogOut,
  Menu,
  X,
  Home,
  Database,
  History,
  Target,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  // Determine base path for admin routes (dev-admin in development, admin in production)
  const basePath = (import.meta.env.DEV && location.startsWith('/dev-admin')) ? '/dev-admin' : '/admin';

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: `${basePath}/dashboard`,
    },
    {
      title: "Artículos",
      icon: Newspaper,
      href: `${basePath}/articles`,
    },
    {
      title: "Autores",
      icon: Users,
      href: `${basePath}/authors`,
    },
    {
      title: "Clasificados",
      icon: FileText,
      href: `${basePath}/classifieds`,
    },
    {
      title: "Reseñas",
      icon: Star,
      href: `${basePath}/reviews`,
    },
    {
      title: "Anuncios",
      icon: Target,
      href: `${basePath}/ads`,
    },
    {
      title: "Moderación",
      icon: ShieldCheck,
      href: `${basePath}/moderation`,
    },
    {
      title: "Usuarios",
      icon: Users,
      href: `${basePath}/users`,
      roleRequired: "admin",
    },
    {
      title: "Base de Datos",
      icon: Database,
      href: `${basePath}/database`,
      roleRequired: "admin",
    },
    {
      title: "Registros",
      icon: History,
      href: `${basePath}/audit`,
      roleRequired: "admin",
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roleRequired || user?.role === item.roleRequired
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="glass"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-full transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <GlassCard className="h-full rounded-none border-r">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">SafraReport</h1>
            <p className="text-sm text-gray-600 mt-1">Panel de Control</p>
          </div>

          <nav className="px-4 pb-4">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 cursor-pointer ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            {user && (
              <div className="flex items-center gap-3 mb-4 px-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profileImageUrl} />
                  <AvatarFallback>{user?.firstName?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </GlassCard>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminLayout;