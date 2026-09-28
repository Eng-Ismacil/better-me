import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // ─── Client-router caching (like React Router DOM) ───────────────────────
  // Pages stay cached in memory for 5 minutes; re-validates layout every 1 min.
  // This eliminates the "every tab = fresh network render" problem.
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
