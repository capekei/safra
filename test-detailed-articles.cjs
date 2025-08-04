const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_TcbpP7ezUJu6@ep-dark-brook-ae83i5pz-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

async function getDetailedArticleInfo() {
  try {
    console.log('📊 SAFRAREPORT DATABASE ANALYSIS');
    console.log('================================\n');
    
    // Total articles count
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM articles');
    const publishedResult = await pool.query('SELECT COUNT(*) as published FROM articles WHERE published = true');
    const draftResult = await pool.query('SELECT COUNT(*) as drafts FROM articles WHERE published = false OR published IS NULL');
    
    console.log('📰 ARTICLE STATISTICS:');
    console.log(`   Total Articles: ${totalResult.rows[0].total}`);
    console.log(`   Published: ${publishedResult.rows[0].published}`);
    console.log(`   Drafts: ${draftResult.rows[0].drafts}\n`);
    
    // Categories breakdown
    const categoriesResult = await pool.query(`
      SELECT c.name, COUNT(a.id) as article_count 
      FROM categories c 
      LEFT JOIN articles a ON c.id = a.category_id AND a.published = true
      GROUP BY c.id, c.name 
      ORDER BY article_count DESC
    `);
    
    console.log('📁 ARTICLES BY CATEGORY:');
    categoriesResult.rows.forEach(row => {
      console.log(`   ${row.name}: ${row.article_count} articles`);
    });
    
    // Recent articles
    const recentResult = await pool.query(`
      SELECT a.title, a.slug, c.name as category, a.created_at, a.views, a.likes
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.published = true
      ORDER BY a.created_at DESC
      LIMIT 5
    `);
    
    console.log('\n📝 MOST RECENT PUBLISHED ARTICLES:');
    recentResult.rows.forEach((article, index) => {
      const date = new Date(article.created_at).toLocaleDateString('es-DO');
      console.log(`   ${index + 1}. ${article.title}`);
      console.log(`      Category: ${article.category || 'Sin categoría'}`);
      console.log(`      Slug: ${article.slug}`);
      console.log(`      Date: ${date}`);
      console.log(`      Views: ${article.views || 0} | Likes: ${article.likes || 0}\n`);
    });
    
    // Popular articles
    const popularResult = await pool.query(`
      SELECT title, slug, views, likes
      FROM articles
      WHERE published = true AND views > 0
      ORDER BY views DESC
      LIMIT 3
    `);
    
    if (popularResult.rows.length > 0) {
      console.log('🔥 MOST POPULAR ARTICLES:');
      popularResult.rows.forEach((article, index) => {
        console.log(`   ${index + 1}. ${article.title}`);
        console.log(`      Views: ${article.views} | Likes: ${article.likes}`);
        console.log(`      URL: /articulos/${article.slug}\n`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

getDetailedArticleInfo();