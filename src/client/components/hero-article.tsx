import { Link } from "wouter";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Clock, User, Heart, MessageCircle, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface HeroArticleProps {
  article: any; // TODO: Type this properly
}

export function HeroArticle({ article }: HeroArticleProps) {
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
    locale: es
  });

  const handleLike = () => {
    // TODO: Implement like functionality
    console.log('Like article:', article.id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.origin + `/articulo/${article.slug}`,
      });
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.origin + `/articulo/${article.slug}`);
    }
  };

  return (
    <div className="mb-12">
      <GlassCard className="overflow-hidden">
        {article.featuredImage && (
          <div className="relative">
            <img 
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover"
              loading="lazy"
            />
            <div className="image-glass-overlay absolute inset-0"></div>
          </div>
        )}
        
        <div className="p-6 md:p-8">
          <div className="flex items-center space-x-4 mb-4">
            <GlassCard className="px-3 py-1 text-sm font-medium text-primary border border-primary/20">
              {article.category?.name}
            </GlassCard>
            <span className="text-gray-500 text-sm flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {timeAgo}
            </span>
            <span className="text-gray-500 text-sm flex items-center">
              <User className="h-4 w-4 mr-1" />
              Por {article.author?.name}
            </span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-balance">
            {article.title}
          </h2>
          
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            {article.excerpt}
          </p>
          
          <div className="flex items-center justify-between">
            <Link href={`/articulo/${article.slug}`}>
              <Button className="bg-primary text-gray-900 px-6 py-3 hover:bg-primary/90 font-semibold">
                Leer artículo completo
              </Button>
            </Link>
            
            <div className="flex items-center space-x-4 text-gray-500">
              <button 
                onClick={handleLike}
                className="hover:text-primary transition-colors flex items-center"
              >
                <Heart className="h-4 w-4 mr-1" />
                <span>{article.likes || 0}</span>
              </button>
              <button className="hover:text-primary transition-colors flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span>{article.comments || 0}</span>
              </button>
              <button 
                onClick={handleShare}
                className="hover:text-primary transition-colors flex items-center"
              >
                <Share2 className="h-4 w-4 mr-1" />
                Compartir
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
