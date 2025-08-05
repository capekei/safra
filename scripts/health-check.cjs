#!/usr/bin/env node

/**
 * SafraReport Health Check Script
 * Comprehensive system health verification for local and production environments
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration
const CONFIG = {
  // Determine base URL based on environment
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://safrareport.onrender.com'
    : 'http://localhost:4000',
  
  timeout: 10000, // 10 seconds
  retries: 3,
  
  // Critical endpoints to test
  endpoints: [
    { path: '/api/health', name: 'Health Check', critical: true },
    { path: '/api/debug/db', name: 'Database Connection', critical: true },
    { path: '/api/debug/articles', name: 'Article Query Test', critical: true },
    { path: '/api/articles', name: 'Articles API', critical: true },
    { path: '/api/categories', name: 'Categories API', critical: false },
    { path: '/api/provinces', name: 'Provinces API', critical: false },
    { path: '/api/weather', name: 'Weather API', critical: false },
    { path: '/api/exchange-rates', name: 'Exchange Rates API', critical: false },
    { path: '/api/fuel-prices', name: 'Fuel Prices API', critical: false },
    { path: '/api/trending', name: 'Trending Articles', critical: false }
  ]
};

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

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = client.request(url, {
      timeout: CONFIG.timeout,
      ...options
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ 
            status: res.statusCode, 
            data: jsonData,
            headers: res.headers,
            responseTime: Date.now() - startTime
          });
        } catch (error) {
          resolve({ 
            status: res.statusCode, 
            data, 
            headers: res.headers,
            responseTime: Date.now() - startTime
          });
        }
      });
    });
    
    const startTime = Date.now();
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Test single endpoint with retries
async function testEndpoint(endpoint, retryCount = 0) {
  const url = `${CONFIG.baseUrl}${endpoint.path}`;
  
  try {
    const result = await makeRequest(url);
    return {
      ...endpoint,
      url,
      success: result.status >= 200 && result.status < 300,
      statusCode: result.status,
      responseTime: result.responseTime,
      data: result.data,
      error: null
    };
  } catch (error) {
    if (retryCount < CONFIG.retries) {
      console.log(`${colors.yellow}⚠️  Retrying ${endpoint.name} (${retryCount + 1}/${CONFIG.retries})${colors.reset}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return testEndpoint(endpoint, retryCount + 1);
    }
    
    return {
      ...endpoint,
      url,
      success: false,
      statusCode: null,
      responseTime: null,
      data: null,
      error: error.message
    };
  }
}

// Format response time with color coding
function formatResponseTime(ms) {
  if (ms === null) return 'N/A';
  if (ms < 100) return `${colors.green}${ms}ms${colors.reset}`;
  if (ms < 500) return `${colors.yellow}${ms}ms${colors.reset}`;
  return `${colors.red}${ms}ms${colors.reset}`;
}

// Format status with icon
function formatStatus(success, critical = false) {
  if (success) {
    return `${colors.green}✅ PASS${colors.reset}`;
  } else {
    const icon = critical ? '❌' : '⚠️';
    const color = critical ? colors.red : colors.yellow;
    return `${color}${icon} FAIL${colors.reset}`;
  }
}

// Main health check function
async function runHealthCheck() {
  console.log(`${colors.bold}${colors.cyan}🏥 SafraReport Health Check${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`Target: ${colors.magenta}${CONFIG.baseUrl}${colors.reset}`);
  console.log(`Environment: ${colors.magenta}${process.env.NODE_ENV || 'development'}${colors.reset}`);
  console.log('');

  const results = [];
  let criticalFailures = 0;
  let totalFailures = 0;

  // Test all endpoints
  for (const endpoint of CONFIG.endpoints) {
    process.stdout.write(`Testing ${endpoint.name}... `);
    
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    if (!result.success) {
      totalFailures++;
      if (result.critical) criticalFailures++;
    }
    
    console.log(`${formatStatus(result.success, result.critical)} ${formatResponseTime(result.responseTime)}`);
  }

  console.log('');
  console.log(`${colors.bold}📊 Detailed Results${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  // Display detailed results
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${colors.bold}${result.name}${colors.reset}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   Status: ${formatStatus(result.success, result.critical)} (${result.statusCode || 'No Response'})`);
    console.log(`   Response Time: ${formatResponseTime(result.responseTime)}`);
    
    if (result.error) {
      console.log(`   Error: ${colors.red}${result.error}${colors.reset}`);
    } else if (result.data && result.success) {
      // Show relevant data snippets
      if (result.path === '/api/health') {
        const data = result.data;
        console.log(`   Uptime: ${colors.green}${data.uptime || 'N/A'}s${colors.reset}`);
        console.log(`   Memory: ${colors.green}${data.memory || 'N/A'}MB${colors.reset}`);
        if (data.dominican) {
          console.log(`   Dominican Features: ${colors.green}✅${colors.reset}`);
        }
      } else if (result.path === '/api/debug/db') {
        const data = result.data;
        if (data.success) {
          console.log(`   Articles Count: ${colors.green}${data.articles_count || 0}${colors.reset}`);
        }
      } else if (result.path === '/api/articles') {
        if (Array.isArray(result.data)) {
          console.log(`   Articles Found: ${colors.green}${result.data.length}${colors.reset}`);
        }
      }
    }
    
    console.log('');
  });

  // Summary
  console.log(`${colors.bold}📋 Summary${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  const totalTests = results.length;
  const passedTests = totalTests - totalFailures;
  const passRate = Math.round((passedTests / totalTests) * 100);

  console.log(`Total Tests: ${colors.cyan}${totalTests}${colors.reset}`);
  console.log(`Passed: ${colors.green}${passedTests}${colors.reset}`);
  console.log(`Failed: ${colors.red}${totalFailures}${colors.reset}`);
  console.log(`Critical Failures: ${colors.red}${criticalFailures}${colors.reset}`);
  console.log(`Pass Rate: ${passRate >= 80 ? colors.green : colors.red}${passRate}%${colors.reset}`);

  // Overall status
  console.log('');
  if (criticalFailures === 0) {
    console.log(`${colors.bold}${colors.green}🎉 SYSTEM HEALTHY${colors.reset}`);
    console.log('SafraReport is operating normally. All critical systems are functional.');
  } else if (criticalFailures <= 2) {
    console.log(`${colors.bold}${colors.yellow}⚠️  SYSTEM DEGRADED${colors.reset}`);
    console.log('SafraReport has some issues but core functionality may still work.');
  } else {
    console.log(`${colors.bold}${colors.red}🚨 SYSTEM CRITICAL${colors.reset}`);
    console.log('SafraReport has critical failures that require immediate attention.');
  }

  // Development hints
  if (process.env.NODE_ENV !== 'production') {
    console.log('');
    console.log(`${colors.bold}💡 Development Tips${colors.reset}`);
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log('• Make sure the server is running: npm run dev');
    console.log('• Check database connection in your .env file');
    console.log('• Verify port 4000 is not blocked by firewall');
    console.log('• Run database migrations: npm run db:push');
    console.log('• Seed database with test data: npm run db:seed');
  }

  // Exit with appropriate code
  process.exit(criticalFailures > 0 ? 1 : 0);
}

// Handle CLI execution
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bold}SafraReport Health Check Script${colors.reset}

Usage: node scripts/health-check.js [options]

Options:
  --production, -p    Test against production URL
  --local, -l         Test against localhost (default)
  --help, -h          Show this help message

Environment Variables:
  NODE_ENV           Set to 'production' for production testing
  BASE_URL           Override the base URL for testing

Examples:
  node scripts/health-check.js                    # Test local development
  NODE_ENV=production node scripts/health-check.js # Test production
  BASE_URL=http://localhost:5173 node scripts/health-check.js # Custom URL
    `);
    process.exit(0);
  }

  // Override base URL based on arguments
  if (args.includes('--production') || args.includes('-p')) {
    CONFIG.baseUrl = 'https://safrareport.onrender.com';
  } else if (args.includes('--local') || args.includes('-l')) {
    CONFIG.baseUrl = 'http://localhost:4000';
  }

  // Override with BASE_URL environment variable
  if (process.env.BASE_URL) {
    CONFIG.baseUrl = process.env.BASE_URL;
  }

  // Run the health check
  runHealthCheck().catch((error) => {
    console.error(`${colors.red}❌ Health check failed:${colors.reset}`, error.message);
    process.exit(1);
  });
}

module.exports = { runHealthCheck, testEndpoint, CONFIG };