import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { SEO } from "@/components/seo";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "@/components/news/article-card";
import { SocialShare } from "@/components/article/social-share";
import { TextToSpeech } from "@/components/article/text-to-speech";
import { Clock, User, Heart, MessageCircle, Share2, Eye, Calendar, Tag, Bookmark } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { SocialEmbedRenderer } from "@/components/social-embed-renderer";

interface ArticleData {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  imageUrl?: string;
  publishedAt: string;
  views?: number;
  likes?: number;
  comments?: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  author?: {
    id: number;
    name: string;
    bio?: string;
    avatar?: string;
  };
}

export default function Article() {
  const { slug } = useParams();
  const { toast } = useToast();

  const { data: article, isLoading, error } = useQuery<ArticleData>({
    queryKey: [`/api/articles/${slug}`],
    enabled: !!slug,
  });

  const { data: relatedArticles } = useQuery<ArticleData[]>({
    queryKey: [`/api/articles/${article?.id}/related`],
    enabled: !!article?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
          <GlassCard className="p-8 animate-pulse">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </GlassCard>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
          <GlassCard className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Artículo no encontrado</h1>
            <p className="text-gray-600">El artículo que buscas no existe o ha sido eliminado.</p>
          </GlassCard>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
    locale: es
  });

  const handleLike = async () => {
    try {
      await fetch(`/api/articles/${article.id}/like`, { method: 'POST' });
      toast({
        title: "¡Gracias!",
        description: "Tu like ha sido registrado.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar tu like. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Enlace copiado",
        description: "El enlace del artículo ha sido copiado al portapapeles.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SocialEmbedRenderer />
      <SEO 
        title={`${article.title} - SafraReport`}
        description={article.excerpt}
        image={article.imageUrl}
        type="article"
        author={article.author?.name}
        publishedTime={article.publishedAt}
        section={article.category?.name}
      />
      <Header />
      
      <main className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
        <article>
          {/* Enhanced article header */}
          <div className="mb-8 text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <GlassCard variant="pill" className="px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <span className="flex items-center text-sm font-semibold text-primary">
                  <Tag className="h-3 w-3 mr-1" />
                  {article.category?.name}
                </span>
              </GlassCard>
              <span className="text-gray-500 text-sm">•</span>
              <span className="text-gray-600 text-sm flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(article.publishedAt), "d 'de' MMMM, yyyy", { locale: es })}
              </span>
            </div>

            {/* Article title with enhanced typography */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight bg-gradient-to-b from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {article.title}
            </h1>

            {/* Author and reading info */}
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                {article.author?.avatar && (
                  <img 
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-8 h-8 rounded-full mr-2 border-2 border-white shadow-sm"
                  />
                )}
                <span className="font-medium">Por {article.author?.name}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {timeAgo}
              </span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {article.views || 0} vistas
              </span>
            </div>
          </div>

          {/* Featured image */}
          {article.featuredImage && (
            <div className="relative mb-8 -mx-4 md:-mx-8 lg:-mx-0">
              <img 
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-[400px] md:h-[500px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
            </div>
          )}

          {/* Text-to-speech component */}
          <div className="max-w-4xl mx-auto mb-8">
            <TextToSpeech text={article.content} />
          </div>

          {/* Social sharing */}
          <div className="max-w-4xl mx-auto mb-8">
            <SocialShare 
              title={article.title}
              excerpt={article.excerpt}
              url={window.location.href}
              className="justify-center"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <GlassCard className="p-6 md:p-8 mb-8 overflow-hidden">
                {/* Article excerpt */}
                <p className="text-xl text-gray-700 leading-relaxed mb-8 font-medium italic border-l-4 border-primary pl-6">
                  {article.excerpt}
                </p>

                {/* Article content */}
                <div className="prose prose-lg max-w-none mb-8">
                  <div 
                    dangerouslySetInnerHTML={{ __html: article.content }}
                    className="text-gray-800 leading-relaxed [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mb-2 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-600 [&>blockquote]:mb-4 [&>img]:rounded-lg [&>img]:my-4 [&>table]:border-collapse [&>table]:w-full [&>table]:mb-4 [&>table_th]:border [&>table_th]:p-2 [&>table_th]:bg-gray-100 [&>table_td]:border [&>table_td]:p-2 [&_.social-embed]:my-8 [&_.social-embed]:mx-auto [&_.social-embed]:max-w-[550px] [&_.twitter-embed]:shadow-lg [&_.twitter-embed]:rounded-lg [&_.instagram-embed]:shadow-lg [&_.instagram-embed]:rounded-lg [&_.tiktok-embed]:shadow-lg [&_.tiktok-embed]:rounded-lg"
                  />
                </div>

                {/* Social actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <Button 
                      onClick={handleLike}
                      variant="ghost"
                      className="hover:text-red-500 hover:bg-red-50 transition-all flex items-center group"
                    >
                      <Heart className="h-5 w-5 mr-2 group-hover:fill-current" />
                      <span className="font-medium">{article.likes || 0} Me gusta</span>
                    </Button>
                    <Button 
                      variant="ghost"
                      className="hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">{article.comments || 0} Comentarios</span>
                    </Button>
                  </div>
                  
                  <Button 
                    variant="ghost"
                    className="hover:text-primary hover:bg-primary/10 transition-all flex items-center"
                  >
                    <Bookmark className="h-5 w-5 mr-2" />
                    <span className="font-medium">Guardar</span>
                  </Button>
                </div>
              </GlassCard>


            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Author card */}
              {article.author && (
                <GlassCard className="p-6 mb-6 sticky top-24">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Autor</h3>
                  <div className="flex items-center space-x-4">
                    {article.author.avatar && (
                      <img 
                        src={article.author.avatar}
                        alt={article.author.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">{article.author.name}</h4>
                      {article.author.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2">{article.author.bio}</p>
                      )}
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Article stats */}
              <GlassCard className="p-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Estadísticas</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      Vistas
                    </span>
                    <span className="font-semibold">{article.views || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Heart className="h-4 w-4 mr-2" />
                      Me gusta
                    </span>
                    <span className="font-semibold">{article.likes || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Comentarios
                    </span>
                    <span className="font-semibold">{article.comments || 0}</span>
                  </div>
                </div>
              </GlassCard>

              {/* Share card */}
              <GlassCard className="p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Compartir</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="glass"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current mx-auto" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                  </Button>
                  <Button 
                    variant="glass"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                  >
                    Facebook
                  </Button>
                  <Button 
                    variant="glass"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${article.title} - ${window.location.href}`)}`, '_blank')}
                  >
                    WhatsApp
                  </Button>
                </div>
              </GlassCard>
            </div>
          </div>
        </article>

        {/* Related articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Artículos relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.slice(0, 4).map((relatedArticle) => (
                <ArticleCard key={relatedArticle.id} article={relatedArticle} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
