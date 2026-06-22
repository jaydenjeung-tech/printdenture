"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ORDER_BTN_BACK,
  ORDER_BTN_NAVY,
  ORDER_BTN_PRIMARY,
  ORDER_INPUT_CLASS,
  chipClass,
} from "@/components/marketing/order-ui";
import {
  ADMIN_STATUS_CONFIG,
  ADMIN_STATUS_STEPS,
  AdminOrderIdChip,
  AdminStatusBadge,
  AdminTagBadge,
} from "@/components/admin/admin-orders-ui";
import { AdminDesignOutsourcePanel } from "@/components/admin/admin-design-outsource-panel";
import type { DesignOutsourceFields } from "@/lib/design-outsource";
import {
  CASE_FILE_KIND_META,
  downloadCaseFile,
  parseStoredCaseFiles,
} from "@/lib/products/case-files";

export type AdminOrderDetailOrder = {
  id: string;
  user_id: string;
  product_name: string;
  product_id: string;
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
  case_files: unknown;
  paid_at: string | null;
  due_date: string | null;
  is_remake: boolean;
  remake_of: string | null;
  remake_reason: string | null;
  remake_note: string | null;
} & DesignOutsourceFields;

export type AdminOrderDetailRx = {
  dentist_name: string;
  dentist_license_no: string;
  license_state: string;
  authorized: boolean;
  margin_type: string | null;
  occlusion: string | null;
  guard_type: string | null;
  notes: string | null;
};

export type AdminOrderDetailProfile = {
  practice_name: string | null;
  phone: string | null;
};

export type AdminOrderDetailMessage = {
  id: string;
  sender_name?: string;
  sender_role: "admin" | "user" | "lab";
  message: string;
  is_internal: boolean;
  created_at: string;
};

export type AdminOrderDetailStatusHistory = {
  id: string;
  from_status: string | null;
  to_status: string;
  created_at: string;
};

export const REMAKE_REASONS = [
  { value: "shade", label: "Shade Mismatch" },
  { value: "fit", label: "Fit Issue" },
  { value: "fracture", label: "Fracture" },
  { value: "design", label: "Design Change" },
  { value: "other", label: "Other" },
] as const;

export function AdminOrderDetailLoading() {
  return (
    <div className="py-16 text-center">
      <p className="text-[14px] text-[var(--pd-muted)]">Loading case…</p>
    </div>
  );
}

function AdminSidePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--pd-border)] bg-white">
      <div className="px-4 py-3 border-b border-[var(--pd-border)] bg-[var(--pd-surface)]">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)]">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function AdminOrderDetailBreadcrumb({
  orderId,
  isRemake,
}: {
  orderId: string;
  isRemake: boolean;
}) {
  return (
    <nav className="flex flex-wrap items-center gap-2 mb-6 text-[13px]">
      <Link href="/admin/orders" className="text-[var(--pd-muted)] hover:text-[var(--pd-navy)] transition-colors">
        All orders
      </Link>
      <span className="text-[var(--pd-border-strong)]">/</span>
      <AdminOrderIdChip id={orderId} />
      {isRemake && (
        <AdminTagBadge className="bg-red-50 text-red-600 border-red-200">Remake</AdminTagBadge>
      )}
    </nav>
  );
}

export function AdminOrderDetailRemakeBanner({
  remakeReason,
  remakeNote,
  originalOrderId,
}: {
  remakeReason: string | null;
  remakeNote: string | null;
  originalOrderId: string;
}) {
  const label = REMAKE_REASONS.find((r) => r.value === remakeReason)?.label || remakeReason;
  return (
    <div className="border border-amber-200 bg-amber-50 px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <p className="text-[13px] text-amber-900">
        <span className="font-semibold">{label}</span>
        {remakeNote && <span className="text-amber-800"> — {remakeNote}</span>}
      </p>
      <Link
        href={`/admin/orders/${originalOrderId}`}
        className="text-[12px] font-medium text-amber-900 hover:underline shrink-0"
      >
        Original case #{originalOrderId.slice(0, 6).toUpperCase()} →
      </Link>
    </div>
  );
}

