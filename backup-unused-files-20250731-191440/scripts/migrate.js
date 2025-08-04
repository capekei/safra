import 'dotenv/config';
import { execSync } from 'node:child_process';

const directUrl = process.env.SUPABASE_DIRECT_URL;

if (!directUrl) {
  console.error('❌ Error: SUPABASE_DIRECT_URL is not set in your .env file. Please use the direct DB connection for migrations.');
  process.exit(1);
}

// Drizzle Kit prioritizes this environment variable.
const env = {
  ...process.env,
  DRIZZLE_DATABASE_URL: directUrl,
};

console.log('🚀 Attempting to push schema to Supabase...');

try {
  // Use the modern, universal 'push' command.
  execSync('npx drizzle-kit push', { stdio: 'inherit', env });
  console.log('✅ Schema push command executed.');
  console.log('Please verify the output above for success or errors.');
} catch (error) {
  console.error('❌ Migration script failed.');
  // The actual error from drizzle-kit will be printed to stderr because of 'stdio: "inherit"'.
  process.exit(1);
}
