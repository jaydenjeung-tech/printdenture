"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCaseNumberLabel } from "@/lib/case-number";
import {
  ORDER_BTN_BACK,
  ORDER_BTN_NAVY,
  ORDER_BTN_PRIMARY,
  ORDER_INPUT_CLASS,
  chipClass,
} from "@/components/marketing/order-ui";

export type AdminOrderStatus = "received" | "printing" | "qc" | "shipped" | "delivered" | string;

export const ADMIN_STATUS_STEPS = ["received", "printing", "qc", "shipped", "delivered"] as const;

export const ADMIN_STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  received: { label: "Received", className: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]" },
  printing: { label: "In Progress", className: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]" },
  qc: { label: "QC Check", className: "bg-[#FDF4FF] text-[#9333EA] border-[#E9D5FF]" },
  shipped: { label: "Shipped", className: "bg-[#E1F5EE] text-[var(--pd-teal-dark)] border-[#9FE1CB]" },
  delivered: { label: "Delivered", className: "bg-[var(--pd-surface)] text-[var(--pd-muted)] border-[var(--pd-border)]" },
};

export function AdminOrdersLoading() {
  return (
    <div className="py-16 text-center">
      <p className="text-[14px] text-[var(--pd-muted)]">Loading orders…</p>
    </div>
  );
}

export function AdminOrdersHeader({
  totalCount,
  lead,
}: {
  totalCount: number;
  lead?: string;
}) {
  return (
    <div className="mb-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)] mb-2">
        Operations
      </p>
      <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.03em]">
        Orders
      </h1>
      <p className="text-[14px] text-[var(--pd-slate)] mt-2 max-w-2xl leading-relaxed">
        {lead ??
          `${totalCount} total case${totalCount !== 1 ? "s" : ""} — status, remakes, messages, and partner design.`}
      </p>
      <p className="text-[12px] text-[var(--pd-muted)] mt-1.5">
        Payment tracking is in{" "}
        <Link href="/admin/payments" className="text-[var(--pd-teal-dark)] hover:underline">
          Payments
        </Link>
        . For print work orders, use{" "}
        <Link href="/lab" className="text-[var(--pd-teal-dark)] hover:underline">
          Lab queue
        </Link>
        .
      </p>
    </div>
  );
}