export function AdminOrderDetailHeader({
  order,
  onRequestRemake,
}: {
  order: AdminOrderDetailOrder;
  onRequestRemake: () => void;
}) {
  return (
    <div className="mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)] mb-2">
          Case
        </p>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.03em]">
          {order.product_name}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <AdminStatusBadge status={order.status} />
          {order.paid_at && (
            <AdminTagBadge className="bg-[#E1F5EE] text-[var(--pd-teal-dark)] border-[#9FE1CB]">Paid</AdminTagBadge>
          )}
          {order.is_remake && (
            <AdminTagBadge className="bg-red-50 text-red-600 border-red-200">Remake</AdminTagBadge>
          )}
          <span className="text-[13px] text-[var(--pd-muted)]">{formatDateTime(order.created_at)}</span>
        </div>
      </div>
      <div className="flex items-start gap-3 shrink-0">
        {!order.is_remake && (
          <button
            type="button"
            onClick={onRequestRemake}
            className="h-9 px-4 text-[13px] border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            Request remake
          </button>
        )}
        <div className="text-right">
          <p className="text-2xl font-semibold text-[var(--pd-navy)] tracking-[-0.02em]">${order.total_price}</p>
          <p className="text-[12px] text-[var(--pd-muted)] mt-0.5">
            {order.quantity} unit{order.quantity > 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AdminOrderDetailStatusPanel({
  status,
  trackingInput,
  saving,
  trackingNumber,
  onStatusChange,
  onTrackingChange,
  onShip,
}: {
  status: string;
  trackingInput: string;
  saving: boolean;
  trackingNumber: string | null;
  onStatusChange: (status: string) => void;
  onTrackingChange: (value: string) => void;
  onShip: () => void;
}) {
  return (
    <AdminSidePanel title="Update status">
      <div className="flex flex-wrap gap-1 mb-5">
        {ADMIN_STATUS_STEPS.map((step) => (
          <button
            key={step}
            type="button"
            onClick={() => onStatusChange(step)}
            disabled={saving}
            className={chipClass(status === step, "h-8 px-2.5 text-[12px]")}
          >
            {ADMIN_STATUS_CONFIG[step]?.label}
          </button>
        ))}
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-2">
          Tracking
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={trackingInput}
            onChange={(e) => onTrackingChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onShip()}
            placeholder="UPS tracking number…"
            className={`${ORDER_INPUT_CLASS} h-9 flex-1 text-[13px]`}
          />
          <button
            type="button"
            onClick={onShip}
            disabled={saving}
            className={`${ORDER_BTN_PRIMARY} h-9 px-4 text-[13px]`}
          >
            {saving ? "…" : "Ship"}
          </button>
        </div>
        {trackingNumber && (
          <a
            href={`https://www.ups.com/track?tracknum=${trackingNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-[var(--pd-teal-dark)] hover:underline mt-2 inline-block"
          >
            Track: {trackingNumber} ↗
          </a>
        )}
      </div>
    </AdminSidePanel>
  );
}

function AdminCaseFilesList({
  caseFiles,
  stlFilePath,
}: {
  caseFiles: unknown;
  stlFilePath: string | null;
}) {
  const files = parseStoredCaseFiles(caseFiles);
  const list =
    files.length > 0
      ? files
      : stlFilePath
        ? [{ kind: "scan" as const, path: stlFilePath, fileName: stlFilePath.split("/").pop() ?? "scan.stl" }]
        : [];

  if (list.length === 0) return null;

  return (
    <ul className="divide-y divide-[var(--pd-border)] border border-[var(--pd-border)]">
      {list.map((file) => (
        <li key={file.path} className="flex items-center justify-between gap-3 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[var(--pd-navy)] truncate">{file.fileName}</p>
            <p className="text-[11px] text-[var(--pd-muted)]">{CASE_FILE_KIND_META[file.kind].label}</p>
          </div>
          <button
            type="button"
            onClick={() => void downloadCaseFile(file.path)}
            className="text-[12px] font-medium text-[var(--pd-teal-dark)] hover:underline shrink-0"
          >
            Download
          </button>
        </li>
      ))}
    </ul>
  );
}

export function AdminOrderDetailTimeline({
  order,
  originalOrder,
  timeline,
  newMessage,
  isInternal,
  sendingMsg,
  onNewMessageChange,
  onToggleInternal,
  onSendMessage,
}: {
  order: AdminOrderDetailOrder;
  originalOrder: AdminOrderDetailOrder | null;
  timeline: (
    | { type: "status"; data: AdminOrderDetailStatusHistory }
    | { type: "message"; data: AdminOrderDetailMessage }
  )[];
  newMessage: string;
  isInternal: boolean;
  sendingMsg: boolean;
  onNewMessageChange: (value: string) => void;
  onToggleInternal: () => void;
  onSendMessage: () => void;
}) {
  return (
    <AdminSidePanel title="Timeline">
      <div className="space-y-0 divide-y divide-[var(--pd-border)] border border-[var(--pd-border)] mb-5">
        <TimelineRow title="Order placed" meta={formatDateTime(order.created_at)} dotClass="bg-[var(--pd-teal)]" />

        {order.is_remake && originalOrder && (
          <TimelineRow
            title="Remake created"
            meta={
              <>
                Reason:{" "}
                <span className="font-medium text-[var(--pd-navy)]">
                  {REMAKE_REASONS.find((r) => r.value === order.remake_reason)?.label || order.remake_reason}
                </span>
                {order.remake_note && ` — ${order.remake_note}`}
              </>
            }
            dotClass="bg-red-400"
            footer={
              <Link
                href={`/admin/orders/${order.remake_of}`}
                className="text-[12px] text-[var(--pd-teal-dark)] hover:underline mt-1 inline-block"
              >
                Original case #{originalOrder.id.slice(0, 6).toUpperCase()} →
              </Link>
            }
          />
        )}

        {timeline.map((item) => {
          if (item.type === "status") {
            const cfg = ADMIN_STATUS_CONFIG[item.data.to_status];
            return (
              <TimelineRow
                key={item.data.id}
                title={
                  <>
                    Status → <span className="text-[var(--pd-navy)]">{cfg?.label ?? item.data.to_status}</span>
                  </>
                }
                meta={
                  item.data.from_status
                    ? `From ${ADMIN_STATUS_CONFIG[item.data.from_status]?.label ?? item.data.from_status} · ${timeAgo(item.data.created_at)}`
                    : timeAgo(item.data.created_at)
                }
                dotClass="bg-[var(--pd-muted)]"
              />
            );
          }

          const msg = item.data;
          return (
            <div key={msg.id} className="px-4 py-3 bg-white">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[13px] font-medium text-[var(--pd-navy)]">{msg.sender_name}</span>
                <AdminTagBadge
                  className={
                    msg.is_internal
                      ? "bg-[#FDF4FF] text-[#9333EA] border-[#E9D5FF]"
                      : msg.sender_role === "admin"
                        ? "bg-[var(--pd-surface)] text-[var(--pd-muted)] border-[var(--pd-border)]"
                        : "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                  }
                >
                  {msg.is_internal ? "Internal" : msg.sender_role === "admin" ? "Admin" : "Practice"}
                </AdminTagBadge>
                <span className="text-[11px] text-[var(--pd-muted)]">{timeAgo(msg.created_at)}</span>
              </div>
              <p
                className={cn(
                  "text-[13px] text-[var(--pd-slate)] leading-relaxed border px-3 py-2",
                  msg.is_internal
                    ? "bg-[#FDF4FF] border-[#E9D5FF]"
                    : "bg-[var(--pd-surface)] border-[var(--pd-border)]"
                )}
              >
                {msg.message}
              </p>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[var(--pd-border)] pt-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)]">Add note</p>
          <button
            type="button"
            onClick={onToggleInternal}
            className={chipClass(isInternal, "h-7 px-2.5 text-[11px]")}
          >
            {isInternal ? "Internal only" : "Visible to practice"}
          </button>
        </div>
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSendMessage();
            }}
            placeholder={isInternal ? "Internal note (lab/admin only)…" : "Message to practice…"}
            rows={2}
            className={`${ORDER_INPUT_CLASS} flex-1 text-[13px] py-2 resize-none min-h-[72px]`}
          />
          <button
            type="button"
            onClick={onSendMessage}
            disabled={sendingMsg || !newMessage.trim()}
            className={`${ORDER_BTN_NAVY} self-end h-9 px-4 text-[13px]`}
          >
            {sendingMsg ? "…" : "Send"}
          </button>
        </div>
        <p className="text-[11px] text-[var(--pd-muted)] mt-1.5">⌘ + Enter to send</p>
      </div>
    </AdminSidePanel>
  );
}

function TimelineRow({
  title,
  meta,
  dotClass,
  footer,
}: {
  title: React.ReactNode;
  meta: React.ReactNode;
  dotClass: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 px-4 py-3 bg-white">
      <div className={cn("w-2 h-2 shrink-0 mt-1.5", dotClass)} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[var(--pd-navy)]">{title}</p>
        <p className="text-[12px] text-[var(--pd-muted)] mt-0.5">{meta}</p>
        {footer}
      </div>
    </div>
  );
}

export function AdminOrderDetailCasePanel({
  order,
  teeth,
}: {
  order: AdminOrderDetailOrder;
  teeth: string | null;
}) {
  const rows = [
    { label: "Product", value: order.product_name },
    { label: "Quantity", value: `${order.quantity} unit${order.quantity > 1 ? "s" : ""}` },
    order.shade ? { label: "Shade", value: order.shade } : null,
    teeth ? { label: "Tooth", value: teeth } : null,
    order.due_date
      ? {
          label: "Due date",
          value: new Date(order.due_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        }
      : null,
    order.notes ? { label: "Notes", value: order.notes } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <AdminSidePanel title="Case details">
      <dl className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-3 text-[13px]">
            <dt className="text-[var(--pd-muted)] shrink-0">{row.label}</dt>
            <dd className="text-[var(--pd-navy)] text-right">{row.value}</dd>
          </div>
        ))}
      </dl>
      {(order.case_files || order.stl_file_path) && (
        <div className="mt-4 pt-4 border-t border-[var(--pd-border)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-2">
            Case files
          </p>
          <AdminCaseFilesList caseFiles={order.case_files} stlFilePath={order.stl_file_path} />
        </div>
      )}
    </AdminSidePanel>
  );
}

export function AdminOrderDetailPracticePanel({
  userId,
  profile,
  rx,
}: {
  userId: string;
  profile: AdminOrderDetailProfile | null;
  rx: AdminOrderDetailRx | null;
}) {
  return (
    <AdminSidePanel title="Practice">
      <div className="space-y-1.5 text-[13px]">
        <p className="font-semibold text-[var(--pd-navy)]">{profile?.practice_name || "—"}</p>
        {rx && <p className="text-[var(--pd-slate)]">Dr. {rx.dentist_name}</p>}
        {rx && (
          <p className="text-[12px] text-[var(--pd-muted)]">
            License #{rx.dentist_license_no} · {rx.license_state}
          </p>
        )}
        {profile?.phone && <p className="text-[12px] text-[var(--pd-muted)]">{profile.phone}</p>}
        <Link
          href={`/admin/customers/${userId}`}
          className={`${ORDER_BTN_BACK} mt-3 w-full h-9 text-[13px] inline-flex justify-between`}
        >
          <span>Customer profile</span>
          <span>→</span>
        </Link>
      </div>
    </AdminSidePanel>
  );
}

export function AdminOrderDetailRxPanel({ rx }: { rx: AdminOrderDetailRx }) {
  return (
    <AdminSidePanel title="Rx">
      <p
        className={cn(
          "text-[13px] font-medium",
          rx.authorized ? "text-[var(--pd-teal-dark)]" : "text-red-600"
        )}
      >
        {rx.authorized ? "✓ Authorized" : "✗ Not authorized"}
      </p>
      <div className="space-y-1 text-[12px] text-[var(--pd-slate)] mt-2">
        {rx.margin_type && <p>Margin: {rx.margin_type}</p>}
        {rx.occlusion && <p>Occlusion: {rx.occlusion}</p>}
        {rx.guard_type && <p>Guard: {rx.guard_type}</p>}
        {rx.notes && <p className="text-[var(--pd-muted)] mt-2 leading-relaxed">{rx.notes}</p>}
      </div>
    </AdminSidePanel>
  );
}

export function AdminOrderDetailPaymentPanel({ order }: { order: AdminOrderDetailOrder }) {
  return (
    <AdminSidePanel title="Payment">
      <div className="space-y-2 text-[13px]">
        <div className="flex justify-between text-[var(--pd-slate)]">
          <span>Unit price</span>
          <span>${order.unit_price}</span>
        </div>
        <div className="flex justify-between text-[var(--pd-slate)]">
          <span>Qty</span>
          <span>{order.quantity}</span>
        </div>
        <div className="flex justify-between font-semibold text-[var(--pd-navy)] border-t border-[var(--pd-border)] pt-2 mt-2">
          <span>Total</span>
          <span>${order.total_price}</span>
        </div>
        {order.is_remake && <p className="text-[12px] text-red-600">Remake — no charge</p>}
        {order.paid_at && (
          <p className="text-[12px] text-[var(--pd-muted)]">Paid {formatDateTime(order.paid_at)}</p>
        )}
      </div>
    </AdminSidePanel>
  );
}

export function AdminOrderDetailRemakeModal({
  order,
  remakeReason,
  remakeNote,
  submitting,
  onReasonChange,
  onNoteChange,
  onClose,
  onSubmit,
}: {
  order: AdminOrderDetailOrder;
  remakeReason: string;
  remakeNote: string;
  submitting: boolean;
  onReasonChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative bg-white border border-[var(--pd-border)] w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-4 py-4 border-b border-[var(--pd-border)] bg-[var(--pd-surface)] flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[16px] font-semibold text-[var(--pd-navy)]">Request remake</h3>
            <p className="text-[12px] text-[var(--pd-muted)] mt-0.5">
              #{order.id.slice(0, 6).toUpperCase()} · {order.product_name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 border border-[var(--pd-border)] text-[var(--pd-muted)] hover:text-[var(--pd-navy)] hover:bg-white transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-2">
              Select reason
            </p>
            <div className="space-y-1">
              {REMAKE_REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => onReasonChange(r.value)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-[13px] border transition-colors",
                    remakeReason === r.value
                      ? "border-red-300 bg-red-50 text-red-700 font-medium"
                      : "border-[var(--pd-border)] bg-white text-[var(--pd-navy)] hover:bg-[var(--pd-surface)]"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-2">
              Note (optional)
            </p>
            <textarea
              value={remakeNote}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Add details…"
              rows={2}
              className={`${ORDER_INPUT_CLASS} text-[13px] py-2 resize-y min-h-[72px]`}
            />
          </div>

          <p className="text-[12px] text-amber-800 border border-amber-200 bg-amber-50 px-3 py-2 leading-relaxed">
            A $0 remake order will be created and linked to this case. You will be redirected to the new case.
          </p>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className={`${ORDER_BTN_BACK} flex-1 h-9 text-[13px]`}>
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!remakeReason || submitting}
              className="flex-1 h-9 text-[13px] bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-40"
            >
              {submitting ? "Creating…" : "Create remake"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminOrderDetailLayout({
  order,
  originalOrder,
  profile,
  rx,
  productCategory,
  defaultPartnerEmail,
  timeline,
  trackingInput,
  saving,
  newMessage,
  isInternal,
  sendingMsg,
  teeth,
  onOutsourceSent,
  onRequestRemake,
  onStatusChange,
  onTrackingChange,
  onShip,
  onNewMessageChange,
  onToggleInternal,
  onSendMessage,
}: {
  order: AdminOrderDetailOrder;
  originalOrder: AdminOrderDetailOrder | null;
  profile: AdminOrderDetailProfile | null;
  rx: AdminOrderDetailRx | null;
  productCategory: string | null;
  defaultPartnerEmail: string;
  timeline: (
    | { type: "status"; data: AdminOrderDetailStatusHistory }
    | { type: "message"; data: AdminOrderDetailMessage }
  )[];
  trackingInput: string;
  saving: boolean;
  newMessage: string;
  isInternal: boolean;
  sendingMsg: boolean;
  teeth: string | null;
  onOutsourceSent: (fields: Partial<DesignOutsourceFields>) => void;
  onRequestRemake: () => void;
  onStatusChange: (status: string) => void;
  onTrackingChange: (value: string) => void;
  onShip: () => void;
  onNewMessageChange: (value: string) => void;
  onToggleInternal: () => void;
  onSendMessage: () => void;
}) {
  return (
    <div className="max-w-6xl w-full mx-auto">
      <AdminOrderDetailBreadcrumb orderId={order.id} isRemake={order.is_remake} />

      {order.is_remake && order.remake_of && (
        <AdminOrderDetailRemakeBanner
          remakeReason={order.remake_reason}
          remakeNote={order.remake_note}
          originalOrderId={order.remake_of}
        />
      )}

      <AdminOrderDetailHeader order={order} onRequestRemake={onRequestRemake} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <AdminOrderDetailStatusPanel
            status={order.status}
            trackingInput={trackingInput}
            saving={saving}
            trackingNumber={order.tracking_number}
            onStatusChange={onStatusChange}
            onTrackingChange={onTrackingChange}
            onShip={onShip}
          />
          <AdminOrderDetailTimeline
            order={order}
            originalOrder={originalOrder}
            timeline={timeline}
            newMessage={newMessage}
            isInternal={isInternal}
            sendingMsg={sendingMsg}
            onNewMessageChange={onNewMessageChange}
            onToggleInternal={onToggleInternal}
            onSendMessage={onSendMessage}
          />
        </div>

        <div className="space-y-4">
          <AdminOrderDetailCasePanel order={order} teeth={teeth} />
          <AdminDesignOutsourcePanel
            orderId={order.id}
            productCategory={productCategory}
            order={order}
            defaultPartnerEmail={defaultPartnerEmail}
            outsource={{
              design_outsource_status: order.design_outsource_status,
              design_outsource_sent_at: order.design_outsource_sent_at,
              design_outsource_email: order.design_outsource_email,
              design_outsource_notes: order.design_outsource_notes,
              design_outsource_sent_by: order.design_outsource_sent_by,
            }}
            onSent={onOutsourceSent}
          />
          <AdminOrderDetailPracticePanel userId={order.user_id} profile={profile} rx={rx} />
          {rx && <AdminOrderDetailRxPanel rx={rx} />}
          <AdminOrderDetailPaymentPanel order={order} />
        </div>
      </div>
    </div>
  );
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

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
