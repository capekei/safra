import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
}

export function SEO({
  title = "SafraReport - Noticias de República Dominicana",
  description = "Portal de noticias, clasificados y reseñas de negocios en República Dominicana. Mantente informado con las últimas noticias nacionales e internacionales.",
  keywords = "noticias República Dominicana, clasificados RD, reseñas negocios, Santo Domingo, noticias dominicanas",
  image = "/safra-logo.png",
  url = window.location.href,
  type = "website",
  author,
  publishedTime,
  modifiedTime,
  section,
}: SEOProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);

    // Open Graph tags
    updateMetaTag("og:title", title, "property");
    updateMetaTag("og:description", description, "property");
    updateMetaTag("og:image", image, "property");
    updateMetaTag("og:url", url, "property");
    updateMetaTag("og:type", type, "property");
    updateMetaTag("og:site_name", "SafraReport", "property");
    updateMetaTag("og:locale", "es_DO", "property");

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image", "name");
    updateMetaTag("twitter:title", title, "name");
    updateMetaTag("twitter:description", description, "name");
    updateMetaTag("twitter:image", image, "name");
    updateMetaTag("twitter:site", "@SafraReportRD", "name");

    // Article specific meta tags
    if (type === "article") {
      if (author) updateMetaTag("article:author", author, "property");
      if (publishedTime) updateMetaTag("article:published_time", publishedTime, "property");
      if (modifiedTime) updateMetaTag("article:modified_time", modifiedTime, "property");
      if (section) updateMetaTag("article:section", section, "property");
      
      // Schema.org JSON-LD
      updateJsonLd({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": title,
        "description": description,
        "image": image,
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime,
        "author": {
          "@type": "Person",
          "name": author || "SafraReport"
        },
        "publisher": {
          "@type": "Organization",
          "name": "SafraReport",
          "logo": {
            "@type": "ImageObject",
            "url": "/safra-logo.png"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": url
        }
      });
    } else {
      // Website schema
      updateJsonLd({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "SafraReport",
        "description": "Portal de noticias de República Dominicana",
        "url": "https://safrareport.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://safrareport.com/buscar?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      });
    }

    // Cleanup function
    return () => {
      // Reset to default title when component unmounts
      document.title = "SafraReport - Noticias de República Dominicana";
    };
  }, [title, description, keywords, image, url, type, author, publishedTime, modifiedTime, section]);

  return null;
}

function updateMetaTag(name: string, content: string, attribute: "name" | "property" = "name") {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute("content", content);
}

function updateJsonLd(data: any) {
  let scriptElement = document.querySelector('script[type="application/ld+json"]');
  
  if (!scriptElement) {
    scriptElement = document.createElement("script");
    scriptElement.setAttribute("type", "application/ld+json");
    document.head.appendChild(scriptElement);
  }
  
  scriptElement.textContent = JSON.stringify(data);
}