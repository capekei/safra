/**
 * Admin API Routes for Article Version Control
 * Handles version history and restoration for SafraReport editorial system
 */

import { Router, type Response } from 'express';
import { versionControl } from '../../services/version-control.js';
import { authenticateAdmin, type AuthRequest } from '../../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin as any);

// Validation schemas
const saveVersionSchema = z.object({
  content: z.any(), // TipTap JSON content
  title: z.string().min(1),
  excerpt: z.string().min(1),
  summary: z.string().optional(),
});

const restoreVersionSchema = z.object({
  version: z.number().int().positive(),
});

/**
 * Get version history for an article
 * GET /admin/versions/:articleId
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

    const versions = await versionControl.getVersions(articleId);

    res.json({
      success: true,
      data: versions,
      count: versions.length
    });

  } catch (error) {
    console.error('Error getting article versions:', error);
    res.status(500).json({
      message: 'Error al obtener versiones del artículo',
      code: 'GET_VERSIONS_ERROR'
    });
  }
});

/**
 * Get a specific version of an article
 * GET /admin/versions/:articleId/:version
 */
router.get('/:articleId/:version', async (req: AuthRequest, res: Response) => {
  try {
    const articleId = parseInt(req.params.articleId);
    const version = parseInt(req.params.version);

    if (isNaN(articleId) || isNaN(version)) {
      return res.status(400).json({
        message: 'ID de artículo o versión inválidos',
        code: 'INVALID_PARAMETERS'
      });
    }

    const versionData = await versionControl.getVersion(articleId, version);

    if (!versionData) {
      return res.status(404).json({
        message: 'Versión no encontrada',
        code: 'VERSION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: versionData
    });

  } catch (error) {
    console.error('Error getting specific version:', error);
    res.status(500).json({
      message: 'Error al obtener la versión específica',
      code: 'GET_VERSION_ERROR'
    });
  }
});

/**
 * Save a new version of an article
 * POST /admin/versions/:articleId
 */
router.post('/:articleId', async (req: AuthRequest, res: Response) => {
  try {
    const articleId = parseInt(req.params.articleId);
    const { content, title, excerpt, summary } = saveVersionSchema.parse(req.body);
    const userId = req.adminUser?.id;

    if (!userId) {
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

    const versionNumber = await versionControl.saveVersion({
      articleId,
      content,
      title,
      excerpt,
      userId,
      summary
    });

    res.json({
      success: true,
      message: 'Versión guardada exitosamente',
      data: {
        articleId,
        version: versionNumber,
        summary: summary || `Versión ${versionNumber}`
      }
    });

  } catch (error) {
    console.error('Error saving version:', error);
    res.status(500).json({
      message: 'Error al guardar versión',
      code: 'SAVE_VERSION_ERROR'
    });
  }
});

/**
 * Restore article to a specific version
 * POST /admin/versions/:articleId/restore
 */
router.post('/:articleId/restore', async (req: AuthRequest, res: Response) => {
  try {
    const articleId = parseInt(req.params.articleId);
    const { version } = restoreVersionSchema.parse(req.body);
    const userId = req.adminUser?.id;

    if (!userId) {
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

    await versionControl.restoreVersion(articleId, version, userId);

    res.json({
      success: true,
      message: `Artículo restaurado a versión ${version} exitosamente`,
      data: {
        articleId,
        restoredToVersion: version,
        restoredBy: userId
      }
    });

  } catch (error) {
    console.error('Error restoring version:', error);
    res.status(500).json({
      message: 'Error al restaurar versión',
      code: 'RESTORE_VERSION_ERROR'
    });
  }
});

/**
 * Compare two versions of an article
 * GET /admin/versions/:articleId/compare/:version1/:version2
 */
router.get('/:articleId/compare/:version1/:version2', async (req: AuthRequest, res: Response) => {
  try {
    const articleId = parseInt(req.params.articleId);
    const version1 = parseInt(req.params.version1);
    const version2 = parseInt(req.params.version2);

    if (isNaN(articleId) || isNaN(version1) || isNaN(version2)) {
      return res.status(400).json({
        message: 'Parámetros inválidos',
        code: 'INVALID_PARAMETERS'
      });
    }

    const comparison = await versionControl.compareVersions(articleId, version1, version2);

    res.json({
      success: true,
      data: comparison
    });

  } catch (error) {
    console.error('Error comparing versions:', error);
    res.status(500).json({
      message: 'Error al comparar versiones',
      code: 'COMPARE_VERSIONS_ERROR'
    });
  }
});

/**
 * Get version statistics for an article
 * GET /admin/versions/:articleId/stats
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

    const stats = await versionControl.getVersionStats(articleId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting version stats:', error);
    res.status(500).json({
      message: 'Error al obtener estadísticas de versiones',
      code: 'GET_STATS_ERROR'
    });
  }
});

/**
 * Clean up old versions (keep only last N versions)
 * DELETE /admin/versions/:articleId/cleanup
 */
router.delete('/:articleId/cleanup', async (req: AuthRequest, res: Response) => {
  try {
    const articleId = parseInt(req.params.articleId);
    const keepLast = parseInt(req.query.keep as string) || 10;

    if (isNaN(articleId)) {
      return res.status(400).json({
        message: 'ID de artículo inválido',
        code: 'INVALID_ARTICLE_ID'
      });
    }

    const deletedCount = await versionControl.cleanupOldVersions(articleId, keepLast);

    res.json({
      success: true,
      message: `${deletedCount} versiones antiguas eliminadas`,
      data: {
        articleId,
        deletedCount,
        keptLast: keepLast
      }
    });

  } catch (error) {
    console.error('Error cleaning up versions:', error);
    res.status(500).json({
      message: 'Error al limpiar versiones antiguas',
      code: 'CLEANUP_ERROR'
    });
  }
});

export default router;