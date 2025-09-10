import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverActions: {
    bodySizeLimit: 4 * 1024 * 1024, // 4 MB
  },
};

export default nextConfig;
