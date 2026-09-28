"use client";

import React, { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

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

  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load audit log");
      setLogs(data.logs || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-extrabold text-[#111827] font-[family-name:var(--font-headline)]">
          {so ? "Diiwaanka Audit-ka" : "Audit Log"}
        </h1>
        <p className="text-[13px] text-[#667085] mt-1">
          {so
            ? "Dhammaan ficillada maamulka ee la sameeyay."
            : "Track all admin actions across the platform."}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 text-[#EF4444] text-[13px] font-semibold flex items-center gap-2">
          <Icon name="error" size={18} />
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={so ? "Raadi action, email..." : "Search action, email..."}
          className="flex-1 px-3 py-2.5 rounded-xl border border-[#E7ECF3] bg-white text-[13px] outline-none focus:border-[#0B6EF3]"
        />
        <button
          type="button"
          onClick={load}
          className="px-3 py-2 rounded-xl border border-[#E7ECF3] bg-white text-[12px] font-bold cursor-pointer"
        >
          <Icon name="refresh" size={16} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E7ECF3] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[13px] text-[#667085] animate-pulse">
            {so ? "Waa la soo rarayaa..." : "Loading..."}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-[#667085]">
            {so ? "Weli ma jiraan diiwaan" : "No audit entries yet"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] min-w-[640px]">
              <thead className="bg-[#FAFBFD] border-b border-[#E7ECF3]">
                <tr>
                  <th className="p-3 font-bold text-[#667085]">{so ? "Waqtiga" : "Time"}</th>
                  <th className="p-3 font-bold text-[#667085]">Admin</th>
                  <th className="p-3 font-bold text-[#667085]">Action</th>
                  <th className="p-3 font-bold text-[#667085]">{so ? "Nooca" : "Entity"}</th>
                  <th className="p-3 font-bold text-[#667085] hidden md:table-cell">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="border-b border-[#E7ECF3] last:border-0 hover:bg-[#FAFBFD]"
                  >
                    <td className="p-3 text-[12px] text-[#667085] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 font-medium text-[#111827]">{log.actorEmail}</td>
                    <td className="p-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#0B6EF3] text-[11px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-[#667085]">{log.entityType}</td>
                    <td className="p-3 text-[11px] text-[#9CA3AF] hidden md:table-cell max-w-xs truncate">
                      {log.entityId ? `ID: ${log.entityId}` : ""}
                      {log.details ? ` · ${JSON.stringify(log.details).slice(0, 80)}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
