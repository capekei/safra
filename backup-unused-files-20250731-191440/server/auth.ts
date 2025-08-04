import { Router } from "express";
import type { Request, Response } from "express";
import { supabase, supabaseAdmin } from "./supabase";
import jwt from "jsonwebtoken";

const router = Router();

// Get current user from Supabase
router.get("/api/auth/user", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Get user profile from our database
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({ user, profile });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: "Error al obtener usuario" });
  }
});

// Logout endpoint
router.post("/api/auth/logout", (req: Request, res: Response) => {
  // Client handles Supabase signOut, server just confirms
  res.json({ success: true, message: "Sesión cerrada exitosamente" });
});

// Admin authentication check
router.get("/api/auth/admin", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // Check if user has admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    res.json({ success: true, user, profile });
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ message: "Error al verificar permisos" });
  }
});

export default router;