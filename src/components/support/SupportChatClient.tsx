"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import { useTranslation } from "@/lib/i18n";
import { SupportMessage } from "@/lib/support";

interface SupportChatClientProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export default function SupportChatClient({ currentUser }: SupportChatClientProps) {
  const { language } = useTranslation();
  const so = language === "so";

  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/support");
      const data = await res.json();
      if (res.ok && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 4 seconds
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict validation: Only image files allowed
    if (!file.type.startsWith("image/")) {
      setError(
        so
          ? "Kaliya faylasha sawirrada ah (JPG, PNG, WebP) ayaa la ogolyahay!"
          : "Only image files (JPG, PNG, WebP) are allowed!"
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setError("");
    setSelectedImageFile(file);
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
      setSelectedImageFile(null);
      setPendingImageUrl(null);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !pendingImageUrl) || sending || uploadingImage) return;

    setSending(true);
    setError("");

    const textToSend = inputText.trim();
    const imageToSend = pendingImageUrl;

    // Optimistic message
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg: SupportMessage = {
      _id: tempId,
      conversationId: currentUser.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userAvatar: currentUser.avatarUrl,
      senderId: currentUser.id,
      senderRole: "user",
      senderName: currentUser.name,
      text: textToSend,
      imageUrl: imageToSend || undefined,
      readByAdmin: false,
      readByUser: true,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");
    setPendingImageUrl(null);
    setSelectedImageFile(null);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSend,
          imageUrl: imageToSend,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Farriinta lama diri karin");

      // Replace optimistic message with actual DB doc
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? data.message : m))
      );
    } catch (err) {
      setError((err as Error).message);
      // Remove failed optimistic msg
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-216px)] sm:h-[calc(100dvh-160px)] md:h-[calc(100vh-120px)] max-w-2xl mx-auto bg-white rounded-3xl border border-[#E7ECF3] shadow-sm overflow-hidden select-none">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-[#E7ECF3] bg-gradient-to-r from-slate-50 to-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#0B6EF3] text-white flex items-center justify-center font-bold shadow-sm">
              <Icon name="support_agent" size={22} />
            </div>
            <span className="w-3 h-3 rounded-full bg-[#10B981] border-2 border-white absolute bottom-0 right-0" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-[14px] font-extrabold text-[#0F172A]">
                {so ? "Taageerada BetterMe (Admin Support)" : "BetterMe Support Team"}
              </h3>
              <span className="text-[10px] font-bold bg-[#EFF6FF] text-[#0B6EF3] px-1.5 py-0.2 rounded-full">
                Online
              </span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              {so
                ? "Nala wadaag su'aalahaaga ama sawirka cilada aad la kulantay."
                : "Ask questions or attach screenshots of issues."}
            </p>
          </div>
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[12px] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Icon name="error" size={16} />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError("")} className="cursor-pointer">
            <Icon name="close" size={16} />
          </button>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
            <Icon name="progress_activity" size={26} className="animate-spin text-[#0B6EF3]" />
            <span className="text-[12px] font-medium">{so ? "Farriimaha ayaa la soo rarayaa..." : "Loading chat history..."}</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-3">
            <div className="w-16 h-16 rounded-3xl bg-[#EFF6FF] text-[#0B6EF3] flex items-center justify-center">
              <Icon name="chat_bubble_outline" size={32} />
            </div>
            <div>
              <h4 className="text-[15px] font-extrabold text-slate-900">
                {so ? "Ku soo dhawoow Support-ka!" : "Welcome to Support Chat!"}
              </h4>
              <p className="text-[12px] text-slate-500 max-w-sm mt-1 leading-relaxed">
                {so
                  ? "Halkan waxaad toos ugula xiriiri kartaa maamulka (Admin). Qor farriintaada ama soo lifaaq sawir (screenshot) si aan kuu caawino."
                  : "Chat directly with BetterMe Admin. Send your message or attach a screenshot image and our team will reply promptly."}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isAdmin = msg.senderRole === "admin";
            return (
              <div
                key={msg._id}
                className={`flex flex-col max-w-[82%] sm:max-w-[75%] ${
                  isAdmin ? "self-start items-start" : "self-end items-end"
                }`}
              >
                {/* Sender Tag */}
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-bold text-slate-500">
                    {isAdmin ? (so ? "🛡️ Admin / Taageerada" : "🛡️ BetterMe Support") : (so ? "Adiga" : "You")}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-2xs ${
                    isAdmin
                      ? "bg-[#F1F5F9] text-slate-800 rounded-tl-sm border border-slate-200/80"
                      : "bg-[#0B6EF3] text-white rounded-tr-sm"
                  }`}
                >
                  {/* Attached Image if present */}
                  {msg.imageUrl && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-black/10 bg-black/5 cursor-pointer">
                      <Image
                        src={msg.imageUrl}
                        alt="Attachment"
                        width={300}
                        height={200}
                        className="object-cover w-full max-h-56 hover:scale-102 transition-transform"
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

      {/* Image Preview Thumbnail before sending */}
      {pendingImageUrl && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-300 relative bg-white">
              <Image src={pendingImageUrl} alt="Preview" fill className="object-cover" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700">
              {so ? "Sawirka waa la lifaaqay ✓" : "Image attached ✓"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setPendingImageUrl(null);
              setSelectedImageFile(null);
            }}
            className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-white border-t border-[#E7ECF3] flex items-center gap-2 shrink-0"
      >
        {/* Hidden File Input for images only */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Attach Image Button */}
        <button
          type="button"
          disabled={uploadingImage || sending}
          onClick={() => fileInputRef.current?.click()}
          title={so ? "Lifaaq sawir (Sawir kaliya)" : "Attach image (Images only)"}
          className="w-10 h-10 rounded-xl text-slate-500 hover:text-[#0B6EF3] hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:opacity-50"
        >
          {uploadingImage ? (
            <Icon name="progress_activity" size={20} className="animate-spin text-[#0B6EF3]" />
          ) : (
            <Icon name="image" size={22} />
          )}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            so
              ? "Qor farriintaada halkan..."
              : "Type your message to admin..."
          }
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAFBFD] text-[13px] text-slate-900 outline-none focus:border-[#0B6EF3] focus:bg-white transition-all"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!inputText.trim() && !pendingImageUrl) || sending || uploadingImage}
          className="w-10 h-10 rounded-xl bg-[#0B6EF3] hover:bg-[#0958c7] disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
        >
          {sending ? (
            <Icon name="progress_activity" size={18} className="animate-spin text-white" />
          ) : (
            <Icon name="send" size={18} />
          )}
        </button>
      </form>

      {/* Lightbox Modal for viewing clicked image */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden bg-black">
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
