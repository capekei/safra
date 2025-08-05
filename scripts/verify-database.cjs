#!/usr/bin/env node

/**
 * SafraReport Database Verification Script
 * Comprehensive database connectivity and data integrity checks
 */

require('dotenv').config();

const { Pool } = require('pg');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5, // max connections for testing
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// Expected tables and their key columns
const expectedTables = {
  articles: ['id', 'title', 'slug', 'content', 'published', 'created_at'],
  categories: ['id', 'name', 'slug', 'description'],
  classifieds: ['id', 'title', 'description', 'price', 'status'],
  businesses: ['id', 'name', 'description', 'average_rating'],
  provinces: ['id', 'name', 'code'],
  classified_categories: ['id', 'name', 'slug'],
  business_categories: ['id', 'name', 'slug'],
  reviews: ['id', 'business_id', 'rating', 'comment'],
  users: ['id', 'email', 'created_at']
};

// Dominican Republic provinces for validation
const dominicanProvinces = [
  'Distrito Nacional', 'Santo Domingo', 'Santiago', 'La Vega', 'San Pedro de Macorís',
  'Duarte', 'La Romana', 'San Cristóbal', 'Puerto Plata', 'Espaillat',
  'Azua', 'Valverde', 'Monseñor Nouel', 'Monte Cristi', 'Hato Mayor',
  'El Seibo', 'Samaná', 'Dajabón', 'Barahona', 'Baoruco',
  'Independencia', 'Peravia', 'Monte Plata', 'Sánchez Ramírez', 'María Trinidad Sánchez',
  'La Altagracia', 'San José de Ocoa', 'Hermanas Mirabal', 'San Juan', 'Elías Piña', 'Pedernales'
];

// Format status with color
function formatStatus(success, message = '') {
  const icon = success ? '✅' : '❌';
  const color = success ? colors.green : colors.red;
  return `${color}${icon} ${message}${colors.reset}`;
}

// Test database connection
async function testConnection(pool) {
  console.log('🔌 Testing database connection...');
  
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as timestamp, version() as version');
    client.release();
    
    console.log(formatStatus(true, 'Database connection successful'));
    console.log(`   Timestamp: ${colors.cyan}${result.rows[0].timestamp}${colors.reset}`);
    console.log(`   Version: ${colors.cyan}${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}${colors.reset}`);
    return true;
  } catch (error) {
    console.log(formatStatus(false, 'Database connection failed'));
    console.log(`   Error: ${colors.red}${error.message}${colors.reset}`);
    return false;
  }
}

// Check if tables exist and get their structure
async function checkTableStructure(pool) {
  console.log('\n📋 Checking table structure...');
  
  const results = {};
  
  for (const [tableName, expectedColumns] of Object.entries(expectedTables)) {
    try {
      // Check if table exists
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `;
      
      const tableResult = await pool.query(tableExistsQuery, [tableName]);
      const tableExists = tableResult.rows[0].exists;
      
      if (!tableExists) {
        console.log(`   ${formatStatus(false, `Table '${tableName}' does not exist`)}`);
        results[tableName] = { exists: false, columns: [], missingColumns: expectedColumns };
        continue;
      }
      
      // Get table columns
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position;
      `;
      
      const columnsResult = await pool.query(columnsQuery, [tableName]);
      const actualColumns = columnsResult.rows.map(row => row.column_name);
      const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
      
      const status = missingColumns.length === 0;
      console.log(`   ${formatStatus(status, `Table '${tableName}'`)} (${actualColumns.length} columns)`);
      
      if (missingColumns.length > 0) {
        console.log(`     Missing columns: ${colors.red}${missingColumns.join(', ')}${colors.reset}`);
      }
      
      results[tableName] = {
        exists: true,
        columns: actualColumns,
        missingColumns,
        details: columnsResult.rows
      };
      
    } catch (error) {
      console.log(`   ${formatStatus(false, `Error checking table '${tableName}': ${error.message}`)}`);
      results[tableName] = { exists: false, error: error.message };
    }
  }
  
  return results;
}

// Check data counts and basic integrity
async function checkDataIntegrity(pool) {
  console.log('\n📊 Checking data integrity...');
  
  const checks = [
    {
      name: 'Articles Count',
      query: 'SELECT COUNT(*) as count FROM articles',
      validate: (result) => result.rows[0].count >= 0
    },
    {
      name: 'Published Articles',
      query: 'SELECT COUNT(*) as count FROM articles WHERE published = true',
      validate: (result) => result.rows[0].count >= 0
    },
    {
      name: 'Categories Count',
      query: 'SELECT COUNT(*) as count FROM categories',
      validate: (result) => result.rows[0].count >= 0
    },
    {
      name: 'Dominican Provinces',
      query: 'SELECT COUNT(*) as count FROM provinces',
      validate: (result) => result.rows[0].count === 31 // Dominican Republic has 31 provinces
    },
    {
      name: 'Province Names Check',
      query: 'SELECT name FROM provinces ORDER BY name',
      validate: (result) => {
        const provinceNames = result.rows.map(row => row.name);
        return dominicanProvinces.some(expected => 
          provinceNames.some(actual => actual.includes(expected) || expected.includes(actual))
        );
      }
    },
    {
      name: 'Classifieds Count',
      query: 'SELECT COUNT(*) as count FROM classifieds',
      validate: (result) => result.rows[0].count >= 0
    },
    {
      name: 'Businesses Count',
      query: 'SELECT COUNT(*) as count FROM businesses',
      validate: (result) => result.rows[0].count >= 0
    }
  ];
  
  const results = {};
  
  for (const check of checks) {
    try {
      const result = await pool.query(check.query);
      const isValid = check.validate(result);
      
      console.log(`   ${formatStatus(isValid, check.name)}`);
      
      if (check.name.includes('Count')) {
        const count = result.rows[0].count;
        console.log(`     Count: ${colors.cyan}${count}${colors.reset}`);
      }
      
      results[check.name] = {
        success: isValid,
        data: result.rows,
        error: null
      };
      
    } catch (error) {
      console.log(`   ${formatStatus(false, `${check.name}: ${error.message}`)}`);
      results[check.name] = {
        success: false,
        data: null,
        error: error.message
      };
    }
  }
  
  return results;
}

