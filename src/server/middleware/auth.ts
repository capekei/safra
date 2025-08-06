import { Router, Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { adminUsers, adminSessions } from '../../shared';
import { eq, and } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
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

// Middleware to authenticate admin users using admin_users table
export const authenticateAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.cookies.admin_session;
    const authHeader = req.headers.authorization;

    if (!sessionId && !authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Autenticación requerida',
        code: 'NOT_AUTHENTICATED'
      });
    }

    let adminUser;

    if (sessionId) {
      // Verify session from cookie
      const session = await db.query.adminSessions.findFirst({
        where: and(
          eq(adminSessions.id, sessionId),
          eq(adminSessions.isActive, true)
        ),
        with: {
          adminUser: true
        }
      });

      if (!session || session.expiresAt < new Date()) {
        return res.status(401).json({ 
          message: 'Sesión expirada',
          code: 'SESSION_EXPIRED'
        });
      }

      adminUser = session.adminUser;
    } else {
      // Verify JWT token from header
      const token = authHeader!.substring(7);
      
      try {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
          console.error("JWT_SECRET is not defined in environment variables.");
          return res.status(500).json({ message: 'Internal Server Error', code: 'JWT_SECRET_MISSING' });
        }
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        adminUser = await db.query.adminUsers.findFirst({
          where: eq(adminUsers.id, decoded.userId)
        });
      } catch (jwtError) {
        return res.status(401).json({ 
          message: 'Token inválido',
          code: 'INVALID_TOKEN'
        });
      }
    }

    if (!adminUser || !adminUser.active) {
      return res.status(403).json({ 
        message: 'Usuario administrador inactivo o no encontrado',
        code: 'ADMIN_INACTIVE_OR_NOT_FOUND'
      });
    }

    req.adminUser = adminUser;
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