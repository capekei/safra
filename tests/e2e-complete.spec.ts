import { test, expect } from '@playwright/test';

// E2E Tests for SafraReport Article Viewing Flow
test.describe('SafraReport Article Viewing E2E Tests', () => {
  
  // Test data - using real article slugs from the database
  const testArticles = [
    {
      slug: 'republica-dominicana-record-historico-turistas',
      title: 'República Dominicana registra récord histórico en llegada de turistas',
      expectedViews: 4689 // This will increment during testing
    },
    {
      slug: 'gobierno-anuncia-nuevas-medidas-economicas-2025', 
      title: 'Gobierno anuncia nuevas medidas económicas para el 2025',
      expectedViews: 4252
    }
  ];

  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto('http://localhost:4000/api/health');
    const response = await page.textContent('body');
    expect(response).toContain('healthy');
  });

  test('Backend API Health Check', async ({ page }) => {
    await page.goto('http://localhost:4000/api/health');
    
    const healthData = await page.textContent('body');
    const health = JSON.parse(healthData);
    
    expect(health.status).toBe('healthy');
    expect(health.dominican.currency).toBe('DOP');
    expect(health.dominican.mobile_optimized).toBe(true);
  });

  test('Database Connection and Article Count', async ({ page }) => {
    await page.goto('http://localhost:4000/api/debug/db');
    
    const dbData = await page.textContent('body');
    const db = JSON.parse(dbData);
    
    expect(db.success).toBe(true);
    expect(db.articles_count).toBe('14'); // Expecting 14 articles
    expect(db.message).toContain('successful');
  });

  test('Article API Returns Valid Data', async ({ page }) => {
    for (const article of testArticles) {
      await page.goto(`http://localhost:4000/api/articles/${article.slug}`);
      
      const articleData = await page.textContent('body');
      const articleObj = JSON.parse(articleData);
      
      // Verify article structure
      expect(articleObj.id).toBeDefined();
      expect(articleObj.title).toBe(article.title);
      expect(articleObj.slug).toBe(article.slug);
      expect(articleObj.content).toBeDefined();
      expect(articleObj.published).toBe(true);
      expect(articleObj.views).toBeGreaterThanOrEqual(article.expectedViews);
      
      // Verify category information
      expect(articleObj.category).toBeDefined();
      expect(articleObj.category.name).toBeDefined();
      expect(articleObj.category.slug).toBeDefined();
      
      console.log(`✅ Article "${article.title}" - Views: ${articleObj.views}, Category: ${articleObj.category.name}`);
    }
  });

  test('Article View Count Increments', async ({ page }) => {
    const testSlug = testArticles[0].slug;
    
    // First request - get initial view count
    await page.goto(`http://localhost:4000/api/articles/${testSlug}`);
    const firstData = await page.textContent('body');
    const firstArticle = JSON.parse(firstData);
    const initialViews = firstArticle.views;
    
    // Second request - view count should increment
    await page.goto(`http://localhost:4000/api/articles/${testSlug}`);
    const secondData = await page.textContent('body');
    const secondArticle = JSON.parse(secondData);
    const newViews = secondArticle.views;
    
    expect(newViews).toBe(initialViews + 1);
    console.log(`✅ View count incremented: ${initialViews} → ${newViews}`);
  });

  test('Articles List API', async ({ page }) => {
    await page.goto('http://localhost:4000/api/articles?limit=5');
    
    const articlesData = await page.textContent('body');
    const articles = JSON.parse(articlesData);
    
    expect(Array.isArray(articles)).toBe(true);
    expect(articles.length).toBeLessThanOrEqual(5);
    expect(articles.length).toBeGreaterThan(0);
    
    // Verify each article has required fields
    articles.forEach(article => {
      expect(article.id).toBeDefined();
      expect(article.title).toBeDefined();
      expect(article.slug).toBeDefined();
      expect(article.published).toBe(true);
    });
    
    console.log(`✅ Articles list returned ${articles.length} articles`);
  });

  test('Category Filter Works', async ({ page }) => {
    await page.goto('http://localhost:4000/api/articles?category=turismo&limit=10');
    
    const articlesData = await page.textContent('body');
    const articles = JSON.parse(articlesData);
    
    expect(Array.isArray(articles)).toBe(true);
    
    // All articles should be in tourism category
    articles.forEach(article => {
      if (article.category) {
        expect(article.category.slug).toBe('turismo');
      }
    });
    
    console.log(`✅ Tourism category filter returned ${articles.length} articles`);
  });

  test('Article Not Found Returns 404', async ({ page }) => {
    const response = await page.goto('http://localhost:4000/api/articles/non-existent-article-slug');
    
    expect(response?.status()).toBe(404);
    
    const errorData = await page.textContent('body');
    const error = JSON.parse(errorData);
    
    expect(error.message).toContain('no encontrado');
  });

  test('Real-time Data Endpoints', async ({ page }) => {
    const endpoints = [
      { path: '/api/fuel-prices', expectedKeys: ['gasolina95', 'gasolinaRegular', 'gasoil'] },
      { path: '/api/exchange-rates', expectedKeys: ['usd', 'eur'] },
      { path: '/api/weather', expectedKeys: ['temp', 'condition', 'location'] }
    ];
    
    for (const endpoint of endpoints) {
      await page.goto(`http://localhost:4000${endpoint.path}`);
      
      const data = await page.textContent('body');
      const dataObj = JSON.parse(data);
      
      endpoint.expectedKeys.forEach(key => {
        expect(dataObj[key]).toBeDefined();
      });
      
      console.log(`✅ ${endpoint.path} returned valid data`);
    }
  });

  test('Database Schema Integrity', async ({ page }) => {
    // Test that all required tables and relationships work
    await page.goto('http://localhost:4000/api/debug/articles');
    
    const debugData = await page.textContent('body');
    const debug = JSON.parse(debugData);
    
    expect(debug.success).toBe(true);
    expect(Array.isArray(debug.articles)).toBe(true);
    expect(debug.articles.length).toBeGreaterThan(0);
    
    // Verify each article has proper structure
    debug.articles.forEach(article => {
      expect(article.id).toBeDefined();
      expect(article.title).toBeDefined();
      expect(article.slug).toBeDefined();
      expect(article.published).toBe(true);
      expect(article.created_at).toBeDefined();
    });
    
    console.log(`✅ Database schema integrity verified with ${debug.articles.length} articles`);
  });
});

