import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./unified-auth";

export interface AuthRequest extends Request {
  adminUser?: any;
  adminToken?: string;
}

export function authenticateAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Check authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Token inválido" });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'admin') {
      return res.status(401).json({ message: "Acceso no autorizado" });
    }

    // Attach admin info to request
    req.adminUser = decoded;
    req.adminToken = token;

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ message: "Token inválido" });
  }
}

// Helper function to log admin actions
export function logAdminAction(adminId: string, action: string, details?: any) {
  console.log(`[ADMIN ACTION] User: ${adminId}, Action: ${action}`, details || '');
  // In production, this would save to the audit_logs table
}

// Middleware to require specific role
export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.adminUser || req.adminUser.role !== role) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    next();
  };
}