// Check indexes and performance
async function checkPerformance(pool) {
  console.log('\n🚀 Checking database performance...');
  
  const performanceChecks = [
    {
      name: 'Articles Index on Slug',
      query: `
        SELECT schemaname, tablename, indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = 'articles' AND indexdef LIKE '%slug%'
      `,
      validate: (result) => result.rows.length > 0
    },
    {
      name: 'Articles Index on Published',
      query: `
        SELECT schemaname, tablename, indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = 'articles' AND indexdef LIKE '%published%'
      `,
      validate: (result) => result.rows.length > 0
    },
    {
      name: 'Database Size',
      query: `
        SELECT 
          pg_size_pretty(pg_database_size(current_database())) as size,
          pg_database_size(current_database()) as bytes
      `,
      validate: (result) => result.rows[0].bytes > 0
    },
    {
      name: 'Connection Count',
      query: 'SELECT count(*) as connections FROM pg_stat_activity',
      validate: (result) => result.rows[0].connections >= 1
    }
  ];
  
  for (const check of performanceChecks) {
    try {
      const result = await pool.query(check.query);
      const isValid = check.validate(result);
      
      console.log(`   ${formatStatus(isValid, check.name)}`);
      
      if (check.name === 'Database Size') {
        console.log(`     Size: ${colors.cyan}${result.rows[0].size}${colors.reset}`);
      } else if (check.name === 'Connection Count') {
        console.log(`     Active Connections: ${colors.cyan}${result.rows[0].connections}${colors.reset}`);
      }
      
    } catch (error) {
      console.log(`   ${formatStatus(false, `${check.name}: ${error.message}`)}`);
    }
  }
}

// Main verification function
async function verifyDatabase() {
  console.log(`${colors.bold}${colors.cyan}🗄️  SafraReport Database Verification${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  // Check DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.log(`${colors.red}❌ DATABASE_URL environment variable not found${colors.reset}`);
    console.log('Please set DATABASE_URL in your .env file');
    process.exit(1);
  }
  
  console.log(`Database URL: ${colors.magenta}${process.env.DATABASE_URL.replace(/\/\/.*@/, '//***:***@')}${colors.reset}`);
  console.log(`Environment: ${colors.magenta}${process.env.NODE_ENV || 'development'}${colors.reset}`);
  
  const pool = new Pool(dbConfig);
  let allChecksPass = true;
  
  try {
    // Test connection
    const connectionOk = await testConnection(pool);
    if (!connectionOk) {
      allChecksPass = false;
    }
    
    // Check table structure
    const tableResults = await checkTableStructure(pool);
    const missingTables = Object.values(tableResults).filter(result => !result.exists);
    if (missingTables.length > 0) {
      allChecksPass = false;
    }
    
    // Check data integrity
    const dataResults = await checkDataIntegrity(pool);
    const failedDataChecks = Object.values(dataResults).filter(result => !result.success);
    if (failedDataChecks.length > 0) {
      allChecksPass = false;
    }
    
    // Check performance
    await checkPerformance(pool);
    
    // Summary
    console.log(`\n${colors.bold}📋 Summary${colors.reset}`);
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    
    const totalTables = Object.keys(expectedTables).length;
    const existingTables = Object.values(tableResults).filter(result => result.exists).length;
    
    console.log(`Tables Expected: ${colors.cyan}${totalTables}${colors.reset}`);
    console.log(`Tables Found: ${colors.cyan}${existingTables}${colors.reset}`);
    console.log(`Missing Tables: ${colors.red}${totalTables - existingTables}${colors.reset}`);
    
    if (allChecksPass) {
      console.log(`\n${colors.bold}${colors.green}🎉 DATABASE HEALTHY${colors.reset}`);
      console.log('All database checks passed successfully.');
    } else {
      console.log(`\n${colors.bold}${colors.yellow}⚠️  DATABASE ISSUES DETECTED${colors.reset}`);
      console.log('Some database checks failed. Review the details above.');
      
      // Provide helpful suggestions
      console.log(`\n${colors.bold}💡 Suggested Actions${colors.reset}`);
      console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
      
      if (missingTables.length > 0) {
        console.log('• Run database migrations: npm run db:push');
        console.log('• Initialize database schema if this is a fresh setup');
      }
      
      console.log('• Seed database with sample data: npm run db:seed');
      console.log('• Check DATABASE_URL format and credentials');
      console.log('• Verify database server is running and accessible');
    }
    
  } catch (error) {
    console.log(`\n${colors.red}❌ Verification failed: ${error.message}${colors.reset}`);
    allChecksPass = false;
  } finally {
    await pool.end();
  }
  
  process.exit(allChecksPass ? 0 : 1);
}

// Handle CLI execution
if (require.main === module) {
  verifyDatabase().catch((error) => {
    console.error(`${colors.red}❌ Database verification failed:${colors.reset}`, error.message);
    process.exit(1);
  });
}

module.exports = { verifyDatabase };