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
  // Enable all Next.js features for development
};

// Export the appropriate config based on environment
const nextConfig = isStaticExport ? staticExportConfig : devConfig;

export default nextConfig;
