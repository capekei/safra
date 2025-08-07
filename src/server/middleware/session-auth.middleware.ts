/**
 * Session-Based Authentication Middleware for SafraReport
 * Dominican Republic optimized with Spanish error messages
 */

import type { Request, Response, NextFunction } from "express";
import { sessionAuth } from "../auth/session-auth.js";

// Extended Request interface for auth
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    emailVerified: boolean;
    provinceId?: string;
    isActive: boolean;
  };
  adminUser?: {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    active: boolean;
  };
  session?: {
    id: string;
    userId?: string;
    adminUserId?: number;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  };
}

/**
 * Validate session and attach user to request
 * Works for both regular users and admin users
 */
export async function validateSession(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Try to get user session first
    const sessionId = sessionAuth.readSessionCookie(req.headers.cookie);
    if (sessionId) {
      const result = await sessionAuth.validateSession(sessionId);
      if (result && result.user && result.session) {
        req.user = result.user;
        req.session = result.session;
        return next();
      }
    }

    // Try admin session if user session failed
    const adminSessionId = sessionAuth.readAdminSessionCookie(req.headers.cookie);
    if (adminSessionId) {
      const result = await sessionAuth.validateAdminSession(adminSessionId);
      if (result && result.user && result.session) {
        req.adminUser = result.user;
        req.session = result.session;
        return next();
      }
    }

    // No valid session found, but don't error - let route decide
    req.user = undefined;
    req.adminUser = undefined;
    req.session = undefined;
    next();
  } catch (error) {
    console.error('Session validation error:', error);
    req.user = undefined;
    req.adminUser = undefined;
    req.session = undefined;
    next();
  }
}

/**
 * Require authentication (either user or admin)
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user && !req.adminUser) {
    return res.status(401).json({
      success: false,
      message: 'Autenticación requerida',
      code: 'NOT_AUTHENTICATED'
    });
  }
  next();
}

/**
 * Require user authentication (not admin)
 */
export function requireUser(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticación de usuario requerida',
      code: 'USER_AUTH_REQUIRED'
    });
  }

  // Check if user is active
  if (!req.user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Cuenta de usuario desactivada',
      code: 'USER_INACTIVE'
    });
  }

  next();
}

/**
 * Require admin authentication
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.adminUser) {
    return res.status(401).json({
      success: false,
      message: 'Autenticación de administrador requerida',
      code: 'ADMIN_AUTH_REQUIRED'
    });
  }

  // Check if admin is active
  if (!req.adminUser.active) {
    return res.status(403).json({
      success: false,
      message: 'Cuenta de administrador desactivada',
      code: 'ADMIN_INACTIVE'
    });
  }

  next();
}

/**
 * Require specific admin role
 */
