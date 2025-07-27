// LEGACY FILE - Replaced by supabase-auth.ts
// This file is kept for reference only and should not be imported

import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: any;
  adminUser?: any;
}

export const authenticateAdmin = () => {
  throw new Error('This is a legacy file. Use supabase-auth.ts instead');
};

export const checkJwt = () => {
  throw new Error('This is a legacy file. Use supabase-auth.ts instead');
};

export const authenticateUser = () => {
  throw new Error('This is a legacy file. Use supabase-auth.ts instead');
};

export const requireRole = () => {
  throw new Error('This is a legacy file. Use supabase-auth.ts instead');
};