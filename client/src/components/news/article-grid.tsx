import { ArticleCard } from "./article-card";

interface ArticleGridProps {
  articles: any[]; // TODO: Type this properly
}

export function ArticleGrid({ articles }: ArticleGridProps) {
  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-gray-700 text-lg font-medium mb-2">Error al cargar artículos en despliegue</p>
          <p className="text-gray-600 text-sm mb-4">
            No se pudieron cargar los artículos. Esto puede deberse a un problema de conexión con la base de datos.
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              🔄 Recargar página
            </button>
            <button 
              onClick={() => {
                console.log("🔍 Debug info:", {
                  environment: import.meta.env.MODE,
                  baseUrl: import.meta.env.VITE_API_BASE_URL || window.location.origin,
                  currentUrl: window.location.href
                });
              }}
              className="w-full px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200 transition-colors"
            >
              Ver información de debug
            </button>
            <p className="text-xs text-gray-500">
              Entorno: {import.meta.env.MODE} | Artículos esperados: 9
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
