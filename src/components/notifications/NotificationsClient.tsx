"use client";

import React, { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import { AppNotification } from "@/types";

interface NotificationsClientProps {
  initialNotifications: AppNotification[];
}

export default function NotificationsClient({
  initialNotifications,
}: NotificationsClientProps) {
  const { language, t } = useTranslation();
  const so = language === "so";

  const [notifications, setNotifications] = useState<AppNotification[]>(
    initialNotifications
  );
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [markingAll, setMarkingAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id?: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id || "all" }),
      });

      if (!id || id === "all") {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    await handleMarkAsRead("all");
    setMarkingAll(false);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeletingId(id);
    try {
      const res = await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    const confirmMsg = so
      ? "Ma hubtaa inaad tirtirto dhammaan wargelinta?"
      : "Are you sure you want to clear all notifications?";
    if (!window.confirm(confirmMsg)) return;

    setClearingAll(true);
    try {
      const res = await fetch("/api/notifications?id=all", {
        method: "DELETE",
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClearingAll(false);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case "streak":
        return { icon: "local_fire_department", color: "#EF4444", bg: "#FFF1F0" };
      case "achievement":
        return { icon: "emoji_events", color: "#F59E0B", bg: "#FFF7ED" };
      case "reminder":
        return { icon: "alarm", color: "#007AFF", bg: "#EFF6FF" };
      default:
        return { icon: "notifications", color: "#10B981", bg: "#ECFDF5" };
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none max-w-2xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-extrabold text-[#101010] tracking-tight">
            {t("notifications_title")}
          </h2>
          <p className="text-[13px] text-[#667085] mt-1">
            {unreadCount > 0
              ? so
                ? `Waxaad leedahay ${unreadCount} wargelin oo cusub`
                : `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : so
              ? "Dhammaan wargelintu waa la aqriyay"
              : "All caught up on notifications"}
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={markingAll}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[12px] font-semibold text-[#007AFF] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Icon name="done_all" size={16} />
              <span>{t("btn_mark_all_read")}</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={clearingAll}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-[12px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Icon name="delete_sweep" size={16} />
              <span>{clearingAll ? (so ? "Waa la tirtirayaa..." : "Clearing...") : so ? "Nadiifi Dhammaan" : "Clear All"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Support Chat Quick Entry Card */}
      <Link
        href="/support"
        className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#0B6EF3]/[0.08] to-[#0B6EF3]/[0.02] border border-[#0B6EF3]/20 hover:border-[#0B6EF3]/40 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B6EF3] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Icon name="support_agent" size={22} />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-[#0F172A] group-hover:text-[#0B6EF3] transition-colors">
              {so ? "Taageerada Tooska ah (Live Support)" : "Need Help? Chat with Support"}
            </h4>
            <p className="text-[11px] text-[#64748B]">
              {so
                ? "Fariin toos ah u dir adminka ama soo lifaaq sawir."
                : "Chat directly with admin or attach screenshot files."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[12px] font-bold text-[#0B6EF3] pr-2">
          <span>{so ? "Fur Chat-ka" : "Open Chat"}</span>
          <Icon name="arrow_forward" size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
            filter === "all"
              ? "bg-[#007AFF] text-white"
              : "bg-white text-[#667085] border border-[#E5E7EB]"
          }`}
        >
          {so ? "Dhammaan" : "All"} ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
            filter === "unread"
              ? "bg-[#007AFF] text-white"
              : "bg-white text-[#667085] border border-[#E5E7EB]"
          }`}
        >
          {so ? "Aan La Akhrin" : "Unread"} ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#E5E7EB] flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#007AFF] flex items-center justify-center">
              <Icon name="notifications_off" size={28} />
            </div>
            <h4 className="font-bold text-[16px] text-[#101010]">
              {t("no_notifications")}
            </h4>
            <p className="text-[12px] text-[#667085] max-w-sm">
              {so
                ? "Digniinaha iyo warbixinnada ku saabsan streak-gaaga iyo caadooyinkaaga halkan ayaa lagu soo bandhigi doonaa."
                : "Real-time updates about your streaks, routines, and achievements will appear here."}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const style = getIconForType(item.type);
            const isDeleting = deletingId === item._id;

            return (
              <div
                key={item._id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 relative group ${
                  isDeleting ? "opacity-30 pointer-events-none scale-98" : ""
                } ${
                  !item.read
                    ? "bg-white border-[#007AFF]/30 shadow-xs"
                    : "bg-white/80 border-[#E5E7EB] opacity-85 hover:opacity-100"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: style.bg, color: style.color }}
                >
                  <Icon name={style.icon} size={22} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-[14px] text-[#101010] truncate">
                      {item.title}
                    </h4>
                    <span
                      suppressHydrationWarning
                      className="text-[11px] text-[#9CA3AF] shrink-0"
                    >
                      {formatTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#667085] mt-0.5 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    {item.link && (
                      <Link
                        href={item.link}
                        onClick={() => handleMarkAsRead(item._id)}
                        className="text-[12px] font-semibold text-[#007AFF] hover:underline flex items-center gap-1"
                      >
                        <span>{so ? "Fiiri" : "View"}</span>
                        <Icon name="arrow_forward" size={14} />
                      </Link>
                    )}

                    {!item.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(item._id)}
                        className="text-[11px] text-[#667085] hover:text-[#101010] font-medium cursor-pointer"
                      >
                        {so ? "Calaamadee in la akhriyay" : "Mark as read"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Individual Delete Button & Unread Dot */}
                <div className="flex items-center gap-2 shrink-0">
                  {!item.read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#007AFF] shrink-0" />
                  )}

                  <button
                    type="button"
                    onClick={(e) => item._id && handleDelete(item._id, e)}
                    title={so ? "Tirtir wargelintan" : "Delete notification"}
                    aria-label={so ? "Tirtir wargelinta" : "Delete notification"}
                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Icon name="delete_outline" size={17} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
