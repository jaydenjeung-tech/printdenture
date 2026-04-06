// app/admin/orders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import Navbar from "@/components/navbar";

type Order = {
  id: string;
  user_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  tracking_number: string | null;
  created_at: string;
  shade: string | null;
  tooth_number: string | null;
  tooth_numbers: number[] | null;
  notes: string | null;
  stl_file_path: string | null;
  paid_at: string | null;
  due_date: string | null;
};

type Rx = {
  id: string;
  order_id: string;
  tooth_numbers: number[] | null;
  shade: string | null;
  margin_type: string | null;
  occlusion: string | null;
  guard_type: string | null;
  dentist_name: string;
  dentist_license_no: string;
  license_state: string;
  authorized: boolean;
  notes: string | null;
};

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  practice_name: string | null;
  phone: string | null;
  email?: string | null;
};

type Message = {
  id: string;
  order_id: string;
  sender_id: string;
  sender_role: "admin" | "user" | "lab";
  message: string;
  is_internal: boolean;
  created_at: string;
  sender_name?: string;
};

type StatusHistory = {
  id: string;
  order_id: string;
  changed_by: string;
  from_status: string | null;
  to_status: string;
  created_at: string;
};

const STATUS_STEPS = ["received", "printing", "qc", "shipped", "delivered"];

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  received:  { label: "Received",    color: "text-blue-600",   dot: "bg-blue-500",   bg: "bg-blue-50 border-blue-200" },
  printing:  { label: "In Progress", color: "text-amber-600",  dot: "bg-amber-500",  bg: "bg-amber-50 border-amber-200" },
  qc:        { label: "QC Check",    color: "text-purple-600", dot: "bg-purple-500", bg: "bg-purple-50 border-purple-200" },
  shipped:   { label: "Shipped",     color: "text-green-600",  dot: "bg-green-500",  bg: "bg-green-50 border-green-200" },
  delivered: { label: "Delivered",   color: "text-gray-500",   dot: "bg-gray-400",   bg: "bg-gray-50 border-gray-200" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rx, setRx] = useState<Rx | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trackingInput, setTrackingInput] = useState("");

  // Message compose
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => { checkAndLoad(); }, [orderId]);

  async function checkAndLoad() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { data: prof } = await supabase
      .from("profiles").select("role, is_admin").eq("id", user.id).single();
    if (prof?.role !== "admin" && !prof?.is_admin) { router.push("/dashboard"); return; }

    await loadAll(supabase, user.id);
  }

  async function loadAll(supabase: ReturnType<typeof createClient>, currentUserId: string) {
    // Order
    const { data: orderData } = await supabase
      .from("orders").select("*").eq("id", orderId).single();
    if (!orderData) { router.push("/admin/orders"); return; }
    setOrder(orderData);
    setTrackingInput(orderData.tracking_number || "");

    // Profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, practice_name, phone")
      .eq("id", orderData.user_id).single();
    setProfile(profileData);

    // Rx
    const { data: rxData } = await supabase
      .from("rx").select("*").eq("order_id", orderId).single();
    setRx(rxData);

    // Messages
    const { data: msgData } = await supabase
      .from("order_messages")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    
    // sender 이름 붙이기
    if (msgData?.length) {
      const senderIds = [...new Set(msgData.map(m => m.sender_id))];
      const { data: senderProfiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, practice_name")
        .in("id", senderIds);
      const nameMap: Record<string, string> = {};
      senderProfiles?.forEach(p => {
        nameMap[p.id] = p.first_name
          ? `${p.first_name} ${p.last_name || ""}`.trim()
          : p.practice_name || "Unknown";
      });
      setMessages(msgData.map(m => ({ ...m, sender_name: nameMap[m.sender_id] || "Unknown" })));
    } else {
      setMessages([]);
    }

    // Status history
    const { data: historyData } = await supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    setStatusHistory(historyData || []);

    setLoading(false);
  }

  async function updateStatus(newStatus: string) {
    if (!order) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("orders")
      .update({ status: newStatus }).eq("id", orderId);

    // 히스토리 기록
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      changed_by: user?.id,
      from_status: order.status,
      to_status: newStatus,
    });

    setOrder(prev => prev ? { ...prev, status: newStatus } : null);
    setStatusHistory(prev => [...prev, {
      id: crypto.randomUUID(),
      order_id: orderId,
      changed_by: user?.id || "",
      from_status: order.status,
      to_status: newStatus,
      created_at: new Date().toISOString(),
    }]);
    setSaving(false);
  }

  async function updateTracking() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("orders")
      .update({ tracking_number: trackingInput || null, status: "shipped" })
      .eq("id", orderId);

    if (order?.status !== "shipped") {
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        changed_by: user?.id,
        from_status: order?.status,
        to_status: "shipped",
      });
    }

    setOrder(prev => prev ? { ...prev, tracking_number: trackingInput, status: "shipped" } : null);
    setSaving(false);
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;
    setSendingMsg(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: inserted } = await supabase.from("order_messages").insert({
      order_id: orderId,
      sender_id: user.id,
      sender_role: "admin",
      message: newMessage.trim(),
      is_internal: isInternal,
    }).select().single();

    if (inserted) {
      const { data: prof } = await supabase
        .from("profiles").select("first_name, last_name").eq("id", user.id).single();
      const senderName = prof?.first_name
        ? `${prof.first_name} ${prof.last_name || ""}`.trim()
        : "Admin";
      setMessages(prev => [...prev, { ...inserted, sender_name: senderName }]);
    }

    setNewMessage("");
    setSendingMsg(false);
  }

  async function downloadStl(filePath: string) {
    const supabase = createClient();
    const { data } = await supabase.storage.from("stl-files").createSignedUrl(filePath, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <p className="text-sm text-[#9B9B9B]">Loading...</p>
      </div>
    );
  }

  if (!order) return null;

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.received;
  const teeth = order.tooth_numbers?.length
    ? order.tooth_numbers.sort((a, b) => a - b).map(n => `#${n}`).join(", ")
    : order.tooth_number ? `#${order.tooth_number}` : null;

  // 타임라인 — 상태 히스토리 + 메시지 합쳐서 시간순 정렬
  type TimelineItem =
    | { type: "status"; data: StatusHistory }
    | { type: "message"; data: Message };

  const timeline: TimelineItem[] = [
    ...statusHistory.map(h => ({ type: "status" as const, data: h })),
    ...messages.map(m => ({ type: "message" as const, data: m })),
  ].sort((a, b) => new Date(a.data.created_at).getTime() - new Date(b.data.created_at).getTime());

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/admin/orders" className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            All Orders
          </Link>
          <span className="text-[#C8C6BE]">/</span>
          <span className="font-mono text-xs bg-[#F0EEE8] px-2 py-0.5 rounded text-[#6B6B6B]">
            #{order.id.slice(0, 6).toUpperCase()}
          </span>
        </div>

        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">{order.product_name}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${status.bg} ${status.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              {order.paid_at && (
                <span className="text-xs px-2.5 py-1 rounded-full border font-medium bg-green-50 text-green-600 border-green-200">
                  Paid
                </span>
              )}
              <span className="text-sm text-[#9B9B9B]">
                {formatDateTime(order.created_at)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#1A1A1A]">${order.total_price}</p>
            <p className="text-xs text-[#9B9B9B] mt-0.5">{order.quantity} unit{order.quantity > 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* ── Left column (2/3) ── */}
          <div className="col-span-2 space-y-6">

            {/* Status update */}
            <div className="bg-white rounded-2xl border border-[#E2E0D8] p-5">
              <h2 className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider mb-4">Update Status</h2>
              <div className="flex gap-2 flex-wrap mb-5">
                {STATUS_STEPS.map(step => (
                  <button key={step} onClick={() => updateStatus(step)}
                    disabled={saving}
                    className={`h-8 px-3 rounded-lg text-xs font-medium border transition-all ${
                      order.status === step
                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                        : "bg-white text-[#6B6B6B] border-[#E2E0D8] hover:border-[#1A1A1A]"
                    }`}>
                    {STATUS_CONFIG[step]?.label}
                  </button>
                ))}
              </div>

              {/* Tracking */}
              <div>
                <p className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider mb-2">Tracking Number</p>
                <div className="flex gap-2">
                  <input type="text" value={trackingInput}
                    onChange={e => setTrackingInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && updateTracking()}
                    placeholder="UPS / FedEx tracking number..."
                    className="flex-1 h-9 px-3 rounded-lg border border-[#E2E0D8] bg-[#F8F7F4] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]"
                  />
                  <button onClick={updateTracking} disabled={saving}
                    className="h-9 px-4 rounded-lg bg-[#16A34A] text-white text-sm font-medium hover:bg-[#15803D] transition-all disabled:opacity-40">
                    {saving ? "..." : "Ship"}
                  </button>
                </div>
                {order.tracking_number && (
                  <a href={`https://www.ups.com/track?tracknum=${order.tracking_number}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#2563EB] hover:underline mt-1.5 block">
                    Track: {order.tracking_number} ↗
                  </a>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-[#E2E0D8] p-5">
              <h2 className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider mb-5">Timeline</h2>

              <div className="space-y-1">
                {/* Order created */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-[#2563EB] mt-1 flex-shrink-0" />
                    <div className="w-px flex-1 bg-[#E2E0D8] mt-1" />
                  </div>
                  <div className="pb-5">
                    <p className="text-sm font-medium text-[#1A1A1A]">Order placed</p>
                    <p className="text-xs text-[#9B9B9B] mt-0.5">{formatDateTime(order.created_at)}</p>
                  </div>
                </div>

                {timeline.map((item, idx) => {
                  const isLast = idx === timeline.length - 1;

                  if (item.type === "status") {
                    const cfg = STATUS_CONFIG[item.data.to_status] ?? STATUS_CONFIG.received;
                    return (
                      <div key={item.data.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full ${cfg.dot} mt-1 flex-shrink-0`} />
                          {!isLast && <div className="w-px flex-1 bg-[#E2E0D8] mt-1" />}
                        </div>
                        <div className={`${isLast ? "" : "pb-5"}`}>
                          <p className="text-sm font-medium text-[#1A1A1A]">
                            Status → <span className={cfg.color}>{cfg.label}</span>
                          </p>
                          {item.data.from_status && (
                            <p className="text-xs text-[#9B9B9B]">
                              from {STATUS_CONFIG[item.data.from_status]?.label || item.data.from_status}
                            </p>
                          )}
                          <p className="text-xs text-[#9B9B9B] mt-0.5">{timeAgo(item.data.created_at)}</p>
                        </div>
                      </div>
                    );
                  }

                  // message
                  const msg = item.data as Message;
                  return (
                    <div key={msg.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${msg.is_internal ? "bg-[#9333EA]" : "bg-[#6B6B6B]"}`} />
                        {!isLast && <div className="w-px flex-1 bg-[#E2E0D8] mt-1" />}
                      </div>
                      <div className={`flex-1 ${isLast ? "" : "pb-5"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-[#1A1A1A]">{msg.sender_name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            msg.is_internal
                              ? "bg-purple-50 text-purple-600"
                              : msg.sender_role === "admin"
                              ? "bg-[#F0EEE8] text-[#6B6B6B]"
                              : "bg-blue-50 text-blue-600"
                          }`}>
                            {msg.is_internal ? "Internal" : msg.sender_role === "admin" ? "Admin" : "Practice"}
                          </span>
                          <span className="text-xs text-[#9B9B9B]">{timeAgo(msg.created_at)}</span>
                        </div>
                        <div className={`rounded-xl px-3 py-2.5 text-sm text-[#1A1A1A] ${
                          msg.is_internal
                            ? "bg-purple-50 border border-purple-100"
                            : "bg-[#F8F7F4] border border-[#E2E0D8]"
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message compose */}
              <div className="mt-6 border-t border-[#E2E0D8] pt-5">
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider">Add Note</p>
                  <button
                    onClick={() => setIsInternal(!isInternal)}
                    className={`flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium border transition-all ${
                      isInternal
                        ? "bg-purple-50 text-purple-600 border-purple-200"
                        : "bg-[#F8F7F4] text-[#6B6B6B] border-[#E2E0D8] hover:border-[#9B9B9B]"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isInternal ? "bg-purple-500" : "bg-[#9B9B9B]"}`} />
                    {isInternal ? "Internal only" : "Visible to practice"}
                  </button>
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendMessage(); }}
                    placeholder={isInternal ? "Internal note (lab/admin only)..." : "Message to practice..."}
                    rows={2}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#E2E0D8] bg-[#F8F7F4] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE] resize-none"
                  />
                  <button onClick={sendMessage} disabled={sendingMsg || !newMessage.trim()}
                    className="self-end h-9 px-4 rounded-xl bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#2563EB] transition-all disabled:opacity-40">
                    {sendingMsg ? "..." : "Send"}
                  </button>
                </div>
                <p className="text-xs text-[#C8C6BE] mt-1.5">⌘ + Enter to send</p>
              </div>
            </div>
          </div>

          {/* ── Right column (1/3) ── */}
          <div className="space-y-4">

            {/* Case info */}
            <div className="bg-white rounded-2xl border border-[#E2E0D8] p-5">
              <h2 className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider mb-4">Case Details</h2>
              <div className="space-y-2.5 text-sm">
                {[
                  { label: "Product", value: order.product_name },
                  { label: "Quantity", value: `${order.quantity} unit${order.quantity > 1 ? "s" : ""}` },
                  order.shade ? { label: "Shade", value: order.shade } : null,
                  teeth ? { label: "Tooth", value: teeth } : null,
                  order.due_date ? { label: "Due date", value: new Date(order.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) } : null,
                  order.notes ? { label: "Notes", value: order.notes } : null,
                ].filter(Boolean).map(item => (
                  <div key={item!.label} className="flex justify-between gap-3">
                    <span className="text-[#9B9B9B] flex-shrink-0">{item!.label}</span>
                    <span className="text-[#1A1A1A] text-right">{item!.value}</span>
                  </div>
                ))}
              </div>
              {order.stl_file_path && (
                <button onClick={() => downloadStl(order.stl_file_path!)}
                  className="w-full mt-4 h-8 rounded-lg border border-[#E2E0D8] text-xs text-[#2563EB] font-medium hover:border-[#2563EB] transition-all">
                  ↓ Download STL
                </button>
              )}
            </div>

            {/* Customer */}
            <div className="bg-white rounded-2xl border border-[#E2E0D8] p-5">
              <h2 className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider mb-4">Practice</h2>
              <div className="space-y-1.5 text-sm">
                <p className="font-semibold text-[#1A1A1A]">{profile?.practice_name || "—"}</p>
                {rx && <p className="text-[#6B6B6B]">Dr. {rx.dentist_name}</p>}
                {rx && <p className="text-xs text-[#9B9B9B]">License #{rx.dentist_license_no} · {rx.license_state}</p>}
                {profile?.phone && <p className="text-xs text-[#9B9B9B]">{profile.phone}</p>}
              </div>
            </div>

            {/* Rx */}
            {rx && (
              <div className="bg-white rounded-2xl border border-[#E2E0D8] p-5">
                <h2 className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider mb-4">Rx</h2>
                <div className="space-y-1.5 text-sm">
                  <span className={`inline-flex text-xs font-medium ${rx.authorized ? "text-green-600" : "text-red-500"}`}>
                    {rx.authorized ? "✓ Authorized" : "✗ Not authorized"}
                  </span>
                  <div className="space-y-1 text-xs text-[#6B6B6B] mt-1">
                    {rx.margin_type && <p>Margin: {rx.margin_type}</p>}
                    {rx.occlusion && <p>Occlusion: {rx.occlusion}</p>}
                    {rx.guard_type && <p>Guard: {rx.guard_type}</p>}
                    {rx.notes && <p className="text-[#9B9B9B] mt-2">{rx.notes}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-[#E2E0D8] p-5">
              <h2 className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider mb-4">Payment</h2>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Unit price</span><span>${order.unit_price}</span>
                </div>
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Qty</span><span>{order.quantity}</span>
                </div>
                <div className="flex justify-between font-bold text-[#1A1A1A] border-t border-[#F0EEE8] pt-1.5 mt-1.5">
                  <span>Total</span><span>${order.total_price}</span>
                </div>
                {order.paid_at && (
                  <p className="text-xs text-[#9B9B9B] mt-1">
                    Paid {formatDateTime(order.paid_at)}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}