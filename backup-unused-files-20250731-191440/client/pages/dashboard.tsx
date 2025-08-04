import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Star, 
  Calendar, 
  MapPin, 
  Eye, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ErrorBoundary } from "react-error-boundary";

// User Classified interface
interface UserClassified {
  id: number;
  title: string;
  description: string;
  price?: number;
  currency: string;
  images: string[];
  contactName: string;
  contactPhone: string;
  municipality?: string;
  province?: {
    id: number;
    name: string;
    code: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    icon: string;
  };
  createdAt: string;
  expiresAt: string;
  featured: boolean;
  active: boolean;
  status: string;
  views?: number;
}

// User Review interface
interface UserReview {
  id: number;
  businessId: number;
  rating: number;
  title?: string;
  content: string;
  images: string[];
  helpful: number;
  approved: boolean;
  createdAt: string;
  business: {
    id: number;
    name: string;
    slug: string;
    category: {
      name: string;
      icon: string;
    };
  };
}

export default function UserDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "No autorizado",
        description: "Iniciando sesión...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch user classifieds
  const { data: classifieds = [], isLoading: classifiedsLoading } = useQuery<UserClassified[]>({
    queryKey: ['/api/user/classifieds'],
    enabled: isAuthenticated,
  });

  // Fetch user reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<UserReview[]>({
    queryKey: ['/api/user/reviews'],
    enabled: isAuthenticated,
  });

  // Delete classified mutation
  const deleteClassifiedMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/user/classifieds/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al eliminar');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/classifieds'] });
      toast({
        title: "Clasificado eliminado",
        description: "El anuncio ha sido eliminado exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el clasificado",
        variant: "destructive",
      });
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/user/reviews/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al eliminar');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/reviews'] });
      toast({
        title: "Reseña eliminada",
        description: "La reseña ha sido eliminada exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la reseña",
        variant: "destructive",
      });
    },
  });

  if (authLoading || classifiedsLoading || reviewsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
          <GlassCard className="p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </GlassCard>
        </main>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Aprobado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Mi Panel de Control - SafraReport" 
        description="Administra tus anuncios clasificados y reseñas en SafraReport"
      />
      <Header />
      
      <main className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Panel de Control</h1>
          <p className="text-gray-600">Administra tu contenido publicado en SafraReport</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clasificados</p>
                <p className="text-2xl font-bold text-gray-900">{classifieds.length}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reseñas</p>
                <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
              </div>
              <Star className="w-8 h-8 text-green-600" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vistas Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classifieds.reduce((acc: number, c: UserClassified) => acc + (c.views || 0), 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </GlassCard>
        </div>

        {/* Content Tabs */}
        <GlassCard className="p-6">
          <Tabs defaultValue="classifieds" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="classifieds">
                <FileText className="w-4 h-4 mr-2" />
                Mis Clasificados
              </TabsTrigger>
              <TabsTrigger value="reviews">
                <Star className="w-4 h-4 mr-2" />
                Mis Reseñas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="classifieds" className="mt-6">
              {classifieds.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No tienes clasificados publicados</p>
                  <Button onClick={() => window.location.href = '/clasificados/nuevo'}>
                    Publicar Clasificado
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {classifieds.map((classified: UserClassified) => (
                    <div key={classified.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {classified.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {classified.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(classified.createdAt), 'dd MMM yyyy', { locale: es })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {classified.municipality || 'Sin ubicación'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {classified.views || 0} vistas
                            </span>
                          </div>

                          <div className="mt-2">
                            {getStatusBadge(classified.status)}
                          </div>
                        </div>

                        <div className="ml-4 flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.href = `/clasificados/${classified.category.slug}/${classified.id}`}
                          >
                            Ver
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => deleteClassifiedMutation.mutate(classified.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No has escrito reseñas</p>
                  <Button onClick={() => window.location.href = '/resenas/nueva'}>
                    Escribir Reseña
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review: UserReview) => (
                    <div key={review.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {review.business.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-500 fill-yellow-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {review.rating}/5
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {review.content}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(review.createdAt), 'dd MMM yyyy', { locale: es })}
                            </span>
                          </div>

                          <div className="mt-2">
                            {getStatusBadge(review.approved ? 'approved' : 'pending')}
                          </div>
                        </div>

                        <div className="ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => deleteReviewMutation.mutate(review.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </GlassCard>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Button
            onClick={() => window.location.href = '/clasificados/nuevo'}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Nuevo Clasificado
          </Button>
          
          <Button
            onClick={() => window.location.href = '/resenas/nueva'}
            variant="outline"
          >
            <Star className="w-4 h-4 mr-2" />
            Escribir Reseña
          </Button>
          
          <Button
            onClick={() => window.location.href = '/cuenta/preferencias'}
            variant="outline"
          >
            Preferencias de Noticias
          </Button>
        </div>
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
}