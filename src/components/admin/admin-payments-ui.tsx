"use client";

import Link from "next/link";
import {
  ORDER_BTN_BACK,
  ORDER_BTN_NAVY,
  ORDER_BTN_PRIMARY,
  ORDER_INPUT_CLASS,
  chipClass,
} from "@/components/marketing/order-ui";
import {
  AdminOrderIdChip,
  AdminOrdersTableHead,
  AdminOrdersTableShell,
  AdminTagBadge,
} from "@/components/admin/admin-orders-ui";
import { orderPaymentLabel, isOrderUnpaid, type OrderPaymentFields } from "@/lib/order-payment";
import {
  stripeCheckoutSessionDashboardUrl,
  stripeDashboardHomeUrl,
} from "@/lib/stripe-admin";

export type AdminPaymentOrder = {
  id: string;
  user_id: string;
  product_name: string;
  total_price: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  stripe_session_id: string | null;
  case_number: number | null;
  is_remake: boolean;
  order_type: string | null;
};

export function AdminPaymentsLoading() {
  return (
    <div className="py-16 text-center">
      <p className="text-[14px] text-[var(--pd-muted)]">Loading payments…</p>
    </div>
  );
}

export function AdminPaymentsHeader({ unpaidCount }: { unpaidCount: number }) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)] mb-2">
          Operations
        </p>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.03em]">
          Payments
        </h1>
        <p className="text-[14px] text-[var(--pd-slate)] mt-2 max-w-2xl leading-relaxed">
          Track paid and unpaid cases, sync from Stripe, and open refunds in the Stripe Dashboard.
          {unpaidCount > 0 && (
            <span className="text-amber-800"> {unpaidCount} case{unpaidCount === 1 ? "" : "s"} awaiting payment.</span>
          )}
        </p>
      </div>
      <a
        href={stripeDashboardHomeUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className={`${ORDER_BTN_NAVY} h-9 px-4 text-[13px] shrink-0`}
      >
        Stripe Dashboard →
      </a>
    </div>
  );
}

export function AdminPaymentStatusBadge({ order }: { order: OrderPaymentFields }) {
  const label = orderPaymentLabel(order);
  const className =
    label === "Paid"
      ? "bg-[#E1F5EE] text-[var(--pd-teal-dark)] border-[#9FE1CB]"
      : label === "Remake"
        ? "bg-red-50 text-red-600 border-red-200"
        : "bg-amber-50 text-amber-800 border-amber-200";

  return <AdminTagBadge className={className}>{label}</AdminTagBadge>;
}

