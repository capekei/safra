import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { SEO } from "@/components/seo";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ProvinceSelector } from "@/components/location/province-selector";
import { ProvinceBadge } from "@/components/location/province-selector";
import { MessageCircle, MapPin, Calendar, Phone, Plus } from "lucide-react";
import { CLASSIFIED_CATEGORIES } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "react-error-boundary";

interface Classified {
  id: number;
  title: string;
  description: string;
  price?: number;
  currency: string;
  images: string[];
  contactName: string;
  contactPhone: string;
  contactWhatsapp?: string;
  contactEmail?: string;
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
}

export default function Clasificados() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [selectedProvince, setSelectedProvince] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  const clasificadosUrl = `/api/clasificados?limit=20&offset=${page * 20}${activeCategory ? `&category=${activeCategory}` : ''}${selectedProvince ? `&province=${selectedProvince}` : ''}`;
  const { 
    data: classifieds, 
    isLoading,
    error 
  } = useQuery<Classified[]>({
    queryKey: [clasificadosUrl],
  });

  const handleCategoryChange = (categorySlug?: string) => {
    setActiveCategory(categorySlug);
    setPage(0);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleWhatsAppContact = (phone: string, title: string) => {
    const message = encodeURIComponent(`Hola, me interesa tu anuncio: ${title}`);
    window.open(`https://wa.me/1${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Clasificados - SafraReport"
        description="Encuentra y publica anuncios clasificados en República Dominicana. Vehículos, inmuebles, empleos y más."
      />
      <Header />
      
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Clasificados</h1>
          <p className="text-gray-600">
            Encuentra y publica anuncios clasificados en República Dominicana
          </p>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <ProvinceSelector
              value={selectedProvince}
              onChange={setSelectedProvince}
              placeholder="Todas las provincias"
            />
          </div>
        </div>

        {/* Category navigation */}
        <div className="mb-8">
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            <GlassCard 
              variant="pill" 
              active={!activeCategory}
              className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 whitespace-nowrap"
              onClick={() => handleCategoryChange()}
            >
              <div className="flex items-center space-x-1">
                <span>Todos</span>
              </div>
            </GlassCard>
            
            {CLASSIFIED_CATEGORIES.map((category) => (
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

        {/* Classifieds grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[...Array(6)].map((_, i) => (
              <GlassCard key={i} className="h-80 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {classifieds?.map((classified: any) => {
              const timeAgo = formatDistanceToNow(new Date(classified.createdAt), {
                addSuffix: true,
                locale: es
              });

              return (
                <GlassCard key={classified.id} variant="hover" className="overflow-hidden">
                  {/* Featured badge */}
                  {classified.featured && (
                    <div className="absolute top-2 left-2 z-10">
                      <GlassCard variant="pill" className="px-2 py-1 text-xs font-medium text-primary border border-primary/20">
                        Destacado
                      </GlassCard>
                    </div>
                  )}

                  {/* Images */}
                  {classified.images && classified.images.length > 0 ? (
                    <div className="relative h-48">
                      <img 
                        src={classified.images[0]}
                        alt={classified.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {classified.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                          +{classified.images.length - 1}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <i className={`fas ${classified.category?.icon || 'fa-image'} text-4xl text-gray-400`}></i>
                    </div>
                  )}
                  
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <GlassCard variant="pill" className="px-2 py-1 text-xs font-medium text-gray-600">
                        {classified.category?.name}
                      </GlassCard>
                      <span className="text-gray-400 text-xs flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {timeAgo}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {classified.title}
                    </h3>

                    {/* Price */}
                    {classified.price && (
                      <div className="text-xl font-bold text-primary mb-2">
                        {classified.currency === 'DOP' ? 'RD$ ' : '$ '}
                        {parseFloat(classified.price).toLocaleString()}
                      </div>
                    )}
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {classified.description}
                    </p>

                    {/* Location */}
                    {(classified.province || classified.municipality) && (
                      <div className="flex items-center text-gray-500 text-xs mb-4">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>
                          {classified.municipality && `${classified.municipality}, `}
                          {classified.province?.name}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Contacto: {classified.contactName}
                      </span>
                      <div className="flex items-center space-x-2">
                        {classified.contactWhatsapp && (
                          <Button
                            size="sm"
                            onClick={() => handleWhatsAppContact(classified.contactWhatsapp, classified.title)}
                            className="whatsapp-green text-white hover:scale-105 transition-transform"
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            WhatsApp
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            window.location.href = `tel:+1${classified.contactPhone}`;
                          }}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Llamar
                        </Button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {!isLoading && (!classifieds || classifieds.length === 0) && (
          <div className="text-center py-12">
            <GlassCard className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                No hay clasificados disponibles
              </h2>
              <p className="text-gray-600 mb-6">
                {activeCategory 
                  ? `No hay anuncios en la categoría seleccionada.`
                  : `Actualmente no hay anuncios clasificados publicados.`
                }
              </p>
              <Button className="bg-primary text-gray-900 hover:bg-primary/90">
                Publicar anuncio
              </Button>
            </GlassCard>
          </div>
        )}

        {/* Load more section */}
        {classifieds && classifieds.length > 0 && (
          <div className="text-center">
            <GlassCard variant="button">
              <Button 
                onClick={handleLoadMore}
                className="px-8 py-4 text-gray-700 font-semibold hover:bg-primary/10 hover:border-primary/20"
                variant="ghost"
              >
                <Plus className="h-4 w-4 mr-2" />
                Cargar más clasificados
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
