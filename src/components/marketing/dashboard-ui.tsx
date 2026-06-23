"use client";

import { useState } from "react";
import Link from "next/link";
import { createAppClient } from "@/lib/supabase";
import { formatCaseNumberHash, formatCaseNumberLabel } from "@/lib/case-number";
import { CtaLink } from "@/components/marketing/primitives";
import { LabPartnerBadge, LabPartnerNotice } from "@/components/marketing/lab-partner";

export type DashboardOrder = {
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
  order_type?: string | null;
};

export type DashboardProfile = {
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
  jb_tray_status?: string | null;
  jb_fork_status?: string | null;
  jb_tray_trained?: boolean | null;
  jb_fork_trained?: boolean | null;
};

const STATUS_STEPS = ["received", "printing", "qc", "shipped", "delivered"];

const STATUS_STEP_LABELS: Record<string, string> = {
  received: "Received",
  printing: "In progress",
  qc: "QC",
  shipped: "Shipped",
  delivered: "Delivered",
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  received: { label: "Received", className: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]" },
  printing: { label: "In Progress", className: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]" },
  qc: { label: "QC Check", className: "bg-[#FDF4FF] text-[#9333EA] border-[#E9D5FF]" },
  shipped: { label: "Shipped", className: "bg-[#E1F5EE] text-[var(--pd-teal-dark)] border-[#9FE1CB]" },
  delivered: { label: "Delivered", className: "bg-[var(--pd-surface)] text-[var(--pd-muted)] border-[var(--pd-border)]" },
};

const REMAKE_REASONS: Record<string, string> = {
  shade: "Shade Mismatch",
  fit: "Fit Issue",
  fracture: "Fracture",
  design: "Design Change",
  other: "Other",
};

const inputClass =
  "w-full h-10 px-3 border border-[var(--pd-border)] bg-white text-[14px] text-[var(--pd-navy)] focus:outline-none focus:border-[var(--pd-teal)] placeholder:text-[var(--pd-muted)]/60";

