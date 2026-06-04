"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createAppClient } from "@/lib/supabase";
import { loadOrderDraft, formatDraftSavedAt } from "@/lib/order-draft";
import Navbar from "@/components/navbar";
import { useSearchParams } from "next/navigation";

type Order = {
  id: string;
  case_number: number | null;
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
  stripe_session_id: string | null;
  paid_at: string | null;
  due_date: string | null;
  is_remake: boolean;
  remake_reason: string | null;
};

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  practice_name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  dentist_name: string | null;
  license_no: string | null;
  license_state: string | null;
};

const STATUS_STEPS = ["received", "printing", "qc", "shipped", "delivered"];

const STATUS_STEP_LABELS: Record<string, string> = {
  received: "Received",
  printing: "In progress",
  qc: "QC",
  shipped: "Shipped",
  delivered: "Delivered",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  received:  { label: "Received",    color: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]" },
  printing:  { label: "In Progress", color: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]" },
  qc:        { label: "QC Check",    color: "bg-[#FDF4FF] text-[#9333EA] border-[#E9D5FF]" },
  shipped:   { label: "Shipped",     color: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]" },
  delivered: { label: "Delivered",   color: "bg-[#F1EFF8] text-[#6B6B6B] border-[#E2E0D8]" },
};

const REMAKE_REASONS: Record<string, string> = {
  shade: "Shade Mismatch",
  fit: "Fit Issue",
  fracture: "Fracture",
  design: "Design Change",
  other: "Other",
};

