// LEGACY FILE - Replaced by supabase-auth.ts
// This file is kept for reference only and should not be imported

import { Router, Request, Response } from "express";

const router = Router();

export default router;

// Legacy exports for compatibility
export function generateToken(): string {
  throw new Error('This is a legacy file. Use supabase-auth.ts instead');
}

export function verifyToken(): any {
  throw new Error('This is a legacy file. Use supabase-auth.ts instead');
}

export function hashPassword(): Promise<string> {
  throw new Error('This is a legacy file. Use supabase-auth.ts instead');
}

export function comparePassword(): Promise<boolean> {
  throw new Error('This is a legacy file. Use supabase-auth.ts instead');
}