export function AdminPaymentsFilters({
  search,
  onSearchChange,
  paymentFilter,
  onPaymentFilterChange,
  dateFilter,
  onDateFilterChange,
  onClear,
  showClear,
  filteredCount,
  filteredPaidTotal,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  paymentFilter: string;
  onPaymentFilterChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  onClear: () => void;
  showClear: boolean;
  filteredCount: number;
  filteredPaidTotal: number;
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

      <div className="flex gap-px bg-[var(--pd-border)] border border-[var(--pd-border)] p-px">
        {[
          { key: "all", label: "All" },
          { key: "unpaid", label: "Unpaid" },
          { key: "paid", label: "Paid" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onPaymentFilterChange(item.key)}
            className={chipClass(paymentFilter === item.key, "h-8 px-3 text-[12px]")}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex gap-px bg-[var(--pd-border)] border border-[var(--pd-border)] p-px">
        {[
          { key: "all", label: "All dates" },
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
        <span>{filteredCount} rows</span>
        {filteredCount > 0 && (
          <span>
            · Paid total:{" "}
            <span className="font-semibold text-[var(--pd-navy)]">${filteredPaidTotal}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function AdminPaymentActions({
  order,
  busy,
  message,
  onMarkPaid,
  onSyncStripe,
}: {
  order: AdminPaymentOrder;
  busy: boolean;
  message: string | null;
  onMarkPaid: () => void;
  onSyncStripe: () => void;
}) {
  const unpaid = isOrderUnpaid(order);

  return (
    <div className="flex flex-col gap-2 min-w-[140px]">
      {unpaid && (
        <>
          <button
            type="button"
            disabled={busy}
            onClick={onMarkPaid}
            className={`${ORDER_BTN_PRIMARY} h-8 px-2 text-[11px] disabled:opacity-50`}
          >
            {busy ? "…" : "Mark paid"}
          </button>
          {order.stripe_session_id && (
            <button
              type="button"
              disabled={busy}
              onClick={onSyncStripe}
              className={`${ORDER_BTN_BACK} h-8 px-2 text-[11px] disabled:opacity-50`}
            >
              Sync Stripe
            </button>
          )}
        </>
      )}
      {order.stripe_session_id && (
        <a
          href={stripeCheckoutSessionDashboardUrl(order.stripe_session_id)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${ORDER_BTN_BACK} h-8 px-2 text-[11px] inline-flex items-center justify-center`}
          onClick={(e) => e.stopPropagation()}
        >
          Stripe →
        </a>
      )}
      <Link
        href={`/admin/orders/${order.id}`}
        className={`${ORDER_BTN_NAVY} h-8 px-2 text-[11px] inline-flex items-center justify-center`}
        onClick={(e) => e.stopPropagation()}
      >
        Case →
      </Link>
      {message && <p className="text-[10px] text-[var(--pd-muted)] leading-snug">{message}</p>}
    </div>
  );
}

export function AdminPaymentsMetricRow({
  unpaidCount,
  unpaidTotal,
  todayRevenue,
  monthRevenue,
  totalRevenue,
  paidCount,
}: {
  unpaidCount: number;
  unpaidTotal: number;
  todayRevenue: number;
  monthRevenue: number;
  totalRevenue: number;
  paidCount: number;
}) {
  const items = [
    {
      label: "Unpaid",
      value: String(unpaidCount),
      sub: unpaidCount > 0 ? `$${unpaidTotal} outstanding` : "All caught up",
    },
    { label: "Today", value: `$${todayRevenue}`, sub: "Paid today" },
    { label: "This month", value: `$${monthRevenue}`, sub: "Paid this month" },
    { label: "All time", value: `$${totalRevenue}`, sub: `${paidCount} paid cases` },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--pd-border)] border border-[var(--pd-border)] mb-4">
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

export function AdminPaymentsEmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-[14px] text-[var(--pd-muted)]">
        No payments match this view.
      </td>
    </tr>
  );
}

export function AdminOrderPaymentPanel({
  order,
  busy,
  message,
  onMarkPaid,
  onSyncStripe,
}: {
  order: {
    id: string;
    product_name?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    paid_at: string | null;
    stripe_session_id?: string | null;
    is_remake: boolean;
    order_type?: string | null;
  };
  busy?: boolean;
  message?: string | null;
  onMarkPaid?: () => void;
  onSyncStripe?: () => void;
}) {
  const label = orderPaymentLabel(order);
  const unpaid = isOrderUnpaid(order);

  return (
    <div className="border border-[var(--pd-border)] bg-white">
      <div className="px-4 py-3 border-b border-[var(--pd-border)] bg-[var(--pd-surface)] flex items-center justify-between gap-2">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)]">Payment</h2>
        <AdminPaymentStatusBadge order={order} />
      </div>
      <div className="p-4 space-y-3 text-[13px]">
        <div className="space-y-2">
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
        </div>

        {label === "Remake" && <p className="text-[12px] text-red-600">Remake — no charge</p>}

        {order.paid_at && (
          <p className="text-[12px] text-[var(--pd-muted)]">
            Paid{" "}
            {new Date(order.paid_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}

        {unpaid && !order.is_remake && (
          <p className="text-[12px] text-amber-800">Awaiting payment — case may have been created before checkout finished.</p>
        )}

        {message && <p className="text-[12px] text-[var(--pd-teal-dark)]">{message}</p>}

        <div className="flex flex-col gap-2 pt-1">
          {unpaid && onMarkPaid && (
            <button
              type="button"
              disabled={busy}
              onClick={onMarkPaid}
              className={`${ORDER_BTN_PRIMARY} w-full h-9 text-[13px] disabled:opacity-50`}
            >
              {busy ? "Saving…" : "Mark as paid"}
            </button>
          )}
          {unpaid && order.stripe_session_id && onSyncStripe && (
            <button
              type="button"
              disabled={busy}
              onClick={onSyncStripe}
              className={`${ORDER_BTN_BACK} w-full h-9 text-[13px] disabled:opacity-50`}
            >
              {busy ? "Checking…" : "Sync from Stripe"}
            </button>
          )}
          {order.stripe_session_id && (
            <a
              href={stripeCheckoutSessionDashboardUrl(order.stripe_session_id)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${ORDER_BTN_BACK} w-full h-9 text-[13px] inline-flex items-center justify-center`}
            >
              Open in Stripe →
            </a>
          )}
          <a
            href={stripeDashboardHomeUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={`${ORDER_BTN_NAVY} w-full h-9 text-[13px] inline-flex items-center justify-center`}
          >
            Stripe payments (refunds) →
          </a>
        </div>
      </div>
    </div>
  );
}

export async function runAdminPaymentAction(
  action: "mark-paid" | "sync-stripe",
  orderId: string
): Promise<{ ok: boolean; message: string; paid_at?: string | null; due_date?: string | null }> {
  const res = await fetch("/api/admin/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, orderId }),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { ok: false, message: data.error || "Request failed" };
  }

  if (action === "sync-stripe" && data.ok === false) {
    return { ok: false, message: data.message || "Stripe payment not completed" };
  }

  if (data.alreadyPaid) {
    return { ok: true, message: "Already marked paid", paid_at: data.paid_at };
  }

  return {
    ok: true,
    message: action === "sync-stripe" ? "Synced from Stripe" : "Marked as paid",
    paid_at: data.paid_at ?? null,
    due_date: data.due_date ?? null,
  };
}
