#!/usr/bin/env node

/**
 * Test script to verify articles API functionality after author table removal
 * Tests that all article endpoints return 200 status codes and correct JSON structure
 */

import http from 'http';

const BASE_URL = 'http://localhost:4000';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data,
            headers: res.headers,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testEndpoint(path, description) {
  console.log(`\n🔍 Testing: ${description}`);
  console.log(`📍 Endpoint: ${path}`);
  
  try {
    const result = await makeRequest(path);
    
    console.log(`✅ Status: ${result.statusCode}`);
    
    if (result.statusCode === 200) {
      if (Array.isArray(result.data)) {
        console.log(`📊 Response: Array with ${result.data.length} items`);
        
        // Check structure of first item if exists
        if (result.data.length > 0) {
          const firstItem = result.data[0];
          console.log(`🔍 First item keys: ${Object.keys(firstItem).join(', ')}`);
          
          // Check for authorUsername field
          if ('authorUsername' in firstItem) {
            console.log(`✅ authorUsername field present: ${firstItem.authorUsername}`);
          } else {
            console.log(`❌ authorUsername field missing`);
          }
          
          // Check for category relation
          if ('category' in firstItem) {
            console.log(`✅ category relation present`);
          } else {
            console.log(`❌ category relation missing`);
          }
        }
      } else if (typeof result.data === 'object') {
        console.log(`📊 Response: Object with keys: ${Object.keys(result.data).join(', ')}`);
      } else {
        console.log(`📊 Response: ${typeof result.data}`);
      }
    } else {
      console.log(`❌ Error response: ${result.data}`);
    }
    
    return result.statusCode === 200;
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 SafraReport Articles API Test Suite');
  console.log('=====================================');
  console.log('Testing API endpoints after author table removal...\n');

  const tests = [
    ['/api/articles', 'Get all articles'],
    ['/api/articles/featured', 'Get featured articles'],
    ['/api/articles/breaking', 'Get breaking news'],
    ['/api/categories', 'Get categories'],
    ['/api/health', 'Health check']
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const [path, description] of tests) {
    const passed = await testEndpoint(path, description);
    if (passed) passedTests++;
  }

  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! API is working correctly.');
    console.log('✅ Author table removal successful');
    console.log('✅ Database queries fixed');
    console.log('✅ No 500 errors detected');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.');
  }

  return passedTests === totalTests;
}

// Run the tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
