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
  AdminStatusBadge,
} from "@/components/admin/admin-orders-ui";
import { AdminDesignOutsourcePanel } from "@/components/admin/admin-design-outsource-panel";
import type { DesignOutsourceFields } from "@/lib/design-outsource";

export function AdminOverviewLoading() {
  return (
    <div className="py-16 text-center">
      <p className="text-[14px] text-[var(--pd-muted)]">Loading overview…</p>
    </div>
  );
}

export function AdminOverviewHeader() {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)] mb-2">
          Admin
        </p>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.03em]">
          Overview
        </h1>
        <p className="text-[14px] text-[var(--pd-slate)] mt-2">Recent orders and revenue at a glance.</p>
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        <Link href="/admin/orders" className={`${ORDER_BTN_NAVY} h-9 px-4 text-[13px]`}>
          All orders →
        </Link>
        <Link href="/admin/products" className={`${ORDER_BTN_BACK} h-9 px-4 text-[13px]`}>
          Products
        </Link>
      </div>
    </div>
  );
}

export function AdminOverviewMetrics({
  items,
}: {
  items: { label: string; value: string | number }[];
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-[var(--pd-border)] border border-[var(--pd-border)] mb-8">
      {items.map((item) => (
        <div key={item.label} className="bg-white p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--pd-muted)] mb-1">
            {item.label}
          </p>
          <p className="text-2xl font-semibold text-[var(--pd-navy)] tracking-[-0.02em]">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function AdminOverviewStatusTabs({
  active,
  onChange,
  counts,
  total,
}: {
  active: string;
  onChange: (status: string) => void;
  counts: Record<string, number>;
  total: number;
}) {
  const tabs = [
    { key: "all", label: `All (${total})` },
    ...ADMIN_STATUS_STEPS.map((s) => ({
      key: s,
      label: `${ADMIN_STATUS_CONFIG[s]?.label ?? s} (${counts[s] ?? 0})`,
    })),
  ];

  return (
    <div className="flex flex-wrap gap-px bg-[var(--pd-border)] border border-[var(--pd-border)] p-px mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={chipClass(active === tab.key, "h-9 px-3 text-[12px]")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export type AdminOverviewOrder = {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  total_price: number;
  status: string;
  shade: string | null;
  tooth_number: string | null;
  notes: string | null;
  stl_file_path: string | null;
  case_files: unknown;
  tracking_number: string | null;
  carrier: string | null;
  created_at: string;
  design_outsource_status: "sent" | "completed" | null;
  design_outsource_sent_at: string | null;
  design_outsource_email: string | null;
  design_outsource_notes: string | null;
  design_outsource_sent_by: string | null;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    practice_name: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  } | null;
};

function AdminDetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--pd-border)] bg-[var(--pd-surface)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-2">{title}</p>
      {children}
    </div>
  );
}

export function AdminOverviewOrderList({
  orders,
  selectedId,
  onSelect,
}: {
  orders: AdminOverviewOrder[];
  selectedId: string | null;
  onSelect: (order: AdminOverviewOrder) => void;
}) {
  if (orders.length === 0) {
    return (
      <div className="border border-dashed border-[var(--pd-border)] bg-[var(--pd-surface)] px-4 py-12 text-center">
        <p className="text-[14px] text-[var(--pd-muted)]">No orders in this view.</p>
      </div>
    );
  }

  return (
    <div className="border border-[var(--pd-border)] bg-white divide-y divide-[var(--pd-border)]">
      {orders.map((order) => {
        const selected = selectedId === order.id;
        const date = new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return (
          <button
            key={order.id}
            type="button"
            onClick={() => onSelect(order)}
            className={cn(
              "w-full text-left px-4 py-4 transition-colors hover:bg-[var(--pd-surface)]",
              selected && "bg-[#E1F5EE]/30 ring-1 ring-inset ring-[var(--pd-teal)]/30"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-semibold text-[14px] text-[var(--pd-navy)]">{order.product_name}</p>
                  <AdminStatusBadge status={order.status} />
                </div>
                <p className="text-[12px] text-[var(--pd-muted)]">
                  {order.profiles?.practice_name || "—"} · {date}
                </p>
                {(order.shade || order.tooth_number) && (
                  <p className="text-[12px] text-[var(--pd-slate)] mt-1">
                    {order.shade ? `Shade ${order.shade}` : ""}
                    {order.shade && order.tooth_number ? " · " : ""}
                    {order.tooth_number ? `Tooth #${order.tooth_number}` : ""}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-[var(--pd-navy)]">${order.total_price}</p>
                <p className="text-[12px] text-[var(--pd-muted)]">×{order.quantity}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function AdminOverviewDetailPanel({
  order,
  trackingInput,
  carrierInput,
  updating,
  onTrackingChange,
  onCarrierChange,
  onStatusChange,
  onSaveTracking,
  onDownloadStl,
  productCategory,
  defaultPartnerEmail,
  onOutsourceSent,
}: {
  order: AdminOverviewOrder;
  trackingInput: string;
  carrierInput: string;
  updating: boolean;
  onTrackingChange: (value: string) => void;
  onCarrierChange: (value: string) => void;
  onStatusChange: (status: string) => void;
  onSaveTracking: () => void;
  onDownloadStl: () => void;
  productCategory: string | null;
  defaultPartnerEmail?: string;
  onOutsourceSent: (fields: Partial<DesignOutsourceFields>) => void;
}) {
  return (
    <div className="border border-[var(--pd-border)] bg-white lg:sticky lg:top-8 flex flex-col lg:max-h-[calc(100vh-4rem)]">
      <div className="shrink-0 px-4 py-4 border-b border-[var(--pd-border)] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[var(--pd-navy)] leading-snug">{order.product_name}</p>
          <p className="text-[12px] text-[var(--pd-muted)] mt-1">
            {new Date(order.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <AdminStatusBadge status={order.status} />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4">
        {order.profiles && (
          <AdminDetailSection title="Practice">
            <p className="text-[14px] font-medium text-[var(--pd-navy)]">
              Dr. {order.profiles.first_name} {order.profiles.last_name}
            </p>
            <p className="text-[13px] text-[var(--pd-slate)] mt-0.5">{order.profiles.practice_name}</p>
            {order.profiles.phone && (
              <p className="text-[12px] text-[var(--pd-muted)] mt-1">{order.profiles.phone}</p>
            )}
            {order.profiles.address && (
              <p className="text-[12px] text-[var(--pd-muted)] mt-1 leading-relaxed">
                {order.profiles.address}, {order.profiles.city}, {order.profiles.state} {order.profiles.zip}
              </p>
            )}
          </AdminDetailSection>
        )}

        <AdminDetailSection title="Case details">
          <dl className="space-y-1.5 text-[13px]">
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--pd-muted)]">Qty</dt>
              <dd className="text-[var(--pd-navy)] font-medium">{order.quantity}</dd>
            </div>
            {order.shade && (
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--pd-muted)]">Shade</dt>
                <dd className="text-[var(--pd-navy)]">{order.shade}</dd>
              </div>
            )}
            {order.tooth_number && (
              <div className="flex justify-between gap-2">
                <dt className="text-[var(--pd-muted)]">Tooth</dt>
                <dd className="text-[var(--pd-navy)]">#{order.tooth_number}</dd>
              </div>
            )}
            {order.notes && (
              <div className="pt-1 border-t border-[var(--pd-border)]">
                <dt className="text-[var(--pd-muted)] mb-1">Notes</dt>
                <dd className="text-[var(--pd-slate)] text-[12px] leading-relaxed">{order.notes}</dd>
              </div>
            )}
            <div className="flex justify-between gap-2 pt-1 border-t border-[var(--pd-border)] font-semibold">
              <dt className="text-[var(--pd-muted)]">Total</dt>
              <dd className="text-[var(--pd-navy)]">${order.total_price}</dd>
            </div>
          </dl>
        </AdminDetailSection>

        {order.stl_file_path && (
          <button
            type="button"
            onClick={onDownloadStl}
            className={`${ORDER_BTN_BACK} w-full h-9 text-[13px] text-[var(--pd-teal-dark)] hover:border-[var(--pd-teal)]`}
          >
            Download STL file
          </button>
        )}

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-2">
            Update status
          </p>
          <div className="grid grid-cols-2 gap-1">
            {ADMIN_STATUS_STEPS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStatusChange(s)}
                disabled={updating || order.status === s}
                className={chipClass(order.status === s, "h-8 px-2 text-[12px]")}
              >
                {ADMIN_STATUS_CONFIG[s]?.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-2">
            Tracking
          </p>
          {order.tracking_number && (
            <p className="text-[12px] text-[var(--pd-teal-dark)] mb-2">
              {order.carrier}: {order.tracking_number}
            </p>
          )}
          <div className="flex gap-px bg-[var(--pd-border)] border border-[var(--pd-border)] p-px mb-2">
            {["UPS", "USPS"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onCarrierChange(c)}
                className={chipClass(carrierInput === c, "flex-1 h-8 text-[12px]")}
              >
                {c}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={trackingInput}
            onChange={(e) => onTrackingChange(e.target.value)}
            placeholder="Tracking number"
            className={`${ORDER_INPUT_CLASS} h-9 text-[13px] mb-2`}
          />
          <button
            type="button"
            disabled={!trackingInput || updating}
            onClick={onSaveTracking}
            className={`${ORDER_BTN_PRIMARY} w-full h-9 text-[13px]`}
          >
            Save & mark shipped
          </button>
        </div>

        <Link href={`/admin/orders/${order.id}`} className={`${ORDER_BTN_NAVY} w-full h-9 text-[13px] inline-flex`}>
          Open full case →
        </Link>

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
      </div>
    </div>
  );
}

export function AdminOverviewDetailPlaceholder() {
  return (
    <div className="border border-dashed border-[var(--pd-border)] bg-[var(--pd-surface)] p-8 text-center lg:sticky lg:top-8">
      <p className="text-[14px] text-[var(--pd-muted)]">Select an order to view details</p>
    </div>
  );
}
