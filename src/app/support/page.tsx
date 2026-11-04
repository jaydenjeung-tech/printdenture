"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createAppClient } from "@/lib/supabase";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PrintDentureMark } from "@/components/logo";
import { formatCaseNumberHash } from "@/lib/case-number";
import { insertWithOptionalSite, scopeOrdersForSite, visibleSupportMessages } from "@/lib/orders/site-scope";

type Message = {
  id: string;
  user_id: string;
  order_id: string | null;
  message: string;
  is_admin: boolean;
  read_at: string | null;
  created_at: string;
  site?: string | null;
};

type Order = {
  id: string;
  case_number: number | null;
  product_name: string;
  product_id?: string | null;
  created_at: string;
  site?: string | null;
};

function caseLabel(order: Order) {
  return `${formatCaseNumberHash(order.case_number, order.id)} · ${order.product_name}`;
}

function SupportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (orderId) setSelectedOrderId(orderId);
  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function load() {
    const supabase = createAppClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }

    const [{ data: messagesData }, { data: ordersData }] = await Promise.all([
      supabase.from("support_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase.from("orders")
        .select("id, case_number, product_name, product_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    const scopedOrders = await scopeOrdersForSite(supabase, (ordersData ?? []) as Order[]);
    const scopedMessages = await visibleSupportMessages(supabase, (messagesData ?? []) as Message[]);

    setOrders(scopedOrders);
    setMessages(scopedMessages);

    const unread = scopedMessages.filter((message) => message.is_admin && !message.read_at);
    if (unread.length > 0) {
      await supabase.from("support_messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", unread.map((message) => message.id));
    }

    setLoading(false);
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;
    setSending(true);
    setSendError(null);

    const supabase = createAppClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSending(false);
      return;
    }

    const { data: newMessage, error } = await insertWithOptionalSite<Message>(supabase, "support_messages", {
      user_id: user.id,
      order_id: attachedOrderId || null,
      message: input.trim(),
      is_admin: false,
    });

    if (error || !newMessage) {
      setSendError("Message was not sent. Try again.");
      setSending(false);
      return;
    }

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setSending(false);

    void fetch("/api/support/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: newMessage.id }),
    });
  }

  const attachedOrderId = orders.some((order) => order.id === selectedOrderId) ? selectedOrderId : "";

  if (loading) {
    return (
      <MarketingShell>
        <div className="min-h-[50vh] flex items-center justify-center pt-24">
          <p className="text-[14px] text-[var(--pd-muted)]">Loading messages…</p>
        </div>
      </MarketingShell>
    );
  }

  return (
    <MarketingShell>
      <section className="border-b border-[var(--pd-border)] bg-white">
        <div className="max-w-2xl mx-auto px-6 lg:px-10 pt-28 pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)] mb-2">
            Provider portal
          </p>
          <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.03em]">
            Support
          </h1>
          <p className="text-[14px] text-[var(--pd-slate)] mt-2 leading-relaxed">
            This inbox is for billing, training, and shipping. A question about one case belongs on that case — open it in the dashboard and use Message lab.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 lg:px-10 py-10 pb-16">
        <div className="bg-white border border-[var(--pd-border)] overflow-hidden">
          <div className="min-h-96 max-h-[500px] overflow-y-auto p-5 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 text-center px-6">
                <p className="text-[14px] font-medium text-[var(--pd-navy)]">No messages yet</p>
                <p className="text-[13px] text-[var(--pd-muted)] mt-1">
                  Send a note below. The lab replies in this thread.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const linked = orders.find((order) => order.id === msg.order_id);
                return (
                  <div key={msg.id} className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}>
                    <div className="max-w-[80%]">
                      {msg.is_admin && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <PrintDentureMark size={18} />
                          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--pd-muted)]">
                            PrintDenture
                          </span>
                        </div>
                      )}
                      <div
                        className={`px-4 py-2.5 text-[14px] leading-relaxed ${
                          msg.is_admin
                            ? "bg-[var(--pd-surface)] text-[var(--pd-navy)] border border-[var(--pd-border)]"
                            : "bg-[var(--pd-teal)] text-white"
                        }`}
                      >
                        {linked && (
                          <p className={`text-[11px] mb-1 font-medium ${msg.is_admin ? "text-[var(--pd-muted)]" : "text-white/75"}`}>
                            Re: {caseLabel(linked)}
                          </p>
                        )}
                        {msg.message}
                      </div>
                      <p className={`text-[10px] mt-1 text-[var(--pd-muted)] ${msg.is_admin ? "text-left" : "text-right"}`}>
                        {new Date(msg.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-[var(--pd-border)] p-4 space-y-3 bg-[var(--pd-surface)]">
            <label className="block">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-1.5">
                About a case
              </span>
              <select
                value={attachedOrderId}
                onChange={(event) => setSelectedOrderId(event.target.value)}
                className="w-full h-10 px-3 border border-[var(--pd-border)] bg-white text-[14px] text-[var(--pd-navy)] focus:outline-none focus:border-[var(--pd-teal)]"
              >
                <option value="">General question</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {caseLabel(order)}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Type your message…"
                rows={2}
                className="flex-1 px-3 py-2.5 border border-[var(--pd-border)] bg-white text-[14px] text-[var(--pd-navy)] resize-none focus:outline-none focus:border-[var(--pd-teal)] placeholder:text-[var(--pd-muted)]"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={!input.trim() || sending}
                className="h-10 px-4 self-end bg-[var(--pd-teal)] text-white text-[13px] font-medium hover:bg-[var(--pd-teal-dark)] transition-colors disabled:opacity-40"
              >
                {sending ? "…" : "Send"}
              </button>
            </div>
            {sendError && <p className="text-[12px] text-red-700">{sendError}</p>}
            <p className="text-[11px] text-[var(--pd-muted)]">Enter to send · Shift+Enter for a new line</p>
          </div>
        </div>

        <Link href="/dashboard" className="inline-block mt-6 text-[13px] text-[var(--pd-slate)] hover:text-[var(--pd-navy)]">
          ← Back to dashboard
        </Link>
      </div>
    </MarketingShell>
  );
}

export default function SupportPage() {
  return (
    <Suspense
      fallback={
        <MarketingShell>
          <div className="min-h-[50vh] flex items-center justify-center pt-24">
            <p className="text-[14px] text-[var(--pd-muted)]">Loading messages…</p>
          </div>
        </MarketingShell>
      }
    >
      <SupportContent />
    </Suspense>
  );
}
