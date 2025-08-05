import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { adminUsers, adminSessions } from './src/shared';
import { eq, and } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

export interface AdminAuthRequest extends Request {
  adminUser?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    active: boolean;
  };
}

// Middleware to authenticate admin users using admin_users table
export const authenticateAdmin = async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.cookies?.admin_session;
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
        message: 'Acceso denegado',
        code: 'ACCESS_DENIED'
      });
    }

    req.adminUser = {
      id: adminUser.id,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: adminUser.role,
      active: adminUser.active
    };
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ 
      message: 'Error de autenticación',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware to require admin role
export const requireAdmin = async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
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
export const requireSuperAdmin = async (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.adminUser) {
      return res.status(401).json({ 
        message: 'Usuario administrador no autenticado',
        code: 'ADMIN_NOT_AUTHENTICATED'
      });
    }

    if (req.adminUser.role !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Acceso denegado - Se requieren permisos de super administrador',
        code: 'SUPER_ADMIN_REQUIRED'
      });
    }

    next();
  } catch (error) {
    console.error('Super admin check error:', error);
    res.status(500).json({ 
      message: 'Error al verificar permisos de super administrador',
      code: 'SUPER_ADMIN_CHECK_ERROR'
    });
  }
};

// Rate limiting middleware for authentication endpoints
const authAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_AUTH_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const rateLimitAuth = (req: Request, res: Response, next: NextFunction) => {
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
};

// Helper to record failed authentication attempt
export const recordFailedAuth = (req: Request) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  const attempts = authAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
  attempts.count += 1;
  attempts.lastAttempt = now;
  
  authAttempts.set(clientIP, attempts);
};

// Helper to clear successful authentication attempts
export const clearAuthAttempts = (req: Request) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  authAttempts.delete(clientIP);
};

// JWT token verification with enhanced security
export const verifyJWT = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'], // Explicitly specify allowed algorithms
      maxAge: '24h' // Maximum token age
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

// Generate secure JWT token
export const generateJWT = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '24h',
    issuer: 'safra-report',
    audience: 'safra-admin'
  });
};

// Session cleanup (should be run periodically)
export const cleanupExpiredSessions = async () => {
  try {
    const now = new Date();
    
    // Deactivate expired sessions
    await db.update(adminSessions)
      .set({ 
        isActive: false,
        updatedAt: now
      })
      .where(and(
        eq(adminSessions.isActive, true),
        // Sessions that have expired
        eq(adminSessions.expiresAt, now)
      ));
    
    
    // Clean up in-memory rate limiting data (older than 1 hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    authAttempts.forEach((data, ip) => {
      if (data.lastAttempt < oneHourAgo) {
        authAttempts.delete(ip);
      }
    });
    
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
};
