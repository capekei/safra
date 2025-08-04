import { Response, NextFunction } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { AdminAuthRequest } from './admin-auth';

/**
 * Middleware to set admin user context for Row Level Security (RLS) policies
 * This must be used after authenticateAdmin middleware
 */
export const setAdminContext = async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.adminUser) {
      // Set the current admin user ID in the database session
      // This is used by RLS policies to determine access permissions
      await db.execute(sql`SELECT set_config('app.current_admin_id', ${req.adminUser.id.toString()}, true)`);
    }
    next();
  } catch (error) {
    console.error('Error setting admin context for RLS:', error);
    // Don't fail the request if context setting fails
    // RLS policies will default to deny access
    next();
  }
};

/**
 * Middleware to clear admin context (optional, for security)
 * Use this after admin operations to ensure context doesn't leak
 */
export const clearAdminContext = async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  try {
    await db.execute(sql`SELECT set_config('app.current_admin_id', '', true)`);
    next();
  } catch (error) {
    console.error('Error clearing admin context:', error);
    next();
  }
};

/**
 * Helper function to check if current database session has admin privileges
 */
export const checkAdminPrivileges = async (): Promise<boolean> => {
  try {
    const result = await db.execute(sql`SELECT is_admin() as is_admin`);
    return result.rows[0]?.is_admin === true;
  } catch (error) {
    console.error('Error checking admin privileges:', error);
    return false;
  }
};

/**
 * Middleware to enforce admin privileges at the database level
 * This provides an additional security layer beyond role-based checks
 */
export const enforceAdminPrivileges = async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  try {
    const hasPrivileges = await checkAdminPrivileges();
    
    if (!hasPrivileges) {
      return res.status(403).json({
        message: 'Privilegios de administrador no verificados en la base de datos',
        code: 'DB_ADMIN_PRIVILEGES_REQUIRED'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error enforcing admin privileges:', error);
    res.status(500).json({
      message: 'Error al verificar privilegios de administrador',
      code: 'PRIVILEGE_CHECK_ERROR'
    });
  }
};
