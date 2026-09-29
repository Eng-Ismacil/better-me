// @ts-ignore
import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl = process.env.CAPACITOR_SERVER_URL || "https://better-me1.vercel.app";
const serverOrigin = new URL(serverUrl);

const config: CapacitorConfig = {
  appId: "com.betterme.app",
  appName: "BetterMe",
  webDir: "web-assets",
  server: {
    url: serverUrl,
    cleartext: serverOrigin.protocol === "http:",
    allowNavigation: [serverOrigin.hostname],
  },
};

export default config;