"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import AdminPageHeader from "@/components/admin/design-system/AdminPageHeader";
import AdminKpiCard from "@/components/admin/design-system/AdminKpiCard";
import AdminContextBar from "@/components/admin/design-system/AdminContextBar";

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

const TEMPLATES = [
  {
    label: "🎉 App Update",
    labelSo: "🎉 Cusboonaysiin Cusub",
    title: "Exciting New Features Are Live!",
    titleSo: "Astaamo Cusub oo Xiiso Leh Ayaa Soo Kordhay!",
    message: "We've just rolled out performance optimizations, streak insights, and smooth habit tracking. Check them out today!",
    messageSo: "Waxaan hadda soo kordhinnay xawaare dheeraad ah, falanqaynta streak-yada iyo dabagalka caadooyinka. Tijaabi maanta!",
  },
  {
    label: "🔥 Consistency Reminder",
    labelSo: "🔥 Xusuusin Streak",
    title: "Don't Break Your Streak Today!",
    titleSo: "Ha Jabin Streak-gaaga Maanta!",
    message: "Small daily habits lead to massive long-term success. Take 2 minutes to check off your routine.",
    messageSo: "Caadooyinka yaryar ee maalinlaha ahi waxay keenaan guul weyn. Qaado 2 daqiiqo si aad u dhammaystirto jadwalkaaga.",
  },
  {
    label: "🛠️ Maintenance Notice",
    labelSo: "🛠️ Ogeysiis Dayactir",
    title: "Scheduled System Maintenance",
    titleSo: "Dayactir Qorshaysan oo Nidaamka Ah",
    message: "BetterMe will undergo a brief 15-minute maintenance window tonight. Your habits and streaks are safe.",
    messageSo: "BetterMe waxaa lagu samayn doonaa dayactir gaaban oo 15 daqiiqo ah caawa. Caadooyinkaaga iyo streak-yadaadu waa ammaan.",
  },
];

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
  const [historySearch, setHistorySearch] = useState("");
  const [inspectItem, setInspectItem] = useState<BroadcastHistory | null>(null);

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

  const filteredUsers = useMemo(() => {
    return usersList.filter(
      (u) =>
        u.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchUserQuery.toLowerCase())
    );
  }, [usersList, searchUserQuery]);

  const selectedUserObj = usersList.find((u) => u.id === selectedUserId);

  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return history;
    const q = historySearch.toLowerCase();
    return history.filter(
      (h) =>
        h.title.toLowerCase().includes(q) ||
        h.message.toLowerCase().includes(q) ||
        h.sentBy?.toLowerCase().includes(q)
    );
  }, [history, historySearch]);

  const totalRecipientsReached = useMemo(() => {
    return history.reduce((acc, h) => acc + (h.recipientCount || 0), 0);
  }, [history]);

  const applyTemplate = (tmpl: (typeof TEMPLATES)[0]) => {
    setTitle(so ? tmpl.titleSo : tmpl.title);
    setMessage(so ? tmpl.messageSo : tmpl.message);
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    if (targetMode === "single" && !selectedUserId) {
      setError(
        so
          ? "Fadlan dooro xubinta aad farriinta tooska ah u dirayso."
          : "Please select the specific member you wish to notify."
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
      if (!res.ok) throw new Error(data.error || "Failed to dispatch notification");

      setSuccess(
        targetMode === "single"
          ? so
            ? `Farriinta tooska ah waxaa loo diray sanduuqa wargelinta ee ${selectedUserObj?.name || "xubinta"}.`
            : `Direct message delivered to ${selectedUserObj?.name || "member"}'s notification tray.`
          : so
          ? `Ogeysiiska waxaa loo faafiyay dhammaan ${data.recipientCount} xubnood!`
          : `Broadcast dispatched successfully to ${data.recipientCount} active members!`
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
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Layer 1: Page Header */}
      <AdminPageHeader
        title={so ? "Xarunta Wargelinta & Farriimaha" : "Broadcast & Notification Dispatch"}
        subtitle={
          so
            ? "U dir wargelin toos ah dhammaan xubnaha ama qof gaar ah oo sanduuqa in-app-ka ugu dhacaysa."
            : "Compose rich in-app announcements, streak nudges, and urgent notifications directly into member trays."
        }
        badges={[
          { label: so ? "La Diray" : "Dispatched", value: history.length, variant: "blue" },
          { label: so ? "Xubnaha Gaadhay" : "Audience Reach", value: totalRecipientsReached, variant: "success" },
          { label: "Status", value: "Ready", variant: "neutral" },
        ]}
        actions={
          <button
            type="button"
            onClick={() => {
              loadHistory();
              loadUsers();
            }}
            className="p-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer"
            title={so ? "Dib u cusboonaysii" : "Refresh data"}
          >
            <Icon name="refresh" size={18} />
          </button>
        }
      />

      {/* Layer 2: Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKpiCard
          label={so ? "Farriimihii La Diray" : "Total Campaigns"}
          value={history.length}
          icon="campaign"
          variant="blue"
          subtext={so ? "Dhammaan ogeysiisyada diiwaangashan" : "Dispatched in-app broadcasts"}
        />
        <AdminKpiCard
          label={so ? "Isku-geynta Dhageystayaasha" : "Total Member Reach"}
          value={totalRecipientsReached}
          icon="groups"
          variant="success"
          subtext={so ? "Xubnaha heley ogeysiisyadan" : "Cumulative recipient deliveries"}
        />
        <AdminKpiCard
          label={so ? "Xubnaha Diyaar ah" : "Audience Pool"}
          value={usersList.length}
          icon="mark_email_read"
          variant="warning"
          subtext={so ? "Akoonnada ka diiwaangashan nidaamka" : "Active directory members"}
        />
        <AdminKpiCard
          label={so ? "Channels-ka Shaqaynaya" : "Delivery Channels"}
          value="In-App + Email"
          icon="hub"
          variant="neutral"
          subtext={so ? "Sanduuqa App-ka iyo Resend API" : "In-app notifications + Resend"}
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

      {success && (
        <div className="p-4 rounded-xl bg-[#ECFDF3] border border-[#10B981]/25 text-[#059669] text-[13px] font-medium flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Icon name="check_circle" size={20} />
            <span>{success}</span>
          </div>
          <button type="button" onClick={() => setSuccess("")} className="cursor-pointer text-[#059669]">
            <Icon name="close" size={18} />
          </button>
        </div>
      )}

      {/* Layer 3 & 4: Dispatch Studio & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dispatch Studio (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <form
            onSubmit={send}
            className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs flex flex-col gap-5"
          >
            {/* Header of Form */}
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0B6EF3]/10 text-[#0B6EF3] flex items-center justify-center font-bold">
                  <Icon name="send" size={17} />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-[#0F172A]">
                    {so ? "Qor Farriin Cusub" : "Compose Dispatch"}
                  </h2>
                  <p className="text-[12px] text-[#64748B]">
                    {so ? "U dir wargelin gaar ah ama mid guud" : "Create notification payload"}
                  </p>
                </div>
              </div>

              {/* Template quick pills */}
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#64748B] mr-1">
                  {so ? "Tusaalooyin:" : "Templates:"}
                </span>
                {TEMPLATES.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-[#0F172A] rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    {so ? t.labelSo : t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience Segment */}
            <div>
              <label className="text-[12px] font-bold text-[#0F172A] block mb-2">
                {so ? "Dhageystayaasha Loo Dirayo" : "Audience Scope"}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTargetMode("all");
                    setSelectedUserId("");
                  }}
                  className={`py-3 px-4 rounded-xl border text-[13px] font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    targetMode === "all"
                      ? "bg-[#0B6EF3] text-white border-[#0B6EF3] shadow-sm"
                      : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-white"
                  }`}
                >
                  <Icon name="groups" size={19} />
                  <span>{so ? "Dhammaan Dadka (All Users)" : "Broadcast to Everyone"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetMode("single")}
                  className={`py-3 px-4 rounded-xl border text-[13px] font-bold flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    targetMode === "single"
                      ? "bg-[#0B6EF3] text-white border-[#0B6EF3] shadow-sm"
                      : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-white"
                  }`}
                >
                  <Icon name="person" size={19} />
                  <span>{so ? "Qof Gaar ah (Specific Member)" : "Direct Member Only"}</span>
                </button>
              </div>
            </div>

            {/* Target Member Picker if single */}
            {targetMode === "single" && (
              <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-blue-50/50 border border-[#0B6EF3]/20 animate-in fade-in">
                <label className="text-[12px] font-bold text-[#0F172A] flex items-center gap-2">
                  <Icon name="person_search" size={16} className="text-[#0B6EF3]" />
                  <span>{so ? "Dooro Xubinta Farriinta Tooska ah Heleysa:" : "Select recipient member:"}</span>
                </label>

                <input
                  type="text"
                  placeholder={so ? "Raadi magac ama email..." : "Filter members by name or email..."}
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[12px] outline-none focus:border-[#0B6EF3]"
                />

                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[13px] font-semibold text-[#0F172A] outline-none focus:border-[#0B6EF3] cursor-pointer"
                  required
                >
                  <option value="">{so ? "-- Dooro xubin liiska --" : "-- Select a member from directory --"}</option>
                  {filteredUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>

                {selectedUserObj && (
                  <p className="text-[11px] text-[#059669] font-bold flex items-center gap-1.5 mt-0.5">
                    <Icon name="check_circle" size={14} />
                    <span>
                      {so
                        ? `Farriintu waxay toos ugu dhacaysaa sanduuqa wargelinta ee ${selectedUserObj.name}.`
                        : `Notification will be delivered directly to ${selectedUserObj.name}'s notification tray.`}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Title */}
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold text-[#0F172A]">
                {so ? "Cinwaanka Wargelinta" : "Notification Title"} *
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] font-medium text-[#0F172A] outline-none focus:border-[#0B6EF3] focus:bg-white transition-all"
                placeholder={
                  targetMode === "single"
                    ? so
                      ? "Tusaale: Xusuusin muhiim ah oo ku saabsan akoonkaaga"
                      : "e.g. Important update regarding your account"
                    : so
                    ? "Tusaale: 🎉 Cusboonaysiin cusub ayaa la soo kordhiyay!"
                    : "e.g. 🎉 Exciting new updates are now live!"
                }
              />
            </label>

            {/* Message Body */}
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-bold text-[#0F172A]">
                {so ? "Qoraalka Farriinta" : "Message Body"} *
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] font-medium text-[#0F172A] outline-none focus:border-[#0B6EF3] focus:bg-white resize-none transition-all"
                placeholder={
                  so
                    ? "Halkan ku qor farriinta tooska ugu dhici doonta sanduuqa wargelinta xubnaha..."
                    : "Enter concise, motivating notification content that appears in member inboxes..."
                }
              />
            </label>

            {/* Email dispatch option */}
            <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Icon name="mail" size={18} className="text-[#0B6EF3]" />
                <div>
                  <span className="text-[13px] font-bold text-[#0F172A] block">
                    {so ? "Email Nuqul ah u dir (Resend)" : "Multi-channel Email Dispatch"}
                  </span>
                  <span className="text-[11px] text-[#64748B]">
                    {so ? "Sidoo kale email toos ah ugu dir ciwaanka xubinta" : "Also relay notification to member email via Resend"}
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0B6EF3] focus:ring-[#0B6EF3] cursor-pointer"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending || !title.trim() || !message.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0B6EF3] hover:bg-[#0958c7] text-white text-[13px] font-bold disabled:opacity-50 cursor-pointer transition-all shadow-sm"
            >
              <Icon name="send" size={18} className={sending ? "animate-spin" : ""} />
              <span>
                {sending
                  ? so
                    ? "Waa la dirayaa..."
                    : "Dispatching..."
                  : targetMode === "single"
                  ? so
                    ? "U Dir Xubintan Farriinta"
                    : "Deliver Direct Notification"
                  : so
                  ? `U Faafi Dhammaan (${usersList.length} Xubnood)`
                  : `Dispatch Broadcast (${usersList.length} Members)`}
              </span>
            </button>
          </form>
        </div>

        {/* Right: Live Notification Preview Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon name="smartphone" size={18} className="text-[#0B6EF3]" />
                <h3 className="text-[13px] font-bold text-[#0F172A] uppercase tracking-wider">
                  {so ? "Muuqaalka Xubinta (Live Preview)" : "Member Device Preview"}
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#10B981] border border-[#10B981]/20">
                In-App Card
              </span>
            </div>

            {/* Phone Mockup Frame */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-300 shadow-inner">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0B6EF3] to-[#20C773]" />
                <div className="flex items-start gap-3 mt-1">
                  <div className="w-8 h-8 rounded-full bg-[#0B6EF3]/10 text-[#0B6EF3] flex items-center justify-center shrink-0">
                    <Icon name="notifications_active" size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-[13px] font-bold text-[#0F172A] truncate">
                        {title.trim() || (so ? "Cinwaanka wargelinta..." : "Notification Title...")}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">Just now</span>
                    </div>
                    <p className="text-[12px] text-[#64748B] mt-1 whitespace-pre-wrap leading-relaxed">
                      {message.trim() ||
                        (so
                          ? "Qoraalka farriintaada ayaa halkan ka muuqan doona marka aad wax qorto..."
                          : "Your notification content preview appears here in real-time as you type...")}
                    </p>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-[#0B6EF3] uppercase tracking-wide">
                        BetterMe Alert
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {targetMode === "single"
                          ? selectedUserObj
                            ? `@${selectedUserObj.name}`
                            : "Direct"
                          : "All Members"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#64748B] text-center mt-3">
              {so
                ? "Farriintan waxay toos uga soo bixi doontaa sanduuqa ogeysiisyada ee taleefanka ama kumbuyuutarka xubinta."
                : "This payload renders in the member's notification drawer with instant audio/haptic alert."}
            </p>
          </div>
        </div>
      </div>

      {/* Layer 5: Broadcast Audit Log */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#0F172A] flex items-center justify-center font-bold">
              <Icon name="history" size={18} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#0F172A]">
                {so ? "Diiwaanka Farriimihii La Diray" : "Dispatch Audit History"}
              </h3>
              <p className="text-[12px] text-[#64748B]">
                {so ? "Diiwaanka ogeysiisyadii hore ee loo diray xubnaha" : "Historic logs of broadcast campaigns"}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder={so ? "Raadi farriin hore..." : "Search dispatched history..."}
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[12px] outline-none focus:border-[#0B6EF3] focus:bg-white"
            />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-[#64748B]">
            <Icon name="inbox" size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold">{so ? "Weli ma jiraan farriimo la diray" : "No dispatched notifications found"}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredHistory.map((m) => (
              <div
                key={m._id}
                onClick={() => setInspectItem(m)}
                className="py-3.5 px-3 rounded-xl hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 cursor-pointer group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-[#0F172A] group-hover:text-[#0B6EF3] transition-colors truncate">
                      {m.title}
                    </span>
                    <span className="text-[10px] font-bold text-[#0B6EF3] bg-[#0B6EF3]/10 px-2 py-0.5 rounded-full shrink-0">
                      {m.recipientCount === 1 ? (so ? "1 qof" : "1 user") : `${m.recipientCount} ${so ? "xubnood" : "members"}`}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#64748B] mt-1 line-clamp-1">{m.message}</p>
                  <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-2">
                    <span>{new Date(m.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span>{so ? "Waxaa diray:" : "Sent by:"} <strong className="text-slate-600 font-semibold">{m.sentBy}</strong></span>
                  </p>
                </div>
                <div className="text-slate-400 group-hover:text-[#0B6EF3] shrink-0 p-1">
                  <Icon name="chevron_right" size={18} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspect Item Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setInspectItem(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Icon name="campaign" size={20} className="text-[#0B6EF3]" />
                <h3 className="text-[15px] font-bold text-[#0F172A]">
                  {so ? "Faahfaahinta Wargelinta" : "Campaign Detail"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {so ? "Cinwaanka" : "Title"}
                </span>
                <p className="text-[14px] font-bold text-[#0F172A] mt-0.5">{inspectItem.title}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {so ? "Qoraalka" : "Message"}
                </span>
                <div className="mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {inspectItem.message}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-[12px]">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px] font-semibold">{so ? "Gaadhay" : "Delivered To"}</span>
                  <span className="text-[#0F172A] font-bold text-[13px] mt-0.5 block">
                    {inspectItem.recipientCount} {so ? "Xubnood" : "Members"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px] font-semibold">{so ? "Taariikhda" : "Dispatched At"}</span>
                  <span className="text-[#0F172A] font-bold text-[13px] mt-0.5 block">
                    {new Date(inspectItem.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
