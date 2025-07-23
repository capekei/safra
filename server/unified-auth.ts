import { Router } from "express";
import type { Request, Response } from "express";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import { z } from "zod";

const router = Router();

// Authentication schemas
const socialAuthSchema = z.object({
  provider: z.enum(['google', 'facebook', 'twitter', 'apple', 'email']),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(), 
  profileImageUrl: z.string().url().optional(),
  providerId: z.string().optional()
});

const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.SESSION_SECRET || 'safra-report-auth-secret-2024';

// Generate JWT token
function generateToken(userId: string, role: string = 'user'): string {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Unified social media authentication
router.post("/api/auth/social", async (req: Request, res: Response) => {
  try {
    const { provider, email, firstName, lastName, profileImageUrl, providerId } = socialAuthSchema.parse(req.body);
    
    // Check if user exists
    let user = await storage.getUserByEmail(email);
    
    if (!user) {
      // Create new user with provider info
      const userId = `${provider}_${providerId || Date.now()}`;
      user = await storage.upsertUser({
        id: userId,
        email,
        firstName: firstName || email.split('@')[0],
        lastName: lastName || '',
        profileImageUrl: profileImageUrl || `https://ui-avatars.com/api/?name=${firstName || email}&background=0D9B5C&color=fff`,
        role: 'user'
      });
    }
    
    // Generate token
    const token = generateToken(user.id, user.role);
    
    // Set session if it exists
    if (req.session) {
      (req.session as any).userId = user.id;
      (req.session as any).user = user;
      (req.session as any).token = token;
    }
    
    res.json({ 
      success: true, 
      user,
      token,
      redirectUrl: user.role === 'admin' ? '/admin/dashboard' : '/cuenta/panel'
    });
  } catch (error) {
    console.error('Social auth error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error al iniciar sesión. Por favor, intente nuevamente." 
    });
  }
});

// Unified admin login
router.post("/api/auth/admin", async (req: Request, res: Response) => {
  try {
    const { username, password } = adminLoginSchema.parse(req.body);
    
    // Check default admin credentials
    if (username === 'admin' && password === 'admin123') {
      const adminUser = {
        id: 'admin_master',
        email: 'admin@safrareport.com',
        firstName: 'Admin',
        lastName: 'SafraReport',
        profileImageUrl: 'https://ui-avatars.com/api/?name=Admin&background=0D9B5C&color=fff',
        role: 'admin' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Generate admin token
      const token = generateToken(adminUser.id, 'admin');
      
      // Set session if it exists
      if (req.session) {
        (req.session as any).userId = adminUser.id;
        (req.session as any).user = adminUser;
        (req.session as any).token = token;
      }
      
      // Store admin token for admin panel access
      res.json({ 
        success: true,
        user: adminUser,
        token,
        redirectUrl: '/admin/dashboard'
      });
    } else {
      // Check database for admin users
      const user = await storage.getUserByEmail(username);
      
      if (user && user.role === 'admin') {
        // In production, verify password hash
        const token = generateToken(user.id, 'admin');
        
        if (req.session) {
          (req.session as any).userId = user.id;
          (req.session as any).user = user;
          (req.session as any).token = token;
        }
        
        res.json({ 
          success: true,
          user,
          token,
          redirectUrl: '/admin/dashboard'
        });
      } else {
        res.status(401).json({ 
          success: false,
          message: "Credenciales inválidas" 
        });
      }
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error al iniciar sesión" 
    });
  }
});

// Get current authenticated user
router.get("/api/auth/user", async (req: Request, res: Response) => {
  try {
    // Check session first
    if ((req.session as any)?.userId && (req.session as any)?.user) {
      return res.json((req.session as any).user);
    }
    
    // Check authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (decoded && decoded.userId) {
        const user = await storage.getUser(decoded.userId);
        if (user) {
          return res.json(user);
        }
      }
    }
    
    res.status(401).json({ message: "No autenticado" });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: "No autenticado" });
  }
});

// Unified logout
router.post("/api/auth/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
    }
    res.json({ 
      success: true, 
      message: "Sesión cerrada exitosamente" 
    });
  });
});

// Check if user has admin access
router.get("/api/auth/check-admin", async (req: Request, res: Response) => {
  try {
    const user = (req.session as any)?.user;
    const token = req.headers.authorization?.substring(7) || (req.session as any)?.token;
    
    if (user && user.role === 'admin') {
      return res.json({ isAdmin: true, user });
    }
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.role === 'admin') {
        return res.json({ isAdmin: true });
      }
    }
    
    res.json({ isAdmin: false });
  } catch (error) {
    res.json({ isAdmin: false });
  }
});

export default router;