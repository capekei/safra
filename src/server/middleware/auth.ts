import { Router, Request, Response, NextFunction } from "express";
import { validateSession, requireAuth, requireAdmin, type AuthRequest } from './session-auth.middleware.js';
import { sessionAuth } from '../auth/session-auth.js';
import { z } from "zod";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import csrf from "csrf";

// User interface for legacy compatibility
export interface DatabaseUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export type AdminUser = InferSelectModel<typeof adminUsers>;

// Auth Request interface for middleware
export interface AuthRequest extends Request {
  user?: DatabaseUser;
  adminUser?: AdminUser;
}

const router = Router();

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: "Demasiados intentos de autenticación. Intente nuevamente en 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Demasiadas solicitudes. Intente nuevamente más tarde.",
  },
});

// CSRF protection
const tokens = new csrf();

// Helmet security headers with development-friendly CSP
const isDevelopment = process.env.NODE_ENV === 'development';

router.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: isDevelopment 
        ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://replit.com"] 
        : ["'self'"],
      connectSrc: [
        "'self'",
        ...(isDevelopment ? ["ws://localhost:*", "wss://localhost:*"] : [])
      ],
    },
  },
}));

// Middleware to authenticate admin users using session-based auth
export const authenticateAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const adminSessionId = sessionAuth.readAdminSessionCookie(req.headers.cookie);

    if (!adminSessionId) {
      return res.status(401).json({ 
        message: 'Autenticación de administrador requerida',
        code: 'ADMIN_AUTH_REQUIRED'
      });
    }

    const result = await sessionAuth.validateAdminSession(adminSessionId);

    if (!result) {
      return res.status(401).json({ 
        message: 'Sesión de administrador inválida o expirada',
        code: 'ADMIN_SESSION_INVALID'
      });
    }

    if (!result.user.active) {
      return res.status(403).json({ 
        message: 'Usuario administrador inactivo',
        code: 'ADMIN_INACTIVE'
      });
    }

    req.adminUser = result.user;
    req.session = result.session;
    next();
  } catch (error) {
    console.error('Error en authenticateAdmin:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor al autenticar administrador',
      code: 'ADMIN_AUTH_ERROR'
    });
  }
};

// Legacy function removed - use authenticateAdmin instead

// Middleware to require admin role (uses new admin system)
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.adminUser) {
      return res.status(401).json({ 
        message: 'Usuario administrador no autenticado',
        code: 'ADMIN_NOT_AUTHENTICATED'
      });
    }

    // Check if user has sufficient admin privileges
    const validRoles = ['admin', 'super_admin'];
    if (!validRoles.includes(req.adminUser.role)) {
      return res.status(403).json({ 
        message: 'Permisos insuficientes - Se requieren permisos de administrador',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  } catch (error) {
    console.error('Admin role check error:', error);
    res.status(500).json({ 
      message: 'Error al verificar permisos de administrador',
      code: 'PERMISSION_CHECK_ERROR'
    });
  }
};

// Middleware to require super admin role
export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.adminUser) {
    return res.status(401).json({ 
      message: 'Usuario administrador no autenticado',
      code: 'ADMIN_NOT_AUTHENTICATED'
    });
  }

  if (req.adminUser.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Acceso denegado - Se requieren permisos de administrador',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }

  next();
};

// Legacy admin check removed - use authenticateAdmin + requireAdmin instead

// Get current user (admin only)
router.get("/api/auth/user", generalLimiter, authenticateAdmin as any, (req: any, res: Response) => {
  res.json(req.adminUser);
});

// Check if user is admin
router.get("/api/auth/check-admin", generalLimiter, authenticateAdmin as any, (req: any, res: Response) => {
  res.json({
    isAdmin: req.adminUser?.role === 'admin',
    user: req.adminUser
  });
});

// Rate limiting middleware for authentication endpoints
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_AUTH_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const rateLimitAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    const attempts = authAttempts.get(clientIP);
    
    if (attempts) {
      // Reset counter if lockout period has passed
      if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
        authAttempts.delete(clientIP);
      } else if (attempts.count >= MAX_AUTH_ATTEMPTS) {
        return res.status(429).json({
          message: 'Demasiados intentos de autenticación. Intente nuevamente en 15 minutos.',
          code: 'RATE_LIMITED',
          retryAfter: Math.ceil((LOCKOUT_DURATION - (now - attempts.lastAttempt)) / 1000)
        });
      }
    }
    next();
  } catch (error) {
    console.error('Error en rate limiting:', error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      code: "SERVER_ERROR"
    });
  }
};

export default router;