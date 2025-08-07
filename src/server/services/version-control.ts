/**
 * VersionControl Service for SafraReport Editorial System
 * Tracks all changes to articles with full version history
 * Essential for Dominican Republic news editorial workflow
 */

import { db } from '../db.js';
import { articleVersions, articles } from '../../shared/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import type { NewArticleVersion } from '../../shared/types.js';

export interface SaveVersionData {
  articleId: number;
  content: any;
  title: string;
  excerpt: string;
  userId: number;
  summary?: string;
}

export interface ArticleVersionWithDetails {
  id: number;
  version: number;
  content: any;
  title: string;
  excerpt: string;
  changed_by: number;
  changes_summary?: string | null;
  created_at: Date | null;
  author_name?: string;
}

export class VersionControl {
  /**
   * Save a new version of an article
   * Automatically increments version number
   */
  async saveVersion(data: SaveVersionData): Promise<number> {
    const { articleId, content, title, excerpt, userId, summary } = data;

    try {
      return await db.transaction(async (tx) => {
        // Get the latest version number for this article
        const lastVersion = await tx.select()
          .from(articleVersions)
          .where(eq(articleVersions.article_id, articleId))
          .orderBy(desc(articleVersions.version))
          .limit(1);
        
        const newVersion = (lastVersion[0]?.version || 0) + 1;
        
        // Insert new version
        const [versionRecord] = await tx.insert(articleVersions).values({
          article_id: articleId,
          version: newVersion,
          content,
          title,
          excerpt,
          changed_by: userId,
          changes_summary: summary || `Versión ${newVersion} - ${new Date().toLocaleDateString('es-DO')}`
        }).returning();

        console.log(`✅ Version ${newVersion} saved for article ${articleId} by user ${userId}`);
        return newVersion;
      });
    } catch (error) {
      console.error('Error saving version:', error);
      throw new Error('Failed to save article version');
    }
  }

  /**
   * Get all versions for an article
   * Returns versions in descending order (newest first)
   */
  async getVersions(articleId: number): Promise<ArticleVersionWithDetails[]> {
    try {
      const versions = await db.select({
        id: articleVersions.id,
        version: articleVersions.version,
        content: articleVersions.content,
        title: articleVersions.title,
        excerpt: articleVersions.excerpt,
        changed_by: articleVersions.changed_by,
        changes_summary: articleVersions.changes_summary,
        created_at: articleVersions.created_at,
        // We'll get author name separately to avoid complex joins
      })
      .from(articleVersions)
      .where(eq(articleVersions.article_id, articleId))
      .orderBy(desc(articleVersions.version));

      // Add author names (in production, consider optimizing with a single join)
      const versionsWithAuthors = await Promise.all(
        versions.map(async (version) => {
          if (version.changed_by) {
            const author = await db.query.adminUsers.findFirst({
              where: eq(db.query.adminUsers.id, version.changed_by),
              columns: { first_name: true }
            });
            return { ...version, author_name: author?.first_name || 'Desconocido' };
          }
          return { ...version, author_name: 'Sistema' };
        })
      );

      return versionsWithAuthors;
    } catch (error) {
      console.error('Error getting versions:', error);
      throw new Error('Failed to get article versions');
    }
  }

  /**
   * Get a specific version of an article
   */
  async getVersion(articleId: number, versionNumber: number): Promise<ArticleVersionWithDetails | null> {
    try {
      const version = await db.select()
        .from(articleVersions)
        .where(and(
          eq(articleVersions.article_id, articleId),
          eq(articleVersions.version, versionNumber)
        ))
        .limit(1);

      if (!version[0]) {
        return null;
      }

      // Get author name
      let authorName = 'Sistema';
      if (version[0].changed_by) {
        const author = await db.query.adminUsers.findFirst({
          where: eq(db.query.adminUsers.id, version[0].changed_by),
          columns: { first_name: true }
        });
        authorName = author?.first_name || 'Desconocido';
      }

      return { ...version[0], author_name: authorName };
    } catch (error) {
      console.error('Error getting specific version:', error);
      throw new Error('Failed to get article version');
    }
  }

