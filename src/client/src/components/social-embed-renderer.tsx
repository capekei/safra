import { useEffect, useRef } from 'react';

export function SocialEmbedRenderer() {

  useEffect(() => {
    console.log('SocialEmbedRenderer: Starting to check for embeds');
    
    // Fix existing broken Twitter embeds in the content
    const fixExistingEmbeds = () => {
      const brokenTwitterLinks = document.querySelectorAll('a[href*="x.com"], a[href*="twitter.com"]');
      brokenTwitterLinks.forEach(link => {
        const url = link.getAttribute('href');
        if (url && url.includes('status/') && link.textContent?.includes('Loading tweet')) {
          const blockquote = link.closest('blockquote');
          if (blockquote) {
            blockquote.classList.add('twitter-tweet');
            blockquote.setAttribute('data-dnt', 'true');
            blockquote.setAttribute('data-theme', 'light');
            console.log('Fixed broken Twitter embed:', url);
          }
        }
      });
    };

    fixExistingEmbeds();

    // Load Twitter/X widgets script
    const loadTwitterScript = () => {
      if (window.twttr && window.twttr.widgets) {
        console.log('Twitter script already loaded, processing widgets');
        window.twttr.widgets.load();
        return;
      }
      
      if (document.querySelector('script[src*="platform.twitter.com"]')) {
        console.log('Twitter script already loading');
        return;
      }
      
      console.log('Loading Twitter script');
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.charset = 'utf-8';
      script.onload = () => {
        console.log('Twitter script loaded successfully');
        if (window.twttr && window.twttr.widgets) {
          window.twttr.widgets.load();
        }
      };
      script.onerror = () => {
        console.error('Failed to load Twitter script');
      };
      document.head.appendChild(script);
    };

    // Load Instagram embed script
    const loadInstagramScript = () => {
      if (window.instgrm && window.instgrm.Embeds) {
        console.log('Instagram script already loaded, processing embeds');
        window.instgrm.Embeds.process();
        return;
      }
      
      if (document.querySelector('script[src*="instagram.com/embed"]')) {
        console.log('Instagram script already loading');
        return;
      }
      
      console.log('Loading Instagram script');
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      script.onload = () => {
        console.log('Instagram script loaded successfully');
        if (window.instgrm && window.instgrm.Embeds) {
          window.instgrm.Embeds.process();
        }
      };
      script.onerror = () => {
        console.error('Failed to load Instagram script');
      };
      document.head.appendChild(script);
    };

    // Load TikTok embed script
    const loadTikTokScript = () => {
      if (document.querySelector('script[src*="tiktok.com/embed"]')) {
        console.log('TikTok script already loading');
        return;
      }
      
      console.log('Loading TikTok script');
      const script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      script.onload = () => {
        console.log('TikTok script loaded successfully');
      };
      script.onerror = () => {
        console.error('Failed to load TikTok script');
      };
      document.head.appendChild(script);
    };

    // Check for social embeds and load appropriate scripts
    const checkAndLoadScripts = () => {
      const twitterEmbeds = document.querySelectorAll('.twitter-embed, .twitter-tweet');
      const instagramEmbeds = document.querySelectorAll('.instagram-embed, .instagram-media');
      const tiktokEmbeds = document.querySelectorAll('.tiktok-embed');

      console.log(`Found embeds: Twitter: ${twitterEmbeds.length}, Instagram: ${instagramEmbeds.length}, TikTok: ${tiktokEmbeds.length}`);

      if (twitterEmbeds.length > 0) {
        loadTwitterScript();
      }

      if (instagramEmbeds.length > 0) {
        loadInstagramScript();
      }

      if (tiktokEmbeds.length > 0) {
        loadTikTokScript();
      }
    };

    // Initial check
    checkAndLoadScripts();

    // Run periodic checks to catch dynamically added content
    const intervalId = setInterval(checkAndLoadScripts, 1000);

    // Also observe for dynamic content changes
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if any added nodes contain social embeds
          Array.from(mutation.addedNodes).forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.classList?.contains('twitter-embed') || 
                  element.classList?.contains('instagram-embed') || 
                  element.classList?.contains('tiktok-embed') ||
                  element.querySelector('.twitter-embed, .instagram-embed, .tiktok-embed')) {
                shouldCheck = true;
              }
            }
          });
        }
      });
      
      if (shouldCheck) {
        setTimeout(checkAndLoadScripts, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearInterval(intervalId);
      observer.disconnect();
    };
  }, []);

  return null;
}

// Declare window properties for TypeScript
declare global {
  interface Window {
    twttr: {
      widgets: {
        load: () => void;
      };
    };
    instgrm: {
      Embeds: {
        process: () => void;
      };
    };
  }
}