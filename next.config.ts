import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.26', '192.168.100.244', 'localhost', '127.0.0.1'],
  devIndicators: false,
};

export default nextConfig;
