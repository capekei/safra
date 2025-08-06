#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class EnvManager {
  constructor() {
    this.envPath = path.join(process.cwd(), '.env');
    this.examplePath = path.join(process.cwd(), '.env.example');
  }

  // Generate secure secrets
  generateSecret(length = 64) {
    return crypto.randomBytes(length).toString('base64');
  }

  // Initialize environment
  init() {
    if (fs.existsSync(this.envPath)) {
      console.log('⚠️  .env already exists');
      return;
    }

    let content = fs.readFileSync(this.examplePath, 'utf8');
    
    // Auto-generate all secrets
    const secretsToGenerate = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'SESSION_SECRET',
      'AUTH0_CLIENT_SECRET',
      'AUTH0_SECRET'
    ];

    secretsToGenerate.forEach(key => {
      const placeholder = `GENERATE_BASE64_SECRET_MIN_64_CHARS`;
      const regex = new RegExp(`${key}="${placeholder}"`, 'g');
      content = content.replace(regex, `${key}="${this.generateSecret()}"`);
    });

    fs.writeFileSync(this.envPath, content);
    console.log('✅ Created .env with generated secrets');
  }

  // Validate environment
  validate(environment = process.env.NODE_ENV || 'development') {
    require('dotenv').config();
    
    const requirements = {
      always: ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV'],
      production: ['SESSION_SECRET', 'CORS_ORIGINS'],
      development: []
    };

    const required = [
      ...requirements.always,
      ...(requirements[environment] || [])
    ];

    const missing = required.filter(key => !process.env[key]);
    const warnings = [];

    // Check for insecure values
    if (environment === 'production') {
      if (process.env.JWT_SECRET?.includes('change-this')) {
        warnings.push('JWT_SECRET contains insecure placeholder');
      }
      if (process.env.SECURE_COOKIES !== 'true') {
        warnings.push('SECURE_COOKIES should be true in production');
      }
      if (!process.env.DATABASE_URL?.includes('sslmode=require')) {
        warnings.push('DATABASE_URL should include sslmode=require');
      }
    }

    if (missing.length > 0) {
      console.error('❌ Missing required variables:');
      missing.forEach(key => console.error(`   - ${key}`));
      process.exit(1);
    }

    if (warnings.length > 0) {
      console.warn('⚠️  Warnings:');
      warnings.forEach(w => console.warn(`   - ${w}`));
    }

    console.log('✅ Environment validated successfully');
  }

  // Export for deployment
  export(target = 'render') {
    require('dotenv').config();
    
    const exports = [];
    const skipKeys = ['PATH', 'HOME', 'USER', 'SHELL'];
    
    Object.entries(process.env).forEach(([key, value]) => {
      if (!skipKeys.includes(key) && !key.startsWith('npm_')) {
        if (target === 'render') {
          exports.push(`${key}=${value}`);
        } else if (target === 'docker') {
          exports.push(`-e ${key}="${value}"`);
        }
      }
    });

    const output = exports.join('\n');
    const filename = `.env.${target}.export`;
    fs.writeFileSync(filename, output);
    console.log(`✅ Exported to ${filename}`);
  }
}

// CLI commands
const manager = new EnvManager();
const command = process.argv[2];

switch (command) {
  case 'init':
    manager.init();
    break;
  case 'validate':
    manager.validate(process.argv[3]);
    break;
  case 'generate-secrets':
    console.log('JWT_SECRET=' + manager.generateSecret());
    console.log('SESSION_SECRET=' + manager.generateSecret());
    console.log('JWT_REFRESH_SECRET=' + manager.generateSecret());
    break;
  case 'export':
    manager.export(process.argv[3] || 'render');
    break;
  default:
    console.log(`
📦 SafraReport Environment Manager

Commands:
  npm run env:init              - Create .env from template
  npm run env:validate          - Validate current environment
  npm run env:generate-secrets  - Generate secure secrets
  npm run env:export [target]   - Export for deployment
    `);
}