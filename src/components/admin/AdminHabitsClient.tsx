"use client";

import React, { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

interface AdminHabit {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  category?: string;
  status?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  currentStreak?: number;
  totalCompletions?: number;
  frequency?: string;
  icon?: string;
}

export default function AdminHabitsClient() {
  const { language } = useTranslation();
  const so = language === "so";
  const [habits, setHabits] = useState<AdminHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminHabit | null>(null);
  const [form, setForm] = useState({ name: "", description: "", status: "active", category: "health" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      const res = await fetch(`/api/admin/habits?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load habits");
      const list = (data.habits || data || []).map((h: AdminHabit) => ({
        ...h,
        id: h.id || h._id || "",
      }));
      setHabits(list);
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

  const openEdit = (h: AdminHabit) => {
    setEditing(h);
    setForm({
      name: h.name || "",
      description: h.description || "",
      status: h.status || "active",
      category: h.category || "health",
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/habits/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(so ? "Tirtir caadadan?" : "Delete this habit?")) return;
    try {
      const res = await fetch(`/api/admin/habits/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-extrabold text-[#111827] font-[family-name:var(--font-headline)]">
          {so ? "Caadooyinka & Hawlaha" : "Habits / Tasks"}
        </h1>
        <p className="text-[13px] text-[#667085] mt-1">
          {so
            ? "Maamul dhammaan caadooyinka isticmaalayaasha."
            : "Manage habits and tasks across all users."}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 text-[#EF4444] text-[13px] font-semibold">
          {error}
        </div>
      )}

      <div className="relative">
        <Icon
          name="search"
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={so ? "Raadi caado ama isticmaale..." : "Search habit or user..."}
          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#E7ECF3] bg-white text-[13px] outline-none focus:border-[#0B6EF3]"
        />
      </div>

      <div className="bg-white rounded-2xl border border-[#E7ECF3] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-[#FAFBFD] border-b border-[#E7ECF3]">
              <tr className="text-[11px] uppercase tracking-wider text-[#667085]">
                <th className="px-4 py-3 font-bold">{so ? "Caado" : "Habit"}</th>
                <th className="px-4 py-3 font-bold">{so ? "Isticmaale" : "Owner"}</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Streak</th>
                <th className="px-4 py-3 font-bold text-right">{so ? "Ficillo" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[13px] text-[#667085]">
                    {so ? "Waa la rarayaa..." : "Loading..."}
                  </td>
                </tr>
              ) : habits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[13px] text-[#667085]">
                    {so ? "Caado lama helin" : "No habits found"}
                  </td>
                </tr>
              ) : (
                habits.map((h) => (
                  <tr key={h.id} className="border-b border-[#F0F2F5] hover:bg-[#FAFBFD]/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#0B6EF3] flex items-center justify-center">
                          <Icon name={h.icon || "task_alt"} size={16} />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#111827]">{h.name}</p>
                          <p className="text-[11px] text-[#667085]">{h.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[12px] font-semibold text-[#111827]">
                        {h.userName || "—"}
                      </p>
                      <p className="text-[11px] text-[#667085]">{h.userEmail || h.userId}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold uppercase text-[#667085]">
                        {h.status || "active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] font-bold text-[#EA580C]">
                      {h.currentStreak ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(h)}
                          className="w-8 h-8 rounded-lg hover:bg-[#EFF6FF] text-[#0B6EF3] flex items-center justify-center cursor-pointer"
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(h.id)}
                          className="w-8 h-8 rounded-lg hover:bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center cursor-pointer"
                        >
                          <Icon name="delete" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer"
            onClick={() => setEditing(null)}
            aria-label="Close"
          />
          <form
            onSubmit={save}
            className="relative bg-white rounded-2xl border border-[#E7ECF3] p-5 w-full max-w-md flex flex-col gap-4 shadow-2xl"
          >
            <h3 className="text-[16px] font-bold text-[#111827]">
              {so ? "Tafatir Caado" : "Edit Habit"}
            </h3>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold">Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] bg-[#FAFBFD] text-[13px] outline-none focus:border-[#0B6EF3]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold">Description</span>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] bg-[#FAFBFD] text-[13px] outline-none focus:border-[#0B6EF3] resize-none"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold">Category</span>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] text-[13px] outline-none"
                >
                  <option value="health">Health</option>
                  <option value="learning">Learning</option>
                  <option value="fitness">Fitness</option>
                  <option value="mindfulness">Mindfulness</option>
                  <option value="productivity">Productivity</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold">Status</span>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                  className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] text-[13px] outline-none"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E7ECF3] text-[13px] font-bold cursor-pointer"
              >
                {so ? "Jooji" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#0B6EF3] text-white text-[13px] font-bold disabled:opacity-50 cursor-pointer"
              >
                {saving ? "..." : so ? "Keydi" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
