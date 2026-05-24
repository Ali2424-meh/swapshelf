import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "70mb",
    serverActions: {
      bodySizeLimit: "70mb",
    },
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
