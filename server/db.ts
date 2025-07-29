import * as dotenv from 'dotenv';
dotenv.config();

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is missing!');
  console.error('💡 Set DATABASE_URL for your deployment platform:');
  console.error('   Railway: Add DATABASE_URL in Variables tab');
  console.error('   Vercel: Add DATABASE_URL in Environment Variables');
  console.error('   Docker: Add -e DATABASE_URL=your_db_url');
  console.error('📋 Format: postgresql://user:pass@host:port/db?sslmode=require');
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });