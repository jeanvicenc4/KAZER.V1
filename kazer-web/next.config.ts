import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@kazer/core'],
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: '**.google.com' },
    ],
  },
  async redirects() {
    return [
      { source: '/app', destination: '/kazer', permanent: false },
      { source: '/planos', destination: '/kazer/pricing', permanent: false },
    ];
  },
};

export default nextConfig;
