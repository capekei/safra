// scripts/transfer-data.js
import 'dotenv/config';
import { execSync } from 'node:child_process';

const sourceUrl = process.env.DATABASE_URL; // Neon
const destinationUrl = process.env.SUPABASE_DIRECT_URL; // Supabase Direct

if (!sourceUrl || !destinationUrl) {
  console.error('❌ Error: DATABASE_URL and/or SUPABASE_DIRECT_URL are not set in your .env file.');
  process.exit(1);
}

// Since postgresql@16 is keg-only, we need the full paths.
const pgDumpPath = '/usr/local/opt/postgresql@16/bin/pg_dump';
const psqlPath = '/usr/local/opt/postgresql@16/bin/psql';

console.log('🚀 Starting data transfer from Neon to Supabase...');
console.log('This may take a few minutes depending on the database size.');

// Using --clean will drop existing objects in the destination before creating them.
// This makes the script idempotent.
const command = `"${pgDumpPath}" --clean --if-exists -d "${sourceUrl}" | "${psqlPath}" -d "${destinationUrl}"`;

try {
  execSync(command, { stdio: 'inherit' });
  console.log('✅ Data transfer completed successfully.');
} catch (error) {
  console.error('❌ Data transfer failed. Check pg_dump/psql errors above.');
  process.exit(1);
}
