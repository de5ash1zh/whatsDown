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
};

export default nextConfig;
