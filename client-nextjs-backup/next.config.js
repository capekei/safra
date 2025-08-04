/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost', 
      'safrareport.com',
      '127.0.0.1',
      // Add other domains as needed for image hosting
    ],
  },
  async rewrites() {
    // Use environment variable for API URL in production
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? (process.env.API_URL || 'https://your-production-api.com')
      : 'http://localhost:4000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
  // Optimize for production
  compress: true,
  poweredByHeader: false,
};

export default nextConfig; 