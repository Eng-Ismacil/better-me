"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import { SupportMessage, ConversationSummary } from "@/lib/support";
import AdminPageHeader from "@/components/admin/design-system/AdminPageHeader";
import AdminKpiCard from "@/components/admin/design-system/AdminKpiCard";

interface AdminSupportClientProps {
  adminUser: {
    id: string;
    name: string;
    email: string;
  };
}

interface AllUserItem {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export default function AdminSupportClient({ adminUser }: AdminSupportClientProps) {
  const { language } = useTranslation();
  const so = language === "so";

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedUser, setSelectedUser] = useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [searchConvQuery, setSearchConvQuery] = useState("");

  // New Chat Modal state
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<AllUserItem[]>([]);
  const [searchNewUserQuery, setSearchNewUserQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Fetch conversations list
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/support?summary=true");
      const data = await res.json();
      if (res.ok && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
      }
    } catch {
      // Ignored
    } finally {
      setLoadingList(false);
    }
  }, []);

  // 2. Fetch messages for selected user
  const loadMessages = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/support?userId=${userId}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch {
      // Ignored
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Polling setup
  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedUser) return;
    loadMessages(selectedUser.userId);
    const interval = setInterval(() => {
      loadMessages(selectedUser.userId);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedUser, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Aggregate Metrics
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadForAdminCount || 0), 0);
  }, [conversations]);

  // Load all users for the "New Chat" modal
  const openNewChatModal = async () => {
    setNewChatModalOpen(true);
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && Array.isArray(data.users)) {
        setAllUsers(
          data.users.map((u: { id?: string; _id?: string; name: string; email: string; avatarUrl?: string }) => ({
            id: u.id || u._id || "",
            name: u.name,
            email: u.email,
            avatarUrl: u.avatarUrl,
          }))
        );
      }
    } catch {
      // Ignored
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSelectUserFromModal = (user: AllUserItem) => {
    const existing = conversations.find((c) => c.userId === user.id);
    if (existing) {
      setSelectedUser(existing);
    } else {
      const newSummary: ConversationSummary = {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userAvatar: user.avatarUrl || "/images/avatar.jpg",
        lastMessage: so ? "Wadahadal cusub" : "New conversation",
        lastMessageAt: new Date().toISOString(),
        unreadForAdminCount: 0,
      };
      setConversations((prev) => [newSummary, ...prev]);
      setSelectedUser(newSummary);
    }
    setNewChatModalOpen(false);
    setSearchNewUserQuery("");
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        so
          ? "Kaliya faylasha sawirrada ah (JPG, PNG, WebP) ayaa la ogolyahay!"
          : "Only image files (JPG, PNG, WebP) are supported."
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setError("");
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/support/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sawirka lama soo gelin karin");

      setPendingImageUrl(data.url);
    } catch (err) {
      setError((err as Error).message);
      setPendingImageUrl(null);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if ((!inputText.trim() && !pendingImageUrl) || sending || uploadingImage) return;

    setSending(true);
    setError("");

    const textToSend = inputText.trim();
    const imageToSend = pendingImageUrl;

    const tempId = `admin_temp_${Date.now()}`;
    const optimisticMsg: SupportMessage = {
      _id: tempId,
      conversationId: selectedUser.userId,
      userId: selectedUser.userId,
      userName: selectedUser.userName,
      userEmail: selectedUser.userEmail,
      userAvatar: selectedUser.userAvatar,
      senderId: adminUser.id,
      senderRole: "admin",
      senderName: adminUser.name || "BetterMe Support",
      text: textToSend,
      imageUrl: imageToSend || undefined,
      readByAdmin: true,
      readByUser: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");
    setPendingImageUrl(null);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: selectedUser.userId,
          text: textToSend,
          imageUrl: imageToSend,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Farriinta lama diri karin");

      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? data.message : m))
      );

      loadConversations();
    } catch (err) {
      setError((err as Error).message);
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter(
      (c) =>
        c.userName.toLowerCase().includes(searchConvQuery.toLowerCase()) ||
        c.userEmail.toLowerCase().includes(searchConvQuery.toLowerCase())
    );
  }, [conversations, searchConvQuery]);

  const filteredAllUsers = useMemo(() => {
    return allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(searchNewUserQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchNewUserQuery.toLowerCase())
    );
  }, [allUsers, searchNewUserQuery]);

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Layer 1: Page Header */}
      <AdminPageHeader
        title={so ? "Taageerada & Wadahadalka Tooska Ah" : "Customer Support & Member Live Chat"}
        subtitle={
          so
            ? "U jawaab macaamiisha, ku xallli su'aalahooda waqtiga dhabta ah, ama adigu u bilow wadahadal cusub qof kasta."
            : "Deliver real-time concierge assistance to members, review screenshot attachments, and initiate proactive direct chats."
        }
        badges={[
          { label: so ? "Wadahadallo" : "Active Inquiries", value: conversations.length, variant: "blue" },
          { label: so ? "Aan La Akhriyin" : "Unread", value: totalUnreadCount, variant: totalUnreadCount > 0 ? "danger" : "success" },
          { label: "Status", value: "Desk Online", variant: "success" },
        ]}
        actions={
          <button
            type="button"
            onClick={openNewChatModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B6EF3] text-white text-[13px] font-bold hover:bg-[#0958c7] shadow-sm transition-all cursor-pointer"
          >
            <Icon name="add_comment" size={17} />
            <span>{so ? "Bilow Farriin Cusub" : "Start New Chat"}</span>
          </button>
        }
      />

      {/* Layer 2: Summary Metrics (KPI Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKpiCard
          label={so ? "Wadahadallada Furan" : "Member Conversations"}
          value={conversations.length}
          icon="forum"
          variant="blue"
          subtext={so ? "Isku-geynta xubnaha la hadlay" : "Total established chat channels"}
        />
        <AdminKpiCard
          label={so ? "Farriimaha Aan La Akhriyin" : "Unread Notifications"}
          value={totalUnreadCount}
          icon="mark_chat_unread"
          variant={totalUnreadCount > 0 ? "danger" : "success"}
          subtext={
            totalUnreadCount > 0
              ? so
                ? "Farriimo u baahan jawaab-celin"
                : "Inbound messages awaiting reply"
              : so
                ? "Dhammaan farriimaha waa la akhriyay"
                : "Zero inbox backlog maintained"
          }
        />
        <AdminKpiCard
          label={so ? "Adeegga Tooska Ah" : "Concierge Desk"}
          value="Active (0ms)"
          icon="support_agent"
          variant="success"
          subtext={so ? "Farriimuhu degdeg bay ku dhacayaan" : "Instant SWR message synchronization"}
        />
        <AdminKpiCard
          label={so ? "Sawirrada & Lifaaqyada" : "Attachment Support"}
          value="Enabled"
          icon="image"
          variant="neutral"
          subtext={so ? "PNG, JPG, WebP waa la oggol yahay" : "High-resolution image uploads"}
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

      {/* Layer 3: Main 2-Pane Chat Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden h-[calc(100vh-280px)] min-h-[580px]">
        {/* Left Pane: Conversations List (4 cols) */}
        <div
          className={`md:col-span-4 border-r border-[#E2E8F0] flex flex-col h-full bg-[#F8FAFC] ${
            selectedUser ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search box */}
          <div className="p-3.5 border-b border-[#E2E8F0] bg-white">
            <div className="relative">
              <Icon name="search" size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={so ? "Raadi wadahadal..." : "Search member chats..."}
                value={searchConvQuery}
                onChange={(e) => setSearchConvQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-[#F8FAFC] text-[12px] font-medium outline-none focus:border-[#0B6EF3] focus:bg-white"
              />
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingList ? (
              <div className="p-12 text-center text-slate-400 text-[12px]">
                <Icon name="sync" size={22} className="animate-spin text-[#0B6EF3] mx-auto mb-2" />
                <span>{so ? "Wadahadallada ayaa la soo rarayaa..." : "Syncing conversations..."}</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-[12px] flex flex-col items-center">
                <Icon name="chat" size={32} className="text-slate-300 mb-2" />
                <p className="font-bold text-[#0F172A]">{so ? "Wadahadal ma jiro" : "No chats found"}</p>
                <button
                  type="button"
                  onClick={openNewChatModal}
                  className="mt-3 text-[12px] font-bold text-[#0B6EF3] hover:underline cursor-pointer"
                >
                  {so ? "+ Bilow fariin cusub" : "+ Start new conversation"}
                </button>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = selectedUser?.userId === c.userId;

                return (
                  <button
                    key={c.userId}
                    type="button"
                    onClick={() => {
                      setSelectedUser(c);
                      setLoadingMessages(true);
                    }}
                    className={`w-full p-4 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/70 border-l-4 border-[#0B6EF3]"
                        : "hover:bg-slate-100/70 bg-white"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 relative shrink-0 border border-slate-200 shadow-xs">
                      <Image
                        src={c.userAvatar || "/images/avatar.jpg"}
                        alt={c.userName}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-[13px] font-bold text-[#0F172A] truncate">
                          {c.userName}
                        </h4>
                        {c.unreadForAdminCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-[#0B6EF3] text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                            {c.unreadForAdminCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#64748B] truncate mt-0.5 font-medium">{c.lastMessage}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Conversation (8 cols) */}
        <div
          className={`md:col-span-8 flex flex-col h-full bg-white ${
            selectedUser ? "flex" : "hidden md:flex"
          }`}
        >
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-3.5 border-b border-[#E2E8F0] bg-white flex items-center justify-between shrink-0 shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="md:hidden w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                  >
                    <Icon name="arrow_back" size={18} />
                  </button>

                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 relative shrink-0 border border-slate-200">
                    <Image
                      src={selectedUser.userAvatar || "/images/avatar.jpg"}
                      alt={selectedUser.userName}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>

                  <div>
                    <h3 className="text-[14px] font-extrabold text-[#0F172A]">
                      {selectedUser.userName}
                    </h3>
                    <p className="text-[11px] text-[#64748B]">{selectedUser.userEmail}</p>
                  </div>
                </div>

                <div className="text-[11px] font-bold bg-[#EFF6FF] text-[#0B6EF3] px-3 py-1 rounded-full border border-[#0B6EF3]/20">
                  ID: {selectedUser.userId.slice(-6)}
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-[#FAFBFD]">
                {loadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                    <Icon name="sync" size={24} className="animate-spin text-[#0B6EF3]" />
                    <span className="text-[12px] font-medium">{so ? "Farriimaha ayaa la soo rarayaa..." : "Loading messages..."}</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-2 text-slate-400">
                    <Icon name="chat_bubble_outline" size={32} />
                    <p className="text-[13px] font-bold text-slate-700">
                      {so ? "Weli farriin ma dhex marin adiga iyo macmiilkan." : "No messages recorded in this channel yet."}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {so ? "Qor farriintaada hoose si aad ula hadasho." : "Send an introductory message to start assisting."}
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.senderRole === "admin";
                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col max-w-[80%] ${
                          isAdmin ? "self-end items-end" : "self-start items-start"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] font-bold text-slate-500">
                            {isAdmin ? "🛡️ BetterMe Support" : msg.userName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatMessageTime(msg.createdAt)}
                          </span>
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-xs ${
                            isAdmin
                              ? "bg-[#0B6EF3] text-white rounded-tr-xs"
                              : "bg-white text-slate-800 rounded-tl-xs border border-slate-200"
                          }`}
                        >
                          {msg.imageUrl && (
                            <div className="mb-2 rounded-xl overflow-hidden border border-black/10 bg-black/5 cursor-pointer">
                              <Image
                                src={msg.imageUrl}
                                alt="Attachment"
                                width={320}
                                height={220}
                                className="object-cover w-full max-h-60 hover:scale-102 transition-transform"
                                onClick={() => setPreviewModalUrl(msg.imageUrl || null)}
                              />
                            </div>
                          )}

                          {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Image Preview Thumbnail */}
              {pendingImageUrl && (
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-300 relative bg-white">
                      <Image src={pendingImageUrl} alt="Preview" fill className="object-cover" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700">
                      {so ? "Sawirka waa la lifaaqay ✓" : "Screenshot attached ✓"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingImageUrl(null)}
                    className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 cursor-pointer"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              )}

              {/* Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3.5 bg-white border-t border-[#E2E8F0] flex items-center gap-2.5 shrink-0"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={uploadingImage || sending}
                  onClick={() => fileInputRef.current?.click()}
                  title={so ? "Lifaaq sawir" : "Attach image"}
                  className="w-10 h-10 rounded-xl text-slate-500 hover:text-[#0B6EF3] hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <Icon name="sync" size={20} className="animate-spin text-[#0B6EF3]" />
                  ) : (
                    <Icon name="image" size={22} />
                  )}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    so
                      ? `U qor farriin ${selectedUser.userName}...`
                      : `Reply directly to ${selectedUser.userName}...`
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] text-slate-900 outline-none focus:border-[#0B6EF3] focus:bg-white transition-all font-medium"
                />

                <button
                  type="submit"
                  disabled={(!inputText.trim() && !pendingImageUrl) || sending || uploadingImage}
                  className="w-10 h-10 rounded-xl bg-[#0B6EF3] hover:bg-[#0958c7] disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
                >
                  {sending ? (
                    <Icon name="sync" size={18} className="animate-spin text-white" />
                  ) : (
                    <Icon name="send" size={18} />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-3 text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#0B6EF3] flex items-center justify-center">
                <Icon name="question_answer" size={32} />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#0F172A]">
                  {so ? "Dooro qof aad la hadasho" : "Select a member conversation"}
                </h3>
                <p className="text-[12px] text-[#64748B] max-w-xs mt-1">
                  {so
                    ? "Dooro mid ka mid ah wadahadallada bidixda, ama guji badhanka 'Farriin Cusub' si aad ula hadasho user kasta."
                    : "Select an inquiry from the left pane or start a new direct chat channel with any registered member."}
                </p>
              </div>
              <button
                type="button"
                onClick={openNewChatModal}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0B6EF3] text-white text-[12px] font-bold hover:bg-[#0958c7] cursor-pointer shadow-xs"
              >
                <Icon name="add_comment" size={16} />
                <span>{so ? "Bilow Farriin Cusub" : "Start New Chat"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* "New Chat" Modal */}
      {newChatModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setNewChatModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-[#E2E8F0] flex flex-col gap-4 max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0B6EF3]/10 text-[#0B6EF3] flex items-center justify-center font-bold">
                  <Icon name="person_add" size={18} />
                </div>
                <h3 className="text-[15px] font-bold text-[#0F172A]">
                  {so ? "Dooro Xubin aad la hadlayso" : "Select Member to Message"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNewChatModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <p className="text-[12px] text-[#64748B] -mt-1">
              {so
                ? "Waxaad si toos ah ula hadli kartaa xubin kasta xitaa haddii aysan hore u furin codsi taageero."
                : "You can reach out proactively to any registered member account."}
            </p>

            <div className="relative">
              <Icon name="search" size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={so ? "Raadi magac ama email..." : "Filter members by name or email..."}
                value={searchNewUserQuery}
                onChange={(e) => setSearchNewUserQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-[#F8FAFC] text-[12px] outline-none focus:border-[#0B6EF3] focus:bg-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[50vh]">
              {loadingUsers ? (
                <div className="p-8 text-center text-slate-400 text-[12px]">
                  <Icon name="sync" size={20} className="animate-spin text-[#0B6EF3] mx-auto mb-2" />
                  <span>{so ? "Xubnaha ayaa la soo rarayaa..." : "Loading directory members..."}</span>
                </div>
              ) : filteredAllUsers.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-[12px]">
                  {so ? "Xubin laguma helin raadinta" : "No matching members found"}
                </div>
              ) : (
                filteredAllUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectUserFromModal(u)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-[#F8FAFC] transition-colors rounded-xl text-left cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 relative shrink-0 border border-slate-200">
                      <Image
                        src={u.avatarUrl || "/images/avatar.jpg"}
                        alt={u.name}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-bold text-[#0F172A] group-hover:text-[#0B6EF3] transition-colors truncate">
                        {u.name}
                      </h4>
                      <p className="text-[11px] text-[#64748B] truncate">{u.email}</p>
                    </div>
                    <Icon name="chevron_right" size={18} className="text-slate-400 group-hover:text-[#0B6EF3] transition-colors" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden bg-black shadow-2xl">
            <Image
              src={previewModalUrl}
              alt="Fullscreen"
              width={800}
              height={600}
              className="object-contain max-h-[85vh] w-auto h-auto"
            />
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 cursor-pointer"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
