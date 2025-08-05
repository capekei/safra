import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { MessageCircle, MapPin, Star, Phone, Plus, Mail, Globe } from "lucide-react";
import { BUSINESS_CATEGORIES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "react-error-boundary";

interface Business {
  id: number;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  images: string[];
  priceRange: number;
  averageRating: number;
  totalReviews: number;
  verified: boolean;
  active: boolean;
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
}

export default function Resenas() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  const resenasUrl = `/api/resenas?limit=20&offset=${page * 20}${activeCategory ? `&category=${activeCategory}` : ''}`;
  const { 
    data: businesses, 
    isLoading,
    error 
  } = useQuery<Business[]>({
    queryKey: [resenasUrl],
  });

  const handleCategoryChange = (categorySlug?: string) => {
    setActiveCategory(categorySlug);
    setPage(0);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleWhatsAppContact = (whatsapp: string, businessName: string) => {
    const message = encodeURIComponent(`Hola, me interesa obtener información sobre ${businessName}`);
    window.open(`https://wa.me/1${whatsapp}?text=${message}`, '_blank');
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-4 w-4 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  const renderPriceIndicator = (priceRange: number) => {
    const indicators = [];
    for (let i = 1; i <= 4; i++) {
      indicators.push(
        <span 
          key={i} 
          className={`text-sm ${i <= priceRange ? 'text-primary font-bold' : 'text-gray-300'}`}
        >
          $
        </span>
      );
    }
    return indicators;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Reseñas de Negocios</h1>
          <p className="text-gray-600">
            Descubre y evalúa los mejores negocios en República Dominicana
          </p>
        </div>

        {/* Category navigation */}
        <div className="mb-8">
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            <GlassCard 
              
              active={!activeCategory}
              className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap"
              onClick={() => handleCategoryChange()}
            >
              <div className="flex items-center space-x-1">
                <span>Todos</span>
              </div>
            </GlassCard>
            
            {BUSINESS_CATEGORIES.map((category) => (
              <GlassCard
                key={category.slug}
                variant="pill"
                active={activeCategory === category.slug}
                className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap"
                onClick={() => handleCategoryChange(category.slug)}
              >
                <div className="flex items-center space-x-1">
                  <i className={`fas ${category.icon}`}></i>
                  <span>{category.name}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Business grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[...Array(6)].map((_, i) => (
              <GlassCard key={i} className="h-96 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {businesses?.map((business: any) => (
              <GlassCard key={business.id} className="overflow-hidden">
                {/* Verified badge */}
                {business.verified && (
                  <div className="absolute top-2 left-2 z-10">
                    <GlassCard className="px-2 py-1 text-xs font-medium text-primary border border-primary/20 bg-primary/10">
                      ✓ Verificado
                    </GlassCard>
                  </div>
                )}

                {/* Business images */}
                {business.images && business.images.length > 0 ? (
                  <div className="relative h-48">
                    <img 
                      src={business.images[0]}
                      alt={business.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {business.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        +{business.images.length - 1}
                      </div>
                    )}
                    <div className="image-glass-overlay absolute inset-0"></div>
                  </div>
                ) : (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <i className={`fas ${business.category?.icon || 'fa-store'} text-4xl text-gray-400`}></i>
                  </div>
                )}
                
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <GlassCard className="px-2 py-1 text-xs font-medium text-gray-600">
                      {business.category?.name}
                    </GlassCard>
                    <div className="flex items-center space-x-1">
                      {renderPriceIndicator(business.priceRange)}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {business.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center space-x-1">
                      {renderStars(parseFloat(business.averageRating))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {parseFloat(business.averageRating).toFixed(1)} ({business.totalReviews} reseñas)
                    </span>
                  </div>
                  
                  {business.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {business.description}
                    </p>
                  )}

                  {/* Location */}
                  {(business.province || business.municipality || business.address) && (
                    <div className="flex items-center text-gray-500 text-xs mb-4">
                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {business.address || 
                         `${business.municipality ? business.municipality + ', ' : ''}${business.province?.name || ''}`}
                      </span>
                    </div>
                  )}
                  
                  {/* Contact options */}
                  <div className="flex flex-wrap gap-2">
                    {business.whatsapp && (
                      <Button
                        size="sm"
                        onClick={() => handleWhatsAppContact(business.whatsapp, business.name)}
                        className="whatsapp-green text-white hover:scale-105 transition-transform flex-1"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        WhatsApp
                      </Button>
                    )}
                    
                    {business.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.location.href = `tel:+1${business.phone}`;
                        }}
                        className="flex-1"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Llamar
                      </Button>
                    )}

                    {business.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.location.href = `mailto:${business.email}`;
                        }}
                        className="flex-1"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
                    )}

                    {business.website && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.open(business.website.startsWith('http') ? business.website : `https://${business.website}`, '_blank');
                        }}
                        className="flex-1"
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        Web
                      </Button>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {!isLoading && (!businesses || businesses.length === 0) && (
          <div className="text-center py-12">
            <GlassCard className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                No hay negocios disponibles
              </h2>
              <p className="text-gray-600 mb-6">
                {activeCategory 
                  ? `No hay negocios en la categoría seleccionada.`
                  : `Actualmente no hay negocios registrados.`
                }
              </p>
              <Button className="bg-primary text-gray-900 hover:bg-primary/90">
                Registrar negocio
              </Button>
            </GlassCard>
          </div>
        )}

        {/* Load more section */}
        {businesses && businesses.length > 0 && (
          <div className="text-center">
            <GlassCard variant="button">
              <Button 
                onClick={handleLoadMore}
                className="px-8 py-4 text-gray-700 font-semibold hover:bg-primary/10 hover:border-primary/20"
                variant="ghost"
              >
                <Plus className="h-4 w-4 mr-2" />
                Cargar más negocios
              </Button>
            </GlassCard>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
