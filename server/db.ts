import * as dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is missing!');
  console.error('💡 For Render deployment, DATABASE_URL is configured in render.yaml');
  console.error('📋 Format: postgresql://user:pass@host:port/db?sslmode=require');
  throw new Error(
    "DATABASE_URL must be set. Check render.yaml configuration.",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Remove SSL config - let Node handle it globally
});
export const db = drizzle(pool, { schema });