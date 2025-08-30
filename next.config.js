/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Use standalone for Vercel with API routes
  output: 'standalone',
  trailingSlash: false,
  
  // Custom webpack config
  webpack: (config) => {
    config.module.rules.push({
      test: /\.html$/,
      type: 'asset/resource',
    });
    return config;
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