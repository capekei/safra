/**
 * Admin Articles Management Page - SafraReport
 * Complete article management with editorial workflow integration
 */

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { ArticleEditor } from '@/components/admin/ArticleEditor';
import { ReviewDashboard } from '@/components/admin/ReviewDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  FileText, 
  Eye, 
  MessageSquare, 
  Clock,
  CheckCircle2 
} from 'lucide-react';

type ViewMode = 'dashboard' | 'editor' | 'review';

export default function AdminArticles() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [editingArticleId, setEditingArticleId] = useState<number | undefined>();

  const handleNewArticle = () => {
    setEditingArticleId(undefined);
    setViewMode('editor');
  };

  const handleEditArticle = (articleId: number) => {
    setEditingArticleId(articleId);
    setViewMode('editor');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setEditingArticleId(undefined);
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'editor':
        return (
          <ArticleEditor
            articleId={editingArticleId}
            onCancel={handleBackToDashboard}
            onSave={() => {
              // Optionally stay in editor or return to dashboard
              // handleBackToDashboard();
            }}
          />
        );

      case 'review':
        return <ReviewDashboard />;

      case 'dashboard':
      default:
        return (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="review">Panel Editorial</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total</p>
                        <p className="text-2xl font-bold text-gray-900">156</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-orange-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Pendientes</p>
                        <p className="text-2xl font-bold text-gray-900">12</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Publicados</p>
                        <p className="text-2xl font-bold text-gray-900">128</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <MessageSquare className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Con Comentarios</p>
                        <p className="text-2xl font-bold text-gray-900">8</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={handleNewArticle}
                      className="flex items-center justify-center gap-2 h-20 bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-6 h-6" />
                      <span className="font-medium">Nuevo Artículo</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setViewMode('review')}
                      className="flex items-center justify-center gap-2 h-20 border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      <Eye className="w-6 h-6" />
                      <span className="font-medium">Panel Editorial</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => window.open('/admin/analytics', '_blank')}
                      className="flex items-center justify-center gap-2 h-20"
                    >
                      <MessageSquare className="w-6 h-6" />
                      <span className="font-medium">Ver Reportes</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Articles - Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Artículos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>La lista de artículos recientes se mostrará aquí.</p>
                    <p className="text-sm">Integración con API en desarrollo.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="review">
              <ReviewDashboard />
            </TabsContent>
          </Tabs>
        );
    }
  };

  return (
    <AdminLayout title="Gestión de Artículos">
      {renderContent()}
    </AdminLayout>
  );
}