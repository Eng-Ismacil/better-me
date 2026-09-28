import { connectToDatabase } from "@/lib/db";

export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
  endsAt: string;
  updatedAt: string;
}

const defaultSettings: MaintenanceSettings = {
  enabled: false,
  message: "We are making BetterMe better. Please check back soon.",
  endsAt: "",
  updatedAt: "",
};

let cachedSettings: MaintenanceSettings | null = null;
let cachedAt = 0;

export async function getMaintenanceSettings(): Promise<MaintenanceSettings> {
  if (cachedSettings && Date.now() - cachedAt < 5000) return cachedSettings;

  const { db } = await connectToDatabase();
  const saved = await db
    .collection<MaintenanceSettings & { _id: string }>("appSettings")
    .findOne({ _id: "maintenance" });
  const endsAt = typeof saved?.endsAt === "string" ? saved.endsAt : "";
  const expiry = endsAt ? Date.parse(endsAt) : Number.NaN;

  cachedSettings = {
    enabled: Boolean(saved?.enabled) && (!Number.isFinite(expiry) || expiry > Date.now()),
    message:
      typeof saved?.message === "string" && saved.message.trim()
        ? saved.message.trim()
        : defaultSettings.message,
    endsAt,
    updatedAt: typeof saved?.updatedAt === "string" ? saved.updatedAt : "",
  };
  cachedAt = Date.now();
  return cachedSettings;
}

export function invalidateMaintenanceCache() {
  cachedSettings = null;
  cachedAt = 0;
}