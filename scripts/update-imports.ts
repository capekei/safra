#!/usr/bin/env tsx

/**
 * SafraReport Import Path Updater
 * AST-based script to update all @safra/* imports to relative paths
 * Handles TypeScript, JavaScript, and JSX files
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Simple AST-like pattern matching for imports
interface ImportUpdate {
  oldImport: string;
  newImport: string;
  pattern: RegExp;
}

const projectRoot = process.cwd();

console.log('🔄 SafraReport Import Path Updater');
console.log('==================================');

// Define import mappings based on new structure
const createImportMappings = (currentFilePath: string): ImportUpdate[] => {
  const relativePath = path.relative(projectRoot, currentFilePath);
  const isInClient = relativePath.startsWith('src/client/');
  const isInServer = relativePath.startsWith('src/server/');
  const isInShared = relativePath.startsWith('src/shared/');
  
  let sharedPath = '';
  let clientPath = '';
  let serverPath = '';
  
  if (isInClient) {
    sharedPath = '../shared';
    serverPath = '../server';
  } else if (isInServer) {
    sharedPath = '../shared';
    clientPath = '../client';
  } else if (isInShared) {
    clientPath = '../client';
    serverPath = '../server';
  } else {
    // Root level files
    sharedPath = './src/shared';
    clientPath = './src/client';
    serverPath = './src/server';
  }

  return [
    {
      oldImport: '@safra/shared',
      newImport: sharedPath,
      pattern: /from\s+['"]@safra\/shared['"]/g
    },
    {
      oldImport: '@safra/client',
      newImport: clientPath,
      pattern: /from\s+['"]@safra\/client['"]/g
    },
    {
      oldImport: '@safra/server', 
      newImport: serverPath,
      pattern: /from\s+['"]@safra\/server['"]/g
    },
    // Handle import statements
    {
      oldImport: 'import.*@safra/shared',
      newImport: sharedPath,
      pattern: /import\s+([^}]+from\s+)?['"]@safra\/shared['"]/g
    },
    {
      oldImport: 'import.*@safra/client',
      newImport: clientPath,
      pattern: /import\s+([^}]+from\s+)?['"]@safra\/client['"]/g
    },
    {
      oldImport: 'import.*@safra/server',
      newImport: serverPath,
      pattern: /import\s+([^}]+from\s+)?['"]@safra\/server['"]/g
    },
    // Handle dynamic imports
    {
      oldImport: 'import(@safra/shared)',
      newImport: sharedPath,
      pattern: /import\s*\(\s*['"]@safra\/shared['"]\s*\)/g
    },
    {
      oldImport: 'import(@safra/client)',
      newImport: clientPath,
      pattern: /import\s*\(\s*['"]@safra\/client['"]\s*\)/g
    },
    {
      oldImport: 'import(@safra/server)',
      newImport: serverPath,
      pattern: /import\s*\(\s*['"]@safra\/server['"]\s*\)/g
    }
  ];
};

// Find all TypeScript/JavaScript files
async function findTSFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
          files.push(...await findTSFiles(fullPath));
        }
      } else if (entry.isFile()) {
        // Include TypeScript, JavaScript, and JSX files
        if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  Could not read directory ${dir}:`, error.message);
  }
  
  return files;
}

// Update imports in a single file
async function updateImportsInFile(filePath: string): Promise<{ updated: boolean; changes: number }> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;
    let changeCount = 0;
    
    const mappings = createImportMappings(filePath);
    
    for (const mapping of mappings) {
      const matches = content.match(mapping.pattern);
      if (matches) {
        // Update import statements
        updatedContent = updatedContent.replace(mapping.pattern, (match) => {
          changeCount++;
          if (match.includes('from')) {
            return match.replace(/@safra\/(shared|client|server)/, mapping.newImport);
          } else if (match.includes('import(')) {
            return `import('${mapping.newImport}')`;
          } else {
            return match.replace(/@safra\/(shared|client|server)/, mapping.newImport);
          }
        });
      }
    }
    
    if (updatedContent !== content) {
      await fs.writeFile(filePath, updatedContent, 'utf8');
      return { updated: true, changes: changeCount };
    }
    
    return { updated: false, changes: 0 };
  } catch (error) {
    console.error(`❌ Error updating file ${filePath}:`, error.message);
    return { updated: false, changes: 0 };
  }
}

// Validate that all imports can be resolved
async function validateImports(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Look for any remaining @safra/ imports
    const remainingImports = content.match(/@safra\/(shared|client|server)/g);
    if (remainingImports) {
      console.warn(`⚠️  File ${filePath} still has @safra imports:`, remainingImports);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error validating file ${filePath}:`, error.message);
    return false;
  }
}

// Main execution function
async function main() {
  console.log('🔍 Finding TypeScript/JavaScript files...');
  
  const allFiles = await findTSFiles(projectRoot);
  const relevantFiles = allFiles.filter(file => 
    // Only process files that might have @safra imports
    !file.includes('node_modules') &&
    !file.includes('.git') &&
    !file.includes('dist') &&
    !file.includes('build')
  );
  
  console.log(`📁 Found ${relevantFiles.length} files to process`);
  
  let totalUpdated = 0;
  let totalChanges = 0;
  const errors: string[] = [];
  
  console.log('🔄 Updating import paths...');
  
  for (const file of relevantFiles) {
    const relativePath = path.relative(projectRoot, file);
    const result = await updateImportsInFile(file);
    
    if (result.updated) {
      totalUpdated++;
      totalChanges += result.changes;
      console.log(`✅ ${relativePath} - ${result.changes} imports updated`);
    }
  }
  
  console.log('');
  console.log('🔍 Validating updated imports...');
  
  let validationErrors = 0;
  for (const file of relevantFiles) {
    const isValid = await validateImports(file);
    if (!isValid) {
      validationErrors++;
      errors.push(path.relative(projectRoot, file));
    }
  }
  
  console.log('');
  console.log('📊 Import Update Summary:');
  console.log('========================');
  console.log(`Files processed: ${relevantFiles.length}`);
  console.log(`Files updated: ${totalUpdated}`);
  console.log(`Total import changes: ${totalChanges}`);
  console.log(`Validation errors: ${validationErrors}`);
  
  if (errors.length > 0) {
    console.log('');
    console.log('⚠️  Files with remaining @safra imports:');
    errors.forEach(file => console.log(`   - ${file}`));
    console.log('');
    console.log('Please manually review these files.');
  }
  
  if (validationErrors === 0) {
    console.log('');
    console.log('✅ All imports successfully updated!');
    console.log('🎯 Next steps:');
    console.log('   1. Update TypeScript path mappings');
    console.log('   2. Test the application: npm run dev');
    console.log('   3. Run type checking: npm run type-check');
  } else {
    console.log('');
    console.log('❌ Some imports need manual attention before proceeding.');
    process.exit(1);
  }
}

// Execute the script
main().catch(error => {
  console.error('💥 Fatal error:', error.message);
  process.exit(1);
});