/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Ensure proper static generation
  output: 'standalone',
  
  // Custom webpack config to ignore HTML files in pages
  webpack: (config) => {
    config.module.rules.push({
      test: /\.html$/,
      type: 'asset/resource',
    });
    return config;
  },
  
  // Async redirects for legal pages (backup)
  async redirects() {
    return [];
  },
  
  // Headers for static pages
  async headers() {
    return [
      {
        source: '/(privacy-policy|terms-of-service|affiliate-disclosure)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;