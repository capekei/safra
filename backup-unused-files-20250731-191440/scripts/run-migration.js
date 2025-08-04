#!/usr/bin/env node

// SafraReport Database Migration Script
// This will create all missing tables and fix the 500 errors

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🚀 Starting SafraReport Database Migration...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is missing!');
    console.error('💡 Make sure your .env file is configured');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    
    // Read the PostgreSQL-compatible schema file
    const schemaPath = path.join(__dirname, 'server', 'postgres-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Executing database schema migration...');
    
    // Execute the complete schema
    await pool.query(schema);
    
    console.log('✅ Database migration completed successfully!');
    console.log('🎉 SafraReport database is now ready!');
    
    // Test the migration by checking if articles table exists
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('articles', 'categories', 'classifieds', 'reviews', 'profiles')
      ORDER BY table_name;
    `);
    
    console.log('📊 Created tables:', result.rows.map(r => r.table_name));
    
    // Check if sample data was inserted
    const articleCount = await pool.query('SELECT COUNT(*) as count FROM articles WHERE published = true');
    console.log('📰 Sample articles created:', articleCount.rows[0].count);
    
    console.log('🌐 Your website should now work properly!');
    console.log('🔗 Test: https://safrareport.onrender.com/api/articles');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('🔍 Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration().catch(console.error);
