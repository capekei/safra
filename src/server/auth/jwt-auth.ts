/**
 * SafraReport Unified JWT Authentication System
 * Production-grade JWT authentication with bcrypt password hashing
 * Unified JWT authentication system for SafraReport
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';
import { Pool } from 'pg';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Environment configuration with validation
const authConfig = {
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
  lockoutDurationMinutes: parseInt(process.env.LOCKOUT_DURATION_MINUTES || '30'),
  enableTwoFactor: process.env.ENABLE_TWO_FACTOR_AUTH === 'true',
  enableAccountLockout: process.env.ENABLE_ACCOUNT_LOCKOUT === 'true',
};

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
  role: z.enum(['user', 'admin']).default('user'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(8).max(128),
});

// Types
interface User {
  id: string;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean;
  isActive: boolean;
  twoFactorEnabled: boolean;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  active: boolean;
  twoFactorEnabled: boolean;
}

interface JWTPayload {
  userId: string | number;
  email: string;
  role: string;
  type: 'access' | 'refresh';
  sessionId: string;
}

interface AuthResult {
  success: boolean;
  user?: User | AdminUser;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
  requiresTwoFactor?: boolean;
  isLocked?: boolean;
}

export class UnifiedAuthService {
  private db: Pool;

  constructor(database: Pool) {
    this.db = database;
    this.validateConfig();
  }

  /**
   * Validate authentication configuration
   */
  private validateConfig(): void {
    if (!authConfig.jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    if (authConfig.jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
  }

  /**
   * Register a new user with email verification
   */
  async registerUser(data: z.infer<typeof registerSchema>): Promise<AuthResult> {
    try {
      const validatedData = registerSchema.parse(data);
      
      // Check if user already exists
      const existingUser = await this.db.query(
        'SELECT id FROM users WHERE email = $1',
        [validatedData.email]
      );

      if (existingUser.rows.length > 0) {
        return { success: false, message: 'User already exists with this email' };
      }

      // Hash password
      const passwordHash = await this.hashPassword(validatedData.password);
      
      // Generate verification token
      const verificationToken = this.generateSecureToken();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const userId = this.generateUserId();
      await this.db.query(`
        INSERT INTO users (
          id, email, password_hash, first_name, last_name, role,
          email_verification_token, email_verification_expires, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        userId,
        validatedData.email,
        passwordHash,
        validatedData.firstName,
        validatedData.lastName,
        validatedData.role,
        verificationToken,
        verificationExpires,
        true // Active but email not verified
      ]);

      // Get the created user
      const userResult = await this.db.query(
        'SELECT id, email, first_name, last_name, role, email_verified, is_active FROM users WHERE id = $1',
        [userId]
      );

      const user = this.mapUserRow(userResult.rows[0]);

      // In production, send verification email here
      // await this.sendVerificationEmail(user.email, verificationToken);

      return {
        success: true,
        user,
        message: 'User registered successfully. Please check your email for verification.'
      };

    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, message: 'Invalid input data' };
      }
      throw error;
    }
  }

  /**
   * Authenticate user login with comprehensive security checks
   */
  async loginUser(data: z.infer<typeof loginSchema>): Promise<AuthResult> {
    try {
      const validatedData = loginSchema.parse(data);

      // Check account lockout first
      if (authConfig.enableAccountLockout) {
        const isLocked = await this.checkAccountLockout(validatedData.email);
        if (isLocked) {
          return { 
            success: false, 
            message: 'Account is temporarily locked due to multiple failed login attempts',
            isLocked: true 
          };
        }
      }

      // Get user from database
      const userResult = await this.db.query(`
        SELECT 
          id, email, password_hash, first_name, last_name, role, 
          email_verified, is_active, failed_login_attempts, 
          two_factor_enabled, two_factor_secret
        FROM users 
        WHERE email = $1
      `, [validatedData.email]);

      if (userResult.rows.length === 0) {
        await this.incrementFailedLoginAttempts(validatedData.email);
        return { success: false, message: 'Invalid email or password' };
      }

      const userRow = userResult.rows[0];

      // Check if account is active
      if (!userRow.is_active) {
        return { success: false, message: 'Account is deactivated' };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(validatedData.password, userRow.password_hash);
      if (!isPasswordValid) {
        await this.incrementFailedLoginAttempts(validatedData.email);
        return { success: false, message: 'Invalid email or password' };
      }

      // Check two-factor authentication
      if (userRow.two_factor_enabled) {
        if (!validatedData.twoFactorCode) {
          return { 
            success: false, 
            message: 'Two-factor authentication code required',
            requiresTwoFactor: true 
          };
        }

        const isTwoFactorValid = await this.verifyTwoFactorCode(
          userRow.two_factor_secret,
          validatedData.twoFactorCode
        );

        if (!isTwoFactorValid) {
          await this.incrementFailedLoginAttempts(validatedData.email);
          return { success: false, message: 'Invalid two-factor authentication code' };
        }
      }

      // Reset failed login attempts on successful login
      await this.resetFailedLoginAttempts(validatedData.email);

      // Update last login
      await this.db.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [userRow.id]
      );

      // Generate tokens
      const sessionId = this.generateSessionId();
      const accessToken = this.generateAccessToken({
        userId: userRow.id,
        email: userRow.email,
        role: userRow.role,
        sessionId
      });

      const refreshToken = this.generateRefreshToken({
        userId: userRow.id,
        email: userRow.email,
        role: userRow.role,
        sessionId
      });

      // Store session
      await this.storeUserSession(userRow.id, sessionId, accessToken, refreshToken, validatedData.rememberMe);

      const user = this.mapUserRow(userRow);

      return {
        success: true,
        user,
        accessToken,
        refreshToken
      };

    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, message: 'Invalid input data' };
      }
      throw error;
    }
  }

  /**
   * Admin authentication with enhanced security
   */
  async loginAdmin(email: string, password: string, twoFactorCode?: string): Promise<AuthResult> {
    try {
      // Get admin user
      const adminResult = await this.db.query(`
        SELECT 
          id, username, email, password_hash, first_name, last_name, role,
          active, failed_login_attempts, two_factor_enabled, two_factor_secret
        FROM admin_users 
        WHERE email = $1
      `, [email]);

      if (adminResult.rows.length === 0) {
        return { success: false, message: 'Invalid credentials' };
      }

      const adminRow = adminResult.rows[0];

      // Check if account is active
      if (!adminRow.active) {
        return { success: false, message: 'Admin account is deactivated' };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, adminRow.password_hash);
      if (!isPasswordValid) {
        await this.incrementAdminFailedLoginAttempts(email);
        return { success: false, message: 'Invalid credentials' };
      }

      // Check two-factor authentication for admins
      if (adminRow.two_factor_enabled) {
        if (!twoFactorCode) {
          return { 
            success: false, 
            message: 'Two-factor authentication required for admin access',
            requiresTwoFactor: true 
          };
        }

        const isTwoFactorValid = await this.verifyTwoFactorCode(
          adminRow.two_factor_secret,
          twoFactorCode
        );

        if (!isTwoFactorValid) {
          await this.incrementAdminFailedLoginAttempts(email);
          return { success: false, message: 'Invalid two-factor authentication code' };
        }
      }

      // Update last login
      await this.db.query(
        'UPDATE admin_users SET last_login = NOW(), failed_login_attempts = 0 WHERE id = $1',
        [adminRow.id]
      );

      // Generate tokens
      const sessionId = this.generateSessionId();
      const accessToken = this.generateAccessToken({
        userId: adminRow.id,
        email: adminRow.email,
        role: adminRow.role,
        sessionId
      });

      const refreshToken = this.generateRefreshToken({
        userId: adminRow.id,
        email: adminRow.email,
        role: adminRow.role,
        sessionId
      });

      // Store admin session
      await this.storeAdminSession(adminRow.id, sessionId, accessToken, refreshToken);

      const admin = this.mapAdminRow(adminRow);

      return {
        success: true,
        user: admin,
        accessToken,
        refreshToken
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, authConfig.jwtSecret) as JWTPayload;
      
      if (payload.type !== 'refresh') {
        return { success: false, message: 'Invalid token type' };
      }

      // Check if session exists and is active
      const isValidSession = await this.validateSession(payload.sessionId, payload.userId);
      if (!isValidSession) {
        return { success: false, message: 'Session expired or invalid' };
      }

      // Generate new access token
      const newAccessToken = this.generateAccessToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        sessionId: payload.sessionId
      });

      // Update session with new token
      await this.updateSessionToken(payload.sessionId, newAccessToken);

      return {
        success: true,
        accessToken: newAccessToken
      };

    } catch (error) {
      return { success: false, message: 'Invalid or expired refresh token' };
    }
  }

  /**
   * Change user password with current password verification
   */
  async changePassword(userId: string, data: z.infer<typeof changePasswordSchema>): Promise<AuthResult> {
    try {
      const validatedData = changePasswordSchema.parse(data);

      // Get current password hash
      const userResult = await this.db.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return { success: false, message: 'User not found' };
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        validatedData.currentPassword,
        userResult.rows[0].password_hash
      );

      if (!isCurrentPasswordValid) {
        return { success: false, message: 'Current password is incorrect' };
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(validatedData.newPassword);

      // Update password and set password_changed_at
      await this.db.query(`
        UPDATE users 
        SET password_hash = $1, password_changed_at = NOW(), updated_at = NOW()
        WHERE id = $2
      `, [newPasswordHash, userId]);

      // Invalidate all existing sessions for security
      await this.invalidateAllUserSessions(userId);

      return {
        success: true,
        message: 'Password changed successfully. Please log in again.'
      };

    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, message: 'Invalid input data' };
      }
      throw error;
    }
  }

  /**
   * Logout user and invalidate session
   */
  async logout(sessionId: string): Promise<boolean> {
    try {
      // Invalidate user session
      await this.db.query(
        'UPDATE user_sessions SET is_active = false WHERE id = $1',
        [sessionId]
      );

      // Invalidate admin session
      await this.db.query(
        'UPDATE admin_sessions SET is_active = false WHERE id = $1',
        [sessionId]
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Express middleware for JWT authentication
   */
  authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    try {
      const payload = jwt.verify(token, authConfig.jwtSecret) as JWTPayload;
      
      if (payload.type !== 'access') {
        return res.status(401).json({ error: 'Invalid token type' });
      }

      // Add user info to request
      req.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        sessionId: payload.sessionId
      };

      next();
    } catch (error) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  };

  /**
   * Express middleware for role-based authorization
   */
  requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    };
  };

  // Private helper methods

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, authConfig.bcryptRounds);
  }

  private generateUserId(): string {
    return `user_${randomBytes(16).toString('hex')}`;
  }

  private generateSessionId(): string {
    return `session_${randomBytes(16).toString('hex')}`;
  }

  private generateSecureToken(): string {
    return randomBytes(32).toString('hex');
  }

  private generateAccessToken(payload: Omit<JWTPayload, 'type'>): string {
    return jwt.sign(
      { ...payload, type: 'access' },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn } as jwt.SignOptions
    );
  }

  private generateRefreshToken(payload: Omit<JWTPayload, 'type'>): string {
    return jwt.sign(
      { ...payload, type: 'refresh' },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtRefreshExpiresIn } as jwt.SignOptions
    );
  }

  private async storeUserSession(
    userId: string, 
    sessionId: string, 
    accessToken: string, 
    refreshToken: string, 
    rememberMe: boolean = false
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.db.query(`
      INSERT INTO user_sessions (
        id, user_id, token, refresh_token, expires_at, refresh_expires_at, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [sessionId, userId, accessToken, refreshToken, expiresAt, refreshExpiresAt, true]);
  }

  private async storeAdminSession(
    adminId: number, 
    sessionId: string, 
    accessToken: string, 
    refreshToken: string
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours for admin sessions
    const refreshExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.db.query(`
      INSERT INTO admin_sessions (
        id, admin_user_id, token, refresh_token, expires_at, refresh_expires_at, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [sessionId, adminId, accessToken, refreshToken, expiresAt, refreshExpiresAt, true]);
  }

  private async validateSession(sessionId: string, userId: string | number): Promise<boolean> {
    // Check user sessions
    const userSession = await this.db.query(
      'SELECT id FROM user_sessions WHERE id = $1 AND user_id = $2 AND is_active = true AND expires_at > NOW()',
      [sessionId, userId]
    );

    if (userSession.rows.length > 0) return true;

    // Check admin sessions
    const adminSession = await this.db.query(
      'SELECT id FROM admin_sessions WHERE id = $1 AND admin_user_id = $2 AND is_active = true AND expires_at > NOW()',
      [sessionId, userId]
    );

    return adminSession.rows.length > 0;
  }

  private async updateSessionToken(sessionId: string, newToken: string): Promise<void> {
    // Update user session
    await this.db.query(
      'UPDATE user_sessions SET token = $1, updated_at = NOW() WHERE id = $2',
      [newToken, sessionId]
    );

    // Update admin session
    await this.db.query(
      'UPDATE admin_sessions SET token = $1, updated_at = NOW() WHERE id = $2',
      [newToken, sessionId]
    );
  }

  private async checkAccountLockout(email: string): Promise<boolean> {
    const result = await this.db.query(
      'SELECT failed_login_attempts, locked_until FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) return false;

    const { failed_login_attempts, locked_until } = result.rows[0];

    // Check if account is currently locked
    if (locked_until && new Date(locked_until) > new Date()) {
      return true;
    }

    // Lock account if too many failed attempts
    if (failed_login_attempts >= authConfig.maxLoginAttempts) {
      const lockUntil = new Date(Date.now() + authConfig.lockoutDurationMinutes * 60 * 1000);
      await this.db.query(
        'UPDATE users SET locked_until = $1 WHERE email = $2',
        [lockUntil, email]
      );
      return true;
    }

    return false;
  }

  private async incrementFailedLoginAttempts(email: string): Promise<void> {
    await this.db.query(
      'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE email = $1',
      [email]
    );
  }

  private async incrementAdminFailedLoginAttempts(email: string): Promise<void> {
    await this.db.query(
      'UPDATE admin_users SET failed_login_attempts = failed_login_attempts + 1 WHERE email = $1',
      [email]
    );
  }

  private async resetFailedLoginAttempts(email: string): Promise<void> {
    await this.db.query(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = $1',
      [email]
    );
  }

  private async invalidateAllUserSessions(userId: string): Promise<void> {
    await this.db.query(
      'UPDATE user_sessions SET is_active = false WHERE user_id = $1',
      [userId]
    );
  }

  private async verifyTwoFactorCode(secret: string, code: string): Promise<boolean> {
    // This would integrate with a TOTP library like speakeasy
    // For now, return false as 2FA implementation is optional
    return false;
  }

  private mapUserRow(row: any): User {
    return {
      id: row.id,
      email: row.email,
      role: row.role,
      firstName: row.first_name,
      lastName: row.last_name,
      emailVerified: row.email_verified,
      isActive: row.is_active,
      twoFactorEnabled: row.two_factor_enabled || false
    };
  }

  private mapAdminRow(row: any): AdminUser {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      role: row.role,
      firstName: row.first_name,
      lastName: row.last_name,
      active: row.active,
      twoFactorEnabled: row.two_factor_enabled || false
    };
  }
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string | number;
        email: string;
        role: string;
        sessionId: string;
      };
    }
  }
}

export default UnifiedAuthService;