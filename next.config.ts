import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Watch list photos are uploaded through server actions.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
