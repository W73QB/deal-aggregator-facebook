/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Force static export for proper page generation
  output: 'export',
  trailingSlash: false,
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
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