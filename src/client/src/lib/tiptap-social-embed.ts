import { Node, mergeAttributes } from '@tiptap/core';

export interface SocialEmbedOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    socialEmbed: {
      setSocialEmbed: (options: { url: string; platform: 'twitter' | 'instagram' | 'tiktok' }) => ReturnType;
    };
  }
}

export const SocialEmbed = Node.create<SocialEmbedOptions>({
  name: 'socialEmbed',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      url: {
        default: null,
      },
      platform: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-social-embed]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-social-embed': '' })];
  },

  addCommands() {
    return {
      setSocialEmbed:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

// Helper functions to convert URLs to embed HTML
export const getEmbedHTML = (url: string, platform: string): string => {
  if (platform === 'twitter') {
    // Extract tweet ID from URL
    const tweetMatch = url.match(/status\/(\d+)/);
    if (tweetMatch) {
      const tweetId = tweetMatch[1];
      return `<div class="social-embed twitter-embed" data-url="${url}" data-platform="twitter">
  <blockquote class="twitter-tweet" data-dnt="true" data-theme="light">
    <a href="${url}">Loading tweet...</a>
  </blockquote>
</div>`;
    }
  } else if (platform === 'instagram') {
    // Instagram embeds
    return `<div class="social-embed instagram-embed" data-url="${url}" data-platform="instagram">
  <blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${url}" data-instgrm-version="14">
    <a href="${url}" target="_blank">View this post on Instagram</a>
  </blockquote>
</div>`;
  } else if (platform === 'tiktok') {
    // TikTok embeds - extract video ID for proper embedding
    const videoMatch = url.match(/video\/(\d+)/);
    if (videoMatch) {
      const videoId = videoMatch[1];
      return `<div class="social-embed tiktok-embed" data-url="${url}" data-platform="tiktok">
  <blockquote class="tiktok-embed" cite="${url}" data-video-id="${videoId}" style="max-width: 605px; min-width: 325px;">
    <section>
      <a target="_blank" title="View on TikTok" href="${url}">View on TikTok</a>
    </section>
  </blockquote>
</div>`;
    }
  }
  return '';
};

// Function to detect platform from URL
export const detectPlatform = (url: string): 'twitter' | 'instagram' | 'tiktok' | null => {
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return 'twitter';
  } else if (url.includes('instagram.com')) {
    return 'instagram';
  } else if (url.includes('tiktok.com')) {
    return 'tiktok';
  }
  return null;
};