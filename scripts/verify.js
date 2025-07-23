// scripts/verify.js
import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const directUrl = process.env.SUPABASE_DIRECT_URL;

if (!directUrl) {
  console.error('❌ Error: SUPABASE_DIRECT_URL is not set in your .env file.');
  process.exit(1);
}

const client = new Client({
  connectionString: directUrl,
  ssl: {
    // Best practice for production connections.
    rejectUnauthorized: true,
  },
});

async function verify() {
  try {
    console.log('🚀 Connecting to Supabase to verify migration...');
    await client.connect();
    console.log('✅ Connected successfully.');

    console.log('\n--- Checking drizzle migrations journal ---');
    const migrationsResult = await client.query('SELECT id, hash, created_at FROM drizzle.__drizzle_migrations ORDER BY id DESC LIMIT 5;');
    console.table(migrationsResult.rows);

    console.log('\n--- Listing public tables ---');
    const tablesResult = await client.query("SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;");
    console.table(tablesResult.rows);

    console.log('\n✅ Verification complete.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Verification failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verify();