function StatusBadge({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 border uppercase tracking-wide ${className}`}>
      {children}
    </span>
  );
}

function DueDateChip({ dueDate }: { dueDate: string | null }) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - today.getTime()) / 86400000);
  const formatted = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const label =
    days < 0 ? `${Math.abs(days)}d overdue`
    : days === 0 ? "Due today"
    : days === 1 ? "Due tomorrow"
    : `Due in ${days}d`;
  const color =
    days < 0 ? "text-red-700 bg-red-50 border-red-200"
    : days <= 1 ? "text-orange-700 bg-orange-50 border-orange-200"
    : days <= 2 ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-[var(--pd-teal-dark)] bg-[#E1F5EE] border-[#9FE1CB]";
  return (
    <span className={`inline-block text-[11px] px-2 py-0.5 border font-medium mt-2 ${color}`}>
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
              className={`h-1 transition-all ${idx <= safeIdx ? "bg-[var(--pd-teal)]" : "bg-[var(--pd-border)]"}`}
              title={STATUS_STEP_LABELS[step]}
            />
          </div>
        ))}
      </div>
      <div className="flex mt-1.5 gap-0.5">
        {STATUS_STEPS.map((step, idx) => (
          <span
            key={step}
            className={`flex-1 text-center text-[9px] leading-tight truncate px-0.5 ${
              idx === safeIdx
                ? "text-[var(--pd-teal-dark)] font-semibold"
                : idx < safeIdx
                  ? "text-[var(--pd-slate)]"
                  : "text-[var(--pd-border-strong)]"
            }`}
          >
            {STATUS_STEP_LABELS[step]}
          </span>
        ))}
      </div>
      {nextStep && status !== "delivered" && (
        <p className="text-[10px] text-[var(--pd-muted)] mt-1">Next: {STATUS_STEP_LABELS[nextStep]}</p>
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

export function DashboardOrderCard({
  order,
  onReorder,
}: {
  order: DashboardOrder;
  onReorder: (order: DashboardOrder) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.received;
  const date = new Date(order.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const teeth = order.tooth_numbers?.length
    ? order.tooth_numbers
        .sort((a, b) => a - b)
        .map((n) => `#${n}`)
        .join(", ")
    : order.tooth_number
      ? `#${order.tooth_number}`
      : null;
  const upsUrl = `https://www.ups.com/track?tracknum=${order.tracking_number}`;
  const caseNum = formatCaseNumberHash(order.case_number, order.id);

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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: inserted } = await supabase
      .from("order_messages")
      .insert({
        order_id: order.id,
        sender_id: user.id,
        sender_role: "user",
        message: newMessage.trim(),
        is_internal: false,
      })
      .select()
      .single();
    if (inserted) setMessages((prev) => [...prev, inserted]);
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
    <div className="border border-[var(--pd-border)] bg-white overflow-hidden hover:border-[var(--pd-border-strong)] transition-colors">
      <button type="button" className="w-full text-left p-5 sm:p-6" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <p className="font-semibold text-[var(--pd-navy)]">{order.product_name}</p>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 border border-[var(--pd-border)] bg-[var(--pd-surface)] text-[var(--pd-muted)]">
                {caseNum}
              </span>
              <StatusBadge className={status.className}>{status.label}</StatusBadge>
              {order.paid_at && (
                <StatusBadge className="bg-[#E1F5EE] text-[var(--pd-teal-dark)] border-[#9FE1CB]">Paid</StatusBadge>
              )}
              {order.order_type === "equipment" && (
                <StatusBadge className="bg-[var(--pd-surface)] text-[var(--pd-navy)] border-[var(--pd-border)]">
                  Equipment
                </StatusBadge>
              )}
              {order.is_remake && (
                <StatusBadge className="bg-red-50 text-red-600 border-red-200">
                  Remake · {REMAKE_REASONS[order.remake_reason || ""] || order.remake_reason}
                </StatusBadge>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap text-[12px] text-[var(--pd-muted)]">
              <span>Qty: {order.quantity}</span>
              {order.shade && <span>Shade: {order.shade}</span>}
              {teeth && <span>Tooth {teeth}</span>}
              <span>{date}</span>
            </div>
            {!order.is_remake && <DueDateChip dueDate={order.due_date} />}
            <StatusProgress status={order.status} />
          </div>
          <div className="text-right shrink-0">
            {order.is_remake ? (
              <p className="text-sm text-red-500 font-medium">Remake</p>
            ) : (
              <p className="text-xl font-semibold text-[var(--pd-navy)]">${order.total_price}</p>
            )}
            <p className="text-xs text-[var(--pd-muted)] mt-0.5">{expanded ? "▲" : "▼"}</p>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[var(--pd-border)] px-5 sm:px-6 py-4 bg-[var(--pd-surface)] space-y-3">
          <LabPartnerNotice variant="compact" className="mb-0" />
          {order.tracking_number && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--pd-muted)] w-24">Tracking</span>
              <a
                href={upsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-[var(--pd-teal-dark)] hover:underline font-medium"
              >
                {order.tracking_number}
              </a>
            </div>
          )}
          {order.notes && (
            <div className="flex items-start gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--pd-muted)] w-24 shrink-0">Notes</span>
              <span className="text-[13px] text-[var(--pd-slate)]">{order.notes}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--pd-muted)] w-24">Case ID</span>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 border border-[var(--pd-border)] bg-white text-[var(--pd-muted)]">
              {formatCaseNumberLabel(order.case_number, order.id)}
            </span>
          </div>
          <div className="flex gap-2 pt-1 flex-wrap">
            {!order.is_remake && (
              <button
                type="button"
                onClick={() => onReorder(order)}
                className="h-9 px-4 text-[12px] font-medium border border-[var(--pd-border)] text-[var(--pd-slate)] hover:border-[var(--pd-navy)] hover:text-[var(--pd-navy)] transition-colors bg-white"
              >
                Reorder
              </button>
            )}
            {order.status === "shipped" && order.tracking_number && (
              <a
                href={upsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-4 text-[12px] font-medium bg-[var(--pd-navy)] text-white hover:bg-[var(--pd-navy-light)] transition-colors inline-flex items-center"
              >
                Track package
              </a>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void toggleMessages();
              }}
              className={`h-9 px-4 text-[12px] font-medium border transition-colors inline-flex items-center gap-1.5 ${
                showMessages
                  ? "bg-[var(--pd-navy)] text-white border-[var(--pd-navy)]"
                  : "bg-white text-[var(--pd-slate)] border-[var(--pd-border)] hover:border-[var(--pd-navy)] hover:text-[var(--pd-navy)]"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {showMessages ? "Hide messages" : "Message lab"}
            </button>
          </div>
        </div>
      )}

      {expanded && showMessages && (
        <div className="border-t border-[var(--pd-border)] px-5 sm:px-6 py-4 bg-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-4">Messages</p>
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {loadingMsgs ? (
              <p className="text-[13px] text-[var(--pd-muted)] text-center py-4">Loading…</p>
            ) : messages.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-[var(--pd-border)]">
                <p className="text-[14px] text-[var(--pd-slate)]">No messages yet.</p>
                <p className="text-[12px] text-[var(--pd-muted)] mt-1">Send a message to the lab about this case.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-3 py-2 ${
                      msg.sender_role === "user"
                        ? "bg-[var(--pd-teal)] text-white"
                        : "bg-[var(--pd-surface)] text-[var(--pd-navy)] border border-[var(--pd-border)]"
                    }`}
                  >
                    {msg.sender_role !== "user" && (
                      <p className="text-[10px] font-semibold text-[var(--pd-muted)] mb-0.5">PrintDenture Lab</p>
                    )}
                    <p className="text-[14px]">{msg.message}</p>
                    <p
                      className={`text-[10px] mt-1 ${msg.sender_role === "user" ? "text-white/70" : "text-[var(--pd-muted)]"}`}
                    >
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
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void sendMessage();
                }
              }}
              placeholder="Ask about this case…"
              className={`flex-1 ${inputClass}`}
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={sendingMsg || !newMessage.trim()}
              className="h-10 px-4 bg-[var(--pd-teal)] text-white text-[13px] font-medium hover:bg-[var(--pd-teal-dark)] transition-colors disabled:opacity-40"
            >
              {sendingMsg ? "…" : "Send"}
            </button>
          </div>
          <p className="text-[11px] text-[var(--pd-muted)] mt-1.5">Press Enter to send</p>
        </div>
      )}
    </div>
  );
}

