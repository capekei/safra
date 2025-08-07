/**
 * ArticleReviewService for SafraReport Editorial Workflow
 * Handles Dominican Republic news editorial review process
 * States: draft → pending_review → approved → published
 */

import { db } from '../db.js';
import { articles, articleReviews, adminUsers, editorialComments } from '../../shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import type { NewArticleReview } from '../../shared/types.js';

export type ReviewDecision = 'approve' | 'reject' | 'needs_changes';

export interface SubmitReviewData {
  articleId: number;
  authorId: number;
}

export interface ReviewArticleData {
  articleId: number;
  reviewerId: number;
  decision: ReviewDecision;
  comments?: string;
}

export interface NotificationData {
  type: 'article_submitted' | 'article_reviewed';
  articleId: number;
  recipientId: number;
  message: string;
}

export class ArticleReviewService {
  /**
   * Submit article for editorial review
   * Changes status from draft to pending_review
   */
  async submitForReview(data: SubmitReviewData): Promise<void> {
    const { articleId, authorId } = data;

    try {
      await db.transaction(async (tx) => {
        // Update article status
        await tx.update(articles).set({ 
          status: 'pending_review',
          submitted_at: new Date()
        }).where(eq(articles.id, articleId));

        // Log the submission
        console.log(`Article ${articleId} submitted for review by admin ${authorId}`);
        
        // Get all editors for notification
        const editors = await tx.select({
          id: adminUsers.id,
          email: adminUsers.email,
          first_name: adminUsers.first_name
        })
        .from(adminUsers)
        .where(eq(adminUsers.role, 'editor'));

        // Notify editors (in production, this would send emails)
        for (const editor of editors) {
          await this.notifyUser({
            type: 'article_submitted',
            articleId,
            recipientId: editor.id,
            message: `Nuevo artículo enviado para revisión por ${authorId}`
          });
        }
      });

      console.log(`✅ Article ${articleId} successfully submitted for review`);
    } catch (error) {
      console.error('Error submitting article for review:', error);
      throw new Error('Failed to submit article for review');
    }
  }

  /**
   * Review article and make editorial decision
   * Updates article status based on review decision
   */
  async reviewArticle(data: ReviewArticleData): Promise<void> {
    const { articleId, reviewerId, decision, comments } = data;

    try {
      await db.transaction(async (tx) => {
        // Record the review
        await tx.insert(articleReviews).values({
          article_id: articleId,
          reviewer_id: reviewerId,
          decision,
          comments,
          reviewed_at: new Date()
        });
        
        // Determine new article status
        const statusMap: Record<ReviewDecision, string> = {
          'approve': 'approved',
          'reject': 'rejected', 
          'needs_changes': 'needs_changes'
        };

        const newStatus = statusMap[decision];
        const updateData: any = { status: newStatus };

        // If approved, record approval details
        if (decision === 'approve') {
          updateData.approved_at = new Date();
          updateData.approved_by = reviewerId;
        }

        // Update article status
        await tx.update(articles)
          .set(updateData)
          .where(eq(articles.id, articleId));

        // Get article details for notification
        const article = await tx.select({
          title: articles.title,
          author_id: articles.author_id
        })
        .from(articles)
        .where(eq(articles.id, articleId))
        .limit(1);

        if (article[0]) {
          // Notify the author
          await this.notifyUser({
            type: 'article_reviewed',
            articleId,
            recipientId: article[0].author_id,
            message: `Tu artículo "${article[0].title}" ha sido ${decision === 'approve' ? 'aprobado' : decision === 'reject' ? 'rechazado' : 'enviado para cambios'}`
          });
        }
      });

      console.log(`✅ Article ${articleId} reviewed with decision: ${decision}`);
    } catch (error) {
      console.error('Error reviewing article:', error);
      throw new Error('Failed to review article');
    }
  }

