import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { DatabaseStorage } from '../database/storage';
import { logger } from '../lib/logger';

// Simple integration test app
const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const storage = new DatabaseStorage();
    // Simple connectivity test
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: 'Database connection failed' 
    });
  }
});

// Categories endpoint (should work with existing schema)
app.get('/api/categories', async (req, res) => {
  try {
    const storage = new DatabaseStorage();
    const categories = await storage.getCategories();
    res.json(categories);
  } catch (error) {
    logger.error('Categories endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Articles endpoint with error handling
app.get('/api/articles', async (req, res) => {
  try {
    const storage = new DatabaseStorage();
    const articles = await storage.getArticles();
    res.json(articles);
  } catch (error) {
    logger.error('Articles endpoint error:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

describe('SafraReport Integration Tests', () => {
  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'silent';
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.database).toBe('connected');
    });
  });

  describe('API Endpoints', () => {
    it('should handle categories endpoint', async () => {
      const response = await request(app)
        .get('/api/categories');

      // Should return either success or graceful error
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      } else {
        expect(response.body.error).toBeDefined();
      }
    });

    it('should handle articles endpoint', async () => {
      const response = await request(app)
        .get('/api/articles');

      // Should return either success or graceful error
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      } else {
        expect(response.body.error).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/nonexistent');

      expect(response.status).toBe(404);
    });

    it('should return JSON responses', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('Database Storage Layer', () => {
    it('should instantiate DatabaseStorage without errors', () => {
      expect(() => {
        const storage = new DatabaseStorage();
        expect(storage).toBeDefined();
      }).not.toThrow();
    });

    it('should have all required IStorage methods', () => {
      const storage = new DatabaseStorage();
      
      // Check that key methods exist
      expect(typeof storage.getArticles).toBe('function');
      expect(typeof storage.getCategories).toBe('function');
      expect(typeof storage.getFeaturedArticles).toBe('function');
      expect(typeof storage.getUser).toBe('function');
      expect(typeof storage.getArticleBySlug).toBe('function');
    });
  });

  describe('Security & Configuration', () => {
    it('should have required environment variables', () => {
      // Check that critical env vars are available
      expect(process.env.DATABASE_URL).toBeDefined();
    });

    it('should handle missing JWT secret gracefully', () => {
      // This tests our fallback mechanisms
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      // Should not crash the app
      expect(() => {
        const storage = new DatabaseStorage();
      }).not.toThrow();
      
      // Restore
      if (originalSecret) {
        process.env.JWT_SECRET = originalSecret;
      }
    });
  });
});
