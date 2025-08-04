import { Router, Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { adminUsers, adminSessions } from '@safra/shared';
import { eq, and } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import { supabase, supabaseAdmin, DatabaseUser, TypedSupabaseClient } from "../supabase";

export type AdminUser = InferSelectModel<typeof adminUsers>;
import { z } from "zod";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import csrf from "csrf";

// Auth Request interface for middleware
export interface AuthRequest extends Request {
  user?: DatabaseUser;
  adminUser?: AdminUser;
}

const router = Router();

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por ventana
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
        process.env.SUPABASE_URL || "",
        ...(isDevelopment ? ["ws://localhost:*", "wss://localhost:*"] : [])
      ],
    },
  },
}));

// Validation schemas
const signUpSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
});

const signInSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
});

const updatePasswordSchema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

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

// Legacy Supabase authentication (for backward compatibility)
export const authenticateSupabase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token de autorización requerido' });
    }

    const token = authHeader.substring(7);
    
    // For now, just pass through - this will be deprecated
    // TODO: Remove once all endpoints use authenticateAdmin
    const user: DatabaseUser = { id: 'legacy-user', email: '', role: 'user', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_active: true };
    req.user = user;
    next();
  } catch (error) {
    console.error('Legacy auth error:', error);
    res.status(500).json({ message: 'Error de autenticación' });
  }
};

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

  // Note: The 'super_admin' role is not in the schema. Defaulting to 'admin'.
  if (req.adminUser.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Acceso denegado - Se requieren permisos de administrador',
      code: 'INSUFFICIENT_PERMISSIONS'
    });
  }

  next();
};

// Middleware para verificar rol de administrador (deprecated - use authenticateAdmin)
export const requireAdminLegacy = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ 
      error: "Acceso denegado. Se requieren permisos de administrador." 
    });
    return;
  }
  next();
};

// Registro de usuario
router.post("/api/auth/signup", authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = signUpSchema.parse(req.body);

    // Registrar usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (authError) {
      console.error('Error de registro:', authError);
      return res.status(400).json({
        error: authError.message === 'User already registered'
          ? "El usuario ya está registrado"
          : "Error al crear la cuenta"
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        error: "Error al crear la cuenta"
      });
    }

    // Crear perfil de usuario en la base de datos
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        profile_image_url: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=00ff00&color=fff`,
        role: 'user',
        is_active: true,
      });

    if (dbError) {
      console.error('Error al crear perfil:', dbError);
      // Si hay error creando el perfil, intentar eliminar el usuario de Auth
      if (supabaseAdmin) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      }
      return res.status(500).json({
        error: "Error al crear el perfil de usuario"
      });
    }

    res.status(201).json({
      message: "Cuenta creada exitosamente. Revise su correo para confirmar su cuenta.",
      user: {
        id: authData.user.id,
        email,
        firstName,
        lastName,
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: error.errors.map(e => e.message)
      });
    }
    
    console.error('Error en registro:', error);
    res.status(500).json({
      error: "Error interno del servidor"
    });
  }
});

// Inicio de sesión
router.post("/api/auth/signin", authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = signInSchema.parse(req.body);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error de inicio de sesión:', error);
      return res.status(401).json({
        error: error.message === 'Invalid login credentials'
          ? "Credenciales inválidas"
          : "Error al iniciar sesión"
      });
    }

    if (!data.user || !data.session) {
      return res.status(401).json({
        error: "Error al iniciar sesión"
      });
    }

    // Obtener datos del usuario desde la base de datos
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (dbError || !userData) {
      return res.status(500).json({
        error: "Error al obtener datos del usuario"
      });
    }

    // Actualizar último inicio de sesión
    await supabase
      .from('users')
      .update({ last_sign_in: new Date().toISOString() })
      .eq('id', data.user.id);

    res.json({
      message: "Inicio de sesión exitoso",
      user: userData,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
      redirectUrl: userData.role === 'admin' ? '/admin/dashboard' : '/cuenta/panel'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Datos inválidos",
        details: error.errors.map(e => e.message)
      });
    }
    
    console.error('Error en inicio de sesión:', error);
    res.status(500).json({
      error: "Error interno del servidor"
    });
  }
});

// Cerrar sesión
router.post("/api/auth/signout", generalLimiter, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      await supabase.auth.admin.signOut(token);
    }

    res.json({
      message: "Sesión cerrada exitosamente"
    });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.json({
      message: "Sesión cerrada"
    });
  }
});

// Obtener usuario actual
router.get("/api/auth/user", generalLimiter, authenticateAdmin as any, (req: any, res: Response) => {
  res.json(req.adminUser);
});

// Verificar si es administrador
router.get("/api/auth/check-admin", generalLimiter, authenticateAdmin as any, (req: any, res: Response) => {
  res.json({
    isAdmin: req.adminUser?.role === 'admin',
    user: req.adminUser
  });
});

// Resetear contraseña
router.post("/api/auth/reset-password", authLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = resetPasswordSchema.parse(req.body);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`,
    });

    if (error) {
      console.error('Error de reset:', error);
      return res.status(400).json({
        error: "Error al enviar correo de recuperación"
      });
    }

    res.json({
      message: "Se ha enviado un correo de recuperación a su dirección de email"
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Email inválido"
      });
    }
    
    console.error('Error en reset password:', error);
    res.status(500).json({
      error: "Error interno del servidor"
    });
  }
});

// Actualizar contraseña
router.post("/api/auth/update-password", authLimiter, authenticateAdmin as any, async (req: any, res: Response) => {
  try {
    const { password } = updatePasswordSchema.parse(req.body);

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Token requerido" });
    }

    const token = authHeader.substring(7);
    
    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      console.error('Error actualizando contraseña:', error);
      return res.status(400).json({
        error: "Error al actualizar contraseña"
      });
    }

    res.json({
      message: "Contraseña actualizada exitosamente"
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Contraseña inválida",
        details: error.errors.map(e => e.message)
      });
    }
    
    console.error('Error en update password:', error);
    res.status(500).json({
      error: "Error interno del servidor"
    });
  }
});

// Autenticación social (Google, Facebook, etc.)
router.post("/api/auth/oauth", generalLimiter, async (req: Request, res: Response) => {
  try {
    const { provider } = z.object({
      provider: z.enum(['google', 'facebook', 'twitter', 'github'])
    }).parse(req.body);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`
      }
    });

    if (error) {
      console.error('Error OAuth:', error);
      return res.status(400).json({
        error: "Error al iniciar autenticación social"
      });
    }

    res.json({
      url: data.url
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Proveedor inválido"
      });
    }
    
    console.error('Error en OAuth:', error);
    res.status(500).json({
      error: "Error interno del servidor"
    });
  }
});

// Callback para autenticación social
router.get("/api/auth/callback", async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_code`);
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error en callback:', error);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_error`);
    }

    if (!data.session || !data.user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_session`);
    }

    // Verificar si el usuario ya existe en nuestra base de datos
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!existingUser) {
      // Crear perfil de usuario para OAuth
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email || '',
          first_name: data.user.user_metadata?.first_name || data.user.user_metadata?.full_name?.split(' ')[0] || '',
          last_name: data.user.user_metadata?.last_name || data.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          profile_image_url: data.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${data.user.email}&background=00ff00&color=fff`,
          role: 'user',
          is_active: true,
        });

      if (dbError) {
        console.error('Error creando perfil OAuth:', dbError);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=profile_error`);
      }
    }

    // Redirigir con token en la URL (el frontend debe manejarlo)
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/success?access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Error en callback OAuth:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`);
  }
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