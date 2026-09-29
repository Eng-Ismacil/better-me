"use client";

import React, { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import AdminPageHeader from "@/components/admin/design-system/AdminPageHeader";
import AdminKpiCard from "@/components/admin/design-system/AdminKpiCard";
import BetterMeLogo from "@/components/brand/BetterMeLogo";

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
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Layer 1: Page Header */}
      <AdminPageHeader
        title={so ? "Settings-ka Hawlgalka & Nidaamka" : "Platform Operations & System Settings"}
        subtitle={
          so
            ? "Xakamee xaaladda shaqo ee app-ka, daaran/deminta dayactirka guud, iyo wargelinta xubnaha."
            : "Control platform availability, schedule maintenance windows, customize lock-screen notices, and verify infrastructure health."
        }
        badges={[
          { label: "Platform State", value: settings.enabled ? "Maintenance Mode" : "Online & Nominal", variant: settings.enabled ? "danger" : "success" },
          { label: "Cluster", value: "MongoDB Atlas", variant: "blue" },
        ]}
        actions={
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
            title={so ? "Dib u cusboonaysii" : "Refresh settings"}
          >
            <Icon name="refresh" size={18} className={loading ? "animate-spin text-[#0B6EF3]" : ""} />
          </button>
        }
      />

      {/* Layer 2: Summary Metrics (KPI Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKpiCard
          label={so ? "Xaaladda App-ka" : "Operational Status"}
          value={settings.enabled ? "Maintenance" : "Online 100%"}
          icon={settings.enabled ? "construction" : "cloud_done"}
          variant={settings.enabled ? "warning" : "success"}
          subtext={
            settings.enabled
              ? so
                ? "Xubnaha waxa u muuqda daahdayactir"
                : "Curtain active for standard users"
              : so
                ? "Dhammaan adeegyadu si fiican bay u shaqaynayaan"
                : "All systems fully accessible"
          }
        />
        <AdminKpiCard
          label={so ? "Xuquuqda Adminka" : "Admin Bypass"}
          value="Unrestricted"
          icon="admin_panel_settings"
          variant="blue"
          subtext={so ? "Admins had iyo jeer way geli karaan" : "Privileged routes remain reachable"}
        />
        <AdminKpiCard
          label={so ? "Kaabaha Serverless" : "Serverless Engine"}
          value="Vercel Edge"
          icon="bolt"
          variant="neutral"
          subtext={so ? "0ms cold boot revalidation" : "Instant SWR data revalidation"}
        />
        <AdminKpiCard
          label={so ? "Amniga Xogta" : "Database Sync"}
          value="Connected"
          icon="storage"
          variant="success"
          subtext={so ? "Indexes si buuxda bay u dhisan yihiin" : "Indexes validated and active"}
        />
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 text-[#EF4444] text-[13px] font-medium flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Icon name="error" size={20} />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError("")} className="cursor-pointer text-[#EF4444]">
            <Icon name="close" size={18} />
          </button>
        </div>
      )}

      {saved && (
        <div className="p-4 rounded-xl bg-[#ECFDF3] border border-[#10B981]/25 text-[#059669] text-[13px] font-medium flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Icon name="check_circle" size={20} />
            <span>{so ? "Settings-ka si guul leh ayaa loo keydiyay!" : "System settings saved successfully!"}</span>
          </div>
        </div>
      )}

      {/* Layer 3 & 4: Settings Studio & Live Lock-Screen Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Configuration Form (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <form
            onSubmit={save}
            className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col"
          >
            {/* Maintenance Mode Toggle Header */}
            <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between gap-4 bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                    settings.enabled
                      ? "bg-amber-100 text-amber-700"
                      : "bg-[#0B6EF3]/10 text-[#0B6EF3]"
                  }`}
                >
                  <Icon name={settings.enabled ? "engineering" : "power_settings_new"} size={22} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0F172A]">
                    {so ? "Habka Dayactirka (Maintenance Mode)" : "Global Maintenance Mode"}
                  </h3>
                  <p className="text-[12px] text-[#64748B]">
                    {so
                      ? "Xidh app-ka xubnaha caadiga ah inta dayactirku socdo."
                      : "Restrict member navigation to a maintenance screen while updating."}
                  </p>
                </div>
              </div>

              {/* iOS-Style Toggle Switch */}
              <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  disabled={loading || saving}
                  onChange={(e) =>
                    setSettings((c) => ({ ...c, enabled: e.target.checked }))
                  }
                  className="peer sr-only"
                />
                <div className="w-13 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#0B6EF3]" />
              </label>
            </div>

            {/* Inputs Body */}
            <div className="p-6 space-y-4">
              {settings.enabled && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[12px] flex items-center gap-2.5 font-medium animate-in fade-in">
                  <Icon name="warning" size={18} className="text-amber-600 shrink-0" />
                  <span>
                    {so
                      ? "DIGNIIN: Maintenance mode waa daaran yahay! Isticmaalayaasha caadiga ah ma geli karaan app-ka."
                      : "WARNING: Maintenance mode is ACTIVE! Standard users will see the lock screen."}
                  </span>
                </div>
              )}

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-[#0F172A]">
                  {so ? "Farriinta Ogeysiiska ee Xubnaha" : "Member Lock-Screen Message"}
                </span>
                <textarea
                  value={settings.message}
                  onChange={(e) =>
                    setSettings((c) => ({ ...c, message: e.target.value }))
                  }
                  maxLength={500}
                  rows={4}
                  placeholder={
                    so
                      ? "Waxaan ku jirnaa dayactir degdeg ah si aan khibraddaada BetterMe uga dhigno mid ka sii wanaagsan. Wax yar kaddib dib ugu soo laabo!"
                      : "We are currently optimizing platform infrastructure to make your habit tracking faster and smoother. We will be back shortly!"
                  }
                  className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] font-medium text-[#0F172A] outline-none focus:border-[#0B6EF3] focus:bg-white resize-none transition-all"
                />
                <span className="text-[11px] text-[#64748B] text-right">
                  {settings.message?.length || 0}/500 {so ? "xaraf" : "characters"}
                </span>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold text-[#0F172A]">
                  {so ? "Waqtiga La Filayo Inuu Furmo (Ikhtiyaar)" : "Estimated Return Time (Optional)"}
                </span>
                <input
                  type="datetime-local"
                  value={toLocalInput(settings.endsAt)}
                  onChange={(e) =>
                    setSettings((c) => ({ ...c, endsAt: e.target.value }))
                  }
                  className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] font-medium text-[#0F172A] outline-none focus:border-[#0B6EF3] focus:bg-white"
                />
              </label>

              <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                <span className="text-[11px] text-[#64748B]">
                  {so ? "Isbeddelladu isla markiiba way hirgalayaan" : "Changes take effect immediately across all nodes"}
                </span>
                <button
                  type="submit"
                  disabled={loading || saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B6EF3] text-white text-[13px] font-bold hover:bg-[#0958c7] shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Icon name={saving ? "sync" : "save"} size={16} className={saving ? "animate-spin" : ""} />
                  <span>{saving ? (so ? "Waa la keydinayaa..." : "Applying...") : so ? "Keydi Settings" : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right: Live Member Lock-Screen Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon name="visibility" size={18} className="text-[#0B6EF3]" />
                <h3 className="text-[13px] font-bold text-[#0F172A] uppercase tracking-wider">
                  {so ? "Muuqaalka Xubinta (User Preview)" : "Member Experience Preview"}
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  settings.enabled ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {settings.enabled ? "Maintenance Splash" : "Normal App"}
              </span>
            </div>

            {/* Mockup Frame */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0F172A] to-slate-900 text-white text-center flex flex-col items-center justify-center min-h-[320px] shadow-lg relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 border border-white/10 shadow-inner">
                  <BetterMeLogo size={32} />
                </div>

                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                  <Icon name="engineering" size={18} />
                </div>

                <h4 className="text-[16px] font-extrabold text-white">
                  BetterMe is Updating
                </h4>

                <p className="text-[12px] text-slate-300 mt-2 max-w-xs leading-relaxed px-2">
                  {settings.message?.trim() ||
                    (so
                      ? "Dayactir ayaa socda si adeeggu kuugu noqdo mid fudud oo degdeg ah..."
                      : "We're currently performing scheduled maintenance to enhance your experience...")}
                </p>

                {settings.endsAt && (
                  <div className="mt-4 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-emerald-400 font-bold">
                    Est. Return: {new Date(settings.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                )}
              </div>
            </div>

            <p className="text-[11px] text-[#64748B] text-center mt-3">
              {so
                ? "Xubnaha soo booqda xilliga dayactirka waxay arki doonaan shaashaddan."
                : "Live simulated viewport of what regular members see during maintenance."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}