export function DashboardProfileModal({
  profile,
  onClose,
  onSave,
}: {
  profile: DashboardProfile;
  onClose: () => void;
  onSave: (updated: DashboardProfile) => void;
}) {
  const [form, setForm] = useState({ ...profile });
  const [saving, setSaving] = useState(false);

  function update(key: keyof DashboardProfile, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createAppClient();
    await supabase
      .from("profiles")
      .update({
        practice_name: form.practice_name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
      })
      .eq("id", profile.id);
    onSave(form);
    setSaving(false);
    onClose();
  }

  const fields: { label: string; key: keyof DashboardProfile }[] = [
    { label: "Practice name *", key: "practice_name" },
    { label: "Phone *", key: "phone" },
    { label: "Address *", key: "address" },
    { label: "City *", key: "city" },
    { label: "State *", key: "state" },
    { label: "ZIP *", key: "zip" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative bg-white border border-[var(--pd-border)] p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-[var(--pd-border)]">
          <h3 className="text-lg font-semibold text-[var(--pd-navy)]">Practice info</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 border border-[var(--pd-border)] flex items-center justify-center text-[var(--pd-muted)] hover:text-[var(--pd-navy)] hover:border-[var(--pd-navy)] transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-[13px] font-medium text-[var(--pd-navy)] mb-1.5">{field.label}</label>
              <input
                type="text"
                value={(form[field.key] as string) || ""}
                onChange={(e) => update(field.key, e.target.value)}
                className={inputClass}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-5 pt-4 border-t border-[var(--pd-border)]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 border border-[var(--pd-border)] text-[13px] text-[var(--pd-slate)] hover:bg-[var(--pd-surface)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="flex-1 h-10 bg-[var(--pd-teal)] text-white text-[13px] font-medium hover:bg-[var(--pd-teal-dark)] transition-colors disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DashboardHeader({
  profile,
  caseCount,
  onEditProfile,
}: {
  profile: DashboardProfile | null;
  caseCount: number;
  onEditProfile: () => void;
}) {
  return (
    <section className="border-b border-[var(--pd-border)] bg-white relative overflow-hidden">
      <div className="absolute inset-0 pd-grid-bg opacity-[0.04] text-[var(--pd-navy)]" aria-hidden />
      <div className="relative max-w-4xl mx-auto px-6 lg:px-10 pt-28 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)] mb-2">
              Provider portal
            </p>
            <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.03em]">
              {profile ? `Hi, Dr. ${profile.last_name}` : "My cases"}
            </h1>
            <p className="text-[14px] text-[var(--pd-slate)] mt-1">
              {caseCount} total case{caseCount !== 1 ? "s" : ""} · track workflow status and messages
            </p>
            <div className="mt-3">
              <LabPartnerBadge />
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {profile && (
              <button
                type="button"
                onClick={onEditProfile}
                className="h-10 px-4 border border-[var(--pd-border)] bg-white text-[13px] text-[var(--pd-slate)] hover:border-[var(--pd-navy)] hover:text-[var(--pd-navy)] transition-colors inline-flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit profile
              </button>
            )}
            <CtaLink href="/order" className="h-10 px-5 text-[13px]">
              New case
            </CtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DashboardStatGrid({
  stats,
}: {
  stats: { label: string; value: number }[];
}) {
  return (
    <div className="grid grid-cols-3 gap-px bg-[var(--pd-border)] border border-[var(--pd-border)] mb-8">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white p-4 sm:p-5 text-center">
          <p className="text-2xl font-semibold text-[var(--pd-navy)]">{stat.value}</p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--pd-muted)] mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

export function DashboardDraftBanner({
  step,
  savedAt,
}: {
  step: number;
  savedAt: string;
}) {
  return (
    <div className="mb-6 border border-[#9FE1CB] bg-[#E1F5EE] px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p className="text-[14px] font-medium text-[var(--pd-navy)]">You have an order in progress</p>
        <p className="text-[12px] text-[var(--pd-slate)] mt-1">
          Step {step} · saved {savedAt}
        </p>
      </div>
      <CtaLink href="/order?resume=draft" className="h-9 px-4 text-[13px] shrink-0">
        Continue order
      </CtaLink>
    </div>
  );
}

export function DashboardPracticeCard({
  profile,
  onEdit,
}: {
  profile: DashboardProfile;
  onEdit: () => void;
}) {
  return (
    <div className="border border-[var(--pd-border)] bg-white px-4 py-3 mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 border border-[var(--pd-border)] bg-[var(--pd-surface)] flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--pd-teal-dark)" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-[var(--pd-navy)] truncate">{profile.practice_name}</p>
          <p className="text-[12px] text-[var(--pd-muted)] truncate">
            {[profile.city, profile.state].filter(Boolean).join(", ") || "Add your address"}
            {profile.phone && ` · ${profile.phone}`}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="text-[12px] text-[var(--pd-teal-dark)] hover:underline shrink-0"
      >
        Edit →
      </button>
    </div>
  );
}

export function DashboardFilters({
  searchQuery,
  onSearchChange,
  onClearSearch,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
}: {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onClearSearch: () => void;
  statusFilter: "all" | "inprogress" | "shipped" | "delivered";
  onStatusFilterChange: (v: "all" | "inprogress" | "shipped" | "delivered") => void;
  sortBy: "newest" | "oldest" | "amount" | "status";
  onSortChange: (v: "newest" | "oldest" | "amount" | "status") => void;
}) {
  const tabs = [
    { key: "all" as const, label: "All" },
    { key: "inprogress" as const, label: "In progress" },
    { key: "shipped" as const, label: "Shipped" },
    { key: "delivered" as const, label: "Delivered" },
  ];

  return (
    <div className="mb-4 space-y-3">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--pd-muted)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by case #, product, tooth, shade…"
          className={`w-full h-10 pl-9 pr-4 ${inputClass}`}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pd-muted)] hover:text-[var(--pd-navy)]"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-px bg-[var(--pd-border)] border border-[var(--pd-border)]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusFilterChange(tab.key)}
              className={`h-8 px-3 text-[12px] font-medium transition-colors ${
                statusFilter === tab.key
                  ? "bg-[var(--pd-navy)] text-white"
                  : "bg-white text-[var(--pd-slate)] hover:text-[var(--pd-navy)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as typeof sortBy)}
          className="h-8 px-3 border border-[var(--pd-border)] bg-white text-[12px] text-[var(--pd-slate)] focus:outline-none focus:border-[var(--pd-teal)]"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="amount">Amount</option>
          <option value="status">By status</option>
        </select>
      </div>
    </div>
  );
}

export function DashboardEmptyState() {
  return (
    <div className="text-center py-20 border border-dashed border-[var(--pd-border-strong)] bg-white">
      <p className="text-[13px] font-semibold uppercase tracking-wider text-[var(--pd-muted)] mb-3">No cases yet</p>
      <p className="text-[14px] text-[var(--pd-slate)] mb-6 max-w-sm mx-auto">
        Submit your first lab case after capture — printed try-in and finishing included.
      </p>
      <CtaLink href="/order">Start first case</CtaLink>
    </div>
  );
}

export function DashboardLoadingState() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <p className="text-[14px] text-[var(--pd-muted)]">Loading cases…</p>
    </div>
  );
}

export { STATUS_STEPS };
