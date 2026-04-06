import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      // Transloadit CDN domains for uploaded media
      { protocol: "https", hostname: "*.tlcdn.com" },
      { protocol: "https", hostname: "*.transloadit.com" },
      { protocol: "https", hostname: "assembly.transloadit.com" },
    ],
  },
};

export default nextConfig;
