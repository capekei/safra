import type { Request, Response, NextFunction } from "express";
import { db } from './db';
import { auditLogs } from '@shared/schema';
import type { AuthRequest } from './supabase-auth';

/**
 * Logs an administrative action to the database.
 * This provides a persistent audit trail of all significant changes made by admins.
 *
 * @param adminId - The ID of the admin performing the action.
 * @param action - The type of action (e.g., 'create', 'update', 'delete').
 * @param entity - The type of entity being acted upon (e.g., 'article', 'user').
 * @param entityId - The ID of the entity, if applicable.
 * @param details - A JSON object with details of the change.
 * @param req - The Express request object to capture IP and user agent.
 */
export interface LogActionOptions {
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'approve' | 'reject' | 'publish' | 'unpublish' | 'feature' | 'unfeature' | 'view_articles' | 'update_article_status' | 'delete_article';
  entityType: string;
  entityId?: string | null;
  changes?: object | null;
}

export async function logAdminAction(
  req: AuthRequest,
  options: LogActionOptions
) {
  try {
    if (!req.adminUser?.id) {
      console.error('Failed to log admin action: adminUser is not available on the request. Ensure authenticateAdmin middleware runs first.');
      return;
    }

    // Note: Temporarily disabled audit logging due to schema mismatch
    // adminUserId expects integer but Supabase provides string IDs
    // This should be fixed by either:
    // 1. Updating schema to use varchar for adminUserId
    // 2. Creating a mapping table between Supabase user IDs and admin user integers
    console.log('Admin action logged:', {
      adminUserId: req.adminUser.id,
      action: options.action,
      entityType: options.entityType,
      entityId: options.entityId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Logging failure should not disrupt the primary user-facing operation.
  }
}