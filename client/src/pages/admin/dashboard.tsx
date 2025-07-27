import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Newspaper,
  FileText,
  Star,
  ShieldCheck,
  TrendingUp,
  Users,
  Calendar,
  Activity,
  Clock,
  MapPin,
  Eye,
  ThumbsUp,
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useApiClient } from "@/lib/api";
import { Progress } from "@/components/ui/progress";

interface DashboardStats {
  total: {
    articles: number;
    classifieds: number;
    businesses: number;
    reviews: number;
    pendingModeration: number;
  };
  today: {
    articles: number;
    classifieds: number;
    reviews: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const api = useApiClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.get("/admin/stats");
      setStats(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Artículos Totales",
      value: stats?.total.articles || 0,
      icon: Newspaper,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Clasificados Activos",
      value: stats?.total.classifieds || 0,
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Negocios",
      value: stats?.total.businesses || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Reseñas Aprobadas",
      value: stats?.total.reviews || 0,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Pendiente Moderación",
      value: stats?.total.pendingModeration || 0,
      icon: ShieldCheck,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const todayCards = [
    {
      label: "Artículos Hoy",
      value: stats?.today.articles || 0,
      icon: Calendar,
    },
    {
      label: "Clasificados Hoy",
      value: stats?.today.classifieds || 0,
      icon: TrendingUp,
    },
    {
      label: "Reseñas Hoy",
      value: stats?.today.reviews || 0,
      icon: Activity,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Resumen general de SafraReport CMS
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <GlassCard key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <>
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <GlassCard key={stat.title} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 rounded-lg ${stat.bgColor} ${stat.color}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {stat.value.toLocaleString()}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
                  </GlassCard>
                );
              })}
            </div>

            {/* Today's Activity */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Actividad de Hoy
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {todayCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.label}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <Icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {card.value}
                        </p>
                        <p className="text-sm text-gray-600">{card.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Acciones Rápidas
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <a
                  href="/admin/articles/new"
                  className="flex flex-col items-center gap-2 p-4 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <Newspaper className="h-6 w-6" />
                  <span className="text-sm font-medium">Nuevo Artículo</span>
                </a>
                <a
                  href="/admin/moderation"
                  className="flex flex-col items-center gap-2 p-4 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <ShieldCheck className="h-6 w-6" />
                  <span className="text-sm font-medium">Moderar</span>
                </a>
                <a
                  href="/admin/users"
                  className="flex flex-col items-center gap-2 p-4 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <Users className="h-6 w-6" />
                  <span className="text-sm font-medium">Usuarios</span>
                </a>
                <a
                  href="/admin/audit"
                  className="flex flex-col items-center gap-2 p-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Activity className="h-6 w-6" />
                  <span className="text-sm font-medium">Registros</span>
                </a>
              </div>
            </GlassCard>
          </>
        )}
      </div>
    </AdminLayout>
  );
}