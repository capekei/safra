// Load environment variables (required for DATABASE_URL at module load time)
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load from root directory .env file
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  DATABASE_URL not set - using mock database for development');
    process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock';
  } else {
    console.error('❌ DATABASE_URL environment variable is missing!');
    console.error('💡 For Render deployment, DATABASE_URL is configured in render.yaml');
    console.error('📋 Format: postgresql://user:pass@host:port/db?sslmode=require');
    throw new Error(
      "DATABASE_URL must be set. Check render.yaml configuration.",
    );
  }
}

// Configure database connection
let pool: Pool;
let db: any;

try {
  if (process.env.DATABASE_URL?.includes('mock')) {
    // Mock pool for development
    console.log('🔧 Using mock database pool for development');
    pool = new Pool({
      connectionString: 'postgresql://localhost:5432/mock',
      ssl: false
    });
    db = { 
      select: () => ({ from: () => ({ orderBy: () => ({ limit: () => ({ offset: () => [] }) }) }) }),
      insert: () => ({ values: () => ({ returning: () => [{}] }) }),
      update: () => ({ set: () => ({ where: () => ({ returning: () => [{}] }) }) }),
      delete: () => ({ where: () => ({}) })
    };
  } else {
    // Real database connection with proper SSL for Render
    const isProduction = process.env.NODE_ENV === 'production';
    const sslConfig = isProduction ? { rejectUnauthorized: false } : false;
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig,
      max: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '20'),
      connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '5000'),
      idleTimeoutMillis: 30000,
    });
    db = drizzle(pool, { schema });
  }
} catch (error) {
  console.error('Database connection error:', error);
  // Fallback mock
  db = { 
    select: () => ({ from: () => ({ orderBy: () => ({ limit: () => ({ offset: () => [] }) }) }) }),
    insert: () => ({ values: () => ({ returning: () => [{}] }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [{}] }) }) }),
    delete: () => ({ where: () => ({}) })
  };
}

export { pool, db };