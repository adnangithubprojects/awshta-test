import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: true, // ✅ Adds trailing slashes to routes like `/about/`

  images: {
    unoptimized: true, // ✅ Required when using `output: "export"`
    formats: ["image/webp"], // ✅ Optional, helps define preferred image formats
  },
};

export default nextConfig;
