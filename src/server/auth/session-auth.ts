/**
 * Modern Session-Based Authentication System for SafraReport
 * Dominican Republic optimized authentication without deprecated dependencies
 */

import { hash, verify } from "@node-rs/argon2";
import { db } from "../db.js";
import { 
  users, 
  sessions, 
  adminUsers, 
  adminSessions,
  passwordResets, 
  emailVerifications, 
  loginAttempts 
} from "../../shared/schema.js";
import { eq, and, gte, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export class SessionAuth {
  // Hash configuration optimized for production
  private hashOptions = {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
  };

  // Session configuration
  private sessionConfig = {
    cookieName: "safra_session",
    adminCookieName: "safra_admin_session",
    sessionExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
    adminSessionExpiry: 24 * 60 * 60 * 1000, // 24 hours
  };

  /**
   * Generate secure session ID
   */
  generateSessionId(): string {
    return nanoid(32);
  }

  /**
   * Generate secure user ID
   */
  generateUserId(): string {
    return nanoid(15);
  }

  /**
   * Rate limiting: Check if IP can attempt login
   */
  async checkRateLimit(ip: string): Promise<boolean> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    
    const attempts = await db.select({ count: sql<number>`count(*)` })
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.ip_address, ip),
          gte(loginAttempts.attempted_at, fifteenMinutesAgo),
          eq(loginAttempts.success, false)
        )
      );

    return Number(attempts[0]?.count || 0) < 5;
  }

  /**
   * Record login attempt for rate limiting
   */
  async recordLoginAttempt(email: string, ip: string, success: boolean): Promise<void> {
    await db.insert(loginAttempts).values({
      id: this.generateUserId(),
      email,
      ip_address: ip,
      success,
      attempted_at: new Date()
    });
  }

  /**
   * Create user session
   */
  async createSession(userId: string, ip: string, userAgent: string): Promise<{
    sessionId: string;
    expiresAt: Date;
  }> {
    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + this.sessionConfig.sessionExpiry);

    await db.insert(sessions).values({
      id: sessionId,
      user_id: userId,
      expires_at: expiresAt,
      ip_address: ip,
      user_agent: userAgent,
      created_at: new Date()
    });

    return { sessionId, expiresAt };
  }

  /**
   * Create admin session
   */
  async createAdminSession(adminId: number, ip: string, userAgent: string): Promise<{
    sessionId: string;
    expiresAt: Date;
  }> {
    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + this.sessionConfig.adminSessionExpiry);

    await db.insert(adminSessions).values({
      id: sessionId,
      admin_user_id: adminId,
      expires_at: expiresAt,
      ip_address: ip,
      user_agent: userAgent,
      created_at: new Date()
    });

    return { sessionId, expiresAt };
  }

  /**
   * Validate user session
   */
  async validateSession(sessionId: string): Promise<{
    session: any;
    user: any;
  } | null> {
    const sessionResult = await db.select({
      session_id: sessions.id,
      user_id: sessions.user_id,
      expires_at: sessions.expires_at,
      ip_address: sessions.ip_address,
      user_agent: sessions.user_agent,
      user: {
        id: users.id,
        email: users.email,
        first_name: users.first_name,
        last_name: users.last_name,
        role: users.role,
        email_verified: users.email_verified,
        province_id: users.province_id,
        is_active: users.is_active
      }
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.user_id, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

    if (!sessionResult[0]) {
      return null;
    }

    const result = sessionResult[0];
    
    // Check if session is expired
    if (result.expires_at < new Date()) {
      await this.invalidateSession(sessionId);
      return null;
    }

    // Check if user is active
    if (!result.user.is_active) {
      return null;
    }

    return {
      session: {
        id: result.session_id,
        userId: result.user_id,
        expiresAt: result.expires_at,
        ipAddress: result.ip_address,
        userAgent: result.user_agent
      },
      user: result.user
    };
  }

  /**
   * Validate admin session
   */
  async validateAdminSession(sessionId: string): Promise<{
    session: any;
    user: any;
  } | null> {
    const sessionResult = await db.select({
      session_id: adminSessions.id,
      admin_user_id: adminSessions.admin_user_id,
      expires_at: adminSessions.expires_at,
      ip_address: adminSessions.ip_address,
      user_agent: adminSessions.user_agent,
      user: {
        id: adminUsers.id,
        username: adminUsers.username,
        email: adminUsers.email,
        first_name: adminUsers.first_name,
        last_name: adminUsers.last_name,
        role: adminUsers.role,
        active: adminUsers.active
      }
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.admin_user_id, adminUsers.id))
    .where(eq(adminSessions.id, sessionId))
    .limit(1);

    if (!sessionResult[0]) {
      return null;
    }

    const result = sessionResult[0];
    
    // Check if session is expired
    if (result.expires_at < new Date()) {
      await this.invalidateAdminSession(sessionId);
      return null;
    }

    // Check if admin user is active
    if (!result.user.active) {
      return null;
    }

    return {
      session: {
        id: result.session_id,
        adminUserId: result.admin_user_id,
        expiresAt: result.expires_at,
        ipAddress: result.ip_address,
        userAgent: result.user_agent
      },
      user: result.user
    };
  }

  /**
   * Invalidate session
   */
  async invalidateSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  /**
   * Invalidate admin session
   */
  async invalidateAdminSession(sessionId: string): Promise<void> {
    await db.delete(adminSessions).where(eq(adminSessions.id, sessionId));
  }

  /**
   * Register new user
   */
  async registerUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    provinceId?: string;
  }): Promise<{
    success: boolean;
    user?: any;
    message: string;
    verificationToken?: string;
  }> {
    try {
      // Check if email exists
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.email, data.email.toLowerCase()))
        .limit(1);

      if (existingUser.length > 0) {
        return { success: false, message: "El correo ya está registrado" };
      }

      // Validate password strength
      if (data.password.length < 8) {
        return { success: false, message: "La contraseña debe tener al menos 8 caracteres" };
      }

      // Hash password
      const passwordHash = await hash(data.password, this.hashOptions);
      const userId = this.generateUserId();

      // Create user
      const [user] = await db.insert(users).values({
        id: userId,
        email: data.email.toLowerCase(),
        password_hash: passwordHash,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        province_id: data.provinceId,
        role: "user",
        created_at: new Date(),
        updated_at: new Date()
      }).returning();

      // Create verification token
      const verificationToken = this.generateSessionId();
      await db.insert(emailVerifications).values({
        id: this.generateUserId(),
        user_id: userId,
        token: verificationToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        created_at: new Date()
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          emailVerified: user.email_verified
        },
        message: "Usuario registrado exitosamente. Verifique su correo electrónico.",
        verificationToken
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: "Error al registrar usuario" };
    }
  }

  /**
   * Login user
   */
  async loginUser(email: string, password: string, ip: string, userAgent: string): Promise<{
    success: boolean;
    user?: any;
    sessionId?: string;
    expiresAt?: Date;
    message: string;
  }> {
    try {
      // Check rate limit
      const canAttempt = await this.checkRateLimit(ip);
      if (!canAttempt) {
        return { 
          success: false, 
          message: "Demasiados intentos. Intente en 15 minutos." 
        };
      }

      // Find user
      const [user] = await db.select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (!user) {
        await this.recordLoginAttempt(email, ip, false);
        return { success: false, message: "Credenciales inválidas" };
      }

      // Check if account is locked
      if (user.locked_until && user.locked_until > new Date()) {
        return { 
          success: false, 
          message: "Cuenta bloqueada temporalmente" 
        };
      }

      // Verify password
      const validPassword = await verify(user.password_hash, password, this.hashOptions);
      if (!validPassword) {
        await this.recordLoginAttempt(email, ip, false);
        
        // Increment failed attempts
        const newAttempts = (user.login_attempts || 0) + 1;
        const updateData: any = { 
          login_attempts: newAttempts,
          updated_at: new Date()
        };

        // Lock account after 5 failed attempts
        if (newAttempts >= 5) {
          updateData.locked_until = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        }

        await db.update(users)
          .set(updateData)
          .where(eq(users.id, user.id));

        return { success: false, message: "Credenciales inválidas" };
      }

      // Check if account is active
      if (!user.is_active) {
        return { success: false, message: "Cuenta desactivada" };
      }

      // Record successful login
      await this.recordLoginAttempt(email, ip, true);
      
      // Update user login info
      await db.update(users)
        .set({ 
          last_login: new Date(),
          login_attempts: 0,
          locked_until: null,
          updated_at: new Date()
        })
        .where(eq(users.id, user.id));

      // Create session
      const { sessionId, expiresAt } = await this.createSession(user.id, ip, userAgent);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          emailVerified: user.email_verified,
          provinceId: user.province_id
        },
        sessionId,
        expiresAt,
        message: "Inicio de sesión exitoso"
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: "Error al iniciar sesión" };
    }
  }

  /**
   * Login admin user
   */
  async loginAdmin(email: string, password: string, ip: string, userAgent: string): Promise<{
    success: boolean;
    user?: any;
    sessionId?: string;
    expiresAt?: Date;
    message: string;
  }> {
    try {
      // Check rate limit
      const canAttempt = await this.checkRateLimit(ip);
      if (!canAttempt) {
        return { 
          success: false, 
          message: "Demasiados intentos. Intente en 15 minutos." 
        };
      }

      // Find admin user
      const [adminUser] = await db.select()
        .from(adminUsers)
        .where(eq(adminUsers.email, email.toLowerCase()))
        .limit(1);

      if (!adminUser) {
        await this.recordLoginAttempt(email, ip, false);
        return { success: false, message: "Credenciales inválidas" };
      }

      // Verify password
      const validPassword = await verify(adminUser.password_hash, password, this.hashOptions);
      if (!validPassword) {
        await this.recordLoginAttempt(email, ip, false);
        return { success: false, message: "Credenciales inválidas" };
      }

      // Check if account is active
      if (!adminUser.active) {
        return { success: false, message: "Cuenta de administrador desactivada" };
      }

      // Record successful login
      await this.recordLoginAttempt(email, ip, true);
      
      // Update admin login info
      await db.update(adminUsers)
        .set({ 
          last_login: new Date(),
          updated_at: new Date()
        })
        .where(eq(adminUsers.id, adminUser.id));

      // Create admin session
      const { sessionId, expiresAt } = await this.createAdminSession(adminUser.id, ip, userAgent);

      return {
        success: true,
        user: {
          id: adminUser.id,
          username: adminUser.username,
          email: adminUser.email,
          firstName: adminUser.first_name,
          lastName: adminUser.last_name,
          role: adminUser.role
        },
        sessionId,
        expiresAt,
        message: "Inicio de sesión de administrador exitoso"
      };
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, message: "Error al iniciar sesión de administrador" };
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{
    success: boolean;
    token?: string;
    message: string;
  }> {
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (!user) {
        // Don't reveal if email exists
        return { 
          success: true, 
          message: "Si el correo existe, recibirá instrucciones para restablecer su contraseña"
        };
      }

      // Create reset token
      const token = this.generateSessionId();
      await db.insert(passwordResets).values({
        id: this.generateUserId(),
        user_id: user.id,
        token,
        expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        used: false,
        created_at: new Date()
      });

      return { 
        success: true, 
        token,
        message: "Si el correo existe, recibirá instrucciones para restablecer su contraseña"
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, message: "Error al procesar solicitud" };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Find valid token
      const [resetRequest] = await db.select()
        .from(passwordResets)
        .where(
          and(
            eq(passwordResets.token, token),
            eq(passwordResets.used, false),
            gte(passwordResets.expires_at, new Date())
          )
        )
        .limit(1);

      if (!resetRequest) {
        return { success: false, message: "Token inválido o expirado" };
      }

      // Hash new password
      const passwordHash = await hash(newPassword, this.hashOptions);

      // Update user password
      await db.update(users)
        .set({ 
          password_hash: passwordHash,
          login_attempts: 0,
          locked_until: null,
          updated_at: new Date()
        })
        .where(eq(users.id, resetRequest.user_id));

      // Mark token as used
      await db.update(passwordResets)
        .set({ used: true })
        .where(eq(passwordResets.id, resetRequest.id));

      // Invalidate all existing sessions for this user
      await db.delete(sessions).where(eq(sessions.user_id, resetRequest.user_id));

      return { 
        success: true, 
        message: "Contraseña actualizada exitosamente" 
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: "Error al restablecer contraseña" };
    }
  }

  /**
   * Create session cookie
   */
  createSessionCookie(sessionId: string, expiresAt: Date): {
    name: string;
    value: string;
    attributes: any;
  } {
    return {
      name: this.sessionConfig.cookieName,
      value: sessionId,
      attributes: {
        expires: expiresAt,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
      }
    };
  }

  /**
   * Create admin session cookie
   */
  createAdminSessionCookie(sessionId: string, expiresAt: Date): {
    name: string;
    value: string;
    attributes: any;
  } {
    return {
      name: this.sessionConfig.adminCookieName,
      value: sessionId,
      attributes: {
        expires: expiresAt,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
      }
    };
  }

  /**
   * Create blank session cookie (for logout)
   */
  createBlankSessionCookie(): {
    name: string;
    value: string;
    attributes: any;
  } {
    return {
      name: this.sessionConfig.cookieName,
      value: "",
      attributes: {
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
      }
    };
  }

  /**
   * Read session cookie
   */
  readSessionCookie(cookieHeader: string | undefined): string | null {
    if (!cookieHeader) return null;
    
    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === this.sessionConfig.cookieName) {
        return value || null;
      }
    }
    return null;
  }

  /**
   * Read admin session cookie
   */
  readAdminSessionCookie(cookieHeader: string | undefined): string | null {
    if (!cookieHeader) return null;
    
    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === this.sessionConfig.adminCookieName) {
        return value || null;
      }
    }
    return null;
  }
}

// Export singleton instance
export const sessionAuth = new SessionAuth();