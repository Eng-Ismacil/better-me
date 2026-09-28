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
  const [notifications, setNotifications] = useState<AppNotification[]>(
    initialNotifications
  );
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [markingAll, setMarkingAll] = useState(false);

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
              ? language === "so"
                ? `Waxaad leedahay ${unreadCount} wargelin oo cusub`
                : `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : language === "so"
              ? "Dhammaan wargelintu waa la aqriyay"
              : "All caught up on notifications"}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={markingAll}
            className="px-4 py-2 rounded-xl bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[12px] font-semibold text-[#007AFF] flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Icon name="done_all" size={16} />
            <span>{t("btn_mark_all_read")}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
            filter === "all"
              ? "bg-[#007AFF] text-white"
              : "bg-white text-[#667085] border border-[#E5E7EB]"
          }`}
        >
          {language === "so" ? "Dhammaan" : "All"} ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
            filter === "unread"
              ? "bg-[#007AFF] text-white"
              : "bg-white text-[#667085] border border-[#E5E7EB]"
          }`}
        >
          {language === "so" ? "Aan La Akhrin" : "Unread"} ({unreadCount})
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
              {language === "so"
                ? "Digniinaha iyo warbixinnada ku saabsan streak-gaaga iyo caadooyinkaaga halkan ayaa lagu soo bandhigi doonaa."
                : "Real-time updates about your streaks, routines, and achievements will appear here."}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const style = getIconForType(item.type);
            return (
              <div
                key={item._id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 ${
                  !item.read
                    ? "bg-white border-[#007AFF]/30 shadow-xs"
                    : "bg-white/80 border-[#E5E7EB] opacity-80"
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
                        <span>{language === "so" ? "Fiiri" : "View"}</span>
                        <Icon name="arrow_forward" size={14} />
                      </Link>
                    )}

                    {!item.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(item._id)}
                        className="text-[11px] text-[#667085] hover:text-[#101010] font-medium"
                      >
                        {language === "so" ? "Calaamadee in la akhriyay" : "Mark as read"}
                      </button>
                    )}
                  </div>
                </div>

                {!item.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#007AFF] shrink-0 mt-1" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
