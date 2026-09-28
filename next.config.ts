import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Client-router segment cache ─────────────────────────────────────────
  // Keep dynamic route segments briefly and static/full-prefetched segments longer.
  experimental: {
    staleTimes: {
      dynamic: 60,   // dynamic pages cached client-side 60s (was 0 = never)
      static: 300,   // static pages cached 5 min
    },
  },

  // ─── Images ──────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    // Serve next-gen formats (avif/webp) automatically
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
