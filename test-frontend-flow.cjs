const http = require('http');

// Test the complete flow: Frontend -> Next.js API -> Backend -> Database
async function testCompleteFlow() {
  console.log('🧪 TESTING COMPLETE ARTICLE VIEWING FLOW');
  console.log('========================================\n');
  
  const tests = [
    {
      name: 'Backend Health Check',
      url: 'http://localhost:4000/api/health',
      expected: 'healthy'
    },
    {
      name: 'Direct Database Query',
      url: 'http://localhost:4000/api/debug/articles',
      expected: 'success'
    },
    {
      name: 'Frontend Health Check',
      url: 'http://localhost:3000/api/health',
      expected: 'should proxy to backend'
    },
    {
      name: 'Popular Article API (via Frontend Proxy)',
      url: 'http://localhost:3000/api/articles/republica-dominicana-record-historico-turistas',
      expected: 'article data'
    },
    {
      name: 'Government Article API (via Frontend Proxy)', 
      url: 'http://localhost:3000/api/articles/gobierno-anuncia-nuevas-medidas-economicas-2025',
      expected: 'article data'
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}`);
      const result = await makeRequest(test.url);
      
      if (result.status === 200) {
        console.log(`   ✅ Status: ${result.status} - SUCCESS`);
        
        // Show relevant data based on test type
        if (test.url.includes('/debug/articles')) {
          console.log(`   📊 Found ${result.data.articles?.length || 0} articles`);
        } else if (test.url.includes('/articles/')) {
          if (result.data.title) {
            console.log(`   📰 Article: "${result.data.title}"`);
            console.log(`   👀 Views: ${result.data.views || 0} | ❤️ Likes: ${result.data.likes || 0}`);
          } else {
            console.log(`   ⚠️  No article data found`);
          }
        } else if (test.url.includes('/health')) {
          console.log(`   💚 Status: ${result.data.status}`);
        }
      } else {
        console.log(`   ❌ Status: ${result.status} - FAILED`);
        console.log(`   Error: ${JSON.stringify(result.data, null, 2)}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error.message}`);
    }
    
    console.log(''); // Empty line for spacing
  }
  
  // Test frontend page rendering (just check if Next.js responds)
  console.log('🖥️  Testing Frontend Page Responses:');
  try {
    const homeResponse = await makeRequest('http://localhost:3000/');
    console.log(`   Home page: ${homeResponse.status === 200 ? '✅ Loading' : '❌ Failed'}`);
    
    const articleResponse = await makeRequest('http://localhost:3000/articulos/republica-dominicana-record-historico-turistas');
    console.log(`   Article page: ${articleResponse.status === 200 ? '✅ Loading' : '❌ Failed'}`);
    
  } catch (error) {
    console.log(`   ❌ Frontend connection failed: ${error.message}`);
  }
  
  console.log('\n🎉 TESTING COMPLETE!');
  console.log('========================================');
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SafraReport-Test/1.0'
      },
      timeout: 5000
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
          // If not JSON, just return status and first 200 chars
          resolve({ 
            status: res.statusCode, 
            data: { 
              raw: data.substring(0, 200) + (data.length > 200 ? '...' : ''),
              isHTML: data.includes('<html')
            }
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

testCompleteFlow();