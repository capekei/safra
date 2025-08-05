import { Request, Response } from 'express';
import { DatabaseStorage } from '../database/storage';

const storage = new DatabaseStorage();

// Utility functions for SEO generation
function generateSitemapXML(urls: Array<{url: string, changefreq: string, priority: number, lastmod?: string}>): string {
  const urlEntries = urls.map(item => `
  <url>
    <loc>${item.url}</loc>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
    ${item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : ''}
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

function generateRSSFeedXML(feedData: {
  title: string,
  description: string, 
  link: string,
  language: string,
  items: Array<{title: string, description: string, link: string, pubDate: string, author: string, category?: string}>
}): string {
  const items = feedData.items.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description}]]></description>
      <link>${item.link}</link>
      <pubDate>${item.pubDate}</pubDate>
      <author>${item.author}</author>
      ${item.category ? `<category>${item.category}</category>` : ''}
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${feedData.title}</title>
    <description>${feedData.description}</description>
    <link>${feedData.link}</link>
    <language>${feedData.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
}

/**
 * Generate and serve sitemap.xml
 */
export async function generateSitemap(req: Request, res: Response) {
  try {
    // Get base URL from request
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Static pages
    const staticUrls = [
      { url: `${baseUrl}/`, changefreq: 'daily', priority: 1.0 },
      { url: `${baseUrl}/articles`, changefreq: 'hourly', priority: 0.9 },
      { url: `${baseUrl}/businesses`, changefreq: 'daily', priority: 0.8 },
      { url: `${baseUrl}/classifieds`, changefreq: 'hourly', priority: 0.8 },
      { url: `${baseUrl}/about`, changefreq: 'monthly', priority: 0.5 },
      { url: `${baseUrl}/contact`, changefreq: 'monthly', priority: 0.5 },
    ];

    // Get articles
    const articles = await storage.getArticles(1000, 0); // Get up to 1000 articles
    const articleUrls = articles.map(article => ({
      url: `${baseUrl}/articles/${article.id}`,
      lastmod: article.updatedAt || article.createdAt,
      changefreq: 'weekly' as const,
      priority: 0.7
    }));

    // Get businesses
    const businesses = await storage.getBusinesses(1000, 0); // Get up to 1000 businesses
    const businessUrls = businesses.map(business => ({
      url: `${baseUrl}/businesses/${business.id}`,
      lastmod: business.createdAt, // updatedAt not in current schema
      changefreq: 'monthly' as const,
      priority: 0.6
    }));

    // Get classifieds
    const classifieds = await storage.getClassifieds(1000, 0); // Get up to 1000 classifieds
    const classifiedUrls = classifieds.map(classified => ({
      url: `${baseUrl}/classifieds/${classified.id}`,
      lastmod: classified.createdAt, // updatedAt not in current schema
      changefreq: 'daily' as const,
      priority: 0.6
    }));

    // Combine all URLs
    const allUrls = [...staticUrls, ...articleUrls, ...businessUrls, ...classifiedUrls];

    // Generate sitemap XML
    const sitemapXML = generateSitemapXML(allUrls);

    // Set headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    res.send(sitemapXML);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}

/**
 * Generate and serve RSS feed
 */
export async function generateRSSFeed(req: Request, res: Response) {
  try {
    // Get base URL from request
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Get latest articles
    const articles = await storage.getArticles(50, 0); // Get latest 50 articles

    // Convert articles to RSS items
    const items = articles.map(article => ({
      title: article.title,
      description: article.excerpt || article.content.substring(0, 200) + '...',
      link: `${baseUrl}/articles/${article.id}`,
      pubDate: new Date(article.createdAt).toUTCString(),
      author: 'Safra Report', // author relation not loaded
      category: undefined // category relation not loaded
    }));

    // Generate RSS feed
    const rssFeed = generateRSSFeedXML({
      title: 'Safra Report - Latest News',
      description: 'Latest news and articles from Safra Report',
      link: baseUrl,
      language: 'es-DO',
      items
    });

    // Set headers
    res.setHeader('Content-Type', 'application/rss+xml');
    res.setHeader('Cache-Control', 'public, max-age=1800'); // Cache for 30 minutes

    res.send(rssFeed);
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    res.status(500).send('Error generating RSS feed');
  }
}

/**
 * Generate robots.txt
 */
export function generateRobotsTxt(req: Request, res: Response) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /api/admin/

# Allow important pages
Allow: /articles/
Allow: /businesses/
Allow: /classifieds/

# Crawl delay (optional)
Crawl-delay: 1`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  res.send(robotsTxt);
} 