export function AdminOrdersMetricRow({
  items,
}: {
  items: { label: string; value: string; sub: string }[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[var(--pd-border)] border border-[var(--pd-border)] mb-4">
      {items.map((item) => (
        <div key={item.label} className="bg-white p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--pd-muted)] mb-1">
            {item.label}
          </p>
          <p className="text-2xl font-semibold text-[var(--pd-navy)] tracking-[-0.02em]">{item.value}</p>
          <p className="text-[12px] text-[var(--pd-muted)] mt-1">{item.sub}</p>
        </div>
      ))}
    </div>
  );
}

export function AdminOrdersStatusFilters({
  items,
  activeFilter,
  onSelect,
}: {
  items: { label: string; value: number; filter: string; tone: string; highlight?: boolean }[];
  activeFilter: string;
  onSelect: (filter: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--pd-border)] border border-[var(--pd-border)] mb-8">
      {items.map((item) => {
        const active = activeFilter === item.filter;
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => onSelect(activeFilter === item.filter ? "all" : item.filter)}
            className={cn(
              "bg-white p-4 text-left transition-colors hover:bg-[var(--pd-surface)]",
              active && "bg-[var(--pd-navy)] text-white hover:bg-[var(--pd-navy)]",
              !active && item.highlight && "ring-1 ring-inset ring-[#BFDBFE]"
            )}
          >
            <p className={cn("text-2xl font-semibold tracking-[-0.02em]", active ? "text-white" : item.tone)}>
              {item.value}
            </p>
            <p className={cn("text-[12px] mt-1", active ? "text-white/75" : "text-[var(--pd-muted)]")}>
              {item.label}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export function AdminOrdersToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentFilter,
  onPaymentFilterChange,
  dateFilter,
  onDateFilterChange,
  onClear,
  showClear,
  filteredCount,
  filteredRevenue,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  paymentFilter?: string;
  onPaymentFilterChange?: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  onClear: () => void;
  showClear: boolean;
  filteredCount: number;
  filteredRevenue: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--pd-muted)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search ID, practice, product…"
          className={`${ORDER_INPUT_CLASS} h-9 pl-8 w-64 sm:w-72`}
        />
      </div>

      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className={`${ORDER_INPUT_CLASS} h-9 w-auto`}
      >
        <option value="all">All statuses</option>
        {ADMIN_STATUS_STEPS.map((s) => (
          <option key={s} value={s}>
            {ADMIN_STATUS_CONFIG[s]?.label ?? s}
          </option>
        ))}
      </select>

      {onPaymentFilterChange && (
        <div className="flex gap-px bg-[var(--pd-border)] border border-[var(--pd-border)] p-px">
          {[
            { key: "all", label: "All pay" },
            { key: "unpaid", label: "Unpaid" },
            { key: "paid", label: "Paid" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onPaymentFilterChange(item.key)}
              className={chipClass((paymentFilter ?? "all") === item.key, "h-8 px-3 text-[12px]")}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-px bg-[var(--pd-border)] border border-[var(--pd-border)] p-px">
        {[
          { key: "all", label: "All" },
          { key: "today", label: "Today" },
          { key: "week", label: "Week" },
          { key: "month", label: "Month" },
        ].map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => onDateFilterChange(d.key)}
            className={chipClass(dateFilter === d.key, "h-8 px-3 text-[12px]")}
          >
            {d.label}
          </button>
        ))}
      </div>

      {showClear && (
        <button type="button" onClick={onClear} className={`${ORDER_BTN_BACK} h-9 px-3 text-[13px]`}>
          Clear
        </button>
      )}

      <div className="ml-auto flex items-center gap-2 text-[12px] text-[var(--pd-muted)]">
        <span>{filteredCount} orders</span>
        {filteredCount > 0 && (
          <span>
            · Revenue:{" "}
            <span className="font-semibold text-[var(--pd-navy)]">${filteredRevenue}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function AdminStatusBadge({ status }: { status: string }) {
  const config = ADMIN_STATUS_CONFIG[status] ?? ADMIN_STATUS_CONFIG.received;
  return (
    <span className={cn("text-[11px] font-medium px-2 py-0.5 border uppercase tracking-wide", config.className)}>
      {config.label}
    </span>
  );
}

export function AdminTagBadge({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <span className={cn("text-[10px] font-medium px-2 py-0.5 border uppercase tracking-wide", className)}>
      {children}
    </span>
  );
}

export function AdminDueDateChip({ dueDate }: { dueDate: string | null }) {
  if (!dueDate) return <span className="text-[12px] text-[var(--pd-muted)]">—</span>;

  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - today.getTime()) / 86400000);
  const formatted = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const label =
    days < 0 ? `${Math.abs(days)}d late`
    : days === 0 ? "Today"
    : days === 1 ? "Tomorrow"
    : `${days}d`;

  const color =
    days < 0 ? "text-red-700 bg-red-50 border-red-200"
    : days <= 1 ? "text-orange-700 bg-orange-50 border-orange-200"
    : days <= 3 ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-[var(--pd-teal-dark)] bg-[#E1F5EE] border-[#9FE1CB]";

  return (
    <span className={cn("inline-block text-[11px] px-2 py-0.5 border font-medium", color)}>
      {formatted} · {label}
    </span>
  );
}

export function AdminSortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <span className={cn("ml-1 text-[10px] transition-opacity", active ? "opacity-100" : "opacity-30")}>
      {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );
}

function AdminDetailPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-[var(--pd-border)] bg-white p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-2">{title}</p>
      {children}
    </div>
  );
}

export function AdminOrderExpandedPanel({
  order,
  profile,
  rx,
  trackingValue,
  onTrackingChange,
  onStatusChange,
  onShip,
  onDownloadStl,
  savingStatus,
  savingTracking,
}: {
  order: {
    id: string;
    case_number?: number | null;
    status: string;
    unit_price: number;
    quantity: number;
    total_price: number;
    paid_at: string | null;
    tracking_number: string | null;
    stl_file_path: string | null;
    notes: string | null;
  };
  profile: { practice_name: string | null; phone?: string | null } | undefined;
  rx: {
    dentist_name: string;
    dentist_license_no: string;
    license_state: string;
    authorized: boolean;
    margin_type: string | null;
    occlusion: string | null;
    guard_type: string | null;
    notes: string | null;
  } | undefined;
  trackingValue: string;
  onTrackingChange: (value: string) => void;
  onStatusChange: (status: string) => void;
  onShip: () => void;
  onDownloadStl: () => void;
  savingStatus: boolean;
  savingTracking: boolean;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-2">
            Update status
          </p>
          <div className="flex flex-wrap gap-1">
            {ADMIN_STATUS_STEPS.map((step) => (
              <button
                key={step}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(step);
                }}
                disabled={savingStatus}
                className={chipClass(order.status === step, "h-8 px-2.5 text-[12px]")}
              >
                {ADMIN_STATUS_CONFIG[step]?.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-2">
            Tracking
          </p>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={trackingValue}
              onChange={(e) => onTrackingChange(e.target.value)}
              placeholder="UPS tracking number…"
              className={`${ORDER_INPUT_CLASS} h-9 flex-1 text-[13px]`}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShip();
              }}
              disabled={savingTracking}
              className={`${ORDER_BTN_PRIMARY} h-9 px-3 text-[12px]`}
            >
              {savingTracking ? "…" : "Ship"}
            </button>
          </div>
          {order.tracking_number && (
            <a
              href={`https://www.ups.com/track?tracknum=${order.tracking_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] text-[var(--pd-teal-dark)] hover:underline mt-2 inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              Track: {order.tracking_number}
            </a>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <AdminDetailPanel title="Customer">
          <div className="text-[14px] space-y-1">
            <p className="font-semibold text-[var(--pd-navy)]">{profile?.practice_name || "—"}</p>
            {rx && (
              <p className="text-[12px] text-[var(--pd-slate)]">
                Dr. {rx.dentist_name} · #{rx.dentist_license_no} ({rx.license_state})
              </p>
            )}
            {profile?.phone && <p className="text-[12px] text-[var(--pd-muted)]">{profile.phone}</p>}
            <p className="text-[11px] font-mono text-[var(--pd-muted)] pt-1">
              #{formatCaseNumberLabel(order.case_number, order.id)}
            </p>
          </div>
        </AdminDetailPanel>

        <AdminDetailPanel title="Payment">
          <div className="flex justify-between text-[13px] text-[var(--pd-slate)]">
            <span>
              ${order.unit_price} × {order.quantity}
            </span>
            <span className="font-semibold text-[var(--pd-navy)]">${order.total_price}</span>
          </div>
          {order.paid_at && (
            <p className="text-[12px] text-[var(--pd-muted)] mt-2">
              Paid{" "}
              {new Date(order.paid_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </AdminDetailPanel>
      </div>

      <div className="space-y-4">
        {rx && (
          <AdminDetailPanel title="Rx">
            <p className={`text-[13px] font-medium ${rx.authorized ? "text-[var(--pd-teal-dark)]" : "text-red-600"}`}>
              {rx.authorized ? "✓ Authorized" : "✗ Not authorized"}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[var(--pd-slate)] mt-2">
              {rx.margin_type && <span>Margin: {rx.margin_type}</span>}
              {rx.occlusion && <span>Occlusion: {rx.occlusion}</span>}
              {rx.guard_type && <span>Guard: {rx.guard_type}</span>}
            </div>
            {rx.notes && <p className="text-[12px] text-[var(--pd-muted)] mt-2">Notes: {rx.notes}</p>}
          </AdminDetailPanel>
        )}

        {order.stl_file_path && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-2">
              STL file
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDownloadStl();
              }}
              className={`${ORDER_BTN_BACK} h-9 px-4 text-[12px] text-[var(--pd-teal-dark)] hover:border-[var(--pd-teal)]`}
            >
              ↓ Download STL
            </button>
          </div>
        )}

        {order.notes && (
          <AdminDetailPanel title="Notes">
            <p className="text-[13px] text-[var(--pd-slate)] leading-relaxed whitespace-pre-wrap">{order.notes}</p>
          </AdminDetailPanel>
        )}

        <div className="border-t border-[var(--pd-border)] pt-4 space-y-3">
          <p className="text-[12px] text-[var(--pd-muted)]">
            Full case — timeline, messages, design outsource, and shipping.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/lab/workorders?ids=${order.id}`}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className={`${ORDER_BTN_BACK} inline-flex h-9 px-4 text-[12px]`}
            >
              Print work order
            </Link>
            <Link
              href={`/admin/orders/${order.id}`}
              onClick={(e) => e.stopPropagation()}
              className={`${ORDER_BTN_NAVY} inline-flex h-9 px-4 text-[12px]`}
            >
              Open full case →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminOrdersTableShell({ children }: { children: ReactNode }) {
  return (
    <div className="border border-[var(--pd-border)] bg-white overflow-x-auto">
      <table className="w-full min-w-[960px] text-[14px]">{children}</table>
    </div>
  );
}

export function AdminOrdersTableHead({
  columns,
  sortKey,
  sortDir,
  onSort,
}: {
  columns: { key: string | null; label: string; width?: string }[];
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
}) {
  return (
    <thead>
      <tr className="border-b border-[var(--pd-border)] bg-[var(--pd-surface)]">
        {columns.map((col, idx) => (
          <th
            key={col.key ?? `col-${idx}`}
            className={cn(
              "text-left px-4 py-3 text-[11px] font-semibold text-[var(--pd-muted)] uppercase tracking-[0.1em]",
              col.width,
              col.key && "cursor-pointer hover:text-[var(--pd-navy)] select-none"
            )}
            onClick={() => col.key && onSort(col.key)}
          >
            {col.label}
            {col.key && <AdminSortIcon active={sortKey === col.key} dir={sortDir} />}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function AdminOrdersEmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-16 border-t border-[var(--pd-border)]">
        <p className="text-[14px] text-[var(--pd-muted)]">No orders found.</p>
      </td>
    </tr>
  );
}

export function AdminOrderIdChip({
  id,
  caseNumber,
}: {
  id: string;
  caseNumber?: number | null;
}) {
  return (
    <span className="font-mono text-[11px] text-[var(--pd-muted)] border border-[var(--pd-border)] bg-[var(--pd-surface)] px-2 py-0.5">
      #{formatCaseNumberLabel(caseNumber, id)}
    </span>
  );
}
