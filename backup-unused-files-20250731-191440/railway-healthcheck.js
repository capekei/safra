#!/usr/bin/env node

/**
 * SafraReport Railway Health Check Script
 * Dominican Marketplace Production Monitoring
 */

const http = require('http');

const HEALTH_ENDPOINT = '/api/health';
const PORT = process.env.PORT || 4000;
const TIMEOUT = 5000; // 5 seconds

function performHealthCheck() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: HEALTH_ENDPOINT,
      method: 'GET',
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Railway-HealthCheck/1.0'
      }
    };

    const startTime = Date.now();
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        
        try {
          const healthData = JSON.parse(data);
          
          if (res.statusCode === 200 && healthData.status === 'healthy') {
            resolve({
              status: 'healthy',
              statusCode: res.statusCode,
              responseTime,
              database: healthData.database,
              articlesCount: healthData.articlesCount,
              timestamp: healthData.timestamp
            });
          } else {
            reject(new Error(`Unhealthy response: ${res.statusCode} - ${data}`));
          }
        } catch (parseError) {
          reject(new Error(`Invalid JSON response: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Health check failed: ${error.message}`));
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Health check timeout after ${TIMEOUT}ms`));
    });
    
    req.end();
  });
}

async function main() {
  console.log('🏥 SafraReport Health Check - Railway Production');
  console.log(`📍 Checking: http://localhost:${PORT}${HEALTH_ENDPOINT}`);
  console.log('⏱️  Timeout: 5 seconds');
  console.log('🇩🇴 Dominican Marketplace Status Check\n');

  try {
    const result = await performHealthCheck();
    
    console.log('✅ HEALTH CHECK PASSED');
    console.log(`🚀 Status: ${result.status}`);
    console.log(`📊 Response Time: ${result.responseTime}ms`);
    console.log(`🗄️  Database: ${result.database}`);
    console.log(`📰 Articles: ${result.articlesCount} published`);
    console.log(`🕒 Timestamp: ${result.timestamp}`);
    
    // Exit with success code
    process.exit(0);
    
  } catch (error) {
    console.error('❌ HEALTH CHECK FAILED');
    console.error(`🔥 Error: ${error.message}`);
    console.error('🚨 SafraReport is not responding correctly');
    
    // Additional debugging info
    console.error('\n🔍 Debugging Information:');
    console.error(`📍 Port: ${PORT}`);
    console.error(`🛣️  Endpoint: ${HEALTH_ENDPOINT}`);
    console.error(`⏱️  Timeout: ${TIMEOUT}ms`);
    console.error(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
    
    // Exit with error code for Railway monitoring
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Health check received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 Health check received SIGINT, shutting down gracefully');
  process.exit(0);
});

// Run health check
main().catch((error) => {
  console.error('🔥 Unexpected error in health check:', error);
  process.exit(1);
});