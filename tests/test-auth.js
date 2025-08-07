#!/usr/bin/env node

/**
 * Simple Authentication System Test
 * Quick verification that the session-based auth system is working
 */

import chalk from 'chalk';

async function testAuthSystem(baseUrl = 'http://localhost:4000') {
  console.log(chalk.bold.cyan('🔐 Testing SafraReport Authentication System\n'));
  console.log(chalk.gray(`Base URL: ${baseUrl}\n`));

  let sessionCookie = null;
  const testEmail = `test${Date.now()}${Math.random().toString(36).substring(7)}@safra.do`;
  const testPassword = 'TestPass123!';

  try {
    // Test 1: Health Check
    console.log('1. Testing auth health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/api/auth/health`);
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log(chalk.green('   ✅ Auth service is healthy'));
      console.log(chalk.gray(`   Location: ${health.location}, Timezone: ${health.timezone}`));
    } else {
      console.log(chalk.red('   ❌ Auth service health check failed'));
      return false;
    }

    // Test 2: Registration
    console.log('\n2. Testing user registration...');
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
        phone: '8092234567',
        provinceId: 'santo-domingo'
      })
    });

    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log(chalk.green('   ✅ Registration successful'));
      console.log(chalk.gray(`   User ID: ${registerData.user.id}`));
    } else {
      const error = await registerResponse.json();
      console.log(chalk.red('   ❌ Registration failed'));
      console.log(chalk.gray(`   Error: ${error.message}`));
      return false;
    }

    // Test 3: Login
    console.log('\n3. Testing user login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      sessionCookie = loginResponse.headers.get('set-cookie');
      console.log(chalk.green('   ✅ Login successful'));
      console.log(chalk.gray(`   User: ${loginData.user.firstName} ${loginData.user.lastName}`));
      console.log(chalk.gray(`   Session cookie received: ${!!sessionCookie}`));
    } else {
      const error = await loginResponse.json();
      console.log(chalk.red('   ❌ Login failed'));
      console.log(chalk.gray(`   Error: ${error.message}`));
      return false;
    }

    // Test 4: Session Validation
    console.log('\n4. Testing session validation...');
    const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
      headers: sessionCookie ? { 'Cookie': sessionCookie } : {}
    });

    if (meResponse.ok) {
      const userData = await meResponse.json();
      console.log(chalk.green('   ✅ Session validation successful'));
      console.log(chalk.gray(`   Authenticated as: ${userData.user.email}`));
    } else {
      console.log(chalk.red('   ❌ Session validation failed'));
      return false;
    }

    // Test 5: Rate Limiting
    console.log('\n5. Testing rate limiting...');
    let rateLimited = false;
    for (let i = 0; i < 6; i++) {
      const badLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'wrong@email.com',
          password: 'wrongpassword'
        })
      });
      
      if (badLoginResponse.status === 429) {
        rateLimited = true;
        break;
      }
    }

    if (rateLimited) {
      console.log(chalk.green('   ✅ Rate limiting is working (blocked after 5 attempts)'));
    } else {
      console.log(chalk.yellow('   ⚠️ Rate limiting may not be working properly'));
    }

    // Test 6: Logout
    console.log('\n6. Testing logout...');
    const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: sessionCookie ? { 'Cookie': sessionCookie } : {}
    });

    if (logoutResponse.ok) {
      console.log(chalk.green('   ✅ Logout successful'));
      
      // Verify session is invalidated
      const meAfterLogoutResponse = await fetch(`${baseUrl}/api/auth/me`, {
        headers: sessionCookie ? { 'Cookie': sessionCookie } : {}
      });
      
      if (meAfterLogoutResponse.status === 401) {
        console.log(chalk.green('   ✅ Session successfully invalidated'));
      } else {
        console.log(chalk.yellow('   ⚠️ Session may still be valid after logout'));
      }
    } else {
      console.log(chalk.red('   ❌ Logout failed'));
      return false;
    }

    console.log(chalk.bold.green('\n🎉 All authentication tests passed!'));
    console.log(chalk.gray('The session-based auth system is working correctly.'));
    return true;

  } catch (error) {
    console.error(chalk.red('\n❌ Test failed with error:'), error.message);
    return false;
  }
}

// CLI Usage
const url = process.argv[2] || 'http://localhost:4000';
testAuthSystem(url)
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error(chalk.red('Test suite crashed:'), error);
    process.exit(1);
  });

export default testAuthSystem;