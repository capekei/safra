/**
 * Admin API Routes for Editorial Comments
 * Handles collaborative feedback system for SafraReport editorial workflow
 */

import { Router, type Response } from 'express';
import { articleReviewService } from '../../services/article-review.js';
import { authenticateAdmin, type AuthRequest } from '../../middleware/auth.js';
import { db } from '../../db.js';
import { editorialComments } from '../../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin as any);

// Validation schemas
const addCommentSchema = z.object({
  text: z.string().min(1).max(1000, 'Comentario muy largo (máximo 1000 caracteres)'),
});

const updateCommentSchema = z.object({
  text: z.string().min(1).max(1000, 'Comentario muy largo (máximo 1000 caracteres)'),
  resolved: z.boolean().optional(),
});

/**
 * Get editorial comments for an article
 * GET /admin/comments/:articleId
 */
router.get('/:articleId', async (req: AuthRequest, res: Response) => {
  try {
    const articleId = parseInt(req.params.articleId);

    if (isNaN(articleId)) {
      return res.status(400).json({
        message: 'ID de artículo inválido',
        code: 'INVALID_ARTICLE_ID'
      });
    }

    const comments = await articleReviewService.getComments(articleId);

    res.json({
      success: true,
      data: comments,
      count: comments.length
    });

  } catch (error) {
    console.error('Error getting editorial comments:', error);
    res.status(500).json({
      message: 'Error al obtener comentarios editoriales',
      code: 'GET_COMMENTS_ERROR'
    });
  }
});

/**
 * Add editorial comment to an article
 * POST /admin/comments/:articleId
 */
router.post('/:articleId', async (req: AuthRequest, res: Response) => {
  try {
    const articleId = parseInt(req.params.articleId);
    const { text } = addCommentSchema.parse(req.body);
    const authorId = req.adminUser?.id;

    if (!authorId) {
      return res.status(401).json({
        message: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (isNaN(articleId)) {
      return res.status(400).json({
        message: 'ID de artículo inválido',
        code: 'INVALID_ARTICLE_ID'
      });
    }

    await articleReviewService.addComment(articleId, authorId, text);

    // Get the newly created comment with author info
    const comments = await articleReviewService.getComments(articleId);
    const newComment = comments[0]; // Most recent comment (ordered by created_at DESC)

    res.status(201).json({
      success: true,
      message: 'Comentario agregado exitosamente',
      data: newComment
    });

  } catch (error) {
    console.error('Error adding editorial comment:', error);
    res.status(500).json({
      message: 'Error al agregar comentario',
      code: 'ADD_COMMENT_ERROR'
    });
  }
});

/**
 * Update editorial comment (edit text or mark as resolved)
 * PUT /admin/comments/:commentId
 */
router.put('/:commentId', async (req: AuthRequest, res: Response) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const { text, resolved } = updateCommentSchema.parse(req.body);
    const userId = req.adminUser?.id;

    if (!userId) {
      return res.status(401).json({
        message: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (isNaN(commentId)) {
      return res.status(400).json({
        message: 'ID de comentario inválido',
        code: 'INVALID_COMMENT_ID'
      });
    }

    // Check if comment exists and user has permission to edit
    const existingComment = await db.select()
      .from(editorialComments)
      .where(eq(editorialComments.id, commentId))
      .limit(1);

    if (!existingComment[0]) {
      return res.status(404).json({
        message: 'Comentario no encontrado',
        code: 'COMMENT_NOT_FOUND'
      });
    }

    // Allow editing only by the author or admins with super_admin role
    if (existingComment[0].author_id !== userId && req.adminUser?.role !== 'super_admin') {
      return res.status(403).json({
        message: 'No tienes permiso para editar este comentario',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    // Update comment
    const updateData: any = {
      updated_at: new Date()
    };

    if (text !== undefined) {
      updateData.text = text;
    }

    if (resolved !== undefined) {
      updateData.resolved = resolved;
    }

    await db.update(editorialComments)
      .set(updateData)
      .where(eq(editorialComments.id, commentId));

    res.json({
      success: true,
      message: 'Comentario actualizado exitosamente',
      data: { commentId, ...updateData }
    });

  } catch (error) {
    console.error('Error updating editorial comment:', error);
    res.status(500).json({
      message: 'Error al actualizar comentario',
      code: 'UPDATE_COMMENT_ERROR'
    });
  }
});

/**
 * Delete editorial comment
 * DELETE /admin/comments/:commentId
 */
router.delete('/:commentId', async (req: AuthRequest, res: Response) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const userId = req.adminUser?.id;

    if (!userId) {
      return res.status(401).json({
        message: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (isNaN(commentId)) {
      return res.status(400).json({
        message: 'ID de comentario inválido',
        code: 'INVALID_COMMENT_ID'
      });
    }

    // Check if comment exists and user has permission to delete
    const existingComment = await db.select()
      .from(editorialComments)
      .where(eq(editorialComments.id, commentId))
      .limit(1);

    if (!existingComment[0]) {
      return res.status(404).json({
        message: 'Comentario no encontrado',
        code: 'COMMENT_NOT_FOUND'
      });
    }

    // Allow deletion only by the author or super_admin
    if (existingComment[0].author_id !== userId && req.adminUser?.role !== 'super_admin') {
      return res.status(403).json({
        message: 'No tienes permiso para eliminar este comentario',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    await db.delete(editorialComments)
      .where(eq(editorialComments.id, commentId));

    res.json({
      success: true,
      message: 'Comentario eliminado exitosamente',
      data: { commentId }
    });

  } catch (error) {
    console.error('Error deleting editorial comment:', error);
    res.status(500).json({
      message: 'Error al eliminar comentario',
      code: 'DELETE_COMMENT_ERROR'
    });
  }
});

/**
 * Mark comment as resolved/unresolved
 * PATCH /admin/comments/:commentId/resolve
 */
router.patch('/:commentId/resolve', async (req: AuthRequest, res: Response) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const resolved = req.body.resolved === true;

    if (isNaN(commentId)) {
      return res.status(400).json({
        message: 'ID de comentario inválido',
        code: 'INVALID_COMMENT_ID'
      });
    }

    await db.update(editorialComments)
      .set({ 
        resolved,
        updated_at: new Date()
      })
      .where(eq(editorialComments.id, commentId));

    res.json({
      success: true,
      message: `Comentario marcado como ${resolved ? 'resuelto' : 'no resuelto'}`,
      data: { commentId, resolved }
    });

  } catch (error) {
    console.error('Error updating comment resolution:', error);
    res.status(500).json({
      message: 'Error al actualizar estado del comentario',
      code: 'RESOLVE_COMMENT_ERROR'
    });
  }
});

/**
 * Get comment statistics for an article
 * GET /admin/comments/:articleId/stats
 */
router.get('/:articleId/stats', async (req: AuthRequest, res: Response) => {
  try {
    const articleId = parseInt(req.params.articleId);

    if (isNaN(articleId)) {
      return res.status(400).json({
        message: 'ID de artículo inválido',
        code: 'INVALID_ARTICLE_ID'
      });
    }

    const allComments = await db.select({
      resolved: editorialComments.resolved
    })
    .from(editorialComments)
    .where(eq(editorialComments.article_id, articleId));

    const stats = {
      total: allComments.length,
      resolved: allComments.filter(c => c.resolved).length,
      unresolved: allComments.filter(c => !c.resolved).length
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting comment stats:', error);
    res.status(500).json({
      message: 'Error al obtener estadísticas de comentarios',
      code: 'GET_COMMENT_STATS_ERROR'
    });
  }
});

export default router;