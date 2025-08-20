import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ignoreDuringBuilds: true,
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com"], // allow images from Unsplash
  },
};

export default nextConfig;
