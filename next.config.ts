import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Watch list photos are uploaded through server actions.
    serverActions: { bodySizeLimit: "10mb" },
  },
  // Roles & Permissions became the Admin page.
  async redirects() {
    return [{ source: "/roles", destination: "/admin", permanent: true }];
  },
};

export default nextConfig;
