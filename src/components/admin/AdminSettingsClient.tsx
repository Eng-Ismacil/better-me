"use client";

import React, { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

interface Settings {
  enabled: boolean;
  message: string;
  endsAt: string;
  updatedAt: string;
}

function toLocalInput(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default function AdminSettingsClient() {
  const { language } = useTranslation();
  const so = language === "so";
  const [settings, setSettings] = useState<Settings>({
    enabled: false,
    message: "",
    endsAt: "",
    updatedAt: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load settings");
      setSettings(data.maintenance);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          endsAt: settings.endsAt ? new Date(settings.endsAt).toISOString() : "",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save settings");
      setSettings(data.maintenance);
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <p className="mb-1 text-[12px] font-bold uppercase text-[#B45309]">
          {so ? "Xakamaynta platform-ka" : "Platform operations"}
        </p>
        <h1 className="text-[22px] font-extrabold text-[#111827] font-[family-name:var(--font-headline)]">
          {so ? "Settings-ka maamulka" : "Operations settings"}
        </h1>
        <p className="mt-1 text-[13px] text-[#667085]">
          {so
            ? "Maamul xaaladaha app-ka ee saameeya isticmaalayaasha."
            : "Control platform availability and scheduled maintenance."}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[#EF4444]/20 bg-[#FEF2F2] p-3 text-[13px] font-semibold text-[#B42318]">
          <Icon name="error" size={18} />
          {error}
        </div>
      )}

      <form onSubmit={save} className="overflow-hidden rounded-xl border border-[#E7ECF3] bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-[#E7ECF3] p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF7E8] text-[#B45309]">
              <Icon name="engineering" size={21} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[14px] font-bold text-[#111827]">
                {so ? "Maintenance mode" : "Maintenance mode"}
              </h2>
              <p className="text-[11px] text-[#667085]">
                {so
                  ? "Users-ka caadiga ah waxay arki doonaan ogeysiiska maintenance-ka."
                  : "Regular members see the notice; admins retain panel access."}
              </p>
            </div>
          </div>
          <label className="relative inline-flex shrink-0 cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.enabled}
              disabled={loading || saving}
              onChange={(event) =>
                setSettings((current) => ({ ...current, enabled: event.target.checked }))
              }
              className="peer sr-only"
              aria-label={so ? "Daar maintenance mode" : "Enable maintenance mode"}
            />
            <span className="h-6 w-11 rounded-full bg-[#D0D5DD] transition-colors peer-checked:bg-[#B45309] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#B45309] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
          </label>
        </div>

        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-bold text-[#344054]">
              {so ? "Fariinta users-ka" : "Member notice"}
            </span>
            <textarea
              value={settings.message}
              onChange={(event) =>
                setSettings((current) => ({ ...current, message: event.target.value }))
              }
              maxLength={500}
              rows={3}
              placeholder={so ? "Tusaale: Dayactir ayaan ku jirnaa..." : "We are improving the app..."}
              className="resize-y rounded-lg border border-[#D0D5DD] px-3 py-2.5 text-[13px] outline-none focus:border-[#0B6EF3]"
            />
          </label>
          <label className="flex flex-col gap-1.5 sm:max-w-sm">
            <span className="text-[12px] font-bold text-[#344054]">
              {so ? "Waqtiga la filayo in la furo (ikhtiyaar)" : "Expected return (optional)"}
            </span>
            <input
              type="datetime-local"
              value={toLocalInput(settings.endsAt)}
              onChange={(event) =>
                setSettings((current) => ({ ...current, endsAt: event.target.value }))
              }
              className="rounded-lg border border-[#D0D5DD] px-3 py-2.5 text-[13px] outline-none focus:border-[#0B6EF3]"
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E7ECF3] pt-4">
            <p className="text-[11px] text-[#667085]">
              {loading
                ? so
                  ? "Waa la soo rarayaa..."
                  : "Loading settings..."
                : settings.enabled
                  ? so
                    ? "Maintenance mode waa daaran yahay"
                    : "Maintenance is enabled"
                  : so
                    ? "App-ku waa diyaar"
                    : "App is available"}
            </p>
            <button
              type="submit"
              disabled={loading || saving}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0B6EF3] px-4 text-[12px] font-bold text-white disabled:opacity-50"
            >
              <Icon name={saved ? "check" : "save"} size={16} />
              {saving ? (so ? "Waa la keydinayaa..." : "Saving...") : so ? "Keydi settings" : "Save settings"}
            </button>
          </div>
          {saved && (
            <p role="status" className="text-[12px] font-semibold text-[#168A67]">
              {so ? "Settings-ka waa la keydiyay." : "Settings saved."}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}