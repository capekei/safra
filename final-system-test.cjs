const http = require('http');

async function completeSystemValidation() {
  console.log('🏁 SAFRAREPORT - COMPLETE SYSTEM VALIDATION');
  console.log('==========================================\n');
  
  const results = {
    backend: { status: 'unknown', details: {} },
    database: { status: 'unknown', details: {} },
    articles: { status: 'unknown', details: {} },
    apiEndpoints: { status: 'unknown', details: {} },
  };

  try {
    // 1. Backend Health Check
    console.log('🔍 Testing Backend Server...');
    const backendHealth = await makeRequest('http://localhost:4000/api/health');
    results.backend = {
      status: backendHealth.status === 200 ? 'PASS' : 'FAIL',
      details: {
        port: 4000,
        response: backendHealth.data,
        uptime: backendHealth.data?.uptime || 'unknown'
      }
    };
    console.log(`   ✅ Backend: ${results.backend.status}`);

    // 2. Database Connection
    console.log('\n🗄️ Testing Database Connection...');
    const dbTest = await makeRequest('http://localhost:4000/api/debug/db');
    results.database = {
      status: dbTest.status === 200 ? 'PASS' : 'FAIL',
      details: {
        articlesCount: dbTest.data?.articles_count || 0,
        connection: dbTest.data?.success ? 'Connected' : 'Failed'
      }
    };
    console.log(`   ✅ Database: ${results.database.status} (${results.database.details.articlesCount} articles)`);

    // 3. Article API Tests
    console.log('\n📰 Testing Article APIs...');
    const testSlugs = [
      'republica-dominicana-record-historico-turistas',
      'gobierno-anuncia-nuevas-medidas-economicas-2025',
      'tigres-licey-campeon-beisbol-dominicano'
    ];

    let articleTests = [];
    for (const slug of testSlugs) {
      const articleTest = await makeRequest(`http://localhost:4000/api/articles/${slug}`);
      articleTests.push({
        slug,
        status: articleTest.status === 200 ? 'PASS' : 'FAIL',
        title: articleTest.data?.title || 'Not found',
        views: articleTest.data?.views || 0
      });
    }

    results.articles = {
      status: articleTests.every(t => t.status === 'PASS') ? 'PASS' : 'FAIL',
      details: {
        tested: articleTests.length,
        passed: articleTests.filter(t => t.status === 'PASS').length,
        articles: articleTests
      }
    };
    console.log(`   ✅ Articles: ${results.articles.status} (${results.articles.details.passed}/${results.articles.details.tested} working)`);

    // 4. API Endpoints Test
    console.log('\n🔌 Testing All API Endpoints...');
    const endpoints = [
      '/api/articles',
      '/api/categories',
      '/api/provinces',
      '/api/fuel-prices',
      '/api/exchange-rates',
      '/api/weather'
    ];

    let endpointTests = [];
    for (const endpoint of endpoints) {
      const test = await makeRequest(`http://localhost:4000${endpoint}`);
      endpointTests.push({
        endpoint,
        status: test.status === 200 ? 'PASS' : 'FAIL',
        response: test.status === 200 ? 'Valid JSON' : 'Error'
      });
    }

    results.apiEndpoints = {
      status: endpointTests.every(t => t.status === 'PASS') ? 'PASS' : 'FAIL',
      details: {
        tested: endpointTests.length,
        passed: endpointTests.filter(t => t.status === 'PASS').length,
        endpoints: endpointTests
      }
    };
    console.log(`   ✅ API Endpoints: ${results.apiEndpoints.status} (${results.apiEndpoints.details.passed}/${results.apiEndpoints.details.tested} working)`);

  } catch (error) {
    console.error('❌ System validation error:', error.message);
  }

  // Final Report
  console.log('\n📊 FINAL SYSTEM STATUS REPORT');
  console.log('==============================');
  
  const allPassed = Object.values(results).every(r => r.status === 'PASS');
  const overallStatus = allPassed ? 'SYSTEM FULLY OPERATIONAL' : 'ISSUES DETECTED';
  
  console.log(`\n🏆 Overall Status: ${overallStatus}`);
  console.log('\nComponent Status:');
  console.log(`   Backend Server: ${results.backend.status}`);
  console.log(`   Database: ${results.database.status}`);
  console.log(`   Article APIs: ${results.articles.status}`);
  console.log(`   API Endpoints: ${results.apiEndpoints.status}`);

  if (allPassed) {
    console.log('\n🎉 CONGRATULATIONS!');
    console.log('SafraReport is fully operational and ready for production!');
    console.log('\nReady URLs:');
    console.log('   Backend API: http://localhost:4000');
    console.log('   Article Example: http://localhost:4000/api/articles/republica-dominicana-record-historico-turistas');
    console.log('   Health Check: http://localhost:4000/api/health');
  } else {
    console.log('\n⚠️  Some components need attention. Check the details above.');
  }

  return results;
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
        'User-Agent': 'SafraReport-SystemValidator/1.0'
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
          resolve({ 
            status: res.statusCode, 
            data: { 
              raw: data.substring(0, 100),
              parseError: true
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

completeSystemValidation();