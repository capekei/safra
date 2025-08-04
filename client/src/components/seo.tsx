import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function SEO({
  title = 'SafraReport - Dominican Republic News & Marketplace',
  description = 'Your trusted source for Dominican Republic news, classifieds, and business reviews. Stay informed with the latest local news and find great deals in your area.',
  keywords = 'Dominican Republic, news, classifieds, marketplace, Santo Domingo, DOP',
  image = '/images/og-image.jpg',
  url = 'https://safrareport.com',
  type = 'website'
}: SEOProps) {
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

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'SafraReport', true);
    updateMetaTag('og:locale', 'es_DO', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Additional meta tags
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('author', 'SafraReport Team');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');

  }, [title, description, keywords, image, url, type]);

  return null; // This component doesn't render anything visible
}