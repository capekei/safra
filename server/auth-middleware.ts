import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Extend Request to include admin user
export interface AuthRequest extends Request {
  adminUser?: any;
}

// Authentication middleware
export function authenticateAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '') || '';
  
  if (!token) {
    return res.status(401).json({ message: "No autorizado" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'safra-admin-secret') as any;
    req.adminUser = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

// Role-based access control
export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.adminUser || req.adminUser.role !== role) {
      return res.status(403).json({ message: "Sin permisos suficientes" });
    }
    next();
  };
}

// Helper functions
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: number): string {
  return jwt.sign(
    { userId, timestamp: Date.now() },
    process.env.SESSION_SECRET || 'safra-admin-secret',
    { expiresIn: '24h' }
  );
}

// User authentication middleware
export function authenticateUser(req: any, res: Response, next: NextFunction) {
  // Check for session user (from social auth or mock auth)
  if ((req.session as any)?.user) {
    req.user = (req.session as any).user;
    return next();
  }
  
  // Check for JWT token
  const token = req.headers.authorization?.replace('Bearer ', '') || '';
  
  if (!token) {
    return res.status(401).json({ message: "No autenticado" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'safra-user-secret') as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
}