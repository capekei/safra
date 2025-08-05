import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { adminUsers, adminSessions } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import adminAuthRouter from '../auth/admin-auth';
import { authenticateAdmin, requireAdmin } from '../middleware/admin-auth';

// Test app setup
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(adminAuthRouter);

// Test protected route
app.get('/test-protected', authenticateAdmin, requireAdmin, (req, res) => {
  res.json({ success: true, message: 'Protected route accessed' });
});

describe('Admin Authentication System', () => {
  let testAdminId: number;
  let testSessionId: string;
  let testToken: string;

  beforeAll(async () => {
    // Create test admin user
    const passwordHash = await bcrypt.hash('testpassword123', 12);
    
    const [testAdmin] = await db.insert(adminUsers).values({
      email: 'test@safrareport.com',
      username: 'testadmin',
      passwordHash: passwordHash,
      firstName: 'Test',
      lastName: 'Admin',
      role: 'super_admin',
      isActive: true
    }).returning();

    testAdminId = testAdmin.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await db.delete(adminSessions).where(eq(adminSessions.adminUserId, testAdminId));
    await db.delete(adminUsers).where(eq(adminUsers.id, testAdminId));
  });

  beforeEach(async () => {
    // Clean up sessions before each test
    await db.delete(adminSessions).where(eq(adminSessions.adminUserId, testAdminId));
  });

  describe('POST /api/auth/admin/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'test@safrareport.com',
          password: 'testpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@safrareport.com');
      expect(response.body.token).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();

      // Store token for other tests
      testToken = response.body.token;
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'test@safrareport.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should fail with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'test@safrareport.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('MISSING_CREDENTIALS');
    });

    it('should fail with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'nonexistent@safrareport.com',
          password: 'testpassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/auth/admin/verify', () => {
    beforeEach(async () => {
      // Login to get a valid token
      const loginResponse = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'test@safrareport.com',
          password: 'testpassword123'
        });
      
      testToken = loginResponse.body.token;
    });

    it('should verify valid JWT token', async () => {
      const response = await request(app)
        .get('/api/auth/admin/verify')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@safrareport.com');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/admin/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_TOKEN');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/admin/verify');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('NOT_AUTHENTICATED');
    });
  });

  describe('POST /api/auth/admin/logout', () => {
    it('should logout successfully', async () => {
      // First login
      const loginResponse = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'test@safrareport.com',
          password: 'testpassword123'
        });

      const cookies = loginResponse.headers['set-cookie'];

      // Then logout
      const response = await request(app)
        .post('/api/auth/admin/logout')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/auth/admin/create', () => {
    it('should create admin user in development', async () => {
      // Set NODE_ENV to development for this test
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const response = await request(app)
        .post('/api/auth/admin/create')
        .send({
          email: 'newadmin@safrareport.com',
          username: 'newadmin',
          password: 'newpassword123',
          firstName: 'New',
          lastName: 'Admin'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('newadmin@safrareport.com');

      // Cleanup
      await db.delete(adminUsers).where(eq(adminUsers.email, 'newadmin@safrareport.com'));
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should fail with weak password', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const response = await request(app)
        .post('/api/auth/admin/create')
        .send({
          email: 'weakpass@safrareport.com',
          username: 'weakpass',
          password: '123',
          firstName: 'Weak',
          lastName: 'Password'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('WEAK_PASSWORD');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Protected Routes', () => {
    beforeEach(async () => {
      // Login to get a valid token
      const loginResponse = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'test@safrareport.com',
          password: 'testpassword123'
        });
      
      testToken = loginResponse.body.token;
    });

    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/test-protected')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny access without token', async () => {
      const response = await request(app)
        .get('/test-protected');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('NOT_AUTHENTICATED');
    });
  });

  describe('Rate Limiting', () => {
    it('should allow normal login attempts', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'test@safrareport.com',
          password: 'testpassword123'
        });

      expect(response.status).toBe(200);
    });

    // Note: Rate limiting tests would require more complex setup
    // to simulate multiple IP addresses and failed attempts
  });

  describe('Security Features', () => {
    it('should not expose sensitive data in responses', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'test@safrareport.com',
          password: 'testpassword123'
        });

      expect(response.body.user.passwordHash).toBeUndefined();
      expect(response.body.user.password).toBeUndefined();
    });

    it('should set secure cookie attributes', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'test@safrareport.com',
          password: 'testpassword123'
        });

      const setCookieHeader = response.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader[0]).toContain('HttpOnly');
      expect(setCookieHeader[0]).toContain('SameSite=Strict');
    });
  });
});
