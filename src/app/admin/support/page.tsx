"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

type Message = {
  id: string;
  user_id: string;
  order_id: string | null;
  message: string;
  is_admin: boolean;
  read_at: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  practice_name: string | null;
};

type Conversation = {
  userId: string;
  profile: Profile | null;
  messages: Message[];
  lastMessage: Message;
  unreadCount: number;
};

export default function AdminSupportPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState<string>("");

  useEffect(() => { checkAndLoad(); }, []);

  async function checkAndLoad() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { data: profile } = await supabase
      .from("profiles").select("is_admin").eq("id", user.id).single();
    if (!profile?.is_admin) { router.push("/dashboard"); return; }

    setCurrentAdminId(user.id);
    await loadData();
  }

  async function loadData() {
    const supabase = createClient();

    const { data: messagesData } = await supabase
      .from("support_messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (!messagesData) { setLoading(false); return; }

    const userIds = [...new Set(messagesData.map(m => m.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, practice_name")
      .in("id", userIds);

    const profileMap: Record<string, Profile> = {};
    profilesData?.forEach(p => { profileMap[p.id] = p; });

    // Group by user
    const convMap: Record<string, Message[]> = {};
    messagesData.forEach(msg => {
      if (!convMap[msg.user_id]) convMap[msg.user_id] = [];
      convMap[msg.user_id].push(msg);
    });

    const convList: Conversation[] = Object.entries(convMap).map(([userId, msgs]) => ({
      userId,
      profile: profileMap[userId] || null,
      messages: msgs,
      lastMessage: msgs[msgs.length - 1],
      unreadCount: msgs.filter(m => !m.is_admin && !m.read_at).length,
    })).sort((a, b) =>
      new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    );

    setConversations(convList);
    if (convList.length > 0 && !selectedUserId) {
      setSelectedUserId(convList[0].userId);
    }
    setLoading(false);
  }

  async function sendReply() {
    if (!input.trim() || !selectedUserId) return;
    setSending(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: newMsg } = await supabase
      .from("support_messages")
      .insert({
        user_id: selectedUserId,
        message: input.trim(),
        is_admin: true,
      })
      .select()
      .single();

    if (newMsg) {
      setConversations(prev => prev.map(c =>
        c.userId === selectedUserId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: newMsg }
          : c
      ));
      setInput("");
    }

    setSending(false);
  }

  async function markAsRead(userId: string) {
    const supabase = createClient();
    await supabase.from("support_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_admin", false)
      .is("read_at", null);

    setConversations(prev => prev.map(c =>
      c.userId === userId
        ? { ...c, unreadCount: 0, messages: c.messages.map(m => ({ ...m, read_at: m.read_at || new Date().toISOString() })) }
        : c
    ));
  }

  const selectedConv = conversations.find(c => c.userId === selectedUserId);
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <p className="text-sm text-[#9B9B9B]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Header */}
      <div className="h-14 border-b border-[#E2E0D8] bg-white flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1A1A1A] rounded-sm flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">PC</span>
            </div>
            <span className="font-semibold text-[#1A1A1A]">Print<span className="text-[#2563EB]">Crown</span></span>
          </Link>
          <span className="text-[#E2E0D8]">/</span>
          <span className="text-sm text-[#6B6B6B]">Support</span>
          {totalUnread > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white font-medium">
              {totalUnread} new
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <Link href="/lab" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A]">Lab Queue</Link>
          <Link href="/admin/orders" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A]">Order Management</Link>
        </div>
      </div>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Conversation list */}
        <div className="w-72 border-r border-[#E2E0D8] bg-white overflow-y-auto flex-shrink-0">
          {conversations.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-[#9B9B9B]">No messages yet</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.userId}
                onClick={() => { setSelectedUserId(conv.userId); markAsRead(conv.userId); }}
                className={`w-full text-left p-4 border-b border-[#E2E0D8] hover:bg-[#F8F7F4] transition-all ${
                  selectedUserId === conv.userId ? "bg-[#F8F7F4]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#1A1A1A] truncate">
                      {conv.profile?.practice_name || "Unknown Practice"}
                    </p>
                    <p className="text-xs text-[#9B9B9B] truncate mt-0.5">
                      {conv.lastMessage.message}
                    </p>
                    <p className="text-[10px] text-[#C8C6BE] mt-1">
                      {new Date(conv.lastMessage.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric",
                      })}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#2563EB] text-white font-medium flex-shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Message thread */}
        <div className="flex-1 flex flex-col">
          {selectedConv ? (
            <>
              {/* Thread header */}
              <div className="h-14 border-b border-[#E2E0D8] bg-white flex items-center px-6">
                <div>
                  <p className="font-semibold text-sm text-[#1A1A1A]">
                    {selectedConv.profile?.practice_name || "Unknown Practice"}
                  </p>
                  {selectedConv.profile && (
                    <p className="text-xs text-[#9B9B9B]">
                      Dr. {selectedConv.profile.first_name} {selectedConv.profile.last_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedConv.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.is_admin ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[75%]">
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.is_admin
                          ? "bg-[#1A1A1A] text-white rounded-tr-sm"
                          : "bg-white border border-[#E2E0D8] text-[#1A1A1A] rounded-tl-sm"
                      }`}>
                        {msg.message}
                      </div>
                      <p className={`text-[10px] mt-1 text-[#9B9B9B] ${msg.is_admin ? "text-right" : "text-left"}`}>
                        {msg.is_admin ? "You · " : ""}
                        {new Date(msg.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply input */}
              <div className="border-t border-[#E2E0D8] bg-white p-4">
                <div className="flex gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendReply();
                      }
                    }}
                    placeholder="Type your reply..."
                    rows={2}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-[#E2E0D8] bg-[#F8F7F4] text-[#1A1A1A] text-sm resize-none focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]"
                  />
                  <button
                    onClick={sendReply}
                    disabled={!input.trim() || sending}
                    className="px-5 rounded-xl bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#2A2A2A] transition-all disabled:opacity-40"
                  >
                    {sending ? "..." : "Reply"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-[#9B9B9B]">Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}