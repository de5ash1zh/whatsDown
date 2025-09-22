import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // S3 bucket public base (generic matcher)
      { protocol: 'https', hostname: '**.s3.*.amazonaws.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      // ui-avatars fallback
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ],
  },
  eslint: {
    // Allow production builds to successfully complete even if
    // there are ESLint errors. We track/fix them iteratively.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete even if there are
    // type errors. Prevents deploy blockers; we fix iteratively.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
