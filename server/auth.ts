import { Router } from "express";
import type { Request, Response, Express } from "express";
import { storage } from "./database/storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import session from "express-session";

const router = Router();

// Mock social media authentication endpoint
router.post("/api/auth/social", async (req: Request, res: Response) => {
  try {
    const { provider, email, firstName, lastName, profileImageUrl } = req.body;
    
    // In production, this would verify the OAuth token with the provider
    // For now, we'll create or update the user
    
    let user = await storage.getUserByEmail(email);
    
    if (!user) {
      // Create new user
      const userId = `${provider}_${Date.now()}`;
      user = await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        profileImageUrl,
        role: 'user'
      });
    }
    
    // Create session
    (req.session as any).userId = user.id;
    (req.session as any).user = user;
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Social auth error:', error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
});

// Get current user
router.get("/api/auth/user", async (req: Request, res: Response) => {
  if ((req.session as any)?.userId && (req.session as any)?.user) {
    res.json((req.session as any).user);
  } else {
    res.status(401).json({ message: "No autenticado" });
  }
});

// Logout - handles both session-based and mock auth logout
router.post("/api/auth/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      // Even if session destroy fails, return success for mock auth cleanup
      res.json({ success: true, message: "Sesión cerrada localmente" });
    } else {
      res.json({ success: true, message: "Sesión cerrada exitosamente" });
    }
  });
});

// Admin login endpoint (separate from social login)
router.post("/api/auth/admin", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    // Check if it's the default admin
    if (username === 'admin' && password === 'admin123') {
      const adminUser = {
        id: 'admin_default',
        email: 'admin@safrareport.com',
        firstName: 'Admin',
        lastName: 'SafraReport',
        profileImageUrl: null,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      (req.session as any).userId = adminUser.id;
      (req.session as any).user = adminUser;
      
      const token = jwt.sign(
        { userId: adminUser.id, role: 'admin' },
        process.env.SESSION_SECRET || 'safra-admin-secret',
        { expiresIn: '7d' }
      );
      
      res.json({ token, user: adminUser });
    } else {
      res.status(401).json({ message: "Credenciales inválidas" });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
});

export default router;