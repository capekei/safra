import { Link } from "wouter";
import { GlassCard } from "@/components/ui/glass-card";
import { Clock, User, Heart, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ArticleCardProps {
  article: any; // TODO: Type this properly
}

export function ArticleCard({ article }: ArticleCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt || article.createdAt), {
    addSuffix: true,
    locale: es
  });

  return (
    <Link href={`/articulo/${article.slug}`}>
      <GlassCard variant="hover" className="cursor-pointer overflow-hidden">
        {article.featuredImage && (
          <div className="relative">
            <img 
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-48 object-cover"
              loading="lazy"
            />
            <div className="image-glass-overlay absolute inset-0"></div>
          </div>
        )}
        
        <div className="p-5">
          <div className="flex items-center space-x-3 mb-3">
            <GlassCard variant="pill" className="px-2 py-1 text-xs font-medium text-gray-600">
              {article.category?.name}
            </GlassCard>
            <span className="text-gray-400 text-xs flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {timeAgo}
            </span>
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
            {article.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {article.excerpt}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 flex items-center">
              <User className="h-3 w-3 mr-1" />
              Por {article.author?.name}
            </span>
            <div className="flex items-center space-x-2 text-gray-400 text-xs">
              <span className="flex items-center">
                <Heart className="h-3 w-3 mr-1" />
                {article.likes || 0}
              </span>
              <span className="flex items-center">
                <MessageCircle className="h-3 w-3 mr-1" />
                {article.comments || 0}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
