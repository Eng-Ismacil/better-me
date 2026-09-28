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

export default function AdminBroadcastClient() {
  const { language } = useTranslation();
  const so = language === "so";

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
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

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), message: message.trim(), sendEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Broadcast failed");
      setSuccess(
        so
          ? `Farriinta waxaa loo diray ${data.recipientCount} isticmaale`
          : `Message sent to ${data.recipientCount} users`
      );
      setTitle("");
      setMessage("");
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
          {so ? "Faafinta Farriimaha" : "Broadcast Messages"}
        </h1>
        <p className="text-[13px] text-[#667085] mt-1">
          {so
            ? "U dir ogeysiis iyo email dhammaan isticmaalayaasha."
            : "Send in-app notifications and optional email to all users."}
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
        className="bg-white rounded-2xl border border-[#E7ECF3] p-5 flex flex-col gap-4"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-bold text-[#111827]">
            {so ? "Cinwaanka" : "Title"}
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] bg-[#FAFBFD] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white"
            placeholder={so ? "Tusaale: Cusbooneysiin cusub" : "e.g. New update available"}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-bold text-[#111827]">
            {so ? "Farriinta" : "Message"}
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            className="px-3 py-2.5 rounded-xl border border-[#E7ECF3] bg-[#FAFBFD] text-[13px] outline-none focus:border-[#0B6EF3] focus:bg-white resize-none"
          />
        </label>
        <label className="flex items-center gap-2 text-[13px] font-semibold text-[#374151]">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="rounded border-[#E7ECF3]"
          />
          {so ? "Sidoo kale email u dir (Resend)" : "Also send via email (Resend)"}
        </label>
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0B6EF3] text-white text-[13px] font-bold hover:bg-[#0958c7] disabled:opacity-50 cursor-pointer"
        >
          <Icon name="send" size={18} />
          {sending ? (so ? "Waa la dirayaa..." : "Sending...") : so ? "Dir Farriinta" : "Send Broadcast"}
        </button>
      </form>

      <section className="bg-white rounded-2xl border border-[#E7ECF3] p-5">
        <h2 className="text-[15px] font-bold text-[#111827] mb-3 flex items-center gap-2">
          <Icon name="history" size={18} className="text-[#667085]" />
          {so ? "Taariikhda" : "Recent Broadcasts"}
        </h2>
        {history.length === 0 ? (
          <p className="text-[13px] text-[#667085] text-center py-6">
            {so ? "Weli ma jiraan faafin" : "No broadcasts yet"}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((m) => (
              <li
                key={m._id}
                className="p-3 rounded-xl border border-[#E7ECF3] bg-[#FAFBFD]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-bold text-[#111827]">{m.title}</p>
                    <p className="text-[12px] text-[#667085] mt-1 line-clamp-2">{m.message}</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#0B6EF3] bg-[#EFF6FF] px-2 py-1 rounded-full shrink-0">
                    {m.recipientCount}
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
