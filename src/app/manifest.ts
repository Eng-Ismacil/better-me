import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BetterMe — Habit & Growth Companion",
    short_name: "BetterMe",
    description: "Build steady habits and track your daily progress.",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    background_color: "#FCF9F8",
    theme_color: "#007AFF",
    orientation: "portrait",
    categories: ["health", "lifestyle", "productivity"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    shortcuts: [
      { name: "Home", url: "/home", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Habits", url: "/habits", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Finance", url: "/finance", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}