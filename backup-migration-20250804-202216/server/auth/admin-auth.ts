import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { adminUsers, adminSessions } from "./src/shared";
import { eq, and } from "drizzle-orm";
import { DR_ERRORS } from "../lib/helpers/dominican";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";
const SALT_ROUNDS = 12;

// Admin login endpoint
router.post("/api/auth/admin/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email y contraseña son requeridos",
        code: "MISSING_CREDENTIALS"
      });
    }

    // Find admin user by email
    const adminUser = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, email.toLowerCase().trim())
    });

    if (!adminUser) {
      return res.status(401).json({ 
        message: "Credenciales inválidas",
        code: "INVALID_CREDENTIALS"
      });
    }

    // Check if account is active
    if (!adminUser.active) {
      return res.status(403).json({ 
        message: "Cuenta desactivada. Contacte al administrador",
        code: "ACCOUNT_DISABLED"
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: "Credenciales inválidas",
        code: "INVALID_CREDENTIALS"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: adminUser.id, 
        email: adminUser.email,
        role: adminUser.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create session record
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(adminSessions).values({
      id: sessionId,
      admin_user_id: adminUser.id,
      token: token,
      expires_at: expiresAt,
      ip_address: req.ip || req.connection.remoteAddress || 'unknown',
      user_agent: req.headers['user-agent'] || 'unknown'
    });

    // Update last login
    await db.update(adminUsers)
      .set({ 
        last_login: new Date(),
        updated_at: new Date()
      })
      .where(eq(adminUsers.id, adminUser.id));

    // Set secure HTTP-only cookie
    res.cookie('admin_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return success response (without sensitive data)
    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      user: {
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.first_name,
        lastName: adminUser.last_name,
        role: adminUser.role
      },
      token: token
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      message: "Error interno del servidor",
      code: "INTERNAL_ERROR"
    });
  }
});

// Admin logout endpoint
router.post("/api/auth/admin/logout", async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies.admin_session;
    
    if (sessionId) {
      // Invalidate session in database
      await db.update(adminSessions)
        .set({ 
          is_active: false,
          updated_at: new Date()
        })
        .where(eq(adminSessions.id, sessionId));
    }

    // Clear cookie
    res.clearCookie('admin_session');

    res.json({
      success: true,
      message: "Sesión cerrada exitosamente"
    });

  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ 
      message: "Error al cerrar sesión",
      code: "LOGOUT_ERROR"
    });
  }
});

// Verify admin session endpoint
router.get("/api/auth/admin/verify", async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies.admin_session;
    const authHeader = req.headers.authorization;

    if (!sessionId && !authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: "No autenticado",
        code: "NOT_AUTHENTICATED"
      });
    }

    let adminUser;

    if (sessionId) {
      // Verify session from cookie
      const session = await db.query.adminSessions.findFirst({
        where: and(
          eq(adminSessions.id, sessionId),
          eq(adminSessions.is_active, true)
        ),
        with: {
          adminUser: true
        }
      });

      if (!session || session.expires_at < new Date()) {
        return res.status(401).json({ 
          message: "Sesión expirada",
          code: "SESSION_EXPIRED"
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
          message: "Token inválido",
          code: "INVALID_TOKEN"
        });
      }
    }

    if (!adminUser || !adminUser.active) {
      return res.status(403).json({ 
        message: "Acceso denegado",
        code: "ACCESS_DENIED"
      });
    }

    // Return user info (without sensitive data)
    res.json({
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.first_name,
        lastName: adminUser.last_name,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('Admin verify error:', error);
    res.status(500).json({ 
      message: "Error al verificar sesión",
      code: "VERIFICATION_ERROR"
    });
  }
});

// Create admin user endpoint (for initial setup only)
router.post("/api/auth/admin/create", async (req: Request, res: Response) => {
  try {
    // Only allow in development or if no admin users exist
    const existingAdmins = await db.query.adminUsers.findMany();
    
    if (process.env.NODE_ENV === 'production' && existingAdmins.length > 0) {
      return res.status(403).json({ 
        message: "Creación de administradores no permitida en producción",
        code: "CREATION_FORBIDDEN"
      });
    }

    const { email, password, firstName, lastName, username } = req.body;

    if (!email || !password || !firstName || !lastName || !username) {
      return res.status(400).json({ 
        message: "Todos los campos son requeridos (email, password, firstName, lastName, username)",
        code: "MISSING_FIELDS"
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ 
        message: "La contraseña debe tener al menos 8 caracteres",
        code: "WEAK_PASSWORD"
      });
    }

    // Check if admin already exists
    const existingAdmin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, email.toLowerCase().trim())
    });

    if (existingAdmin) {
      return res.status(409).json({ 
        message: "Ya existe un administrador con este email",
        code: "EMAIL_EXISTS"
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create admin user
    const [newAdmin] = await db.insert(adminUsers).values({
      email: email.toLowerCase().trim(),
      username: username.toLowerCase().trim(),
      password: passwordHash,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      role: 'super_admin',
      active: true
    }).returning();

    res.status(201).json({
      success: true,
      message: "Administrador creado exitosamente",
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        firstName: newAdmin.first_name,
        lastName: newAdmin.last_name,
        role: newAdmin.role
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ 
      message: "Error al crear administrador",
      code: "CREATION_ERROR"
    });
  }
});

export default router;
