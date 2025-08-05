import { Link, useLocation } from "wouter";
import { Home, Tag, Star, Search, User, Shield } from "lucide-react";
import { ROUTES } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

export function MobileBottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    {
      icon: Home,
      label: "Inicio",
      href: ROUTES.HOME,
      isActive: location === ROUTES.HOME,
    },
    {
      icon: Search,
      label: "Buscar",
      href: "/buscar",
      isActive: location.startsWith("/buscar"),
    },
    {
      icon: Tag,
      label: "Clasificados",
      href: "/clasificados",
      isActive: location.startsWith("/clasificados"),
    },
    {
      icon: Star,
      label: "Reseñas",
      href: "/resenas",
      isActive: location.startsWith("/resenas"),
    },
    {
      icon: User,
      label: "Perfil",
      href: ROUTES.ACCOUNT,
      isActive: location.startsWith(ROUTES.ACCOUNT),
    },
  ];

  if (user && user.role === 'admin') {
    navItems.push({
      icon: Shield,
      label: "Admin",
      href: ROUTES.ADMIN,
      isActive: location.startsWith(ROUTES.ADMIN),
    });
  }

  return (
    <nav className="mobile-nav fixed bottom-4 left-4 right-4 glass-effect p-2 z-40">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <button 
                className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-lg transition-colors ${
                  item.isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-500 hover:text-primary'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
