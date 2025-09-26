import type { NextConfig } from "next";

// Check if we're building for static export (GitHub Pages)
const isStaticExport = process.env.BUILD_STATIC === 'true';

// Base configuration that works for both dev and production
const baseConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
};

// GitHub Pages specific configuration
const staticExportConfig: NextConfig = {
  ...baseConfig,
  output: 'export',
  trailingSlash: true,
  basePath: '/adhd-dashboard',
  assetPrefix: '/adhd-dashboard/',
  images: {
    unoptimized: true
  },
  // Disable server-side features for static export
  experimental: {
    // Ensure no server-side features are used
  }
};

// Development configuration (default Next.js behavior)
const devConfig: NextConfig = {
  ...baseConfig,
  images: {
    // Keep image optimization enabled for development
  },
  // CSP headers for development environment
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://accounts.google.com https://ssl.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://www.googleapis.com https://accounts.google.com https://oauth2.googleapis.com",
              "frame-src 'self' https://accounts.google.com https://content.googleapis.com",
              "img-src 'self' data: blob: https:",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'"
            ].join('; ')
          }
        ]
      }
    ];
  }
};

// Export the appropriate config based on environment
const nextConfig = isStaticExport ? staticExportConfig : devConfig;

export default nextConfig;
