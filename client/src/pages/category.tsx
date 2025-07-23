import { useParams } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { ArticleGrid } from "@/components/news/article-grid";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NEWS_CATEGORIES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export default function Category() {
  const { slug } = useParams();
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  const category = NEWS_CATEGORIES.find(cat => cat.slug === slug);

  const articlesUrl = `/api/articles?limit=20&offset=${page * 20}&category=${slug}`;
  const { 
    data: articles, 
    isLoading,
    error 
  } = useQuery({
    queryKey: [articlesUrl],
    enabled: !!slug,
  });

  const { data: categoryData } = useQuery({
    queryKey: [`/api/categories/${slug}`],
    enabled: !!slug,
  });

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
          <GlassCard className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Categoría no encontrada</h1>
            <p className="text-gray-600">La categoría que buscas no existe.</p>
          </GlassCard>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        {/* Category header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <i className={`fas ${category.icon} text-primary text-xl`}></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              {categoryData?.description && (
                <p className="text-gray-600 mt-2">{categoryData.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Articles grid */}
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
          <>
            <ArticleGrid articles={articles || []} />
            
            {/* Load more section */}
            {articles && articles.length > 0 && (
              <div className="text-center">
                <GlassCard variant="button">
                  <Button 
                    onClick={handleLoadMore}
                    className="px-8 py-4 text-gray-700 font-semibold hover:bg-primary/10 hover:border-primary/20"
                    variant="ghost"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Cargar más artículos
                  </Button>
                </GlassCard>
              </div>
            )}
          </>
        )}

        {!isLoading && (!articles || articles.length === 0) && (
          <div className="text-center py-12">
            <GlassCard className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                No hay artículos en esta categoría
              </h2>
              <p className="text-gray-600">
                Actualmente no hay artículos publicados en la categoría {category.name}.
              </p>
            </GlassCard>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
