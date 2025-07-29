#!/usr/bin/env node

/**
 * Production Readiness Checker for SafraReport
 * Validates that the application is ready for production deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

class ProductionChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  error(message) {
    this.errors.push(`❌ ${message}`);
  }

  warn(message) {
    this.warnings.push(`⚠️  ${message}`);
  }

  pass(message) {
    this.passed.push(`✅ ${message}`);
  }

  checkEnvironmentVariables() {
    console.log('🔍 Checking environment variables...');
    
    const requiredVars = [
      'NODE_ENV',
      'DATABASE_URL', 
      'SESSION_SECRET',
      'AUTH0_DOMAIN',
      'AUTH0_CLIENT_ID',
      'AUTH0_CLIENT_SECRET'
    ];

    // Check .env.production exists
    const prodEnvPath = path.join(projectRoot, '.env.production');
    if (!fs.existsSync(prodEnvPath)) {
      this.error('.env.production file is missing');
    } else {
      this.pass('.env.production file exists');
    }

    // Check if development secrets are being used
    const envPath = path.join(projectRoot, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('development')) {
        this.warn('Development environment detected in .env file');
      }
      if (envContent.includes('your_') || envContent.includes('development_')) {
        this.error('Placeholder values found in environment variables');
      }
    }

    this.pass('Environment variables check completed');
  }

  checkBuildOutput() {
    console.log('🏗️  Checking build output...');
    
    const distPath = path.join(projectRoot, 'dist');
    const serverBuild = path.join(distPath, 'index.js');
    const clientBuild = path.join(distPath, 'public');
    
    if (!fs.existsSync(distPath)) {
      this.error('dist/ directory not found - run npm run build first');
      return;
    }
    
    if (!fs.existsSync(serverBuild)) {
      this.error('Server build (dist/index.js) not found');
    } else {
      this.pass('Server build exists');
    }
    
    if (!fs.existsSync(clientBuild)) {
      this.error('Client build (dist/public/) not found');
    } else {
      this.pass('Client build exists');
      
      // Check for critical client files
      const indexHtml = path.join(clientBuild, 'index.html');
      if (fs.existsSync(indexHtml)) {
        const htmlContent = fs.readFileSync(indexHtml, 'utf8');
        if (htmlContent.includes('replit-dev-banner')) {
          this.warn('Development banner still present in production HTML');
        } else {
          this.pass('Development banner properly removed from production build');
        }
      }
    }
  }

  checkSecurity() {
    console.log('🔒 Checking security configuration...');
    
    // Check if .env is in .gitignore
    const gitignorePath = path.join(projectRoot, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      if (gitignoreContent.includes('.env')) {
        this.pass('.env files are properly gitignored');
      } else {
        this.error('.env files are not in .gitignore - security risk!');
      }
    }

    // Check package.json for audit issues
    try {
      const { execSync } = require('child_process');
      const auditResult = execSync('npm audit --audit-level moderate', { 
        cwd: projectRoot, 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      this.pass('No moderate or high security vulnerabilities found');
    } catch (error) {
      this.warn('Security vulnerabilities detected - run npm audit fix');
    }
  }

  checkDependencies() {
    console.log('📦 Checking dependencies...');
    
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check for development dependencies in production
    const prodDeps = Object.keys(packageJson.dependencies || {});
    const devDeps = Object.keys(packageJson.devDependencies || {});
    
    const devInProd = prodDeps.filter(dep => 
      dep.includes('dev') || 
      dep.includes('test') || 
      dep.includes('@types') ||
      dep === 'vite' // Vite should typically be in devDependencies
    );
    
    if (devInProd.length > 0) {
      this.warn(`Development packages in production dependencies: ${devInProd.join(', ')}`);
    }
    
    this.pass('Dependencies structure check completed');
  }

  checkConfiguration() {
    console.log('⚙️  Checking configuration files...');
    
    // Check vite.config.ts for production settings
    const viteConfigPath = path.join(projectRoot, 'vite.config.ts');
    if (fs.existsSync(viteConfigPath)) {
      const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
      if (viteConfig.includes('drop_console: true')) {
        this.pass('Console statements will be removed in production build');
      } else {
        this.warn('Console statements not configured to be removed in production');
      }
    }
    
    this.pass('Configuration check completed');
  }

  async run() {
    console.log('🚀 SafraReport Production Readiness Check');
    console.log('==========================================\\n');
    
    this.checkEnvironmentVariables();
    this.checkBuildOutput();
    this.checkSecurity();
    this.checkDependencies();
    this.checkConfiguration();
    
    console.log('\\n📊 Results Summary');
    console.log('==================');
    
    if (this.passed.length > 0) {
      console.log('\\n✅ Passed Checks:');
      this.passed.forEach(msg => console.log(`  ${msg}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\\n⚠️  Warnings:');
      this.warnings.forEach(msg => console.log(`  ${msg}`));
    }
    
    if (this.errors.length > 0) {
      console.log('\\n❌ Critical Issues:');
      this.errors.forEach(msg => console.log(`  ${msg}`));
      console.log('\\n🚨 DEPLOYMENT BLOCKED - Fix critical issues before deploying to production');
      process.exit(1);
    } else {
      console.log('\\n🎉 Production Readiness: PASSED');
      if (this.warnings.length > 0) {
        console.log('💡 Consider addressing warnings for optimal production setup');
      }
    }
  }
}

const checker = new ProductionChecker();
checker.run().catch(error => {
  console.error('❌ Production readiness check failed:', error);
  process.exit(1);
});