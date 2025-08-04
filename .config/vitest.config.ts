import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  test: {
    globals: true,
    // Use different environments based on test file location
    environmentMatchGlobs: [
      ['client/**/*.test.{ts,tsx}', 'jsdom'],
      ['server/**/*.test.{ts,tsx}', 'node'],
    ],
    setupFiles: ['./server/tests/setup.ts', './client/src/test-setup.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    // Run tests sequentially to avoid database conflicts for server tests
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'server/tests/',
        'client/src/__tests__/',
        'client/src/test-setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        'server/database/storage-corrupted-backup.ts'
      ]
    }
  }
});
