const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_TcbpP7ezUJu6@ep-dark-brook-ae83i5pz-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

async function checkData() {
  try {
    console.log('🔍 Checking existing data...');
    
    // Check articles count
    const articlesCount = await pool.query('SELECT COUNT(*) FROM articles');
    console.log(`📰 Articles: ${articlesCount.rows[0].count}`);
    
    // Check categories count
    const categoriesCount = await pool.query('SELECT COUNT(*) FROM categories');
    console.log(`📁 Categories: ${categoriesCount.rows[0].count}`);
    
    // Get sample articles
    if (parseInt(articlesCount.rows[0].count) > 0) {
      const sampleArticles = await pool.query('SELECT id, title, slug, published FROM articles LIMIT 3');
      console.log('\n📝 Sample articles:');
      sampleArticles.rows.forEach(article => {
        console.log(`  - ${article.id}: ${article.title} (${article.slug}) - Published: ${article.published}`);
      });
    }
    
    // Get sample categories
    if (parseInt(categoriesCount.rows[0].count) > 0) {
      const sampleCategories = await pool.query('SELECT id, name, slug FROM categories LIMIT 3');
      console.log('\n📂 Sample categories:');
      sampleCategories.rows.forEach(category => {
        console.log(`  - ${category.id}: ${category.name} (${category.slug})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkData();