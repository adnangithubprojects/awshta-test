import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "awshta.com" },
      { protocol: "https", hostname: "awshta.devsment.com" },
    ],
  },
};

export default nextConfig;