// Performance Tests
test.describe('SafraReport Performance Tests', () => {
  
  test('API Response Times', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:4000/api/articles/republica-dominicana-record-historico-turistas');
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // API should respond within 2 seconds
    expect(responseTime).toBeLessThan(2000);
    
    console.log(`✅ API response time: ${responseTime}ms`);
  });
  
  test('Concurrent Article Requests', async ({ page }) => {
    const testSlugs = [
      'republica-dominicana-record-historico-turistas',
      'gobierno-anuncia-nuevas-medidas-economicas-2025',
      'tigres-licey-campeon-beisbol-dominicano'
    ];
    
    const startTime = Date.now();
    
    // Make concurrent requests
    const promises = testSlugs.map(slug => 
      page.goto(`http://localhost:4000/api/articles/${slug}`)
    );
    
    await Promise.all(promises);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // All requests should complete within 3 seconds
    expect(totalTime).toBeLessThan(3000);
    
    console.log(`✅ ${testSlugs.length} concurrent requests completed in ${totalTime}ms`);
  });
});

// Dominican Republic Specific Tests
test.describe('Dominican Republic Localization Tests', () => {
  
  test('Currency and Locale Data', async ({ page }) => {
    await page.goto('http://localhost:4000/api/fuel-prices');
    
    const fuelData = await page.textContent('body');
    const fuel = JSON.parse(fuelData);
    
    // Verify Dominican fuel prices are in reasonable ranges
    expect(fuel.gasolina95).toBeGreaterThan(200);
    expect(fuel.gasolina95).toBeLessThan(400);
    expect(fuel.gasolinaRegular).toBeGreaterThan(200);
    expect(fuel.gasolinaRegular).toBeLessThan(400);
    
    console.log(`✅ Dominican fuel prices: Gasolina 95: ${fuel.gasolina95}, Regular: ${fuel.gasolinaRegular}`);
  });
  
  test('Exchange Rates for Dominican Market', async ({ page }) => {
    await page.goto('http://localhost:4000/api/exchange-rates');
    
    const ratesData = await page.textContent('body');
    const rates = JSON.parse(ratesData);
    
    // USD to DOP should be reasonable (around 55-65 range)
    expect(rates.usd.rate).toBeGreaterThan(50);
    expect(rates.usd.rate).toBeLessThan(70);
    
    console.log(`✅ Exchange rates: USD: ${rates.usd.rate} DOP, EUR: ${rates.eur.rate} DOP`);
  });
});