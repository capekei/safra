import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Link } from "wouter";

interface ArticleData {
  article: {
    id: number;
    title: string;
    slug: string;
    published: boolean;
    isFeatured: boolean;
    isBreaking: boolean;
    views: number;
    createdAt: string;
  };
  author: {
    name: string;
  } | null;
  category: {
    name: string;
  } | null;
}

export default function AdminArticlesTest() {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const { toast } = useToast();

  const loginAndFetch = async () => {
    setLoading(true);
    try {
      // Step 1: Authenticate
      const authResponse = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        }),
      });

      const authData = await authResponse.json();
      
      if (!authData.success) {
        throw new Error('Authentication failed');
      }

      // Store token
      localStorage.setItem('adminToken', authData.token);
      setAuthenticated(true);

      // Step 2: Fetch articles
      const articlesResponse = await fetch('/api/admin/articles', {
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!articlesResponse.ok) {
        throw new Error(`HTTP ${articlesResponse.status}`);
      }

      const articlesData = await articlesResponse.json();
      setArticles(articlesData);

      toast({
        title: "Éxito",
        description: `Autenticado correctamente. ${articlesData.length} artículos cargados.`,
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: `Error: ${error}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Articles Test</h1>
          <p className="text-gray-600">Test the admin authentication and articles loading</p>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex gap-4">
              <Button 
                onClick={loginAndFetch}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Loading...' : 'Login & Fetch Articles'}
              </Button>
              
              {authenticated && (
                <Link to="/admin/dashboard">
                  <Button variant="outline">
                    Go to Admin Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </GlassCard>

          {authenticated && (
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
              <p className="text-green-600">✅ Admin authenticated successfully</p>
              <p className="text-gray-600">Token stored in localStorage</p>
            </GlassCard>
          )}

          {articles.length > 0 && (
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Articles Found ({articles.length})
              </h2>
              
              <div className="space-y-4">
                {articles.map((item) => (
                  <div key={item.article.id} className="border rounded-lg p-4 bg-white/50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {item.article.title}
                        </h3>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            item.article.published 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {item.article.published ? 'Publicado' : 'Borrador'}
                          </span>
                          
                          {item.article.isFeatured && (
                            <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                              Destacado
                            </span>
                          )}
                          
                          {item.article.isBreaking && (
                            <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
                              Última Hora
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>ID: {item.article.id}</span>
                          <span>Categoría: {item.category?.name || 'N/A'}</span>
                          <span>Autor: {item.author?.name || 'N/A'}</span>
                          <span>Vistas: {item.article.views}</span>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-500">
                          Slug: {item.article.slug}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {!loading && articles.length === 0 && authenticated && (
            <GlassCard className="p-6">
              <p className="text-gray-600">No articles found</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}