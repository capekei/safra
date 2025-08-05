#!/usr/bin/env node

/**
 * SafraReport Package Consolidation Script
 * Merges client, server, shared package.json files into root package.json
 * Removes duplicates, resolves conflicts, and optimizes for single repo
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 SafraReport Package Consolidation');
console.log('====================================');

const projectRoot = process.cwd();

// Read all package.json files
const readPackageJson = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`⚠️  Could not read ${filePath}:`, error.message);
    return null;
  }
};

const rootPackage = readPackageJson(path.join(projectRoot, 'package.json'));
const clientPackage = readPackageJson(path.join(projectRoot, 'client/package.json'));
const serverPackage = readPackageJson(path.join(projectRoot, 'server/package.json'));
const sharedPackage = readPackageJson(path.join(projectRoot, 'shared/package.json'));

if (!rootPackage) {
  console.error('❌ Root package.json not found');
  process.exit(1);
}

// Merge dependencies function
const mergeDependencies = (target, source, type) => {
  if (!source || !source[type]) return;
  
  if (!target[type]) target[type] = {};
  
  Object.entries(source[type]).forEach(([name, version]) => {
    // Skip workspace dependencies
    if (version.startsWith('workspace:')) return;
    
    if (target[type][name] && target[type][name] !== version) {
      // Resolve version conflicts by choosing the higher version
      const targetVersion = target[type][name].replace(/[^0-9.]/g, '');
      const sourceVersion = version.replace(/[^0-9.]/g, '');
      
      if (compareVersions(sourceVersion, targetVersion) > 0) {
        console.log(`🔄 Updating ${name}: ${target[type][name]} → ${version}`);
        target[type][name] = version;
      } else {
        console.log(`📌 Keeping ${name}: ${target[type][name]} (higher than ${version})`);
      }
    } else {
      target[type][name] = version;
    }
  });
};

// Simple version comparison
const compareVersions = (a, b) => {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    
    if (aPart > bPart) return 1;
    if (aPart < bPart) return -1;
  }
  return 0;
};

// Merge scripts function
const mergeScripts = (target, packages) => {
  const consolidatedScripts = {
    // Development scripts
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd src/server && tsx watch index.ts",
    "dev:client": "cd src/client && vite --port 5173",
    
    // Build scripts
    "build": "./scripts/build-single-repo.sh",
    "build:client": "cd src/client && tsc && vite build",
    "build:server": "cd src/server && tsc && esbuild index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "build:shared": "cd src/shared && tsc",
    
    // Test scripts
    "test": "vitest",
    "test:client": "cd src/client && vitest",
    "test:server": "cd src/server && vitest",
    "test:e2e": "playwright test",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    
    // Type checking
    "type-check": "concurrently \"npm run type-check:client\" \"npm run type-check:server\" \"npm run type-check:shared\"",
    "type-check:client": "cd src/client && tsc --noEmit",
    "type-check:server": "cd src/server && tsc --noEmit", 
    "type-check:shared": "cd src/shared && tsc --noEmit",
    
    // Database scripts
    "db:push": "drizzle-kit push --config drizzle.config.ts",
    "db:seed": "tsx src/server/seeds/safe-seed.ts",
    "db:migrate": "tsx scripts/migrate-database.ts",
    
    // Production scripts
    "start": "NODE_ENV=production node dist/index.js",
    "preview": "cd src/client && vite preview",
    
    // Linting and formatting
    "lint": "eslint src --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "npm run lint -- --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    
    // Migration scripts
    "migrate:single-repo": "./scripts/migrate-to-single-repo.sh",
    "migrate:update-imports": "tsx scripts/update-imports.ts",
    "migrate:consolidate-packages": "node scripts/consolidate-packages.js"
  };
  
  // Keep original scripts that don't conflict
  Object.entries(target.scripts || {}).forEach(([name, script]) => {
    if (!consolidatedScripts[name] && !name.includes('turbo') && !name.includes('changeset')) {
      consolidatedScripts[name] = script;
    }
  });
  
  return consolidatedScripts;
};

console.log('📦 Merging dependencies from all packages...');

// Create consolidated package.json
const consolidatedPackage = {
  name: "@safrareport/app",
  version: "2.0.0",
  private: true,
  type: "module",
  license: "MIT",
  description: "SafraReport - Dominican Republic's premier news and marketplace platform",
  engines: {
    node: ">=20.0.0",
    npm: ">=10.0.0"
  },
  scripts: mergeScripts(rootPackage, [clientPackage, serverPackage, sharedPackage]),
  dependencies: {},
  devDependencies: {},
  optionalDependencies: {}
};

// Merge all dependencies
[clientPackage, serverPackage, sharedPackage, rootPackage].forEach(pkg => {
  if (pkg) {
    mergeDependencies(consolidatedPackage, pkg, 'dependencies');
    mergeDependencies(consolidatedPackage, pkg, 'devDependencies');
    mergeDependencies(consolidatedPackage, pkg, 'optionalDependencies');
  }
});

// Add concurrently for parallel script execution
if (!consolidatedPackage.devDependencies.concurrently) {
  consolidatedPackage.devDependencies.concurrently = "^9.1.0";
}

// Remove workspace references and duplicates in dependencies
delete consolidatedPackage.dependencies['@safra/shared'];
delete consolidatedPackage.dependencies['@safra/client'];
delete consolidatedPackage.dependencies['@safra/server'];

// Sort dependencies alphabetically
const sortObject = (obj) => {
  return Object.keys(obj).sort().reduce((result, key) => {
    result[key] = obj[key];
    return result;
  }, {});
};

consolidatedPackage.dependencies = sortObject(consolidatedPackage.dependencies);
consolidatedPackage.devDependencies = sortObject(consolidatedPackage.devDependencies);
if (Object.keys(consolidatedPackage.optionalDependencies).length > 0) {
  consolidatedPackage.optionalDependencies = sortObject(consolidatedPackage.optionalDependencies);
} else {
  delete consolidatedPackage.optionalDependencies;
}

// Add package manager specification (npm instead of pnpm)
consolidatedPackage.packageManager = "npm@10.11.0";

console.log('💾 Writing consolidated package.json...');

// Backup original package.json
const backupPath = path.join(projectRoot, `package.json.backup-${Date.now()}`);
fs.copyFileSync(path.join(projectRoot, 'package.json'), backupPath);
console.log(`📁 Backup created: ${backupPath}`);

// Write the new package.json
fs.writeFileSync(
  path.join(projectRoot, 'package.json'),
  JSON.stringify(consolidatedPackage, null, 2) + '\n'
);

console.log('✅ Package consolidation completed!');
console.log('');
console.log('📊 Summary:');
console.log(`   Dependencies: ${Object.keys(consolidatedPackage.dependencies).length}`);
console.log(`   Dev Dependencies: ${Object.keys(consolidatedPackage.devDependencies).length}`);
console.log(`   Scripts: ${Object.keys(consolidatedPackage.scripts).length}`);
console.log('');
console.log('🎯 Next steps:');
console.log('   1. Run: npm install');
console.log('   2. Update import paths: npm run migrate:update-imports');
console.log('   3. Update TypeScript configuration');
console.log('   4. Test the new configuration: npm run dev');