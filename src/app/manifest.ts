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
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      { name: "Home", url: "/home", icons: [{ src: "/icon.svg", sizes: "any" }] },
      { name: "Habits", url: "/habits", icons: [{ src: "/icon.svg", sizes: "any" }] },
      { name: "Finance", url: "/finance", icons: [{ src: "/icon.svg", sizes: "any" }] },
    ],
  };
}