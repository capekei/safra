import { Router, Request, Response, NextFunction } from "express";
import { supabase, supabaseAdmin, DatabaseUser, TypedSupabaseClient } from "./supabase";
import { z } from "zod";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import csrf from "csrf";

// Auth Request interface for middleware
export interface AuthRequest extends Request {
  user?: DatabaseUser;
  adminUser?: DatabaseUser;
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

// Helmet security headers
router.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.SUPABASE_URL || ""],
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

// Middleware para verificar tokens de Supabase
export const authenticateSupabase = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ 
        error: "Token de acceso requerido" 
      });
      return;
    }

    const token = authHeader.substring(7);
    
    // Verificar el token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      res.status(401).json({ 
        error: "Token inválido o expirado" 
      });
      return;
    }

    // Obtener información adicional del usuario desde la base de datos
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError || !userData) {
      res.status(401).json({ 
        error: "Usuario no encontrado en la base de datos" 
      });
      return;
    }

    req.user = userData;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(500).json({ 
      error: "Error interno del servidor" 
    });
  }
};

// Middleware para verificar rol de administrador (deprecated - use authenticateAdmin)
export const requireAdmin = (
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
router.get("/api/auth/user", generalLimiter, authenticateSupabase as any, (req: any, res: Response) => {
  res.json(req.user);
});

// Verificar si es administrador
router.get("/api/auth/check-admin", generalLimiter, authenticateSupabase as any, (req: any, res: Response) => {
  res.json({
    isAdmin: req.user?.role === 'admin',
    user: req.user
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
router.post("/api/auth/update-password", authLimiter, authenticateSupabase as any, async (req: any, res: Response) => {
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

// Auth Request interface for middleware
export interface AuthRequest extends Request {
  user?: DatabaseUser;
  adminUser?: DatabaseUser;
}

// Admin authentication middleware
export const authenticateAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ 
        error: "Token de acceso requerido",
        code: "NO_TOKEN"
      });
      return;
    }

    const token = authHeader.substring(7);
    
    // Verificar el token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      res.status(401).json({ 
        error: "Token inválido o expirado",
        code: "INVALID_TOKEN"
      });
      return;
    }

    // Obtener información adicional del usuario desde la base de datos
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError || !userData) {
      res.status(401).json({ 
        error: "Usuario no encontrado en la base de datos",
        code: "USER_NOT_FOUND"
      });
      return;
    }

    // Verificar que el usuario es administrador
    if (userData.role !== 'admin') {
      res.status(403).json({ 
        error: "Acceso denegado. Se requieren permisos de administrador.",
        code: "INSUFFICIENT_ROLE"
      });
      return;
    }

    req.user = userData;
    req.adminUser = userData;
    next();
  } catch (error) {
    console.error('Error de autenticación admin:', error);
    res.status(500).json({ 
      error: "Error interno de autenticación",
      code: "AUTH_ERROR"
    });
  }
};



export default router;