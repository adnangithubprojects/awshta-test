import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Remote hosts used by next/image (see config/url-config.ts: IMAGE_URL / BASE_URL)
    remotePatterns: [
      { protocol: "https", hostname: "awshta.com" },
      { protocol: "https", hostname: "awshta.devsment.com" },
    ],
  },
};

export default nextConfig;
