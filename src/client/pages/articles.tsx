import { useState, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { GlassCard } from "@/components/ui/glass-card";
import { SEO } from "@/components/seo";
import { withAdminAuth } from "@/hoc/withAdminAuth";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye, Star, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

interface Article {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  category_id: number;
  category_name?: string;
  is_featured: boolean;
  is_breaking: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

function AdminArticles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);

  // Fetch articles
  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: async (): Promise<Article[]> => {
      const response = await fetch('/api/admin/articles', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      return response.json();
    }
  });

  // Delete article mutation
  const deleteArticleMutation = useMutation({
    mutationFn: async (articleId: number) => {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to delete article');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast({ title: 'Article deleted successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error deleting article', 
        variant: 'destructive' 
      });
    }
  });

  // Toggle featured/breaking status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: number; field: string; value: boolean }) => {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [field]: value })
      });
      if (!response.ok) {
        throw new Error('Failed to update article');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      toast({ title: 'Article updated successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Error updating article', 
        variant: 'destructive' 
      });
    }
  });

  const handleDelete = (articleId: number) => {
    if (confirm('Are you sure you want to delete this article?')) {
      deleteArticleMutation.mutate(articleId);
    }
  };

  const toggleFeatured = (id: number, currentValue: boolean) => {
    toggleStatusMutation.mutate({ id, field: 'is_featured', value: !currentValue });
  };

  const toggleBreaking = (id: number, currentValue: boolean) => {
    toggleStatusMutation.mutate({ id, field: 'is_breaking', value: !currentValue });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEO title="Articles - Admin" />
        <Header />
        <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
          <GlassCard className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Articles</h1>
            <p className="text-gray-600">Failed to load articles. Please try again later.</p>
          </GlassCard>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Articles Management - Admin"
        description="Manage news articles"
      />
      <Header />
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Articles Management</h1>
            <p className="mt-2 text-gray-600">
              Create, edit, and manage news articles
            </p>
          </div>
          <Link href="/admin/articles/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Article
            </Button>
          </Link>
        </div>

        <GlassCard className="overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Articles Found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first article.</p>
              <Link href="/admin/articles/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Article
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {article.title}
                          </div>
                          {article.excerpt && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {article.excerpt}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {article.category_name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {article.published ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Draft
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {article.is_featured && (
                              <button
                                onClick={() => toggleFeatured(article.id, article.is_featured)}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                              >
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </button>
                            )}
                            {article.is_breaking && (
                              <button
                                onClick={() => toggleBreaking(article.id, article.is_breaking)}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                              >
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Breaking
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(article.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/articles/${article.id}`}>
                            <Button size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/articles/${article.id}/edit`}>
                            <Button size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            
                            size="sm"
                            onClick={() => handleDelete(article.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </main>
      <Footer />
    </div>
  );
}

export default withAdminAuth(AdminArticles);
