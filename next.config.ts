import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // fully static SPA → 0 serverless functions (stays under Vercel Hobby's 12-fn limit)
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // required by `output: export` since next/image is used (no optimization server)
  },
};

export default nextConfig;
