/**
 * Authentication Routes for SafraReport
 * Modern session-based authentication optimized for Dominican Republic
 */

import { Router, type Request, type Response } from "express";
import { sessionAuth } from "../auth/session-auth.js";
import { z } from "zod";
import rateLimit from "express-rate-limit";

// Rate limiting configurations
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { 
    error: 'Demasiados intentos de autenticación. Intente nuevamente en 15 minutos.',
    code: 'RATE_LIMITED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { 
    error: 'Demasiadas solicitudes. Intente nuevamente más tarde.',
    code: 'RATE_LIMITED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas with Dominican Spanish error messages
const registerSchema = z.object({
  email: z.string()
    .email('Formato de correo electrónico inválido')
    .min(1, 'El correo electrónico es requerido')
    .max(255, 'El correo electrónico es muy largo'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña es muy larga')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  firstName: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre es muy largo')
    .regex(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/, 'El nombre solo puede contener letras'),
  lastName: z.string()
    .min(1, 'El apellido es requerido')
    .max(100, 'El apellido es muy largo')
    .regex(/^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/, 'El apellido solo puede contener letras'),
  phone: z.string()
    .regex(/^(\+1)?(8(09|29|49))[2-9]\d{6}$/, 'Formato de teléfono dominicano inválido (809/829/849-XXX-XXXX)')
    .optional(),
  provinceId: z.string().optional()
});

const loginSchema = z.object({
  email: z.string()
    .email('Formato de correo electrónico inválido')
    .min(1, 'El correo electrónico es requerido'),
  password: z.string()
    .min(1, 'La contraseña es requerida')
});

const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Formato de correo electrónico inválido')
    .min(1, 'El correo electrónico es requerido')
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  newPassword: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña es muy larga')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una minúscula, una mayúscula y un número')
});

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user account
 */
router.post('/register', generalRateLimit, async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    const result = await sessionAuth.registerUser({
      email: validatedData.email,
      password: validatedData.password,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phone: validatedData.phone,
      provinceId: validatedData.provinceId
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        user: result.user
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        code: 'REGISTRATION_FAILED'
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.errors,
        code: 'VALIDATION_ERROR'
      });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
});

/**
 * POST /api/auth/login
 * User login with session creation
 */
router.post('/login', authRateLimit, async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    const result = await sessionAuth.loginUser(
      validatedData.email,
      validatedData.password,
      ip,
      userAgent
    );

    if (result.success && result.sessionId && result.expiresAt) {
      // Set session cookie
      const cookie = sessionAuth.createSessionCookie(result.sessionId, result.expiresAt);
      res.setHeader("Set-Cookie", [
        `${cookie.name}=${cookie.value}; HttpOnly; Secure=${cookie.attributes.secure}; SameSite=${cookie.attributes.sameSite}; Path=${cookie.attributes.path}; Expires=${cookie.attributes.expires.toUTCString()}`
      ]);

      res.json({
        success: true,
        message: result.message,
        user: result.user
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.message,
        code: 'LOGIN_FAILED'
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.errors,
        code: 'VALIDATION_ERROR'
      });
    } else {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
});

/**
 * POST /api/auth/admin/login
 * Admin login with enhanced security
 */
router.post('/admin/login', authRateLimit, async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    const result = await sessionAuth.loginAdmin(
      validatedData.email,
      validatedData.password,
      ip,
      userAgent
    );

    if (result.success && result.sessionId && result.expiresAt) {
      // Set admin session cookie
      const cookie = sessionAuth.createAdminSessionCookie(result.sessionId, result.expiresAt);
      res.setHeader("Set-Cookie", [
        `${cookie.name}=${cookie.value}; HttpOnly; Secure=${cookie.attributes.secure}; SameSite=${cookie.attributes.sameSite}; Path=${cookie.attributes.path}; Expires=${cookie.attributes.expires.toUTCString()}`
      ]);

      res.json({
        success: true,
        message: result.message,
        user: result.user
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.message,
        code: 'ADMIN_LOGIN_FAILED'
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.errors,
        code: 'VALIDATION_ERROR'
      });
    } else {
      console.error('Admin login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
});

/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const sessionId = sessionAuth.readSessionCookie(req.headers.cookie);
    const adminSessionId = sessionAuth.readAdminSessionCookie(req.headers.cookie);
    
    if (sessionId) {
      await sessionAuth.invalidateSession(sessionId);
    }
    
    if (adminSessionId) {
      await sessionAuth.invalidateAdminSession(adminSessionId);
    }

    // Clear session cookies
    const blankCookie = sessionAuth.createBlankSessionCookie();
    res.setHeader("Set-Cookie", [
      `${blankCookie.name}=${blankCookie.value}; HttpOnly; Secure=${blankCookie.attributes.secure}; SameSite=${blankCookie.attributes.sameSite}; Path=${blankCookie.attributes.path}; Expires=${blankCookie.attributes.expires.toUTCString()}`,
      `safra_admin_session=; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=lax; Path=/; Expires=${new Date(0).toUTCString()}`
    ]);
    
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', generalRateLimit, async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    
    const result = await sessionAuth.requestPasswordReset(email);
    
    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: result.message
    });
    
    // In production, send email here with result.token
    if (result.token) {
      console.log(`Password reset token for ${email}: ${result.token}`);
      // TODO: Implement email service
      // await emailService.sendPasswordResetEmail(email, result.token);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Formato de correo electrónico inválido',
        code: 'VALIDATION_ERROR'
      });
    } else {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
router.post('/reset-password', authRateLimit, async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    
    const result = await sessionAuth.resetPassword(token, newPassword);

    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        code: 'RESET_FAILED'
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.errors,
        code: 'VALIDATION_ERROR'
      });
    } else {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
});

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const sessionId = sessionAuth.readSessionCookie(req.headers.cookie);
    const adminSessionId = sessionAuth.readAdminSessionCookie(req.headers.cookie);
    
    if (sessionId) {
      const result = await sessionAuth.validateSession(sessionId);
      if (result) {
        return res.json({
          success: true,
          user: result.user,
          session: {
            id: result.session.id,
            expiresAt: result.session.expiresAt
          }
        });
      }
    }
    
    if (adminSessionId) {
      const result = await sessionAuth.validateAdminSession(adminSessionId);
      if (result) {
        return res.json({
          success: true,
          user: result.user,
          session: {
            id: result.session.id,
            expiresAt: result.session.expiresAt
          }
        });
      }
    }
    
    res.status(401).json({
      success: false,
      message: 'No autenticado',
      code: 'NOT_AUTHENTICATED'
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/auth/health
 * Health check endpoint for auth service
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Servicio de autenticación funcionando correctamente',
    timestamp: new Date().toISOString(),
    location: 'República Dominicana',
    timezone: 'America/Santo_Domingo'
  });
});

export default router;