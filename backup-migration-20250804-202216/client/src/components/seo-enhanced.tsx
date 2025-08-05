import { useEffect } from 'react';

interface SEOEnhancedProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  article?: {
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
  };
  locale?: string;
  canonical?: string;
}

export function SEOEnhanced({
  title = 'SafraReport - Noticias de República Dominicana',
  description = 'Tu fuente confiable de noticias, clasificados y reseñas de negocios en República Dominicana. Mantente informado con las últimas noticias locales.',
  keywords = 'República Dominicana, noticias, clasificados, marketplace, Santo Domingo, RD, noticias dominicanas',
  image = '/images/safrareport-og.jpg',
  url = 'https://safrareport.com',
  type = 'website',
  article,
  locale = 'es_DO',
  canonical
}: SEOEnhancedProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('content', content);
    };

    // Helper function to update or create link tags
    const updateLinkTag = (rel: string, href: string) => {
      let tag = document.querySelector(`link[rel="${rel}"]`);
      
      if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', rel);
        document.head.appendChild(tag);
      }
      
      tag.setAttribute('href', href);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'SafraReport');
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    updateMetaTag('language', 'Spanish');
    updateMetaTag('geo.region', 'DO');
    updateMetaTag('geo.country', 'Dominican Republic');
    updateMetaTag('geo.placename', 'Santo Domingo');

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'SafraReport', true);
    updateMetaTag('og:locale', locale, true);

    // Article-specific Open Graph tags
    if (article && type === 'article') {
      if (article.author) updateMetaTag('article:author', article.author, true);
      if (article.publishedTime) updateMetaTag('article:published_time', article.publishedTime, true);
      if (article.modifiedTime) updateMetaTag('article:modified_time', article.modifiedTime, true);
      if (article.section) updateMetaTag('article:section', article.section, true);
      if (article.tags) {
        article.tags.forEach(tag => {
          const tagMeta = document.createElement('meta');
          tagMeta.setAttribute('property', 'article:tag');
          tagMeta.setAttribute('content', tag);
          document.head.appendChild(tagMeta);
        });
      }
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:site', '@SafraReport');
    updateMetaTag('twitter:creator', '@SafraReport');

    // Dominican Republic specific tags
    updateMetaTag('DC.title', title);
    updateMetaTag('DC.description', description);
    updateMetaTag('DC.language', 'es-DO');
    updateMetaTag('DC.coverage', 'República Dominicana');

    // Schema.org JSON-LD structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": type === 'article' ? "NewsArticle" : "WebSite",
      "headline": title,
      "description": description,
      "url": url,
      "publisher": {
        "@type": "Organization",
        "name": "SafraReport",
        "url": "https://safrareport.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://safrareport.com/images/logo.png"
        }
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://safrareport.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    if (type === 'article' && article) {
      Object.assign(structuredData, {
        "author": {
          "@type": "Person",
          "name": article.author || "SafraReport"
        },
        "datePublished": article.publishedTime,
        "dateModified": article.modifiedTime || article.publishedTime,
        "articleSection": article.section,
        "keywords": article.tags?.join(', '),
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": url
        }
      });
    }

    // Update or create JSON-LD script
    let jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(structuredData);

    // Canonical URL
    if (canonical || url) {
      updateLinkTag('canonical', canonical || url);
    }

    // Favicon and app icons
    updateLinkTag('icon', '/favicon.ico');
    updateLinkTag('apple-touch-icon', '/apple-touch-icon.png');
    updateLinkTag('manifest', '/manifest.json');

    // DNS prefetch for performance
    const dnsPrefetchDomains = [
      'https://images.unsplash.com',
      'https://fonts.googleapis.com',
      'https://api.safrareport.com'
    ];

    dnsPrefetchDomains.forEach(domain => {
      let prefetchLink = document.querySelector(`link[rel="dns-prefetch"][href="${domain}"]`);
      if (!prefetchLink) {
        prefetchLink = document.createElement('link');
        prefetchLink.setAttribute('rel', 'dns-prefetch');
        prefetchLink.setAttribute('href', domain);
        document.head.appendChild(prefetchLink);
      }
    });

  }, [title, description, keywords, image, url, type, article, locale, canonical]);

  return null; // This component doesn't render anything visible
}