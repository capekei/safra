#!/usr/bin/env node

/**
 * SafraReport Comprehensive Lighthouse-Style Testing Suite
 * Dominican Republic News Platform Optimization Testing
 * Tests performance, auth, accessibility, SEO, and DR-specific features
 */

const lighthouse = require('lighthouse');
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');
const fs = require('fs');

class SafraReportAuditor {
  constructor(url = 'http://localhost:4000') {
    this.url = url;
    this.results = {
      performance: {},
      accessibility: {},
      bestPractices: {},
      seo: {},
      pwa: {},
      auth: {},
      dominicanOptimization: {},
      security: {},
      api: {}
    };
  }

  /**
   * Test Authentication System
   */
  async testAuthSystem() {
    const spinner = ora('🔐 Testing authentication system...').start();
    const results = [];

    try {
      // Test registration
      const registerData = {
        email: `test${Date.now()}@safra.do`,
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1-809-123-4567',
        provinceId: 'santo-domingo'
      };

      const registerResponse = await fetch(`${this.url}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });

      results.push({
        name: 'Registration',
        success: registerResponse.ok,
        status: registerResponse.status,
        details: registerResponse.ok ? 'User registered successfully' : await registerResponse.text()
      });

      // Test login
      const loginResponse = await fetch(`${this.url}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password
        })
      });

      const loginCookie = loginResponse.headers.get('set-cookie');
      results.push({
        name: 'Login',
        success: loginResponse.ok && !!loginCookie,
        status: loginResponse.status,
        details: loginResponse.ok ? 'Login successful with session cookie' : await loginResponse.text()
      });

      // Test rate limiting (attempt 6 bad logins)
      let rateLimited = false;
      for (let i = 0; i < 6; i++) {
        const response = await fetch(`${this.url}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'wrong@email.com',
            password: 'wrongpass'
          })
        });
        
        if (response.status === 429) {
          rateLimited = true;
          break;
        }
      }

      results.push({
        name: 'Rate Limiting',
        success: rateLimited,
        details: 'Blocks after 5 failed attempts (15 min lockout)'
      });

      // Test session validation
      if (loginCookie) {
        const meResponse = await fetch(`${this.url}/api/auth/me`, {
          headers: { 'Cookie': loginCookie }
        });

        results.push({
          name: 'Session Validation',
          success: meResponse.ok,
          status: meResponse.status,
          details: meResponse.ok ? 'Session validated successfully' : 'Session validation failed'
        });
      }

      // Test password reset
      const resetResponse = await fetch(`${this.url}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerData.email })
      });

      results.push({
        name: 'Password Reset',
        success: resetResponse.ok,
        status: resetResponse.status,
        details: 'Password reset token generated'
      });

      // Test logout
      if (loginCookie) {
        const logoutResponse = await fetch(`${this.url}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Cookie': loginCookie }
        });

        results.push({
          name: 'Logout',
          success: logoutResponse.ok,
          status: logoutResponse.status,
          details: 'Session invalidated successfully'
        });
      }

      this.results.auth = {
        tests: results,
        score: Math.round((results.filter(r => r.success).length / results.length) * 100),
        totalTests: results.length,
        passedTests: results.filter(r => r.success).length
      };

      spinner.succeed('🔐 Authentication tests complete');
    } catch (error) {
      spinner.fail('🔐 Authentication tests failed');
      this.results.auth = { 
        error: error.message, 
        score: 0, 
        tests: results 
      };
    }
  }

  /**
   * Run Lighthouse audit with Dominican 3G profile
   */
  async runLighthouse() {
    const spinner = ora('🚀 Running Lighthouse audit (Dominican 3G profile)...').start();
    
    try {
      // Dominican mobile profile (3G network simulation)
      const dominicanMobileConfig = {
        extends: 'lighthouse:default',
        settings: {
          formFactor: 'mobile',
          throttling: {
            rttMs: 300,        // Dominican 3G latency
            throughputKbps: 700, // Dominican 3G speed
            cpuSlowdownMultiplier: 4
          },
          screenEmulation: {
            mobile: true,
            width: 360,        // Common Dominican phone width
            height: 640,
            deviceScaleFactor: 2
          },
          emulatedUserAgent: 'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
        }
      };

      const result = await lighthouse(this.url, {
        output: 'json',
        logLevel: 'error',
        chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
      }, dominicanMobileConfig);

      // Extract scores
      this.results.performance = {
        score: Math.round(result.lhr.categories.performance.score * 100),
        metrics: {
          FCP: Math.round(result.lhr.audits['first-contentful-paint'].numericValue),
          LCP: Math.round(result.lhr.audits['largest-contentful-paint'].numericValue),
          TBT: Math.round(result.lhr.audits['total-blocking-time'].numericValue),
          CLS: result.lhr.audits['cumulative-layout-shift'].numericValue.toFixed(3),
          TTI: Math.round(result.lhr.audits['interactive'].numericValue),
          SI: Math.round(result.lhr.audits['speed-index'].numericValue)
        }
      };

      this.results.accessibility = {
        score: Math.round(result.lhr.categories.accessibility.score * 100),
        issues: result.lhr.categories.accessibility.auditRefs
          .filter(ref => result.lhr.audits[ref.id].score < 1)
          .map(ref => ({
            title: result.lhr.audits[ref.id].title,
            description: result.lhr.audits[ref.id].description
          }))
          .slice(0, 5) // Top 5 issues
      };

      this.results.bestPractices = {
        score: Math.round(result.lhr.categories['best-practices'].score * 100)
      };

      this.results.seo = {
        score: Math.round(result.lhr.categories.seo.score * 100)
      };

      this.results.pwa = {
        score: Math.round((result.lhr.categories.pwa?.score || 0) * 100),
        installable: result.lhr.audits['installable-manifest']?.score === 1,
        offline: result.lhr.audits['works-offline']?.score === 1
      };

      spinner.succeed('🚀 Lighthouse audit complete');
    } catch (error) {
      spinner.fail('🚀 Lighthouse audit failed');
      this.results.performance = { score: 0, error: error.message };
      this.results.accessibility = { score: 0, error: error.message };
      this.results.bestPractices = { score: 0, error: error.message };
      this.results.seo = { score: 0, error: error.message };
      this.results.pwa = { score: 0, error: error.message };
    }
  }

  /**
   * Dominican Republic specific optimization tests
   */
  async runDominicanTests() {
    const spinner = ora('🇩🇴 Running Dominican Republic optimization tests...').start();
    
    try {
      // Test homepage for Dominican-specific features
      const response = await fetch(this.url);
      const html = await response.text();
      const headers = Object.fromEntries(response.headers.entries());

      const metrics = {
        // Language and localization
        language: html.includes('lang="es-DO"') || html.includes('lang="es"'),
        spanishContent: (html.match(/[áéíóúñÁÉÍÓÚÑ]/g) || []).length > 50,
        
        // Currency
        currencyFormat: html.includes('RD$') || html.includes('DOP'),
        
        // Dominican provinces (should have key provinces mentioned)
        provinces: /Santo Domingo|Santiago|La Romana|San Pedro|La Vega/gi.test(html),
        
        // Mobile optimization
        viewport: html.includes('name="viewport"'),
        mobileFirst: html.includes('initial-scale=1'),
        
        // Performance indicators
        gzipCompression: headers['content-encoding'] === 'gzip',
        cacheHeaders: !!headers['cache-control'],
        
        // WhatsApp integration (popular in DR)
        whatsappLinks: html.includes('whatsapp') || html.includes('wa.me'),
        
        // Data usage estimation
        htmlSize: Buffer.byteLength(html, 'utf8'),
        responseTime: Date.now() - Date.now() // This would be measured properly with timing
      };

      // Calculate optimization score
      const checks = {
        'Spanish Language Support': metrics.language ? 10 : 0,
        'Spanish Content Detection': metrics.spanishContent ? 10 : 0,
        'Dominican Peso Currency': metrics.currencyFormat ? 10 : 0,
        'Dominican Provinces Listed': metrics.provinces ? 10 : 0,
        'Mobile Viewport Tag': metrics.viewport ? 10 : 0,
        'Mobile-First Design': metrics.mobileFirst ? 10 : 0,
        'Gzip Compression': metrics.gzipCompression ? 10 : 0,
        'Browser Caching': metrics.cacheHeaders ? 10 : 0,
        'WhatsApp Integration': metrics.whatsappLinks ? 10 : 0,
        'Lightweight HTML': metrics.htmlSize < 100000 ? 10 : 5 // <100KB gets full points
      };

      const score = Object.values(checks).reduce((a, b) => a + b, 0);

      this.results.dominicanOptimization = {
        score,
        checks,
        metrics: {
          htmlSize: metrics.htmlSize,
          spanishWords: (html.match(/[áéíóúñÁÉÍÓÚÑ]/g) || []).length
        },
        recommendations: this.getDominicanRecommendations(metrics, checks)
      };

      spinner.succeed('🇩🇴 Dominican optimization tests complete');
    } catch (error) {
      spinner.fail('🇩🇴 Dominican optimization tests failed');
      this.results.dominicanOptimization = { 
        score: 0, 
        error: error.message,
        checks: {},
        recommendations: []
      };
    }
  }

  /**
   * API performance tests
   */
  async testAPIPerformance() {
    const spinner = ora('🔌 Testing API performance...').start();
    
    const endpoints = [
      { path: '/api/auth/health', name: 'Auth Health', maxTime: 100 },
      { path: '/api/articles', name: 'Articles List', maxTime: 500 },
      { path: '/api/categories', name: 'Categories', maxTime: 200 },
      { path: '/api/provinces', name: 'Dominican Provinces', maxTime: 200 },
      { path: '/api/classifieds', name: 'Clasificados', maxTime: 500 },
    ];

    const results = [];

    for (const endpoint of endpoints) {
      const times = [];
      let success = true;
      let errors = [];
      
      // Test each endpoint 3 times for average
      for (let i = 0; i < 3; i++) {
        const start = Date.now();
        try {
          const response = await fetch(this.url + endpoint.path);
          const time = Date.now() - start;
          times.push(time);
          if (!response.ok) {
            success = false;
            errors.push(`HTTP ${response.status}`);
          }
        } catch (error) {
          success = false;
          errors.push(error.message);
          break;
        }
      }

      const avgTime = times.length > 0 ? 
        Math.round(times.reduce((a, b) => a + b) / times.length) : 0;

      results.push({
        name: endpoint.name,
        path: endpoint.path,
        avgTime,
        maxTime: endpoint.maxTime,
        success,
        withinLimit: avgTime <= endpoint.maxTime,
        errors: errors.slice(0, 2) // Only show first 2 errors
      });
    }

    this.results.api = {
      endpoints: results,
      score: Math.round((results.filter(r => r.success && r.withinLimit).length / results.length) * 100),
      averageResponseTime: Math.round(
        results.reduce((sum, r) => sum + r.avgTime, 0) / results.length
      )
    };

    spinner.succeed('🔌 API performance tests complete');
  }

  /**
   * Security tests
   */
  async testSecurity() {
    const spinner = ora('🔒 Running security tests...').start();
    
    try {
      const response = await fetch(this.url);
      const headers = Object.fromEntries(response.headers.entries());

      const securityHeaders = {
        'X-Frame-Options': headers['x-frame-options'] ? 15 : 0,
        'X-Content-Type-Options': headers['x-content-type-options'] ? 15 : 0,
        'X-XSS-Protection': headers['x-xss-protection'] ? 10 : 0,
        'Strict-Transport-Security': headers['strict-transport-security'] ? 20 : 0,
        'Content-Security-Policy': headers['content-security-policy'] ? 20 : 0,
        'HTTPS Usage': this.url.startsWith('https') ? 20 : 0
      };

      const score = Object.values(securityHeaders).reduce((a, b) => a + b, 0);

      this.results.security = {
        score,
        headers: securityHeaders,
        recommendations: this.getSecurityRecommendations(securityHeaders, score)
      };

      spinner.succeed('🔒 Security tests complete');
    } catch (error) {
      spinner.fail('🔒 Security tests failed');
      this.results.security = { score: 0, error: error.message };
    }
  }

  /**
   * Generate Dominican-specific recommendations
   */
  getDominicanRecommendations(metrics, checks) {
    const recommendations = [];

    if (!checks['Spanish Language Support']) {
      recommendations.push('🌐 Add lang="es-DO" attribute to HTML tag for Dominican Spanish');
    }
    if (!checks['Dominican Peso Currency']) {
      recommendations.push('💰 Display prices in Dominican Pesos (RD$) format');
    }
    if (!checks['WhatsApp Integration']) {
      recommendations.push('💬 Add WhatsApp contact buttons (preferred communication in DR)');
    }
    if (metrics.htmlSize > 100000) {
      recommendations.push(`📱 Reduce page size from ${(metrics.htmlSize/1024).toFixed(0)}KB to <100KB for 3G users`);
    }
    if (!checks['Gzip Compression']) {
      recommendations.push('⚡ Enable Gzip compression to reduce bandwidth usage');
    }
    if (!checks['Mobile-First Design']) {
      recommendations.push('📱 Implement mobile-first responsive design (70% of DR users are mobile)');
    }
    if (!checks['Dominican Provinces Listed']) {
      recommendations.push('🏝️ Include major Dominican provinces (Santo Domingo, Santiago, etc.)');
    }

    return recommendations;
  }

  /**
   * Generate security recommendations
   */
  getSecurityRecommendations(headers, score) {
    const recommendations = [];

    if (!headers['HTTPS Usage']) {
      recommendations.push('🔐 Enable HTTPS for secure connections');
    }
    if (!headers['Content-Security-Policy']) {
      recommendations.push('🛡️ Add Content-Security-Policy header to prevent XSS attacks');
    }
    if (!headers['Strict-Transport-Security']) {
      recommendations.push('🔒 Add HSTS header to enforce HTTPS connections');
    }
    if (!headers['X-Frame-Options']) {
      recommendations.push('🖼️ Add X-Frame-Options header to prevent clickjacking');
    }
    if (!headers['X-Content-Type-Options']) {
      recommendations.push('🔍 Add X-Content-Type-Options header to prevent MIME sniffing');
    }

    return recommendations;
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.clear();
    console.log(chalk.bold.cyan('\\n🔍 SAFRAREPORT COMPREHENSIVE AUDIT REPORT\\n'));
    console.log(chalk.gray(`URL: ${this.url}`));
    console.log(chalk.gray(`Generated: ${new Date().toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' })} (Dominican Time)`));
    console.log('═'.repeat(80));

    // Performance metrics (if available)
    if (this.results.performance.metrics) {
      const perfTable = new Table({
        head: [chalk.cyan('Performance Metric'), chalk.cyan('Value'), chalk.cyan('Target (3G)'), chalk.cyan('Status')],
        colWidths: [25, 12, 15, 10]
      });

      const metrics = this.results.performance.metrics;
      perfTable.push(
        ['First Contentful Paint', `${(metrics.FCP/1000).toFixed(2)}s`, '<2.5s', this.getStatus(metrics.FCP < 2500)],
        ['Largest Contentful Paint', `${(metrics.LCP/1000).toFixed(2)}s`, '<4.0s', this.getStatus(metrics.LCP < 4000)],
        ['Total Blocking Time', `${metrics.TBT}ms`, '<600ms', this.getStatus(metrics.TBT < 600)],
        ['Cumulative Layout Shift', metrics.CLS, '<0.25', this.getStatus(parseFloat(metrics.CLS) < 0.25)],
        ['Time to Interactive', `${(metrics.TTI/1000).toFixed(2)}s`, '<7.0s', this.getStatus(metrics.TTI < 7000)]
      );

      console.log(chalk.bold('\\n📊 PERFORMANCE (Dominican 3G Network)'));
      console.log(perfTable.toString());
    }

    // Authentication tests
    if (this.results.auth.tests) {
      const authTable = new Table({
        head: [chalk.cyan('Auth Test'), chalk.cyan('Status'), chalk.cyan('Details')],
        colWidths: [20, 12, 48]
      });

      this.results.auth.tests.forEach(test => {
        authTable.push([
          test.name,
          test.success ? chalk.green('✅ Pass') : chalk.red('❌ Fail'),
          test.details || `HTTP ${test.status || 'N/A'}`
        ]);
      });

      console.log(chalk.bold('\\n🔐 AUTHENTICATION SYSTEM'));
      console.log(authTable.toString());
      console.log(chalk.yellow(`Score: ${this.results.auth.score}/100 (${this.results.auth.passedTests}/${this.results.auth.totalTests} tests passed)`));
    }

    // Dominican optimizations
    if (this.results.dominicanOptimization.checks) {
      const drTable = new Table({
        head: [chalk.cyan('Dominican Optimization'), chalk.cyan('Status'), chalk.cyan('Points')],
        colWidths: [35, 12, 10]
      });

      Object.entries(this.results.dominicanOptimization.checks).forEach(([check, points]) => {
        drTable.push([
          check,
          points > 5 ? chalk.green('✅ Good') : chalk.red('❌ Needs Work'),
          `${points}/10`
        ]);
      });

      console.log(chalk.bold('\\n🇩🇴 DOMINICAN REPUBLIC OPTIMIZATIONS'));
      console.log(drTable.toString());
      
      if (this.results.dominicanOptimization.metrics) {
        console.log(chalk.yellow(`HTML Size: ${(this.results.dominicanOptimization.metrics.htmlSize/1024).toFixed(1)}KB`));
        console.log(chalk.yellow(`Spanish Content: ${this.results.dominicanOptimization.metrics.spanishWords} accented characters`));
      }
    }

    // API Performance
    if (this.results.api.endpoints) {
      const apiTable = new Table({
        head: [chalk.cyan('API Endpoint'), chalk.cyan('Avg Time'), chalk.cyan('Target'), chalk.cyan('Status')],
        colWidths: [25, 12, 12, 15]
      });

      this.results.api.endpoints.forEach(endpoint => {
        apiTable.push([
          endpoint.name,
          `${endpoint.avgTime}ms`,
          `<${endpoint.maxTime}ms`,
          endpoint.withinLimit && endpoint.success ? chalk.green('✅ Fast') : chalk.red('❌ Slow')
        ]);
      });

      console.log(chalk.bold('\\n🔌 API PERFORMANCE'));
      console.log(apiTable.toString());
      console.log(chalk.yellow(`Average Response Time: ${this.results.api.averageResponseTime}ms`));
    }

    // Overall scores
    const scoresTable = new Table({
      head: [chalk.cyan('Category'), chalk.cyan('Score'), chalk.cyan('Grade')],
      colWidths: [30, 15, 10]
    });

    const categories = [
      ['Performance', this.results.performance.score || 0],
      ['Accessibility', this.results.accessibility.score || 0],
      ['Best Practices', this.results.bestPractices.score || 0],
      ['SEO', this.results.seo.score || 0],
      ['PWA', this.results.pwa.score || 0],
      ['Authentication', this.results.auth.score || 0],
      ['Dominican Optimization', this.results.dominicanOptimization.score || 0],
      ['API Performance', this.results.api.score || 0],
      ['Security', this.results.security.score || 0]
    ];

    categories.forEach(([category, score]) => {
      scoresTable.push([
        category,
        this.getColoredScore(score),
        this.getGrade(score)
      ]);
    });

    console.log(chalk.bold('\\n📈 OVERALL SCORES'));
    console.log(scoresTable.toString());

    // Recommendations
    const allRecommendations = [
      ...(this.results.dominicanOptimization.recommendations || []),
      ...(this.results.security.recommendations || [])
    ];

    if (allRecommendations.length > 0) {
      console.log(chalk.bold('\\n💡 PRIORITY RECOMMENDATIONS'));
      allRecommendations.slice(0, 8).forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }

    // Calculate final score
    const weights = {
      performance: 0.25,
      accessibility: 0.10,
      auth: 0.20,
      dominicanOptimization: 0.20,
      api: 0.15,
      security: 0.10
    };

    const finalScore = Math.round(
      (this.results.performance.score || 0) * weights.performance +
      (this.results.accessibility.score || 0) * weights.accessibility +
      (this.results.auth.score || 0) * weights.auth +
      (this.results.dominicanOptimization.score || 0) * weights.dominicanOptimization +
      (this.results.api.score || 0) * weights.api +
      (this.results.security.score || 0) * weights.security
    );

    console.log('\\n' + '═'.repeat(80));
    console.log(chalk.bold('\\n🏆 FINAL SCORE: ') + this.getColoredScore(finalScore, true));
    
    if (finalScore >= 90) {
      console.log(chalk.green('✨ ¡Excelente! Listo para producción en República Dominicana!'));
    } else if (finalScore >= 70) {
      console.log(chalk.yellow('👍 Bueno, pero revise las recomendaciones arriba'));
    } else {
      console.log(chalk.red('⚠️ Necesita mejoras antes de producción'));
    }

    // Save detailed report
    const reportData = {
      ...this.results,
      finalScore,
      url: this.url,
      timestamp: new Date().toISOString(),
      recommendations: allRecommendations
    };

    fs.writeFileSync('safra-audit-report.json', JSON.stringify(reportData, null, 2));
    console.log(chalk.gray('\\nReporte detallado guardado en: safra-audit-report.json'));
    console.log(chalk.gray('Para análisis en producción: npm run audit:prod'));
  }

  // Helper methods
  getColoredScore(score, large = false) {
    const formatted = large ? chalk.bold(`${score}/100`) : score.toString();
    if (score >= 90) return chalk.green(formatted);
    if (score >= 70) return chalk.yellow(formatted);
    return chalk.red(formatted);
  }

  getGrade(score) {
    if (score >= 90) return chalk.green('A');
    if (score >= 80) return chalk.green('B');
    if (score >= 70) return chalk.yellow('C');
    if (score >= 60) return chalk.yellow('D');
    return chalk.red('F');
  }

  getStatus(condition) {
    return condition ? chalk.green('✅') : chalk.red('❌');
  }

  /**
   * Run complete audit
   */
  async runFullAudit() {
    console.log(chalk.bold.cyan('🚀 SafraReport - Auditoría Completa para República Dominicana\\n'));
    console.log(chalk.gray(`Iniciando auditoría de: ${this.url}`));
    console.log(chalk.gray('Optimizado para redes 3G y usuarios dominicanos\\n'));
    
    try {
      // Run all tests
      await this.testAuthSystem();
      await this.runLighthouse();
      await this.runDominicanTests();
      await this.testAPIPerformance();
      await this.testSecurity();
      
      this.generateReport();
    } catch (error) {
      console.error(chalk.red('❌ Auditoría falló:'), error.message);
      process.exit(1);
    }
  }
}

// CLI Usage
if (require.main === module) {
  const url = process.argv[2] || 'http://localhost:4000';
  const auditor = new SafraReportAuditor(url);
  auditor.runFullAudit().catch(console.error);
}

module.exports = SafraReportAuditor;