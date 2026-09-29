"use client";

import React, { useState, useMemo } from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import AdminPageHeader from "@/components/admin/design-system/AdminPageHeader";
import AdminKpiCard from "@/components/admin/design-system/AdminKpiCard";
import AdminContextBar from "@/components/admin/design-system/AdminContextBar";
import { useAdminAudit } from "@/hooks/useAdminAudit";

interface AuditEntry {
  _id: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
  createdAt: string;
}


export default function AdminAuditClient() {
  const { language } = useTranslation();
  const so = language === "so";

  const [search, setSearch] = useState("");
  const [selectedActionFilter, setSelectedActionFilter] = useState("all");
  const [inspectedEntry, setInspectedEntry] = useState<AuditEntry | null>(null);
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState(1);

  // ── React Query SWR Cache-First ──
  const {
    data,
    isLoading: loading,
    isFetching,
    refetch,
    isError,
  } = useAdminAudit(search, selectedActionFilter, page);

  const logs = data?.logs || [];
  const pagination = data ? { page, limit: 50, total: data.total, pages: data.pages } : { page: 1, limit: 50, total: 0, pages: 1 };
  const error = isError ? "Failed to load audit log" : "";


  // Aggregate stats
  const stats = useMemo(() => {
    const total = pagination.total || logs.length;
    const actors = new Set(logs.map((l) => l.actorEmail)).size;
    const deletions = logs.filter(
      (l) => l.action?.toLowerCase().includes("delete") || l.action?.toLowerCase().includes("purge")
    ).length;
    const updates = logs.filter(
      (l) => l.action?.toLowerCase().includes("update") || l.action?.toLowerCase().includes("patch")
    ).length;
    return { total, actors, deletions, updates };
  }, [logs, pagination]);

  const copyDetailsJson = () => {
    if (!inspectedEntry) return;
    navigator.clipboard.writeText(JSON.stringify(inspectedEntry, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActionBadge = (action: string) => {
    const act = action?.toLowerCase() || "";
    if (act.includes("delete") || act.includes("purge") || act.includes("disable")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          {action}
        </span>
      );
    }
    if (act.includes("create") || act.includes("add") || act.includes("enable")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF3] text-[#10B981] border border-[#10B981]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          {action}
        </span>
      );
    }
    if (act.includes("update") || act.includes("patch") || act.includes("edit")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EFF6FF] text-[#0B6EF3] border border-[#0B6EF3]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0B6EF3]" />
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        {action}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Layer 1: Page Header */}
      <AdminPageHeader
        title={so ? "Diiwaanka Amniga & Audit-ka" : "Security & System Audit Log"}
        subtitle={
          so
            ? "Raad-raaca dhammaan wax ka beddelka maamulka, isbeddellada xuquuqaha iyo xogta nidaamka."
            : "Immutable audit trail tracking administrative access, user mutations, financial entries, and platform changes."
        }
        badges={[
          { label: so ? "Dhacdooyinka" : "Events", value: stats.total, variant: "blue" },
          { label: so ? "Maamulayaasha" : "Operators", value: stats.actors, variant: "neutral" },
          { label: "Status", value: "Verified Active", variant: "success" },
        ]}
        actions={
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={loading || isFetching}
            className="p-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
            title={so ? "Dib u cusboonaysii" : "Refresh audit logs"}
          >
            <Icon name="refresh" size={18} className={loading ? "animate-spin text-[#0B6EF3]" : ""} />
          </button>
        }
      />

      {/* Layer 2: Summary Metrics (KPI Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKpiCard
          label={so ? "Isku-geynta Dhacdooyinka" : "Total Audited Events"}
          value={stats.total}
          icon="manage_search"
          variant="blue"
          subtext={so ? "Dhammaan ficillada la qoray" : "Recorded administrative actions"}
        />
        <AdminKpiCard
          label={so ? "Ficillada Wax Ka Beddelka" : "System Mutations"}
          value={stats.updates}
          icon="edit_note"
          variant="warning"
          subtext={so ? "Isbeddellada xogta nidaamka" : "Configurations and profile edits"}
        />
        <AdminKpiCard
          label={so ? "Tirtiridda & Xayiraadda" : "Destructive Mutations"}
          value={stats.deletions}
          icon="delete_forever"
          variant="danger"
          subtext={so ? "Tirtiridda iyo joojinta xubnaha" : "Deletions, purges, and bans"}
        />
        <AdminKpiCard
          label={so ? "Maamulayaasha Diiwaangashan" : "Active Operators"}
          value={stats.actors}
          icon="admin_panel_settings"
          variant="success"
          subtext={so ? "Emails-ka maamulka ee firfircoon" : "Unique administrator accounts"}
        />
      </div>

      {/* Alert Error */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 text-[#EF4444] text-[13px] font-medium flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Icon name="error" size={20} />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => void refetch()} className="cursor-pointer text-[#EF4444]">
            <Icon name="close" size={18} />
          </button>
        </div>
      )}

      {/* Layer 3: Context Toolbar */}
      <AdminContextBar
        searchPlaceholder={so ? "Raadi action, email ama entity..." : "Filter by operator email, action, or entity..."}
        searchValue={search}
        onSearchChange={setSearch}
        filterTabs={[
          { key: "all", label: so ? "Dhammaan" : "All Events", count: logs.length },
          { key: "update", label: so ? "Wax Ka Beddel" : "Updates" },
          { key: "delete", label: so ? "Tirtirid" : "Deletions" },
        ]}
        activeTab={selectedActionFilter}
        onTabChange={setSelectedActionFilter}
      />

      {/* Layer 4: Main Log Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3.5 pl-5 pr-3">{so ? "Waqtiga" : "Timestamp"}</th>
                <th className="px-4 py-3.5">{so ? "Maamulaha (Operator)" : "Operator"}</th>
                <th className="px-4 py-3.5">{so ? "Ficilka" : "Action"}</th>
                <th className="px-4 py-3.5">{so ? "Qaybta (Entity)" : "Target Entity"}</th>
                <th className="px-4 py-3.5">{so ? "Xogta Gaaban" : "Summary"}</th>
                <th className="py-3.5 pl-4 pr-5 text-right">{so ? "Baar" : "Inspect"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[13px] text-[#64748B]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Icon name="sync" size={24} className="animate-spin text-[#0B6EF3]" />
                      <span className="font-semibold">{so ? "Diiwaanka ayaa la soo rarayaa..." : "Streaming audit log entries..."}</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center gap-2 text-[#64748B]">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                        <Icon name="history_toggle_off" size={26} />
                      </div>
                      <p className="text-[14px] font-bold text-[#0F172A]">
                        {so ? "Diiwaan lama helin" : "No audit entries recorded"}
                      </p>
                      <p className="text-[12px] text-[#64748B]">
                        {so
                          ? "Ficillada maamulka ee la sameeyo ayaa si toos ah halkan loogu qori doonaa."
                          : "Administrative actions performed across the app will stream here in real-time."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const detailsPreview = log.details ? JSON.stringify(log.details) : "";

                  return (
                    <tr
                      key={log._id}
                      onClick={() => setInspectedEntry(log)}
                      className="group hover:bg-[#F8FAFC]/80 transition-colors cursor-pointer"
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 pl-5 pr-3 whitespace-nowrap text-[12px] text-[#64748B]">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#0F172A]">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </span>
                        </div>
                      </td>

                      {/* Operator */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#0B6EF3]/10 text-[#0B6EF3] flex items-center justify-center text-[11px] font-bold shrink-0">
                            {log.actorEmail ? log.actorEmail[0].toUpperCase() : "A"}
                          </div>
                          <span className="text-[13px] font-medium text-[#0F172A] truncate max-w-[180px]">
                            {log.actorEmail || "System Admin"}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Entity */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
                          <Icon name="dataset" size={14} className="text-slate-400" />
                          <span className="capitalize">{log.entityType}</span>
                        </span>
                      </td>

                      {/* Summary */}
                      <td className="px-4 py-3.5">
                        <div className="text-[12px] text-[#64748B] max-w-xs truncate font-mono text-[11px]">
                          {log.entityId && <span className="text-slate-400 mr-1.5">ID:{log.entityId.slice(0, 8)}…</span>}
                          {detailsPreview ? detailsPreview.slice(0, 50) : "—"}
                        </div>
                      </td>

                      {/* Inspect button */}
                      <td className="py-3.5 pl-4 pr-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedEntry(log);
                          }}
                          className="w-8 h-8 rounded-lg text-[#64748B] hover:text-[#0B6EF3] hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer ml-auto"
                          title={so ? "Baar faahfaahinta" : "Inspect payload"}
                        >
                          <Icon name="data_object" size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Layer 5: Detail Inspector Drawer */}
      {inspectedEntry && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setInspectedEntry(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-[#E2E8F0] flex flex-col animate-in slide-in-from-right duration-250">
              {/* Header */}
              <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0B6EF3]/10 text-[#0B6EF3] flex items-center justify-center font-bold">
                    <Icon name="data_object" size={18} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#0F172A]">
                      {so ? "Baarista Dhacdada (Event Payload)" : "Audit Event Inspector"}
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      {so ? "Xogta buuxda ee ficilka la diiwaangeliyay" : "Complete cryptographic event telemetry"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedEntry(null)}
                  className="w-8 h-8 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              {/* Inspector Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Meta Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {so ? "Maamulaha" : "Operator"}
                    </span>
                    <span className="text-[13px] font-bold text-[#0F172A] block mt-1 truncate">
                      {inspectedEntry.actorEmail}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {so ? "Waqtiga Saxda Ah" : "Timestamp"}
                    </span>
                    <span className="text-[13px] font-bold text-[#0F172A] block mt-1 truncate">
                      {new Date(inspectedEntry.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {so ? "Ficilka" : "Action"}
                    </span>
                    <div className="mt-1">{getActionBadge(inspectedEntry.action)}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {so ? "Entity Type & ID" : "Entity Reference"}
                    </span>
                    <span className="text-[13px] font-bold text-[#0F172A] block mt-1 capitalize truncate">
                      {inspectedEntry.entityType} {inspectedEntry.entityId ? `(#${inspectedEntry.entityId.slice(0, 8)})` : ""}
                    </span>
                  </div>
                </div>

                {/* Raw JSON Block */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-bold text-[#0F172A]">
                      {so ? "Xogta JSON (Raw Details Payload)" : "Structured Details Payload"}
                    </span>
                    <button
                      type="button"
                      onClick={copyDetailsJson}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-[#0F172A] rounded-lg transition-colors cursor-pointer"
                    >
                      <Icon name={copied ? "check" : "content_copy"} size={14} />
                      <span>{copied ? (so ? "Waa la koobiyay!" : "Copied!") : so ? "Koobi JSON" : "Copy JSON"}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0F172A] text-emerald-400 font-mono text-[12px] overflow-x-auto leading-relaxed shadow-inner">
                    <pre>{JSON.stringify(inspectedEntry.details || {}, null, 2)}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