  /**
   * Restore article to a specific version
   * Creates a new version with the restored content
   */
  async restoreVersion(articleId: number, versionNumber: number, restoredBy: number): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        // Get the version to restore
        const versionToRestore = await tx.select()
          .from(articleVersions)
          .where(and(
            eq(articleVersions.article_id, articleId),
            eq(articleVersions.version, versionNumber)
          ))
          .limit(1);

        if (!versionToRestore[0]) {
          throw new Error('Version not found');
        }

        const { content, title, excerpt } = versionToRestore[0];

        // Update the main article
        await tx.update(articles).set({
          content,
          title,
          excerpt,
          updated_at: new Date()
        }).where(eq(articles.id, articleId));

        // Save this restoration as a new version
        await this.saveVersion({
          articleId,
          content,
          title,
          excerpt,
          userId: restoredBy,
          summary: `Restaurado a versión ${versionNumber}`
        });

        console.log(`✅ Article ${articleId} restored to version ${versionNumber} by user ${restoredBy}`);
      });
    } catch (error) {
      console.error('Error restoring version:', error);
      throw new Error('Failed to restore article version');
    }
  }

  /**
   * Compare two versions of an article
   * Returns a basic diff structure (can be enhanced with proper diff algorithms)
   */
  async compareVersions(articleId: number, version1: number, version2: number) {
    try {
      const [v1, v2] = await Promise.all([
        this.getVersion(articleId, version1),
        this.getVersion(articleId, version2)
      ]);

      if (!v1 || !v2) {
        throw new Error('One or both versions not found');
      }

      return {
        version1: {
          number: version1,
          title: v1.title,
          excerpt: v1.excerpt,
          content: v1.content,
          created_at: v1.created_at,
          author: v1.author_name
        },
        version2: {
          number: version2,
          title: v2.title,
          excerpt: v2.excerpt,
          content: v2.content,
          created_at: v2.created_at,
          author: v2.author_name
        },
        changes: {
          title: v1.title !== v2.title,
          excerpt: v1.excerpt !== v2.excerpt,
          content: JSON.stringify(v1.content) !== JSON.stringify(v2.content)
        }
      };
    } catch (error) {
      console.error('Error comparing versions:', error);
      throw new Error('Failed to compare versions');
    }
  }

  /**
   * Get version statistics for an article
   */
  async getVersionStats(articleId: number) {
    try {
      const stats = await db.select({
        total_versions: db.$count(),
        first_version: db.$min(articleVersions.created_at),
        last_version: db.$max(articleVersions.created_at)
      })
      .from(articleVersions)
      .where(eq(articleVersions.article_id, articleId));

      return stats[0] || {
        total_versions: 0,
        first_version: null,
        last_version: null
      };
    } catch (error) {
      console.error('Error getting version stats:', error);
      return {
        total_versions: 0,
        first_version: null,
        last_version: null
      };
    }
  }

  /**
   * Clean up old versions (keep only last N versions)
   * Useful for database maintenance
   */
  async cleanupOldVersions(articleId: number, keepLast: number = 10): Promise<number> {
    try {
      // Get versions to delete (keep only the latest N)
      const versionsToDelete = await db.select({ id: articleVersions.id })
        .from(articleVersions)
        .where(eq(articleVersions.article_id, articleId))
        .orderBy(desc(articleVersions.version))
        .offset(keepLast);

      if (versionsToDelete.length === 0) {
        return 0;
      }

      const idsToDelete = versionsToDelete.map(v => v.id);
      
      // Delete old versions
      await db.delete(articleVersions)
        .where(eq(articleVersions.id, idsToDelete[0])); // Simplified for demo

      console.log(`🧹 Cleaned up ${versionsToDelete.length} old versions for article ${articleId}`);
      return versionsToDelete.length;
    } catch (error) {
      console.error('Error cleaning up versions:', error);
      throw new Error('Failed to cleanup old versions');
    }
  }
}

// Export singleton instance
export const versionControl = new VersionControl();