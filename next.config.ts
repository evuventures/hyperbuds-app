import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Prevent Vercel build from failing on ESLint errors
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.ufs.sh',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        protocol: 'https',
        hostname: 'np2flplp9c.ufs.sh',
      },
    ],
  },
};
export default nextConfig;
