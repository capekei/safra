/**
 * SafraReport Unified Authentication Routes
 * Express routes for the unified JWT authentication system
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import UnifiedAuthService from '../auth/jwt-auth.js';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

// Rate limiting configurations
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const loginSchema = z.object({
  email: z.string().email().min(1).max(255),
  password: z.string().min(8).max(128),
  rememberMe: z.boolean().optional(),
  twoFactorCode: z.string().length(6).optional(),
});

const registerSchema = z.object({
  email: z.string().email().min(1).max(255),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

const adminLoginSchema = z.object({
  email: z.string().email().min(1).max(255),
  password: z.string().min(8).max(128),
  twoFactorCode: z.string().length(6).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(8).max(128),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email().min(1).max(255),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export function createAuthRoutes(db: Pool): Router {
  const router = Router();
  const authService = new UnifiedAuthService(db);

  /**
   * POST /auth/register
   * Register a new user account
   */
  router.post('/register', generalRateLimit, async (req: Request, res: Response) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      const result = await authService.registerUser({
        ...validatedData,
        role: 'user' // Default role for public registration
      });

      if (result.success) {
        res.status(201).json({
          success: true,
          message: result.message,
          user: {
            id: result.user?.id,
            email: result.user?.email,
            firstName: result.user?.firstName,
            lastName: result.user?.lastName,
            role: result.user?.role,
            emailVerified: result.user?.emailVerified
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.message
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: error.errors
        });
      } else {
        console.error('Registration error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  });

  /**
   * POST /auth/login
   * User login with JWT token generation
   */
  router.post('/login', authRateLimit, async (req: Request, res: Response) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const result = await authService.loginUser(validatedData);

      if (result.success) {
        // Set HTTP-only cookie for refresh token
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
          success: true,
          user: {
            id: result.user?.id,
            email: result.user?.email,
            firstName: result.user?.firstName,
            lastName: result.user?.lastName,
            role: result.user?.role,
            emailVerified: result.user?.emailVerified
          },
          accessToken: result.accessToken
        });
      } else {
        const statusCode = result.isLocked ? 423 : (result.requiresTwoFactor ? 200 : 401);
        res.status(statusCode).json({
          success: false,
          error: result.message,
          requiresTwoFactor: result.requiresTwoFactor,
          isLocked: result.isLocked
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: error.errors
        });
      } else {
        console.error('Login error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  });

  /**
   * POST /auth/admin/login
   * Admin login with enhanced security
   */
  router.post('/admin/login', authRateLimit, async (req: Request, res: Response) => {
    try {
      const validatedData = adminLoginSchema.parse(req.body);
      
      const result = await authService.loginAdmin(
        validatedData.email,
        validatedData.password,
        validatedData.twoFactorCode
      );

      if (result.success) {
        // Set HTTP-only cookie for refresh token
        res.cookie('adminRefreshToken', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000 // 24 hours for admin
        });

        res.json({
          success: true,
          user: {
            id: result.user?.id,
            username: (result.user as any)?.username,
            email: result.user?.email,
            firstName: result.user?.firstName,
            lastName: result.user?.lastName,
            role: result.user?.role
          },
          accessToken: result.accessToken
        });
      } else {
        const statusCode = result.requiresTwoFactor ? 200 : 401;
        res.status(statusCode).json({
          success: false,
          error: result.message,
          requiresTwoFactor: result.requiresTwoFactor
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: error.errors
        });
      } else {
        console.error('Admin login error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  });

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token
   */
  router.post('/refresh', generalRateLimit, async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken || req.cookies.adminRefreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'Refresh token required'
        });
      }

      const result = await authService.refreshToken(refreshToken);

      if (result.success) {
        res.json({
          success: true,
          accessToken: result.accessToken
        });
      } else {
        // Clear invalid refresh token cookie
        res.clearCookie('refreshToken');
        res.clearCookie('adminRefreshToken');
        
        res.status(401).json({
          success: false,  
          error: result.message
        });
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * POST /auth/change-password
   * Change user password (requires authentication)
   */
  router.post('/change-password', authService.authenticateToken, async (req: Request, res: Response) => {
    try {
      const validatedData = changePasswordSchema.parse(req.body);
      
      const result = await authService.changePassword(req.user!.id.toString(), validatedData);

      if (result.success) {
        // Clear all cookies to force re-login
        res.clearCookie('refreshToken');
        res.clearCookie('adminRefreshToken');
        
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.message
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: error.errors
        });
      } else {
        console.error('Change password error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  });

  /**
   * POST /auth/forgot-password
   * Request password reset
   */
  router.post('/forgot-password', generalRateLimit, async (req: Request, res: Response) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      
      // Generate reset token
      const resetToken = require('crypto').randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token in database
      await db.query(`
        UPDATE users 
        SET password_reset_token = $1, password_reset_expires = $2
        WHERE email = $3
      `, [resetToken, resetExpires, validatedData.email]);

      // In production, send reset email here
      // await emailService.sendPasswordResetEmail(validatedData.email, resetToken);

      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid email address'
        });
      } else {
        console.error('Forgot password error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  });

  /**
   * POST /auth/reset-password
   * Reset password using reset token
   */
  router.post('/reset-password', authRateLimit, async (req: Request, res: Response) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      
      // Verify reset token
      const userResult = await db.query(`
        SELECT id, email FROM users 
        WHERE password_reset_token = $1 AND password_reset_expires > NOW()
      `, [validatedData.token]);

      if (userResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired reset token'
        });
      }

      const user = userResult.rows[0];

      // Hash new password
      const bcrypt = require('bcrypt');
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const newPasswordHash = await bcrypt.hash(validatedData.newPassword, saltRounds);

      // Update password and clear reset token
      await db.query(`
        UPDATE users 
        SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL,
            password_changed_at = NOW(), updated_at = NOW()
        WHERE id = $2
      `, [newPasswordHash, user.id]);

      // Invalidate all existing sessions
      await db.query(
        'UPDATE user_sessions SET is_active = false WHERE user_id = $1',
        [user.id]
      );

      res.json({
        success: true,
        message: 'Password has been reset successfully. Please log in with your new password.'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: error.errors
        });
      } else {
        console.error('Reset password error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        });
      }
    }
  });

  /**
   * POST /auth/logout
   * Logout user and invalidate session
   */
  router.post('/logout', authService.authenticateToken, async (req: Request, res: Response) => {
    try {
      const sessionId = req.user!.sessionId;
      
      await authService.logout(sessionId);
      
      // Clear refresh token cookies
      res.clearCookie('refreshToken');
      res.clearCookie('adminRefreshToken');
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * GET /auth/me
   * Get current user information
   */
  router.get('/me', authService.authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;

      let userResult;
      if (userRole === 'admin') {
        userResult = await db.query(`
          SELECT id, username, email, first_name, last_name, role, active, last_login
          FROM admin_users WHERE id = $1
        `, [userId]);
      } else {
        userResult = await db.query(`
          SELECT id, email, first_name, last_name, role, email_verified, is_active, last_login
          FROM users WHERE id = $1
        `, [userId]);
      }

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const user = userResult.rows[0];
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username, // Only for admins
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          emailVerified: user.email_verified, // Only for users
          isActive: user.is_active || user.active,
          lastLogin: user.last_login
        }
      });
    } catch (error) {
      console.error('Get user info error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * GET /auth/sessions
   * Get user's active sessions (requires authentication)
   */
  router.get('/sessions', authService.authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;

      let sessionsResult;
      if (userRole === 'admin') {
        sessionsResult = await db.query(`
          SELECT id, ip_address, user_agent, created_at, expires_at, is_active
          FROM admin_sessions 
          WHERE admin_user_id = $1 AND is_active = true
          ORDER BY created_at DESC
        `, [userId]);
      } else {
        sessionsResult = await db.query(`
          SELECT id, ip_address, user_agent, created_at, expires_at, is_active
          FROM user_sessions 
          WHERE user_id = $1 AND is_active = true
          ORDER BY created_at DESC
        `, [userId]);
      }

      res.json({
        success: true,
        sessions: sessionsResult.rows.map(session => ({
          id: session.id,
          ipAddress: session.ip_address,
          userAgent: session.user_agent,
          createdAt: session.created_at,
          expiresAt: session.expires_at,
          isActive: session.is_active,
          isCurrent: session.id === req.user!.sessionId
        }))
      });
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  /**
   * DELETE /auth/sessions/:sessionId
   * Revoke a specific session
   */
  router.delete('/sessions/:sessionId', authService.authenticateToken, async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      if (userRole === 'admin') {
        await db.query(
          'UPDATE admin_sessions SET is_active = false WHERE id = $1 AND admin_user_id = $2',
          [sessionId, userId]
        );
      } else {
        await db.query(
          'UPDATE user_sessions SET is_active = false WHERE id = $1 AND user_id = $2',
          [sessionId, userId]
        );
      }

      res.json({
        success: true,
        message: 'Session revoked successfully'
      });
    } catch (error) {
      console.error('Revoke session error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  return router;
}

export default createAuthRoutes;