const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_TcbpP7ezUJu6@ep-dark-brook-ae83i5pz-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

async function investigateArticles() {
  try {
    console.log('🔍 COMPREHENSIVE ARTICLE INVESTIGATION');
    console.log('=====================================\n');
    
    // 1. Get ALL articles regardless of status
    console.log('📊 COMPLETE ARTICLE INVENTORY:');
    const allArticles = await pool.query(`
      SELECT id, title, slug, published, created_at, updated_at, published_at
      FROM articles 
      ORDER BY id ASC
    `);
    
    console.log(`   Total articles in database: ${allArticles.rows.length}`);
    
    // 2. Check ID ranges
    const minMaxIds = await pool.query(`
      SELECT MIN(id) as min_id, MAX(id) as max_id, COUNT(*) as total_count
      FROM articles
    `);
    
    const { min_id, max_id, total_count } = minMaxIds.rows[0];
    console.log(`   ID Range: ${min_id} to ${max_id}`);
    console.log(`   Expected vs Actual: ${max_id - min_id + 1} expected, ${total_count} actual`);
    console.log(`   Missing IDs: ${(max_id - min_id + 1) - total_count}\n`);
    
    // 3. Published vs Draft breakdown
    const statusBreakdown = await pool.query(`
      SELECT 
        COUNT(CASE WHEN published = true THEN 1 END) as published_count,
        COUNT(CASE WHEN published = false OR published IS NULL THEN 1 END) as draft_count
      FROM articles
    `);
    
    console.log('📈 PUBLICATION STATUS:');
    console.log(`   Published: ${statusBreakdown.rows[0].published_count}`);
    console.log(`   Drafts/Unpublished: ${statusBreakdown.rows[0].draft_count}\n`);
    
    // 4. List all articles with details
    console.log('📝 COMPLETE ARTICLE LIST:');
    allArticles.rows.forEach((article, index) => {
      const status = article.published ? '✅ Published' : '📝 Draft';
      const createdDate = new Date(article.created_at).toLocaleDateString('es-DO');
      console.log(`   ${index + 1}. [ID: ${article.id}] ${article.title}`);
      console.log(`      Status: ${status}`);
      console.log(`      Slug: ${article.slug}`);
      console.log(`      Created: ${createdDate}\n`);
    });
    
    // 5. Check for any gaps in IDs
    console.log('🔢 ID SEQUENCE ANALYSIS:');
    const idGaps = await pool.query(`
      WITH RECURSIVE id_series AS (
        SELECT ${min_id} as id
        UNION ALL
        SELECT id + 1
        FROM id_series
        WHERE id < ${max_id}
      )
      SELECT s.id as missing_id
      FROM id_series s
      LEFT JOIN articles a ON s.id = a.id
      WHERE a.id IS NULL
      ORDER BY s.id
    `);
    
    if (idGaps.rows.length > 0) {
      console.log('   Missing Article IDs:');
      idGaps.rows.forEach(row => {
        console.log(`   - ID ${row.missing_id} (deleted or never created)`);
      });
    } else {
      console.log('   ✅ No gaps in article ID sequence');
    }
    
    // 6. Articles with unusual dates
    console.log('\n📅 DATE ANALYSIS:');
    const dateIssues = await pool.query(`
      SELECT id, title, created_at, updated_at, published_at
      FROM articles
      WHERE published_at < created_at
         OR created_at > NOW()
         OR published_at > NOW()
      ORDER BY id
    `);
    
    if (dateIssues.rows.length > 0) {
      console.log('   Articles with unusual dates:');
      dateIssues.rows.forEach(article => {
        console.log(`   - [ID: ${article.id}] ${article.title}`);
        console.log(`     Created: ${article.created_at}`);
        console.log(`     Published: ${article.published_at}`);
      });
    } else {
      console.log('   ✅ All article dates look normal');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

investigateArticles();