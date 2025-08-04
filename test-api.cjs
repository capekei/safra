// Simple test script to check API endpoints
const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing API endpoints...');
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const health = await makeRequest('/api/health');
    console.log(`   Status: ${health.status}`);
    console.log(`   Response: ${JSON.stringify(health.data, null, 2)}`);
    
    // Test articles endpoint
    console.log('\n2. Testing articles endpoint...');
    const articles = await makeRequest('/api/articles');
    console.log(`   Status: ${articles.status}`);
    console.log(`   Response: ${JSON.stringify(articles.data, null, 2)}`);
    
    // Test categories endpoint  
    console.log('\n3. Testing categories endpoint...');
    const categories = await makeRequest('/api/categories');
    console.log(`   Status: ${categories.status}`);
    console.log(`   Response: ${JSON.stringify(categories.data, null, 2)}`);
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();