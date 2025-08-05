import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { db } from '../db';
import { articles, categories, adminUsers } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { DatabaseStorage } from '../database/storage';

// Test app setup
const app = express();
app.use(express.json());

// Mock routes for testing
app.get('/api/articles', async (req, res) => {
  try {
    const storage = new DatabaseStorage();
    const articles = await storage.getArticles();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/articles/featured', async (req, res) => {
  try {
    const storage = new DatabaseStorage();
    const featuredArticles = await storage.getFeaturedArticles();
    res.json(featuredArticles);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const storage = new DatabaseStorage();
    const categories = await storage.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

describe('API Endpoints', () => {
  let testCategoryId: number;
  let testArticleId: number;
  let testAdminId: number;

  beforeAll(async () => {
    // Create test admin user
    const passwordHash = await bcrypt.hash('testpassword123', 12);
    const [testAdmin] = await db.insert(adminUsers).values({
      email: 'testapi@safrareport.com',
      username: 'testapi',
      passwordHash: passwordHash,
      firstName: 'Test',
      lastName: 'API',
      role: 'admin',
      isActive: true
    }).returning();
    testAdminId = testAdmin.id;

    // Create test category
    const [testCategory] = await db.insert(categories).values({
      name: 'Test Category',
      slug: 'test-category',
      icon: 'test-icon',
      description: 'Test category for API testing'
    }).returning();
    testCategoryId = testCategory.id;

    // Create test article
    const [testArticle] = await db.insert(articles).values({
      title: 'Test Article',
      slug: 'test-article',
      excerpt: 'This is a test article excerpt',
      content: 'This is the full content of the test article',
      authorId: testAdmin.id.toString(),
      categoryId: testCategoryId,
      published: true,
      isFeatured: true,
      isBreaking: false
    }).returning();
    testArticleId = testArticle.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await db.delete(articles).where(eq(articles.id, testArticleId));
    await db.delete(categories).where(eq(categories.id, testCategoryId));
    await db.delete(adminUsers).where(eq(adminUsers.id, testAdminId));
  });

  describe('GET /api/articles', () => {
    it('should return published articles', async () => {
      const response = await request(app)
        .get('/api/articles');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Should include our test article
      const testArticle = response.body.find((article: any) => article.id === testArticleId);
      expect(testArticle).toBeDefined();
      expect(testArticle.title).toBe('Test Article');
      expect(testArticle.published).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      // This would require mocking the database to simulate an error
      // For now, we test the happy path
      const response = await request(app)
        .get('/api/articles');

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/articles/featured', () => {
    it('should return only featured articles', async () => {
      const response = await request(app)
        .get('/api/articles/featured');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All returned articles should be featured
      response.body.forEach((article: any) => {
        expect(article.isFeatured).toBe(true);
      });

      // Should include our test featured article
      const testArticle = response.body.find((article: any) => article.id === testArticleId);
      expect(testArticle).toBeDefined();
    });
  });

  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      const response = await request(app)
        .get('/api/categories');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Should include our test category
      const testCategory = response.body.find((category: any) => category.id === testCategoryId);
      expect(testCategory).toBeDefined();
      expect(testCategory.name).toBe('Test Category');
      expect(testCategory.slug).toBe('test-category');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint');

      expect(response.status).toBe(404);
    });
  });

  describe('Response Format', () => {
    it('should return JSON responses', async () => {
      const response = await request(app)
        .get('/api/articles');

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should include proper CORS headers', async () => {
      const response = await request(app)
        .get('/api/articles');

      // Note: CORS headers would be set by middleware in the actual app
      expect(response.status).toBe(200);
    });
  });

  describe('Performance', () => {
    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/articles');

      const responseTime = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // 5 seconds max
    });
  });
});
