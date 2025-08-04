const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_TcbpP7ezUJu6@ep-dark-brook-ae83i5pz-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

async function testSimpleQuery() {
  try {
    console.log('🧪 Testing simple article query...');
    
    // Test basic select
    const articles = await pool.query(`
      SELECT id, title, slug, published, created_at, updated_at
      FROM articles 
      WHERE published = true 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log(`✅ Found ${articles.rows.length} articles:`);
    articles.rows.forEach(article => {
      console.log(`  - ${article.title} (${article.slug})`);
    });
    
    // Test category query
    const categories = await pool.query(`
      SELECT id, name, slug
      FROM categories 
      ORDER BY name 
      LIMIT 5
    `);
    
    console.log(`\n✅ Found ${categories.rows.length} categories:`);
    categories.rows.forEach(category => {
      console.log(`  - ${category.name} (${category.slug})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testSimpleQuery();