  /**
   * Get articles pending review for editorial dashboard
   */
  async getPendingReviews(limit: number = 20) {
    try {
      return await db.select({
        id: articles.id,
        title: articles.title,
        excerpt: articles.excerpt,
        author_id: articles.author_id,
        author_name: adminUsers.first_name,
        submitted_at: articles.submitted_at,
        status: articles.status,
        category_id: articles.category_id,
        created_at: articles.created_at
      })
      .from(articles)
      .leftJoin(adminUsers, eq(articles.author_id, adminUsers.id))
      .where(eq(articles.status, 'pending_review'))
      .orderBy(desc(articles.submitted_at))
      .limit(limit);
    } catch (error) {
      console.error('Error getting pending reviews:', error);
      throw new Error('Failed to get pending reviews');
    }
  }

  /**
   * Get review history for an article
   */
  async getArticleReviews(articleId: number) {
    try {
      return await db.select({
        id: articleReviews.id,
        decision: articleReviews.decision,
        comments: articleReviews.comments,
        reviewed_at: articleReviews.reviewed_at,
        reviewer_name: adminUsers.first_name,
        reviewer_email: adminUsers.email
      })
      .from(articleReviews)
      .leftJoin(adminUsers, eq(articleReviews.reviewer_id, adminUsers.id))
      .where(eq(articleReviews.article_id, articleId))
      .orderBy(desc(articleReviews.reviewed_at));
    } catch (error) {
      console.error('Error getting article reviews:', error);
      throw new Error('Failed to get article reviews');
    }
  }

  /**
   * Publish approved article
   * Final step in editorial workflow
   */
  async publishArticle(articleId: number, publisherId: number): Promise<void> {
    try {
      // Verify article is approved
      const article = await db.select()
        .from(articles)
        .where(and(eq(articles.id, articleId), eq(articles.status, 'approved')))
        .limit(1);

      if (!article[0]) {
        throw new Error('Article not found or not approved for publishing');
      }

      await db.update(articles).set({
        status: 'published',
        published: true,
        published_at: new Date()
      }).where(eq(articles.id, articleId));

      console.log(`✅ Article ${articleId} published by admin ${publisherId}`);
    } catch (error) {
      console.error('Error publishing article:', error);
      throw new Error('Failed to publish article');
    }
  }

  /**
   * Add editorial comment to article
   */
  async addComment(articleId: number, authorId: number, text: string): Promise<void> {
    try {
      await db.insert(editorialComments).values({
        article_id: articleId,
        author_id: authorId,
        text,
        resolved: false
      });

      console.log(`✅ Comment added to article ${articleId} by admin ${authorId}`);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  }

  /**
   * Get editorial comments for article
   */
  async getComments(articleId: number) {
    try {
      return await db.select({
        id: editorialComments.id,
        text: editorialComments.text,
        resolved: editorialComments.resolved,
        created_at: editorialComments.created_at,
        author_name: adminUsers.first_name,
        author_email: adminUsers.email
      })
      .from(editorialComments)
      .leftJoin(adminUsers, eq(editorialComments.author_id, adminUsers.id))
      .where(eq(editorialComments.article_id, articleId))
      .orderBy(desc(editorialComments.created_at));
    } catch (error) {
      console.error('Error getting comments:', error);
      throw new Error('Failed to get comments');
    }
  }

  /**
   * Private method to handle user notifications
   * In production, this would integrate with email/push notification system
   */
  private async notifyUser(data: NotificationData): Promise<void> {
    // For now, just log the notification
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`📧 Notification: ${data.type} for article ${data.articleId} to user ${data.recipientId}: ${data.message}`);
    
    // TODO: Implement actual notification system
    // await emailService.send({
    //   to: recipientEmail,
    //   subject: getSubjectForNotificationType(data.type),
    //   message: data.message
    // });
  }

  /**
   * Get editorial workflow statistics
   * Useful for admin dashboard
   */
  async getWorkflowStats() {
    try {
      const stats = await db.select({
        status: articles.status,
        count: db.$count()
      })
      .from(articles)
      .groupBy(articles.status);

      return stats.reduce((acc, stat) => {
        acc[stat.status || 'unknown'] = Number(stat.count);
        return acc;
      }, {} as Record<string, number>);
    } catch (error) {
      console.error('Error getting workflow stats:', error);
      return {};
    }
  }
}

// Export singleton instance
export const articleReviewService = new ArticleReviewService();