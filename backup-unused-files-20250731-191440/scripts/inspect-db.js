#!/usr/bin/env node

// SafraReport Database Inspection Script
// Check what tables and columns exist to plan safe migration

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function inspectDatabase() {
  console.log('🔍 Inspecting SafraReport Database...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is missing!');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to database...');
    
    // Check what tables exist
    console.log('\n📊 Existing Tables:');
    const tablesResult = await pool.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('❌ No tables found in public schema');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  ✅ ${row.table_name} (${row.table_type})`);
      });
    }
    
    // Check columns for key tables if they exist
    const keyTables = ['articles', 'categories', 'classifieds', 'reviews', 'users', 'profiles'];
    
    for (const tableName of keyTables) {
      const tableExists = tablesResult.rows.some(row => row.table_name === tableName);
      if (tableExists) {
        console.log(`\n📋 Columns in ${tableName}:`);
        const columnsResult = await pool.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position;
        `, [tableName]);
        
        columnsResult.rows.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
      }
    }
    
    // Check if there's any data in key tables
    console.log('\n📈 Data Count:');
    for (const tableName of keyTables) {
      const tableExists = tablesResult.rows.some(row => row.table_name === tableName);
      if (tableExists) {
        try {
          const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`  ${tableName}: ${countResult.rows[0].count} rows`);
        } catch (error) {
          console.log(`  ${tableName}: Error counting rows - ${error.message}`);
        }
      }
    }
    
    console.log('\n✅ Database inspection completed!');
    
  } catch (error) {
    console.error('❌ Inspection failed:', error.message);
    console.error('🔍 Full error:', error);
  } finally {
    await pool.end();
  }
}

inspectDatabase().catch(console.error);
