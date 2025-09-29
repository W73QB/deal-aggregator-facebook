/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: false,

  // Enhanced images configuration for 10/10 performance
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'deal-aggregator-facebook.vercel.app',
      'cdn.jsdelivr.net'
    ],
    minimumCacheTTL: 31536000, // 1 year cache
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enhanced experimental features
  experimental: {
    optimizeCss: false, // Disable CSS optimization causing media="print"
    scrollRestoration: true,
  },

  // Enhanced security and performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-analytics.com",
              "frame-src 'self'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400'
          }
        ]
      }
    ]
  },

  // SEO redirects for duplicate content prevention
  async redirects() {
    return [
      // Legacy path redirects
      {
        source: '/legacy/:path*',
        destination: '/:path*',
        permanent: true
      },
      {
        source: '/home',
        destination: '/',
        permanent: true
      },

      // HTML file redirects to prevent duplicate content
      {
        source: '/index.html',
        destination: '/',
        permanent: true
      },
      {
        source: '/home.html',
        destination: '/',
        permanent: true
      },
      {
        source: '/deals.html',
        destination: '/deals',
        permanent: true
      },
      {
        source: '/blog.html',
        destination: '/blog',
        permanent: true
      },
      {
        source: '/about.html',
        destination: '/about',
        permanent: true
      },
      {
        source: '/contact.html',
        destination: '/contact',
        permanent: true
      },
      {
        source: '/privacy.html',
        destination: '/privacy',
        permanent: true
      },
      {
        source: '/terms-of-service.html',
        destination: '/terms-of-service',
        permanent: true
      },
      {
        source: '/affiliate-disclosure.html',
        destination: '/affiliate-disclosure',
        permanent: true
      },

      // Blog post HTML redirects
      {
        source: '/blog/:slug.html',
        destination: '/blog/:slug',
        permanent: true
      },

      // Pages directory HTML redirects (catch any remaining)
      {
        source: '/pages/:path*.html',
        destination: '/:path*',
        permanent: true
      },

      // Common SEO redirects
      {
        source: '/index.php',
        destination: '/',
        permanent: true
      },
      {
        source: '/home.php',
        destination: '/',
        permanent: true
      }
    ]
  },

  // Performance optimizations
  async rewrites() {
    return [
      {
        source: '/api/deals',
        destination: '/api/deals?cache=true'
      }
    ];
  },

  // Webpack optimizations for 10/10 build
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Exclude server-only dependencies from client bundle
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'bcrypt': 'bcrypt',
        'pg': 'pg',
        'winston': 'winston',
        'ioredis': 'ioredis',
        'prom-client': 'prom-client',
        'express': 'express',
        'helmet': 'helmet',
        'morgan': 'morgan',
        'nodemailer': 'nodemailer',
        '@sentry/node': '@sentry/node',
        'node-cron': 'node-cron',
        'rate-limiter-flexible': 'rate-limiter-flexible'
      });
    }

    // Production optimizations
    if (!dev) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.maxSize = 250000; // 250kb max chunk size
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
          maxSize: 200000
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5
        }
      };
    }

    return config;
  },

  // Build optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  compress: true,
  poweredByHeader: false,
}

export default nextConfig