export function requireAdminRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación de administrador requerida',
        code: 'ADMIN_AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.adminUser.role)) {
      return res.status(403).json({
        success: false,
        message: `Permisos insuficientes. Se requiere rol: ${roles.join(' o ')}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
}

/**
 * Require super admin role
 */
export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.adminUser) {
    return res.status(401).json({
      success: false,
      message: 'Autenticación de administrador requerida',
      code: 'ADMIN_AUTH_REQUIRED'
    });
  }

  if (req.adminUser.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado - Se requieren permisos de súper administrador',
      code: 'SUPER_ADMIN_REQUIRED'
    });
  }

  next();
}

/**
 * Check if user has verified email
 */
export function requireVerifiedEmail(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticación requerida',
      code: 'NOT_AUTHENTICATED'
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Correo electrónico no verificado. Verifique su correo para continuar.',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }

  next();
}

/**
 * Check if user is from a specific Dominican province
 */
export function requireProvince(...provinces: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!req.user.provinceId || !provinces.includes(req.user.provinceId)) {
      return res.status(403).json({
        success: false,
        message: `Acceso limitado a usuarios de: ${provinces.join(', ')}`,
        code: 'PROVINCE_RESTRICTED'
      });
    }

    next();
  };
}

/**
 * Refresh session if close to expiry (extend session)
 */
export async function refreshNearExpirySession(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.session && req.session.expiresAt) {
      const now = new Date();
      const expiresAt = new Date(req.session.expiresAt);
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      const oneHour = 60 * 60 * 1000;

      // If session expires in less than 1 hour, refresh it
      if (timeUntilExpiry < oneHour) {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        if (req.user) {
          // Refresh user session
          await sessionAuth.invalidateSession(req.session.id);
          const { sessionId, expiresAt: newExpiresAt } = await sessionAuth.createSession(req.user.id, ip, userAgent);
          
          const cookie = sessionAuth.createSessionCookie(sessionId, newExpiresAt);
          res.setHeader("Set-Cookie", [
            `${cookie.name}=${cookie.value}; HttpOnly; Secure=${cookie.attributes.secure}; SameSite=${cookie.attributes.sameSite}; Path=${cookie.attributes.path}; Expires=${cookie.attributes.expires.toUTCString()}`
          ]);
        } else if (req.adminUser) {
          // Refresh admin session
          await sessionAuth.invalidateAdminSession(req.session.id);
          const { sessionId, expiresAt: newExpiresAt } = await sessionAuth.createAdminSession(req.adminUser.id, ip, userAgent);
          
          const cookie = sessionAuth.createAdminSessionCookie(sessionId, newExpiresAt);
          res.setHeader("Set-Cookie", [
            `${cookie.name}=${cookie.value}; HttpOnly; Secure=${cookie.attributes.secure}; SameSite=${cookie.attributes.sameSite}; Path=${cookie.attributes.path}; Expires=${cookie.attributes.expires.toUTCString()}`
          ]);
        }
      }
    }
    next();
  } catch (error) {
    console.error('Session refresh error:', error);
    // Don't fail the request if session refresh fails
    next();
  }
}

/**
 * Log authentication events for security monitoring
 */
export function logAuthEvent(eventType: 'login' | 'logout' | 'access_denied' | 'session_expired') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const userId = req.user?.id || req.adminUser?.id || 'anonymous';
    const userType = req.user ? 'user' : req.adminUser ? 'admin' : 'anonymous';

    console.log(`[AUTH_EVENT] ${eventType.toUpperCase()} - User: ${userId} (${userType}) - IP: ${ip} - Agent: ${userAgent} - Time: ${new Date().toISOString()}`);
    
    // In production, send to proper logging service
    // await auditLogger.logAuthEvent({ eventType, userId, userType, ip, userAgent });
    
    next();
  };
}

/**
 * Check Dominican business hours (optional middleware for admin actions)
 */
export function checkBusinessHours(req: AuthRequest, res: Response, next: NextFunction) {
  const now = new Date();
  const dominicanTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Santo_Domingo" }));
  const hour = dominicanTime.getHours();
  const day = dominicanTime.getDay(); // 0 = Sunday, 6 = Saturday

  // Business hours: Monday-Friday 8 AM to 6 PM (Dominican time)
  const isBusinessHours = (day >= 1 && day <= 5) && (hour >= 8 && hour < 18);

  if (!isBusinessHours) {
    // Just log, don't block (this is optional)
    console.log(`[AFTER_HOURS] Action attempted outside business hours - ${dominicanTime.toISOString()}`);
  }

  next();
}

// Export all middleware functions
export {
  sessionAuth as auth,
  validateSession as session,
  requireAuth as authenticated,
  requireUser as userOnly,
  requireAdmin as adminOnly,
  requireAdminRole as adminRole,
  requireSuperAdmin as superAdmin,
  requireVerifiedEmail as verified,
  requireProvince as provinceOnly,
  refreshNearExpirySession as refreshSession,
  logAuthEvent as logAuth,
  checkBusinessHours as businessHours
};