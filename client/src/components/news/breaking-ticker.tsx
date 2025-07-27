import { useQuery } from "@tanstack/react-query";
import { Zap } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

interface BreakingArticle {
  id: number;
  title: string;
  slug: string;
}

interface BreakingTickerData {
  articles?: BreakingArticle[];
}

function BreakingTickerContent() {
  const { data: breakingNews, isLoading } = useQuery<BreakingArticle[]>({
    queryKey: ["/api/articles/breaking"],
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading || !breakingNews || !Array.isArray(breakingNews) || breakingNews.length === 0) {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 border-b border-white/20">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-primary font-semibold flex-shrink-0 flex items-center">
            <Zap className="h-4 w-4 mr-1" />
            ÚLTIMA HORA
          </span>
          <div className="text-gray-700">
            Cargando noticias de última hora...
          </div>
        </div>
      </div>
    );
  }

  const tickerText = breakingNews.map((article: BreakingArticle) => article.title).join(' • ') + ' • ';

  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 border-b border-white/20">
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-primary font-semibold flex-shrink-0 flex items-center">
          <Zap className="h-4 w-4 mr-1" />
          ÚLTIMA HORA
        </span>
        <div className="overflow-hidden flex-1">
          <div className="ticker-scroll whitespace-nowrap text-gray-700">
            {tickerText}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BreakingTicker() {
  return (
    <ErrorBoundary 
      fallback={
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 border-b border-white/20">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-primary font-semibold flex-shrink-0 flex items-center">
              <Zap className="h-4 w-4 mr-1" />
              ÚLTIMA HORA
            </span>
            <div className="text-gray-700">
              Error cargando noticias. Intenta recargar la página.
            </div>
          </div>
        </div>
      }
      onError={(error) => console.error('Error en ticker de noticias:', error)}
    >
      <BreakingTickerContent />
    </ErrorBoundary>
  );
}
