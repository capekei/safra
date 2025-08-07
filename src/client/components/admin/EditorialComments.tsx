/**
 * EditorialComments Component for SafraReport
 * Collaborative feedback system for Dominican Republic editorial workflow
 * Mobile-optimized for 3G networks with efficient loading
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Plus, 
  Check, 
  Clock, 
  User, 
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';

interface EditorialComment {
  id: number;
  text: string;
  resolved: boolean;
  created_at: string;
  author_name: string;
  author_email: string;
}

interface CommentStats {
  total: number;
  resolved: number;
  unresolved: number;
}

interface EditorialCommentsProps {
  articleId: number;
  showAddComment?: boolean;
  className?: string;
}

export function EditorialComments({ 
  articleId, 
  showAddComment = true, 
  className = '' 
}: EditorialCommentsProps) {
  const [comments, setComments] = useState<EditorialComment[]>([]);
  const [stats, setStats] = useState<CommentStats>({
    total: 0,
    resolved: 0,
    unresolved: 0
  });
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (articleId) {
      loadComments();
      loadStats();
    }
  }, [articleId]);

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/admin/comments/${articleId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.data || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/admin/comments/${articleId}/stats`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data || { total: 0, resolved: 0, unresolved: 0 });
      }
    } catch (error) {
      console.error('Error loading comment stats:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setAddingComment(true);
      const response = await fetch(`/api/admin/comments/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          text: newComment.trim()
        })
      });

      if (response.ok) {
        setNewComment('');
        await loadComments();
        await loadStats();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Error al agregar comentario'}`);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error al agregar comentario');
    } finally {
      setAddingComment(false);
    }
  };

  const handleToggleResolved = async (commentId: number, resolved: boolean) => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ resolved })
      });

      if (response.ok) {
        await loadComments();
        await loadStats();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Error al actualizar comentario'}`);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Error al actualizar comentario');
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editText.trim()) return;

    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          text: editText.trim()
        })
      });

      if (response.ok) {
        setEditingId(null);
        setEditText('');
        await loadComments();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Error al editar comentario'}`);
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      alert('Error al editar comentario');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este comentario?')) return;

    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await loadComments();
        await loadStats();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Error al eliminar comentario'}`);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error al eliminar comentario');
    }
  };

  const startEdit = (comment: EditorialComment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
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

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-4">
            <Clock className="w-5 h-5 animate-spin mr-2 text-blue-600" />
            <span className="text-gray-600">Cargando comentarios...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Comentarios Editoriales
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {stats.unresolved > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {stats.unresolved} pendientes
              </Badge>
            )}
            {stats.resolved > 0 && (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {stats.resolved} resueltos
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add New Comment */}
        {showAddComment && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
            <div className="space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Agregar comentario editorial..."
                className="min-h-[80px]"
                disabled={addingComment}
              />
              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || addingComment}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {addingComment ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Agregar Comentario
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin comentarios</h3>
            <p className="text-gray-600">
              {showAddComment 
                ? 'Agrega el primer comentario editorial para este artículo'
                : 'No hay comentarios editoriales para este artículo'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <Card key={comment.id} className={`border-l-4 ${
                comment.resolved ? 'border-l-green-500 bg-green-50' : 'border-l-orange-500 bg-orange-50'
              }`}>
                <CardContent className="p-4">
                  {/* Comment Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{comment.author_name}</span>
                      <span>•</span>
                      <span>{formatDate(comment.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={comment.resolved ? 'default' : 'secondary'}>
                        {comment.resolved ? 'Resuelto' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Comment Content */}
                  {editingId === comment.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEdit}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEditComment(comment.id)}
                          disabled={!editText.trim()}
                        >
                          Guardar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-800 mb-3 whitespace-pre-wrap">{comment.text}</p>
                      
                      {/* Comment Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleResolved(comment.id, !comment.resolved)}
                          className={`flex items-center gap-1 ${
                            comment.resolved 
                              ? 'text-orange-600 border-orange-300 hover:bg-orange-50' 
                              : 'text-green-600 border-green-300 hover:bg-green-50'
                          }`}
                        >
                          {comment.resolved ? (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              Marcar Pendiente
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3" />
                              Marcar Resuelto
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(comment)}
                          className="flex items-center gap-1 text-gray-600"
                        >
                          <Edit3 className="w-3 h-3" />
                          Editar
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="flex items-center gap-1 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default EditorialComments;