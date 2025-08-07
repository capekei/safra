/**
 * ReviewDashboard Component for SafraReport Editorial Workflow
 * Displays pending articles and allows editorial review management
 * Optimized for Dominican Republic editors with mobile-first design
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Eye,
  AlertTriangle,
  Calendar,
  User 
} from 'lucide-react';

interface PendingArticle {
  id: number;
  title: string;
  excerpt: string;
  author_id: number;
  author_name: string;
  submitted_at: string;
  status: string;
  category_id: number;
  created_at: string;
}

interface WorkflowStats {
  draft: number;
  pending_review: number;
  approved: number;
  published: number;
  needs_changes: number;
  rejected: number;
}

type ReviewDecision = 'approve' | 'reject' | 'needs_changes';

export function ReviewDashboard() {
  const [pendingArticles, setPendingArticles] = useState<PendingArticle[]>([]);
  const [stats, setStats] = useState<WorkflowStats>({
    draft: 0,
    pending_review: 0,
    approved: 0,
    published: 0,
    needs_changes: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewComments, setReviewComments] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load pending articles and stats in parallel
      const [articlesResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/article-review/pending', {
          credentials: 'include'
        }),
        fetch('/api/admin/article-review/stats', {
          credentials: 'include'
        })
      ]);

      if (articlesResponse.ok) {
        const articlesData = await articlesResponse.json();
        setPendingArticles(articlesData.data || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data || {});
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (articleId: number, decision: ReviewDecision) => {
    try {
      setReviewingId(articleId);
      
      const response = await fetch(`/api/admin/article-review/${articleId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          decision,
          comments: reviewComments
        })
      });

      if (response.ok) {
        // Reload dashboard data to reflect changes
        await loadDashboardData();
        setReviewComments('');
        
        // Show success message
        const decisionMessages = {
          approve: 'aprobado',
          reject: 'rechazado',
          needs_changes: 'enviado para cambios'
        };
        alert(`Artículo ${decisionMessages[decision]} exitosamente`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Error al revisar artículo'}`);
      }
    } catch (error) {
      console.error('Error reviewing article:', error);
      alert('Error al revisar artículo');
    } finally {
      setReviewingId(null);
    }
  };

  const handlePublish = async (articleId: number) => {
    try {
      const response = await fetch(`/api/admin/article-review/${articleId}/publish`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        await loadDashboardData();
        alert('Artículo publicado exitosamente');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Error al publicar artículo'}`);
      }
    } catch (error) {
      console.error('Error publishing article:', error);
      alert('Error al publicar artículo');
    }
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Borrador', icon: Clock },
      pending_review: { variant: 'default' as const, label: 'Pendiente', icon: AlertTriangle },
      approved: { variant: 'default' as const, label: 'Aprobado', icon: CheckCircle2 },
      needs_changes: { variant: 'destructive' as const, label: 'Cambios', icon: XCircle },
      published: { variant: 'default' as const, label: 'Publicado', icon: CheckCircle2 },
      rejected: { variant: 'destructive' as const, label: 'Rechazado', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando panel editorial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workflow Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(stats).map(([status, count]) => {
          const statusLabels = {
            draft: 'Borradores',
            pending_review: 'Pendientes',
            approved: 'Aprobados',
            published: 'Publicados',
            needs_changes: 'Cambios',
            rejected: 'Rechazados'
          };

          return (
            <Card key={status} className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <p className="text-sm text-gray-600">{statusLabels[status as keyof typeof statusLabels]}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Artículos Pendientes de Revisión
            <Badge variant="secondary">{pendingArticles.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingArticles.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">¡Todo al día!</h3>
              <p className="text-gray-600">No hay artículos pendientes de revisión</p>
            </div>
          ) : (
            pendingArticles.map((article) => (
              <Card key={article.id} className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Article Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {article.title}
                        </h3>
                        {getStatusBadge(article.status)}
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{article.author_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Enviado: {formatDate(article.submitted_at)}</span>
                        </div>
                      </div>
                      
                      {/* Review Comments Input */}
                      {reviewingId === article.id && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comentarios de revisión (opcional)
                          </label>
                          <Textarea
                            value={reviewComments}
                            onChange={(e) => setReviewComments(e.target.value)}
                            placeholder="Agregar comentarios sobre esta revisión..."
                            className="min-h-[80px]"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start"
                        onClick={() => window.open(`/admin/articles/${article.id}`, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Artículo
                      </Button>
                      
                      {reviewingId !== article.id ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReviewingId(article.id)}
                          className="justify-start"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Revisar
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            size="sm"
                            onClick={() => handleReview(article.id, 'approve')}
                            className="w-full justify-start bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Aprobar
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReview(article.id, 'needs_changes')}
                            className="w-full justify-start border-orange-300 text-orange-700 hover:bg-orange-50"
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Pedir Cambios
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReview(article.id, 'reject')}
                            className="w-full justify-start border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rechazar
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReviewingId(null);
                              setReviewComments('');
                            }}
                            className="w-full justify-start"
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ReviewDashboard;