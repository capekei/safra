import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { SEO } from "@/components/seo";
import { CategoryNav } from "@/components/news/category-nav";
import { HeroArticle } from "@/components/news/hero-article";
import { ArticleGrid } from "@/components/news/article-grid";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Plus, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MainSidebar } from "@/components/sidebar-cards";
import type { ArticleWithRelations } from "@/lib/types";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  // Fetch featured articles with deployment configuration
  const { data: featuredArticles, isLoading: isLoadingFeatured, error: featuredError } = useQuery<ArticleWithRelations[]>({
    queryKey: ["/api/articles/featured"],
    queryFn: () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
      const url = `${baseUrl}/api/articles/featured`;
      
      return fetch(url, {
        cache: 'no-store',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => {
        if (!res.ok) throw new Error(`Error al conectar: HTTP ${res.status}`);
        return res.json();
      });
    },
    retry: 3,
    retryDelay: 1000,
    enabled: true,
  });

  // Handle featured articles error
  useEffect(() => {
    if (featuredError) {
      console.error("Error al cargar artículos destacados:", featuredError);
      toast({
        title: "Error de conexión", 
        description: "No se pudieron cargar los artículos destacados. Verifica tu conexión a internet.",
        variant: "destructive",
      });
    }
  }, [featuredError, toast]);

  // Fetch regular articles with deployment-specific configuration
  const { 
    data: articles, 
    isLoading: isLoadingArticles,
    error: articlesError 
  } = useQuery<ArticleWithRelations[]>({
    queryKey: ['/api/articles', page, activeCategory],
    queryFn: () => {
      const articlesUrl = `/api/articles?limit=20&offset=${page * 20}${activeCategory ? `&category=${activeCategory}` : ''}`;
      // Use VITE_API_BASE_URL for deployment compatibility
      const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
      const fullUrl = `${baseUrl}${articlesUrl}`;

      console.log("🌐 Deploy fetch URL:", fullUrl);
      console.log("🔍 Environment check:", {
        mode: import.meta.env.MODE,
        baseUrl: baseUrl,
        apiUrl: import.meta.env.VITE_API_BASE_URL,
        location: window.location.origin
      });
      
      return fetch(fullUrl, {
        cache: 'no-store', // Prevent deployment caching issues
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(async res => {
        if (!res.ok) {
          const errorText = await res.text().catch(() => 'Unable to read error response');
          console.error("❌ API Error Response:", {
            status: res.status,
            statusText: res.statusText,
            url: fullUrl,
            body: errorText
          });
          throw new Error(`Error de base de datos en despliegue. Verifica secrets: HTTP ${res.status} - ${res.statusText}`);
        }
        return res.json();
      });
    },
    retry: 3,
    retryDelay: 1000,
    enabled: true,
  });

  // Handle articles error and success logging for deployment debugging
  useEffect(() => {
    if (articlesError) {
      console.error("❌ Error al cargar artículos:", articlesError);
      console.error("🌐 Current URL:", window.location.href);
      console.error("🔧 Environment:", import.meta.env.MODE);
      toast({
        title: "Error de conexión",
        description: "No se pudieron cargar los artículos. Verifica tu conexión a internet.", 
        variant: "destructive",
      });
    }
  }, [articlesError, toast]);

  useEffect(() => {
    if (articles && articles.length > 0) {
      console.log("✅ Deploy articles loaded:", articles.length, "articles");
      console.log("📰 First article:", articles[0]?.title);
      console.log("🌐 Base URL:", import.meta.env.VITE_API_BASE_URL || window.location.origin);
    }
  }, [articles]);



  const handleCategoryChange = (categorySlug?: string) => {
    setActiveCategory(categorySlug);
    setPage(0);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent('Hola, me interesa obtener más información sobre SafraReport');
    window.open(`https://wa.me/18090000000?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO />
      <Header />
      
      <main className="pt-32 pb-20 px-4 max-w-8xl mx-auto">
        {/* Category Navigation */}
        <CategoryNav 
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        <div className="flex gap-6">
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Hero Section - Featured Article */}
            {isLoadingFeatured ? (
              <div className="mb-12">
                <GlassCard className="h-96 animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </GlassCard>
              </div>
            ) : featuredArticles && featuredArticles.length > 0 ? (
              <HeroArticle article={featuredArticles[0]} />
            ) : (
              <div className="mb-12 text-center py-8">
                <p className="text-gray-500">No hay artículos destacados disponibles.</p>
              </div>
            )}

            {/* Articles Grid */}
            {isLoadingArticles ? (
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
            ) : articlesError ? (
              <div className="text-center py-12">
                <p className="text-red-500 text-lg">Error al cargar artículos</p>
                <p className="text-gray-600 mt-2">Por favor, verifica tu conexión a internet y recarga la página.</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-4"
                  variant="outline"
                >
                  Recargar página
                </Button>
              </div>
            ) : (
              <ArticleGrid articles={articles || []} />
            )}

            {/* Load More Section */}
            {articles && articles.length > 0 && (
              <div className="text-center">
                <GlassCard variant="button">
                  <Button 
                    onClick={handleLoadMore}
                    className="px-8 py-4 text-gray-700 font-semibold hover:bg-primary/10 hover:border-primary/20"
                    variant="ghost"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Cargar más noticias
                  </Button>
                </GlassCard>
              </div>
            )}
          </div>

          {/* Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block w-80 sticky top-32 h-fit">
            <MainSidebar />
          </aside>
        </div>
      </main>



      <Footer />
      <MobileBottomNav />
    </div>
  );
}
