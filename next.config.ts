import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  experimental: {
    // Enable optimizations
    optimizePackageImports: ["lucide-react"],
  },
  // 環境変数の設定
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // 画像最適化の設定
  images: {
    domains: ['ujcwfpkskazokneqsaqd.supabase.co'],
  },
};

export default nextConfig;
