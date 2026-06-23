"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { createAppClient } from "@/lib/supabase";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { formatCaseNumberLabel } from "@/lib/case-number";

type Message = {
  id: string;
  user_id: string;
  order_id: string | null;
  message: string;
  is_admin: boolean;
  read_at: string | null;
  created_at: string;
};

type Order = {
  id: string;
  case_number: number | null;
  product_name: string;
  created_at: string;
};

function SupportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    // URL에서 orderId 파라미터 가져오기
    const orderId = searchParams.get("orderId");
    if (orderId) setSelectedOrderId(orderId);
  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function load() {
    const supabase = createAppClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const [{ data: messagesData }, { data: ordersData }] = await Promise.all([
      supabase.from("support_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase.from("orders")
        .select("id, case_number, product_name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    if (messagesData) setMessages(messagesData);
    if (ordersData) setOrders(ordersData);

    // 읽지 않은 어드민 메시지 읽음 처리
    const unread = messagesData?.filter(m => m.is_admin && !m.read_at) || [];
    if (unread.length > 0) {
      await supabase.from("support_messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", unread.map(m => m.id));
    }

    setLoading(false);
  }

  async function sendMessage() {
    if (!input.trim()) return;
    setSending(true);

    const supabase = createAppClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: newMessage } = await supabase
      .from("support_messages")
      .insert({
        user_id: user.id,
        order_id: selectedOrderId || null,
        message: input.trim(),
        is_admin: false,
      })
      .select()
      .single();

    if (newMessage) {
      setMessages(prev => [...prev, newMessage]);
      setInput("");
      setSelectedOrderId("");
    }

    setSending(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <p className="text-sm text-[#9B9B9B]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 pt-24 pb-10">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Support</h1>
          <p className="text-sm text-[#6B6B6B] mt-0.5">
            Send us a message and we'll get back to you shortly.
          </p>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-2xl border border-[#E2E0D8] overflow-hidden mb-4">
          <div className="min-h-96 max-h-[500px] overflow-y-auto p-5 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <div className="w-12 h-12 bg-[#F8F7F4] rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl">💬</span>
                </div>
                <p className="font-medium text-[#1A1A1A] mb-1">No messages yet</p>
                <p className="text-sm text-[#9B9B9B]">Send us a message below and we'll respond soon.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[80%] ${msg.is_admin ? "" : ""}`}>
                    {msg.is_admin && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-5 h-5 bg-[#1A1A1A] rounded-sm flex items-center justify-center">
                          <span className="text-white text-[8px] font-bold">PC</span>
                        </div>
                        <span className="text-xs font-medium text-[#6B6B6B]">PrintDenture Support</span>
                      </div>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.is_admin
                        ? "bg-[#F8F7F4] text-[#1A1A1A] rounded-tl-sm"
                        : "bg-[#1A1A1A] text-white rounded-tr-sm"
                    }`}>
                      {msg.order_id && (
                        <p className={`text-xs mb-1 font-medium ${msg.is_admin ? "text-[#9B9B9B]" : "text-white/60"}`}>
                          Re: {orders.find(o => o.id === msg.order_id)?.product_name || "Order"}
                        </p>
                      )}
                      {msg.message}
                    </div>
                    <p className={`text-[10px] mt-1 text-[#9B9B9B] ${msg.is_admin ? "text-left" : "text-right"}`}>
                      {new Date(msg.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-[#E2E0D8] p-4 space-y-3">
            {/* Order selector */}
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-[#E2E0D8] bg-[#F8F7F4] text-sm text-[#6B6B6B] focus:outline-none focus:border-[#1A1A1A]"
            >
              <option value="">General inquiry (no specific order)</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.product_name} · #{formatCaseNumberLabel(o.case_number, o.id)}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message..."
                rows={2}
                className="flex-1 px-3 py-2.5 rounded-xl border border-[#E2E0D8] bg-white text-[#1A1A1A] text-sm resize-none focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="h-auto px-4 rounded-xl bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#2A2A2A] transition-all disabled:opacity-40 self-end pb-2.5 pt-2.5"
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
            <p className="text-xs text-[#9B9B9B]">Press Enter to send · Shift+Enter for new line</p>
          </div>
        </div>

        <Link href="/dashboard" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A]">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <p className="text-sm text-[#9B9B9B]">Loading...</p>
      </div>
    }>
      <SupportContent />
    </Suspense>
  );
}