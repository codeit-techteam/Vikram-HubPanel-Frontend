import type { NextConfig } from "next";

/** Upstream API used by the local same-origin rewrite (avoids browser CORS). */
const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET ??
  "https://bajriwala-backend-zkuxd.ondigitalocean.app";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${API_PROXY_TARGET}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.cloudflarestorage.com",
      },
    ],
  },
};

export default nextConfig;
