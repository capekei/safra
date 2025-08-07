/**
 * Admin API Routes for Article Review Workflow
 * Handles editorial review process for SafraReport Dominican Republic news platform
 */

import { Router, type Response } from 'express';
import { articleReviewService } from '../../services/article-review.js';
import { versionControl } from '../../services/version-control.js';
import { authenticateAdmin, type AuthRequest } from '../../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin as any);

// Validation schemas
const submitForReviewSchema = z.object({
  articleId: z.number().int().positive(),
});

const reviewArticleSchema = z.object({
  decision: z.enum(['approve', 'reject', 'needs_changes']),
  comments: z.string().optional(),
});

const publishArticleSchema = z.object({
  articleId: z.number().int().positive(),
});

/**
 * Submit article for editorial review
 * POST /admin/article-review/submit
 */
router.post('/submit', async (req: AuthRequest, res: Response) => {
  try {
    const { articleId } = submitForReviewSchema.parse(req.body);
    const authorId = req.adminUser?.id;

    if (!authorId) {
      return res.status(401).json({
        message: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    await articleReviewService.submitForReview({
      articleId,
      authorId
    });

    res.json({
      success: true,
      message: 'Artículo enviado para revisión exitosamente',
      data: { articleId, status: 'pending_review' }
    });

  } catch (error) {
    console.error('Error submitting article for review:', error);
    res.status(500).json({
      message: 'Error al enviar artículo para revisión',
      code: 'SUBMIT_ERROR'
    });
  }
});

/**
 * Review article (approve/reject/request changes)
 * POST /admin/article-review/:id/review
 */
router.post('/:id/review', async (req: AuthRequest, res: Response) => {
  try {
    const articleId = parseInt(req.params.id);
    const { decision, comments } = reviewArticleSchema.parse(req.body);
    const reviewerId = req.adminUser?.id;

    if (!reviewerId) {
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

    await articleReviewService.reviewArticle({
      articleId,
      reviewerId,
      decision,
      comments
    });

    const statusMessages = {
      approve: 'aprobado',
      reject: 'rechazado',
      needs_changes: 'enviado para cambios'
    };

    res.json({
      success: true,
      message: `Artículo ${statusMessages[decision]} exitosamente`,
      data: { articleId, decision, reviewerId }
    });

  } catch (error) {
    console.error('Error reviewing article:', error);
    res.status(500).json({
      message: 'Error al revisar artículo',
      code: 'REVIEW_ERROR'
    });
  }
});

/**
 * Get articles pending review for editorial dashboard
 * GET /admin/article-review/pending
 */
router.get('/pending', async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const pendingArticles = await articleReviewService.getPendingReviews(limit);

    res.json({
      success: true,
      data: pendingArticles,
      count: pendingArticles.length
    });

  } catch (error) {
    console.error('Error getting pending reviews:', error);
    res.status(500).json({
      message: 'Error al obtener artículos pendientes',
      code: 'GET_PENDING_ERROR'
    });
  }
});

/**
 * Get review history for an article
 * GET /admin/article-review/:id/history
 */
router.get('/:id/history', async (req: AuthRequest, res: Response) => {
  try {
    const articleId = parseInt(req.params.id);

    if (isNaN(articleId)) {
      return res.status(400).json({
        message: 'ID de artículo inválido',
        code: 'INVALID_ARTICLE_ID'
      });
    }

    const reviews = await articleReviewService.getArticleReviews(articleId);

    res.json({
      success: true,
      data: reviews,
      count: reviews.length
    });

  } catch (error) {
    console.error('Error getting review history:', error);
    res.status(500).json({
      message: 'Error al obtener historial de revisiones',
      code: 'GET_HISTORY_ERROR'
    });
  }
});

/**
 * Publish approved article
 * POST /admin/article-review/:id/publish
 */
router.post('/:id/publish', async (req: AuthRequest, res: Response) => {
  try {
    const articleId = parseInt(req.params.id);
    const publisherId = req.adminUser?.id;

    if (!publisherId) {
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

    await articleReviewService.publishArticle(articleId, publisherId);

    res.json({
      success: true,
      message: 'Artículo publicado exitosamente',
      data: { articleId, status: 'published', publisherId }
    });

  } catch (error) {
    console.error('Error publishing article:', error);
    res.status(500).json({
      message: 'Error al publicar artículo',
      code: 'PUBLISH_ERROR'
    });
  }
});

/**
 * Get workflow statistics
 * GET /admin/article-review/stats
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await articleReviewService.getWorkflowStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting workflow stats:', error);
    res.status(500).json({
      message: 'Error al obtener estadísticas',
      code: 'GET_STATS_ERROR'
    });
  }
});

export default router;