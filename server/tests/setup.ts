import { beforeAll, afterAll } from 'vitest';
import { db } from '../db';
import { logger } from '../lib/logger';

// Test environment setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'silent';
  
  // Ensure database connection
  try {
    await db.execute('SELECT 1 as test');
    logger.info('Test database connection established');
  } catch (error) {
    logger.error('Failed to connect to test database:', error);
    throw error;
  }
});

afterAll(async () => {
  // Cleanup after all tests
  logger.info('Test suite completed');
});

// Global test utilities
declare global {
  var testUtils: {
    createTestUser: () => Promise<any>;
    cleanupTestData: () => Promise<void>;
  };
}

globalThis.testUtils = {
  createTestUser: async () => {
    // Utility function for creating test users
    return {
      id: 'test-user-' + Date.now(),
      email: 'test@example.com',
      role: 'user'
    };
  },
  
  cleanupTestData: async () => {
    // Utility function for cleaning up test data
    logger.debug('Cleaning up test data');
  }
};
