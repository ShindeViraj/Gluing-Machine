import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    allowedDevOrigins: ['192.168.0.26', 'localhost', '127.0.0.1'],
  },
};

export default nextConfig;
