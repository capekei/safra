/**
 * ArticleEditor Component for SafraReport Editorial Workflow
 * Complete article editing with status management, version control, and comments
 * Optimized for Dominican Republic editorial process with mobile support
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RichTextEditor } from '@/components/rich-text-editor';
import { EditorialComments } from './EditorialComments';
import { 
  Save,
  Send,
  Eye,
  History,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  ArrowLeft,
  Settings
} from 'lucide-react';

interface Article {
  id?: number;
  title: string;
  excerpt: string;
  content: string;
  slug?: string;
  categoryId: number;
  provinceId?: number;
  status: string;
  published: boolean;
  isFeatured: boolean;
  isBreaking: boolean;
  featuredImage?: string;
  videoUrl?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: number;
  publishedAt?: string;
}

interface Category {
  id: number;
  name: string;
}

interface Province {
  id: number;
  name: string;
}

interface ArticleVersion {
  id: number;
  version: number;
  title: string;
  excerpt: string;
  content: any;
  summary?: string;
  createdAt: string;
  createdBy: string;
}

interface ArticleEditorProps {
  articleId?: number;
  onSave?: (article: Article) => void;
  onCancel?: () => void;
}

export function ArticleEditor({ articleId, onSave, onCancel }: ArticleEditorProps) {
  const [article, setArticle] = useState<Article>({
    title: '',
    excerpt: '',
    content: '',
    categoryId: 1,
    status: 'draft',
    published: false,
    isFeatured: false,
    isBreaking: false,
    tags: []
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [versions, setVersions] = useState<ArticleVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [newTags, setNewTags] = useState('');

  useEffect(() => {
    loadCategories();
    loadProvinces();
    if (articleId) {
      loadArticle();
      loadVersions();
    }
  }, [articleId]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProvinces = async () => {
    try {
      const response = await fetch('/api/provinces');
      if (response.ok) {
        const data = await response.json();
        setProvinces(data);
      }
    } catch (error) {
      console.error('Error loading provinces:', error);
    }
  };

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
      }
    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async () => {
    if (!articleId) return;
    
    try {
      const response = await fetch(`/api/admin/versions/${articleId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setVersions(data.data || []);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const handleSave = async (submitForReview = false) => {
    try {
      setSaving(true);
      
      const saveData = {
        ...article,
        tags: article.tags?.length ? article.tags : null
      };

      const url = articleId ? `/api/admin/articles/${articleId}` : '/api/admin/articles';
      const method = articleId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(saveData)
      });

      if (response.ok) {
        const result = await response.json();
        const savedArticle = result.article;
        
        setArticle(savedArticle);
        
        // Save version if this is an update
        if (articleId && savedArticle.id) {
          await saveVersion(savedArticle.id);
        }

        // Submit for review if requested
        if (submitForReview && savedArticle.id) {
          await handleSubmitForReview(savedArticle.id);
        }

        onSave?.(savedArticle);
        alert(submitForReview ? 'Artículo guardado y enviado para revisión' : 'Artículo guardado exitosamente');
        
        // If this was a new article, redirect to edit mode
        if (!articleId && savedArticle.id) {
          window.location.href = `/admin/articles/${savedArticle.id}`;
        }
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Error al guardar artículo'}`);
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Error al guardar artículo');
    } finally {
      setSaving(false);
    }
  };

  const saveVersion = async (articleId: number) => {
    try {
      await fetch(`/api/admin/versions/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          summary: `Autoguardado - ${new Date().toLocaleString('es-DO')}`
        })
      });
    } catch (error) {
      console.error('Error saving version:', error);
    }
  };

  const handleSubmitForReview = async (id: number) => {
    try {
      const response = await fetch('/api/admin/article-review/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ articleId: id })
      });

      if (response.ok) {
        // Update article status
        setArticle(prev => ({ ...prev, status: 'pending_review' }));
        loadVersions(); // Refresh versions
      }
    } catch (error) {
      console.error('Error submitting for review:', error);
    }
  };

  const addTag = () => {
    if (newTags.trim()) {
      const newTagsArray = newTags.split(',').map(tag => tag.trim()).filter(Boolean);
      setArticle(prev => ({
        ...prev,
        tags: [...(prev.tags || []), ...newTagsArray]
      }));
      setNewTags('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setArticle(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove)
    }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Borrador', icon: Clock },
      pending_review: { variant: 'default' as const, label: 'En Revisión', icon: AlertTriangle },
      approved: { variant: 'default' as const, label: 'Aprobado', icon: CheckCircle2 },
      needs_changes: { variant: 'destructive' as const, label: 'Cambios Requeridos', icon: XCircle },
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
        <Clock className="w-8 h-8 animate-spin mr-3 text-blue-600" />
        <span className="text-lg text-gray-600">Cargando editor...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onCancel && (
                <Button variant="ghost" size="sm" onClick={onCancel}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {articleId ? 'Editar Artículo' : 'Nuevo Artículo'}
                </h1>
                {article.status && (
                  <div className="mt-2">
                    {getStatusBadge(article.status)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {articleId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVersions(!showVersions)}
                >
                  <History className="w-4 h-4 mr-2" />
                  Versiones ({versions.length})
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave(false)}
                disabled={saving}
              >
                {saving ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Guardar
              </Button>
              
              {article.status === 'draft' && (
                <Button
                  size="sm"
                  onClick={() => handleSave(true)}
                  disabled={saving || !article.title || !article.content}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar para Revisión
                </Button>
              )}
            </div>
          </div>

          {/* Article Form */}
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={article.title}
                  onChange={(e) => setArticle(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título del artículo"
                  className="text-lg font-medium"
                />
              </div>

              {/* Excerpt */}
              <div>
                <Label htmlFor="excerpt">Extracto *</Label>
                <Textarea
                  id="excerpt"
                  value={article.excerpt}
                  onChange={(e) => setArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Breve descripción del artículo (máximo 160 caracteres)"
                  className="min-h-[60px]"
                  maxLength={160}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {article.excerpt.length}/160 caracteres
                </p>
              </div>

              {/* Content Editor */}
              <div>
                <Label>Contenido *</Label>
                <div className="mt-2">
                  <RichTextEditor
                    content={article.content}
                    onChange={(content) => setArticle(prev => ({ ...prev, content }))}
                    placeholder="Escribe el contenido del artículo..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Article Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              <div>
                <Label>Categoría</Label>
                <Select
                  value={article.categoryId.toString()}
                  onValueChange={(value) => setArticle(prev => ({ 
                    ...prev, 
                    categoryId: parseInt(value) 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Province */}
              <div>
                <Label>Provincia (opcional)</Label>
                <Select
                  value={article.provinceId?.toString() || ''}
                  onValueChange={(value) => setArticle(prev => ({ 
                    ...prev, 
                    provinceId: value ? parseInt(value) : undefined 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar provincia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin provincia</SelectItem>
                    {provinces.map((province) => (
                      <SelectItem key={province.id} value={province.id.toString()}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Artículo destacado</Label>
                  <Switch
                    id="featured"
                    checked={article.isFeatured}
                    onCheckedChange={(checked) => 
                      setArticle(prev => ({ ...prev, isFeatured: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="breaking">Noticia de última hora</Label>
                  <Switch
                    id="breaking"
                    checked={article.isBreaking}
                    onCheckedChange={(checked) => 
                      setArticle(prev => ({ ...prev, isBreaking: checked }))
                    }
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Etiquetas</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="Agregar etiquetas..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button size="sm" onClick={addTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {article.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          {articleId && (
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="w-full justify-start"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {showComments ? 'Ocultar' : 'Mostrar'} Comentarios
              </Button>
              
              {showComments && (
                <div className="mt-4">
                  <EditorialComments articleId={articleId} />
                </div>
              )}
            </div>
          )}

          {/* Version History */}
          {showVersions && versions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Historial de Versiones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {versions.map((version) => (
                    <div key={version.id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Versión {version.version}</span>
                        <span className="text-gray-500">
                          {new Date(version.createdAt).toLocaleDateString('es-DO')}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs mt-1">
                        {version.summary || 'Sin descripción'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArticleEditor;