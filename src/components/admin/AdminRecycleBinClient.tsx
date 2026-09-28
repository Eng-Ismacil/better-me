"use client";

import React, { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

interface DeletedUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  deletedAt?: string;
  status?: string;
}

export default function AdminRecycleBinClient() {
  const { language } = useTranslation();
  const so = language === "so";

  const [users, setUsers] = useState<DeletedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const normalize = (u: DeletedUser) => ({
    ...u,
    id: u.id || u._id || "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      const res = await fetch(`/api/admin/recycle-bin?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setUsers((data.users || []).map(normalize));
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

  const restore = async (ids: string[]) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/recycle-bin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restore failed");
      setSelected(new Set());
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const permanentDelete = async (ids: string[]) => {
    if (
      !confirm(
        so
          ? "Tani waa tirtirid joogto ah! Ma hubtaa?"
          : "This permanently deletes users. Are you sure?"
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/recycle-bin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setSelected(new Set());
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const toggleAll = () => {
    if (selected.size === users.length) setSelected(new Set());
    else setSelected(new Set(users.map((u) => u.id)));
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-extrabold text-[#111827] font-[family-name:var(--font-headline)]">
          {so ? "Qashinka (Recycle Bin)" : "Recycle Bin"}
        </h1>
        <p className="text-[13px] text-[#667085] mt-1">
          {so
            ? "Soo celi ama si joogto ah u tirtir isticmaalayaasha la tirtiray."
            : "Restore or permanently delete soft-deleted users."}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 text-[#EF4444] text-[13px] font-semibold flex items-center gap-2">
          <Icon name="error" size={18} />
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={so ? "Raadi magac ama email..." : "Search name or email..."}
          className="flex-1 min-w-[200px] px-3 py-2.5 rounded-xl border border-[#E7ECF3] bg-white text-[13px] outline-none focus:border-[#0B6EF3]"
        />
        {selected.size > 0 && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => restore(Array.from(selected))}
              className="px-3 py-2 rounded-xl bg-[#ECFDF3] text-[#20C773] text-[12px] font-bold border border-[#BBF7D0] cursor-pointer disabled:opacity-50"
            >
              {so ? `Soo celi (${selected.size})` : `Restore (${selected.size})`}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => permanentDelete(Array.from(selected))}
              className="px-3 py-2 rounded-xl bg-[#FEF2F2] text-[#EF4444] text-[12px] font-bold border border-[#FECDD3] cursor-pointer disabled:opacity-50"
            >
              {so ? "Tirtir joogto" : "Delete forever"}
            </button>
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E7ECF3] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[13px] text-[#667085] animate-pulse">
            {so ? "Waa la soo rarayaa..." : "Loading..."}
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-[#667085]">
            {so ? "Qashinku waa madhan yahay" : "Recycle bin is empty"}
          </div>
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#FAFBFD] border-b border-[#E7ECF3]">
              <tr>
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === users.length && users.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                <th className="p-3 font-bold text-[#667085]">{so ? "Magac" : "Name"}</th>
                <th className="p-3 font-bold text-[#667085] hidden sm:table-cell">Email</th>
                <th className="p-3 font-bold text-[#667085] hidden md:table-cell">
                  {so ? "La tirtiray" : "Deleted"}
                </th>
                <th className="p-3 font-bold text-[#667085] text-right">{so ? "Ficil" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[#E7ECF3] last:border-0 hover:bg-[#FAFBFD]">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.has(u.id)}
                      onChange={() => {
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (next.has(u.id)) next.delete(u.id);
                          else next.add(u.id);
                          return next;
                        });
                      }}
                    />
                  </td>
                  <td className="p-3 font-semibold text-[#111827]">{u.name}</td>
                  <td className="p-3 text-[#667085] hidden sm:table-cell">{u.email}</td>
                  <td className="p-3 text-[#667085] hidden md:table-cell text-[12px]">
                    {u.deletedAt ? new Date(u.deletedAt).toLocaleString() : "—"}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => restore([u.id])}
                        className="p-2 rounded-lg text-[#20C773] hover:bg-[#ECFDF3] cursor-pointer"
                        title="Restore"
                      >
                        <Icon name="restore" size={18} />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => permanentDelete([u.id])}
                        className="p-2 rounded-lg text-[#EF4444] hover:bg-[#FEF2F2] cursor-pointer"
                        title="Delete forever"
                      >
                        <Icon name="delete_forever" size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