function DueDateChip({ dueDate }: { dueDate: string | null }) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - today.getTime()) / 86400000);
  const formatted = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const label = days < 0 ? `${Math.abs(days)}d overdue`
    : days === 0 ? "Due today"
    : days === 1 ? "Due tomorrow"
    : `Due in ${days}d`;
  const color = days < 0 ? "text-red-600 bg-red-50 border-red-200"
    : days <= 1 ? "text-orange-600 bg-orange-50 border-orange-200"
    : days <= 2 ? "text-yellow-600 bg-yellow-50 border-yellow-200"
    : "text-green-600 bg-green-50 border-green-200";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${color}`}>
      Est. delivery {formatted} · {label}
    </span>
  );
}

function StatusProgress({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.indexOf(status);
  const safeIdx = currentIdx >= 0 ? currentIdx : 0;
  const nextStep = safeIdx < STATUS_STEPS.length - 1 ? STATUS_STEPS[safeIdx + 1] : null;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-1">
        {STATUS_STEPS.map((step, idx) => (
          <div key={step} className="flex-1 min-w-0">
            <div
              className={`h-1.5 rounded-full transition-all ${
                idx <= safeIdx ? "bg-[#2563EB]" : "bg-[#E2E0D8]"
              }`}
              title={STATUS_STEP_LABELS[step]}
            />
          </div>
        ))}
      </div>
      <div className="flex mt-1.5 gap-0.5">
        {STATUS_STEPS.map((step, idx) => (
          <span
            key={step}
            className={`flex-1 text-center text-[9px] leading-tight truncate px-0.5
              ${idx === safeIdx ? "text-[#2563EB] font-semibold" : idx < safeIdx ? "text-[#6B6B6B]" : "text-[#C8C6BE]"}`}
          >
            {STATUS_STEP_LABELS[step]}
          </span>
        ))}
      </div>
      {nextStep && status !== "delivered" && (
        <p className="text-[10px] text-[#9B9B9B] mt-1">
          Next: {STATUS_STEP_LABELS[nextStep]}
        </p>
      )}
    </div>
  );
}

type Message = {
  id: string;
  sender_role: "admin" | "user" | "lab";
  message: string;
  is_internal: boolean;
  created_at: string;
};

function OrderCard({ order, onReorder }: { order: Order; onReorder: (order: Order) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.received;
  const date = new Date(order.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  const teeth = order.tooth_numbers?.length
    ? order.tooth_numbers.sort((a, b) => a - b).map(n => `#${n}`).join(", ")
    : order.tooth_number ? `#${order.tooth_number}` : null;
  const upsUrl = `https://www.ups.com/track?tracknum=${order.tracking_number}`;
  const caseNum = order.case_number ? `PC-${String(order.case_number).padStart(6, '0')}` : null;

  async function loadMessages() {
    if (loadingMsgs) return;
    setLoadingMsgs(true);
    const supabase = createAppClient();
    const { data } = await supabase
      .from("order_messages")
      .select("*")
      .eq("order_id", order.id)
      .eq("is_internal", false)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setLoadingMsgs(false);
  }

  async function toggleMessages() {
    if (!showMessages) await loadMessages();
    setShowMessages(!showMessages);
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;
    setSendingMsg(true);
    const supabase = createAppClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: inserted } = await supabase.from("order_messages").insert({
      order_id: order.id,
      sender_id: user.id,
      sender_role: "user",
      message: newMessage.trim(),
      is_internal: false,
    }).select().single();
    if (inserted) setMessages(prev => [...prev, inserted]);
    setNewMessage("");
    setSendingMsg(false);
  }

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

  return (
    <div className="bg-white rounded-2xl border border-[#E2E0D8] overflow-hidden hover:border-[#C8C6BE] transition-colors">
      <button className="w-full text-left p-5" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="font-semibold text-[#1A1A1A]">{order.product_name}</p>
              {caseNum && (
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-[#F8F7F4] border border-[#E2E0D8] text-[#6B6B6B]">
                  {caseNum}
                </span>
              )}
              <Badge className={`text-xs border ${status.color}`}>{status.label}</Badge>
              {order.paid_at && (
                <Badge className="text-xs border bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]">Paid</Badge>
              )}
              {order.is_remake && (
                <Badge className="text-xs border bg-red-50 text-red-500 border-red-200">
                  Remake · {REMAKE_REASONS[order.remake_reason || ""] || order.remake_reason}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-[#9B9B9B]">Qty: {order.quantity}</span>
              {order.shade && <span className="text-xs text-[#9B9B9B]">Shade: {order.shade}</span>}
              {teeth && <span className="text-xs text-[#9B9B9B]">Tooth {teeth}</span>}
              <span className="text-xs text-[#9B9B9B]">{date}</span>
            </div>
            {!order.is_remake && <DueDateChip dueDate={order.due_date} />}
            <StatusProgress status={order.status} />
          </div>
          <div className="text-right flex-shrink-0">
            {order.is_remake ? (
              <p className="text-sm text-red-400 font-medium">Remake</p>
            ) : (
              <p className="font-bold text-[#1A1A1A]">${order.total_price}</p>
            )}
            <p className="text-xs text-[#9B9B9B] mt-0.5">{expanded ? "▲" : "▼"}</p>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#E2E0D8] px-5 py-4 bg-[#F8F7F4] space-y-3">
          {order.tracking_number && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#6B6B6B] w-24">Tracking</span>
              <a href={upsUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#2563EB] hover:underline font-medium">
                {order.tracking_number}
              </a>
            </div>
          )}
          {order.notes && (
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-[#6B6B6B] w-24">Notes</span>
              <span className="text-xs text-[#4B4B4B]">{order.notes}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#6B6B6B] w-24">Case ID</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-[#F8F7F4] border border-[#E2E0D8] text-[#6B6B6B]">
              {caseNum ?? order.id.slice(0, 8)}
            </span>
          </div>
          <div className="flex gap-2 pt-1">
            {!order.is_remake && (
              <button onClick={() => onReorder(order)}
                className="h-8 px-4 rounded-lg text-xs font-medium border border-[#E2E0D8] text-[#6B6B6B] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-all bg-white">
                Reorder
              </button>
            )}
            {order.status === "shipped" && order.tracking_number && (
              <a href={upsUrl} target="_blank" rel="noopener noreferrer"
                className="h-8 px-4 rounded-lg text-xs font-medium bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] transition-all flex items-center">
                Track package
              </a>
            )}
            <button onClick={e => { e.stopPropagation(); toggleMessages(); }}
              className={`h-8 px-4 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                showMessages
                  ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                  : "bg-white text-[#6B6B6B] border-[#E2E0D8] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
              }`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {showMessages ? "Hide messages" : "Message lab"}
            </button>
          </div>
        </div>
      )}

      {expanded && showMessages && (
        <div className="border-t border-[#E2E0D8] px-5 py-4 bg-white">
          <p className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider mb-4">Messages</p>
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {loadingMsgs ? (
              <p className="text-xs text-[#9B9B9B] text-center py-4">Loading...</p>
            ) : messages.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-[#9B9B9B]">No messages yet.</p>
                <p className="text-xs text-[#C8C6BE] mt-1">Send a message to the lab about this case.</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                    msg.sender_role === "user"
                      ? "bg-[#2563EB] text-white rounded-br-sm"
                      : "bg-[#F8F7F4] text-[#1A1A1A] border border-[#E2E0D8] rounded-bl-sm"
                  }`}>
                    {msg.sender_role !== "user" && (
                      <p className="text-[10px] font-semibold text-[#9B9B9B] mb-0.5">PrintDenture Lab</p>
                    )}
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender_role === "user" ? "text-blue-200" : "text-[#C8C6BE]"}`}>
                      {timeAgo(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask about this case..."
              className="flex-1 h-9 px-3 rounded-xl border border-[#E2E0D8] bg-[#F8F7F4] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#2563EB] placeholder:text-[#C8C6BE]"
            />
            <button onClick={sendMessage} disabled={sendingMsg || !newMessage.trim()}
              className="h-9 px-4 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-all disabled:opacity-40">
              {sendingMsg ? "..." : "Send"}
            </button>
          </div>
          <p className="text-xs text-[#C8C6BE] mt-1.5">Press Enter to send</p>
        </div>
      )}
    </div>
  );
}

function ProfileModal({ profile, onClose, onSave }: {
  profile: Profile;
  onClose: () => void;
  onSave: (updated: Profile) => void;
}) {
  const [form, setForm] = useState({ ...profile });
  const [saving, setSaving] = useState(false);

  function update(key: keyof Profile, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createAppClient();
    await supabase.from("profiles").update({
      practice_name: form.practice_name,
      phone: form.phone,
      address: form.address,
      city: form.city,
      state: form.state,
      zip: form.zip,
    }).eq("id", profile.id);
    onSave(form);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-[#E2E0D8] p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[#1A1A1A]">Practice Info</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8F7F4] flex items-center justify-center text-[#6B6B6B] hover:bg-[#E2E0D8] transition-all">
            ✕
          </button>
        </div>
        <div className="space-y-3">
          {[
            { label: "Practice name", key: "practice_name" as keyof Profile },
            { label: "Phone",         key: "phone" as keyof Profile },
            { label: "Address",       key: "address" as keyof Profile },
            { label: "City",          key: "city" as keyof Profile },
            { label: "State",         key: "state" as keyof Profile },
            { label: "ZIP",           key: "zip" as keyof Profile },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider block mb-1">
                {field.label}
              </label>
              <input
                type="text"
                value={(form[field.key] as string) || ""}
                onChange={e => update(field.key, e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-[#E2E0D8] bg-[#F8F7F4] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-[#E2E0D8] text-sm text-[#6B6B6B] hover:bg-[#F8F7F4] transition-all">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 h-10 rounded-xl bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#2563EB] transition-all disabled:opacity-40">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount" | "status">("newest");
  const [statusFilter, setStatusFilter] = useState<"all" | "inprogress" | "shipped" | "delivered">("all");
  const [orderDraft, setOrderDraft] = useState<{ productName: string; savedAt: string; step: number } | null>(null);

  useEffect(() => {
    const draft = loadOrderDraft();
    if (draft?.productId && draft.step >= 2) {
      setOrderDraft({
        productName: `Step ${draft.step} saved`,
        savedAt: draft.savedAt,
        step: draft.step,
      });
    }
  }, []);

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (!orderId) return;
    async function completeOrder() {
      const supabase = createAppClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await fetch("/api/order-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, userId: user.id }),
      });
      router.replace("/dashboard");
    }
    completeOrder();
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      const supabase = createAppClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      const [{ data: profileData }, { data: ordersData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (profileData) setProfile(profileData);
      if (ordersData) setOrders(ordersData);
      setLoading(false);
    }
    load();
  }, [router]);

  function handleReorder(order: Order) {
    router.push(`/order?reorder=${order.id}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <p className="text-sm text-[#9B9B9B]">Loading...</p>
      </div>
    );
  }

  const nonRemakeOrders = orders.filter(o => !o.is_remake);
  const inProgressOrders = orders.filter(o => ["received", "printing", "qc"].includes(o.status) && !o.is_remake);
  const shippedOrders = orders.filter(o => ["shipped", "delivered"].includes(o.status));

  const filteredOrders = orders
    .filter(o => {
      if (statusFilter === "inprogress" && !["received", "printing", "qc"].includes(o.status)) return false;
      if (statusFilter === "shipped" && o.status !== "shipped") return false;
      if (statusFilter === "delivered" && o.status !== "delivered") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const caseNum = o.case_number ? `pc-${String(o.case_number).padStart(6, '0')}` : "";
        const teeth = o.tooth_numbers?.map(n => `#${n}`).join(" ") || "";
        if (
          !caseNum.includes(q) &&
          !o.product_name.toLowerCase().includes(q) &&
          !teeth.includes(q) &&
          !(o.shade?.toLowerCase().includes(q))
        ) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "amount") return b.total_price - a.total_price;
      if (sortBy === "status") return STATUS_STEPS.indexOf(b.status) - STATUS_STEPS.indexOf(a.status);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Navbar />
      {showProfileModal && profile && (
        <ProfileModal
          profile={profile}
          onClose={() => setShowProfileModal(false)}
          onSave={updated => setProfile(updated)}
        />
      )}
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">
              {profile ? `Hi, Dr. ${profile.last_name}` : "My cases"}
            </h1>
            <p className="text-sm text-[#6B6B6B] mt-0.5">
              {nonRemakeOrders.length} total case{nonRemakeOrders.length !== 1 ? "s" : ""}
            </p>
          </div>
          {profile && (
            <button onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 h-9 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#6B6B6B] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit profile
            </button>
          )}
        </div>

        {orderDraft && (
          <div className="mb-6 rounded-xl border border-[#BFDBFE] bg-[#F0F9FF] px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">You have an order in progress</p>
              <p className="text-xs text-[#6B6B6B] mt-1">
                Step {orderDraft.step} · saved {formatDraftSavedAt(orderDraft.savedAt)}
              </p>
            </div>
            <Link href="/order?resume=draft">
              <Button className="h-9 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white shrink-0">
                Continue order
              </Button>
            </Link>
          </div>
        )}

        {orders.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Total orders", value: nonRemakeOrders.length },
              { label: "In progress",  value: inProgressOrders.length },
              { label: "Shipped",      value: shippedOrders.length },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl border border-[#E2E0D8] p-4 text-center">
                <p className="text-2xl font-bold text-[#1A1A1A]">{stat.value}</p>
                <p className="text-xs text-[#9B9B9B] mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {profile?.practice_name && (
          <div className="bg-white rounded-xl border border-[#E2E0D8] px-4 py-3 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">{profile.practice_name}</p>
                <p className="text-xs text-[#9B9B9B]">
                  {[profile.city, profile.state].filter(Boolean).join(", ") || "Add your address"}
                  {profile.phone && ` · ${profile.phone}`}
                </p>
              </div>
            </div>
            <button onClick={() => setShowProfileModal(true)}
              className="text-xs text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
              Edit →
            </button>
          </div>
        )}

        {orders.length > 0 && (
          <div className="mb-4 space-y-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9B9B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by case #, product, tooth, shade..."
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9B9B] hover:text-[#1A1A1A]">
                  ✕
                </button>
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-1">
                {([
                  { key: "all", label: "All" },
                  { key: "inprogress", label: "In Progress" },
                  { key: "shipped", label: "Shipped" },
                  { key: "delivered", label: "Delivered" },
                ] as const).map(tab => (
                  <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
                    className={`h-8 px-3 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === tab.key
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-white border border-[#E2E0D8] text-[#6B6B6B] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
                    }`}>
                    {tab.label}
                  </button>
                ))}
              </div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="h-8 px-3 rounded-lg border border-[#E2E0D8] bg-white text-xs text-[#6B6B6B] focus:outline-none focus:border-[#1A1A1A]">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="amount">Amount</option>
                <option value="status">By status</option>
              </select>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E2E0D8]">
            <p className="text-4xl mb-4">📦</p>
            <p className="font-semibold text-[#1A1A1A] mb-1">No cases yet</p>
            <p className="text-sm text-[#9B9B9B] mb-6">Place your first order to get started.</p>
            <Link href="/order">
              <Button className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-lg">
                Start first order
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#E2E0D8]">
                <p className="text-sm text-[#9B9B9B]">No cases match your search.</p>
                <button onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                  className="text-xs text-[#2563EB] hover:underline mt-2 block mx-auto">
                  Clear filters
                </button>
              </div>
            ) : filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} onReorder={handleReorder} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <p className="text-sm text-[#9B9B9B]">Loading...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}