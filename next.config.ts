import type { NextConfig } from "next";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Prevent Vercel build from failing on ESLint errors
  },
};
export default nextConfig;
