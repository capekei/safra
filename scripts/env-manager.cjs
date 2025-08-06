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

  // Validate environment with Dominican Republic specific checks
  validate(environment = process.env.NODE_ENV || 'development') {
    require('dotenv').config();
    
    const requirements = {
      always: [
        'DATABASE_URL', 
        'JWT_SECRET', 
        'NODE_ENV', 
        'PORT'
      ],
      production: [
        'SESSION_SECRET', 
        'CORS_ORIGINS',
        'TRUST_PROXY',
        'SECURE_COOKIES'
      ],
      development: []
    };

    const required = [
      ...requirements.always,
      ...(requirements[environment] || [])
    ];

    const missing = required.filter(key => !process.env[key]);
    const warnings = [];

    // Security validations for production
    if (environment === 'production') {
      if (process.env.JWT_SECRET?.includes('GENERATE') || process.env.JWT_SECRET?.length < 64) {
        warnings.push('JWT_SECRET must be at least 64 characters and not contain placeholder text');
      }
      if (process.env.SECURE_COOKIES !== 'true') {
        warnings.push('SECURE_COOKIES should be true in production');
      }
      if (process.env.TRUST_PROXY !== 'true') {
        warnings.push('TRUST_PROXY should be true for Render deployment');
      }
      if (!process.env.DATABASE_URL?.includes('sslmode=require')) {
        warnings.push('DATABASE_URL should include sslmode=require for secure connection');
      }
      if (process.env.PORT !== '10000') {
        warnings.push('PORT should be 10000 for Render deployment');
      }
    }

    // Dominican Republic specific validations
    const drValidations = this.validateDominicanRepublicConfig();
    warnings.push(...drValidations);

    // Database URL validation
    const dbValidation = this.validateDatabaseUrl(process.env.DATABASE_URL);
    if (dbValidation.error) {
      warnings.push(`DATABASE_URL: ${dbValidation.error}`);
    }

    // Report results
    if (missing.length > 0) {
      console.error('❌ Missing required variables:');
      missing.forEach(key => console.error(`   - ${key}`));
      process.exit(1);
    }

    if (warnings.length > 0) {
      console.warn('⚠️  Configuration warnings:');
      warnings.forEach(w => console.warn(`   - ${w}`));
    }

    console.log('✅ Environment validated successfully');
    if (environment === 'production') {
      console.log('🇩🇴 Dominican Republic optimizations detected');
    }
  }

  // Dominican Republic specific configuration validation
  validateDominicanRepublicConfig() {
    const warnings = [];
    const drConfig = {
      timezone: process.env.VITE_DEFAULT_TIMEZONE || process.env.DEFAULT_TIMEZONE,
      currency: process.env.VITE_DEFAULT_CURRENCY || process.env.DEFAULT_CURRENCY,
      locale: process.env.VITE_DEFAULT_LOCALE || process.env.DEFAULT_LOCALE,
      country: process.env.DEFAULT_COUNTRY
    };

    // Check Dominican Republic specific settings
    if (drConfig.timezone && drConfig.timezone !== 'America/Santo_Domingo') {
      warnings.push('Consider using DEFAULT_TIMEZONE=America/Santo_Domingo for Dominican Republic');
    }
    
    if (drConfig.currency && drConfig.currency !== 'DOP') {
      warnings.push('Consider using DEFAULT_CURRENCY=DOP for Dominican Peso');
    }
    
    if (drConfig.locale && drConfig.locale !== 'es-DO') {
      warnings.push('Consider using DEFAULT_LOCALE=es-DO for Dominican Spanish');
    }

    if (drConfig.country && drConfig.country !== 'DO') {
      warnings.push('Consider using DEFAULT_COUNTRY=DO for Dominican Republic');
    }

    // Mobile optimization checks
    if (process.env.MOBILE_FIRST !== 'true') {
      warnings.push('Consider enabling MOBILE_FIRST=true for Dominican mobile users');
    }

    return warnings;
  }

  // Database URL validation
  validateDatabaseUrl(url) {
    if (!url) return { error: 'DATABASE_URL is required' };
    
    try {
      const dbUrl = new URL(url);
      
      if (!['postgresql:', 'postgres:'].includes(dbUrl.protocol)) {
        return { error: 'Must use PostgreSQL protocol (postgresql:// or postgres://)' };
      }

      if (!dbUrl.hostname || !dbUrl.port) {
        return { error: 'Must include hostname and port' };
      }

      if (!dbUrl.pathname || dbUrl.pathname === '/') {
        return { error: 'Must include database name' };
      }

      // Production specific checks
      if (process.env.NODE_ENV === 'production') {
        if (!url.includes('sslmode=require')) {
          return { error: 'Production databases must use SSL (add ?sslmode=require)' };
        }
      }

      return { valid: true };
    } catch (error) {
      return { error: 'Invalid DATABASE_URL format' };
    }
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