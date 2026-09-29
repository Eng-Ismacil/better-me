"use client";

import React, { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";

interface BroadcastHistory {
  _id: string;
  title: string;
  message: string;
  sentBy: string;
  recipientCount: number;
  createdAt: string;
}

interface TargetUser {
  id: string;
  name: string;
  email: string;
}

export default function AdminBroadcastClient() {
  const { language } = useTranslation();
  const so = language === "so";

  const [targetMode, setTargetMode] = useState<"all" | "single">("all");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [usersList, setUsersList] = useState<TargetUser[]>([]);
  const [searchUserQuery, setSearchUserQuery] = useState("");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [history, setHistory] = useState<BroadcastHistory[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/broadcast");
      const data = await res.json();
      if (res.ok) setHistory(data.messages || []);
    } catch {
      /* ignore */
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && Array.isArray(data.users)) {
        setUsersList(
          data.users.map((u: { id?: string; _id?: string; name: string; email: string }) => ({
            id: u.id || u._id || "",
            name: u.name,
            email: u.email,
          }))
        );
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadHistory();
    loadUsers();
  }, [loadHistory, loadUsers]);

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  const selectedUserObj = usersList.find((u) => u.id === selectedUserId);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    if (targetMode === "single" && !selectedUserId) {
      setError(
        so
          ? "Fadlan dooro user-ka aad fariinta tooska ah u direyso."
          : "Please select the specific user you want to message."
      );
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");
    try {
      const payload: {
        title: string;
        message: string;
        sendEmail: boolean;
        userIds?: string[];
      } = {
        title: title.trim(),
        message: message.trim(),
        sendEmail,
      };

      if (targetMode === "single" && selectedUserId) {
        payload.userIds = [selectedUserId];
      }

      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send notification");

      setSuccess(
        targetMode === "single"
          ? so
            ? `Farriinta tooska ah waxaa loo diray sanduuqa wargelinta ee ${selectedUserObj?.name || "user-ka"}`
            : `Notification successfully delivered to ${selectedUserObj?.name || "user"}'s inbox`
          : so
          ? `Farriinta waxaa loo diray dhammaan ${data.recipientCount} isticmaale`
          : `Broadcast notification sent to ${data.recipientCount} users`
      );
      setTitle("");
      setMessage("");
      if (targetMode === "single") {
        setSelectedUserId("");
        setSearchUserQuery("");
      }
      await loadHistory();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-extrabold text-[#111827] font-[family-name:var(--font-headline)]">
          {so ? "Wargelinta & Farriimaha Adminka" : "Admin Notifications & Broadcast"}
        </h1>
        <p className="text-[13px] text-[#667085] mt-1">
          {so
            ? "U dir wargelin toos ah dhammaan dadka ama qof gaar ah oo sanduuqa notification-ka ugu dhaceysa."
            : "Send notifications to all users or directly to an individual user's notification box."}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/25 text-[#EF4444] text-[13px] font-semibold flex items-center gap-2">
          <Icon name="error" size={18} />
          {error}
        </div>
      )}
      {success && (
        <div className="p-3.5 rounded-xl bg-[#ECFDF3] border border-[#BBF7D0] text-[#15803D] text-[13px] font-semibold flex items-center gap-2">
          <Icon name="check_circle" size={18} />
          {success}
        </div>
      )}

      <form
        onSubmit={send}
        className="bg-white rounded-2xl border border-[#E7ECF3] p-5 flex flex-col gap-4 shadow-2xs"
      >
        {/* Recipient Target Mode: All Users vs Specific User */}
        <div>
          <label className="text-[12px] font-bold text-[#111827] block mb-2">
            {so ? "Cidda Loo Dirayo (Target Audience)" : "Target Audience"}
          </label>
          <div className="grid grid-cols-2 gap-2 max-w-md">
            <button
              type="button"
              onClick={() => {
                setTargetMode("all");
                setSelectedUserId("");
              }}
              className={`py-2.5 px-3 rounded-xl border text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                targetMode === "all"
                  ? "bg-[#0B6EF3] text-white border-[#0B6EF3] shadow-sm"
                  : "bg-[#FAFBFD] text-[#475467] border-[#E7ECF3] hover:bg-white"
              }`}
            >
              <Icon name="groups" size={18} />
              <span>{so ? "Dhammaan Dadka (All)" : "All Users"}</span>
            </button>

            <button
              type="button"
              onClick={() => setTargetMode("single")}
              className={`py-2.5 px-3 rounded-xl border text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                targetMode === "single"
                  ? "bg-[#0B6EF3] text-white border-[#0B6EF3] shadow-sm"
                  : "bg-[#FAFBFD] text-[#475467] border-[#E7ECF3] hover:bg-white"
              }`}
            >
              <Icon name="person" size={18} />
              <span>{so ? "Qof Gaar ah (Specific User)" : "Specific User"}</span>
            </button>
          </div>
        </div>

        {/* Specific User Selector if in single mode */}
        {targetMode === "single" && (
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <label className="text-[12px] font-bold text-[#0F172A] flex items-center gap-1.5">
              <Icon name="person_search" size={16} className="text-[#0B6EF3]" />
              <span>{so ? "Dooro User-ka farriinta tooska ah loogu dirayo:" : "Select user to send direct notification:"}</span>
            </label>

            <input
              type="text"
              placeholder={so ? "Ku raadi magac ama email..." : "Search by name or email..."}
              value={searchUserQuery}
              onChange={(e) => setSearchUserQuery(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-[12px] outline-none focus:border-[#0B6EF3]"
            />

            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[13px] font-medium outline-none focus:border-[#0B6EF3] cursor-pointer"
              required
            >
              <option value="">{so ? "-- Dooro user liiska --" : "-- Select a user from list --"}</option>
              {filteredUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>

            {selectedUserObj && (
              <p className="text-[11px] text-[#059669] font-semibold flex items-center gap-1">
                <Icon name="check" size={14} />
                <span>
                  {so
                    ? `Farriintu waxay toos ugu dhacaysaa sanduuqa wargelinta ee ${selectedUserObj.name}.`
                    : `Notification will be sent directly to ${selectedUserObj.name}'s notification box.`}
                </span>
              </p>
            )}
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-bold text-[#111827]">
            {so ? "Cinwaanka Wargelinta" : "Notification Title"}
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="px-3.5 py-2.5 rounded-xl border border-[#E7ECF3] bg-[#FAFBFD] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white"
            placeholder={
              targetMode === "single"
                ? so
                  ? "Tusaale: Xusuusin muhiim ah oo ku saabsan akoonkaaga"
                  : "e.g. Important notice regarding your account"
                : so
                ? "Tusaale: Cusbooneysiin cusub ayaa la soo kordhiyay"
                : "e.g. New update available"
            }
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-bold text-[#111827]">
            {so ? "Qoraalka Farriinta" : "Notification Message"}
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            className="px-3.5 py-2.5 rounded-xl border border-[#E7ECF3] bg-[#FAFBFD] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white resize-none"
            placeholder={
              so
                ? "Halkan ku qor farriinta tooska ugu dhici doonta sanduuqa wargelinta..."
                : "Type message that will appear in user's notification box..."
            }
          />
        </label>

        <label className="flex items-center gap-2 text-[13px] font-semibold text-[#374151] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="rounded border-[#E7ECF3] text-[#0B6EF3] cursor-pointer"
          />
          {so ? "Sidoo kale email u dir (Resend)" : "Also send email copy (Resend)"}
        </label>

        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0B6EF3] hover:bg-[#0958c7] text-white text-[13px] font-bold disabled:opacity-50 cursor-pointer transition-all shadow-xs"
        >
          <Icon name="send" size={18} />
          {sending
            ? so
              ? "Waa la dirayaa..."
              : "Sending..."
            : targetMode === "single"
            ? so
              ? "U dir User-ka Wargelinta"
              : "Send User Notification"
            : so
            ? "U faafi Dhammaan Dadka"
            : "Send Broadcast"}
        </button>
      </form>

      <section className="bg-white rounded-2xl border border-[#E7ECF3] p-5 shadow-2xs">
        <h2 className="text-[15px] font-bold text-[#111827] mb-3 flex items-center gap-2">
          <Icon name="history" size={18} className="text-[#667085]" />
          {so ? "Taariikhda Farriimihii La Diray" : "Recent Notification History"}
        </h2>
        {history.length === 0 ? (
          <p className="text-[13px] text-[#667085] text-center py-6">
            {so ? "Weli ma jiraan farriimo la diray" : "No sent notifications yet"}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((m) => (
              <li
                key={m._id}
                className="p-3.5 rounded-xl border border-[#E7ECF3] bg-[#FAFBFD]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-bold text-[#111827]">{m.title}</p>
                    <p className="text-[12px] text-[#667085] mt-1 line-clamp-2">{m.message}</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#0B6EF3] bg-[#EFF6FF] px-2 py-1 rounded-full shrink-0">
                    {m.recipientCount === 1 ? (so ? "1 qof" : "1 user") : `${m.recipientCount} ${so ? "qof" : "users"}`}
                  </span>
                </div>
                <p className="text-[10px] text-[#9CA3AF] mt-2">
                  {new Date(m.createdAt).toLocaleString()} · {m.sentBy}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
