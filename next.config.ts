import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['192.168.0.47', '192.168.100.27'],
};

export default nextConfig;
