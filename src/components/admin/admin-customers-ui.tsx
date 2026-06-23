"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ORDER_BTN_BACK,
  ORDER_INPUT_CLASS,
} from "@/components/marketing/order-ui";
import {
  AdminOrderIdChip,
  AdminOrdersTableHead,
  AdminOrdersTableShell,
  AdminSortIcon,
  AdminStatusBadge,
  AdminTagBadge,
} from "@/components/admin/admin-orders-ui";

export type AdminCustomerProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  practice_name: string | null;
  phone: string | null;
  dentist_name: string | null;
  license_no: string | null;
  license_state: string | null;
  address?: string | null;
  city: string | null;
  state: string | null;
  zip?: string | null;
  created_at: string;
};

export type AdminCustomerStats = {
  profile: AdminCustomerProfile;
  totalOrders: number;
  totalRevenue: number;
  remakeCount: number;
  remakeRate: number;
  lastOrderDate: string | null;
  daysSinceLastOrder: number | null;
  pendingOrders: number;
};

export type CustomerFilter = "all" | "active" | "inactive" | "dormant" | "high_remake";

export function AdminCustomersLoading() {
  return (
    <div className="py-16 text-center">
      <p className="text-[14px] text-[var(--pd-muted)]">Loading customers…</p>
    </div>
  );
}

export function AdminCustomersHeader({ totalCount }: { totalCount: number }) {
  return (
    <div className="mb-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)] mb-2">
        Practices
      </p>
      <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.03em]">
        Customers
      </h1>
      <p className="text-[14px] text-[var(--pd-slate)] mt-2">
        {totalCount} practice{totalCount !== 1 ? "s" : ""} with order history and activity signals.
      </p>
    </div>
  );
}

export function AdminCustomersSummaryFilters({
  items,
  activeFilter,
  onSelect,
}: {
  items: { label: string; value: number; filter: CustomerFilter; tone: string; highlight?: boolean }[];
  activeFilter: CustomerFilter;
  onSelect: (filter: CustomerFilter) => void;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--pd-border)] border border-[var(--pd-border)] mb-8">
      {items.map((item) => {
        const active = activeFilter === item.filter;
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => onSelect(active ? "all" : item.filter)}
            className={cn(
              "bg-white p-4 sm:p-5 text-left transition-colors hover:bg-[var(--pd-surface)]",
              active && "bg-[var(--pd-navy)] text-white hover:bg-[var(--pd-navy)]",
              !active && item.highlight && "ring-1 ring-inset ring-red-200"
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

export function AdminCustomersToolbar({
  search,
  onSearchChange,
  resultCount,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
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
          placeholder="Search practice, doctor, city…"
          className={`${ORDER_INPUT_CLASS} h-9 pl-8 w-64 sm:w-72`}
        />
      </div>
      <p className="ml-auto text-[12px] text-[var(--pd-muted)]">{resultCount} practices</p>
    </div>
  );
}

export function AdminCustomerActivityBadge({ days }: { days: number | null }) {
  if (days === null) {
    return (
      <AdminTagBadge className="bg-[var(--pd-surface)] text-[var(--pd-muted)] border-[var(--pd-border)]">
        No orders
      </AdminTagBadge>
    );
  }
  if (days > 60) {
    return (
      <AdminTagBadge className="bg-red-50 text-red-600 border-red-200">Dormant {days}d</AdminTagBadge>
    );
  }
  if (days > 30) {
    return (
      <AdminTagBadge className="bg-amber-50 text-amber-700 border-amber-200">Inactive {days}d</AdminTagBadge>
    );
  }
  return (
    <AdminTagBadge className="bg-[#E1F5EE] text-[var(--pd-teal-dark)] border-[#9FE1CB]">Active</AdminTagBadge>
  );
}

const CUSTOMER_TABLE_COLUMNS = [
  { key: "practice_name", label: "Practice" },
  { key: null, label: "Location" },
  { key: "totalOrders", label: "Orders" },
  { key: "totalRevenue", label: "Revenue" },
  { key: "remakeRate", label: "Remake rate" },
  { key: "lastOrderDate", label: "Last order" },
  { key: null, label: "Status" },
  { key: null, label: "" },
] as const;

export function AdminCustomersTable({
  rows,
  sortKey,
  sortDir,
  onSort,
  onRowClick,
}: {
  rows: AdminCustomerStats[];
  sortKey: string;
  sortDir: "asc" | "desc";
  onSort: (key: string) => void;
  onRowClick: (id: string) => void;
}) {
  return (
    <AdminOrdersTableShell>
      <AdminOrdersTableHead
        columns={[...CUSTOMER_TABLE_COLUMNS]}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={onSort}
      />
      <tbody className="divide-y divide-[var(--pd-border)]">
        {rows.map((c) => (
          <tr
            key={c.profile.id}
            onClick={() => onRowClick(c.profile.id)}
            className="cursor-pointer hover:bg-[var(--pd-surface)] transition-colors"
          >
            <td className="px-4 py-3">
              <p className="font-semibold text-[var(--pd-navy)]">{c.profile.practice_name || "—"}</p>
              {c.profile.dentist_name && (
                <p className="text-[12px] text-[var(--pd-muted)] mt-0.5">Dr. {c.profile.dentist_name}</p>
              )}
            </td>
            <td className="px-4 py-3">
              <p className="text-[13px] text-[var(--pd-slate)]">
                {[c.profile.city, c.profile.state].filter(Boolean).join(", ") || "—"}
              </p>
            </td>
            <td className="px-4 py-3">
              <p className="font-medium text-[var(--pd-navy)]">{c.totalOrders}</p>
              {c.pendingOrders > 0 && (
                <p className="text-[11px] text-amber-700 mt-0.5">{c.pendingOrders} pending</p>
              )}
            </td>
            <td className="px-4 py-3">
              <p className="font-semibold text-[var(--pd-navy)]">${c.totalRevenue.toLocaleString()}</p>
            </td>
            <td className="px-4 py-3">
              {c.remakeCount > 0 ? (
                <div>
                  <p
                    className={cn(
                      "font-medium",
                      c.remakeRate >= 20
                        ? "text-red-600"
                        : c.remakeRate >= 10
                          ? "text-amber-700"
                          : "text-[var(--pd-navy)]"
                    )}
                  >
                    {c.remakeRate}%
                  </p>
                  <p className="text-[11px] text-[var(--pd-muted)] mt-0.5">{c.remakeCount} remakes</p>
                </div>
              ) : (
                <p className="text-[13px] text-[var(--pd-muted)]">—</p>
              )}
            </td>
            <td className="px-4 py-3">
              {c.lastOrderDate ? (
                <p className="text-[13px] text-[var(--pd-slate)]">
                  {new Date(c.lastOrderDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              ) : (
                <p className="text-[13px] text-[var(--pd-muted)]">—</p>
              )}
            </td>
            <td className="px-4 py-3">
              <AdminCustomerActivityBadge days={c.daysSinceLastOrder} />
            </td>
            <td className="px-4 py-3 text-center text-[var(--pd-muted)]">→</td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td colSpan={8} className="text-center py-16 border-t border-[var(--pd-border)]">
              <p className="text-[14px] text-[var(--pd-muted)]">No customers found.</p>
            </td>
          </tr>
        )}
      </tbody>
    </AdminOrdersTableShell>
  );
}

export function AdminCustomerBreadcrumb({ practiceName }: { practiceName: string }) {
  return (
    <nav className="flex items-center gap-2 mb-6 text-[13px]">
      <Link href="/admin/customers" className="text-[var(--pd-muted)] hover:text-[var(--pd-navy)] transition-colors">
        Customers
      </Link>
      <span className="text-[var(--pd-border-strong)]">/</span>
      <span className="text-[var(--pd-navy)] font-medium">{practiceName}</span>
    </nav>
  );
}

export function AdminCustomerDetailHeader({ profile }: { profile: AdminCustomerProfile }) {
  return (
    <div className="mb-8">
      <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.03em]">
        {profile.practice_name || "—"}
      </h1>
      {profile.dentist_name && (
        <p className="text-[14px] text-[var(--pd-slate)] mt-1">Dr. {profile.dentist_name}</p>
      )}
      <p className="text-[12px] text-[var(--pd-muted)] mt-1">
        Customer since{" "}
        {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </p>
    </div>
  );
}

export function AdminCustomerMetrics({
  items,
}: {
  items: { label: string; value: string | number; tone?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--pd-border)] border border-[var(--pd-border)] mb-8">
      {items.map((item) => (
        <div key={item.label} className="bg-white p-4 sm:p-5 text-center sm:text-left">
          <p className={cn("text-2xl font-semibold tracking-[-0.02em]", item.tone ?? "text-[var(--pd-navy)]")}>
            {item.value}
          </p>
          <p className="text-[12px] text-[var(--pd-muted)] mt-1">{item.label}</p>
        </div>
      ))}
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

export function AdminCustomerInfoPanel({ profile }: { profile: AdminCustomerProfile }) {
  const rows = [
    { label: "Practice", value: profile.practice_name },
    { label: "Doctor", value: profile.dentist_name ? `Dr. ${profile.dentist_name}` : null },
    {
      label: "License",
      value: profile.license_no ? `#${profile.license_no} · ${profile.license_state}` : null,
    },
    { label: "Phone", value: profile.phone },
    {
      label: "Address",
      value:
        [profile.address, profile.city, profile.state, profile.zip].filter(Boolean).join(", ") || null,
    },
  ].filter((item) => item.value);

  return (
    <AdminSidePanel title="Practice info">
      <dl className="space-y-2.5">
        {rows.map((item) => (
          <div key={item.label} className="flex justify-between gap-3 text-[13px]">
            <dt className="text-[var(--pd-muted)] shrink-0">{item.label}</dt>
            <dd className="text-[var(--pd-navy)] text-right">{item.value}</dd>
          </div>
        ))}
      </dl>
    </AdminSidePanel>
  );
}

const REMAKE_REASONS: Record<string, string> = {
  shade: "Shade Mismatch",
  fit: "Fit Issue",
  fracture: "Fracture",
  design: "Design Change",
  other: "Other",
};

export function AdminCustomerRemakePanel({
  remakeByReason,
  remakeCount,
  remakeRate,
}: {
  remakeByReason: Record<string, number>;
  remakeCount: number;
  remakeRate: number;
}) {
  if (remakeCount === 0) return null;

  return (
    <AdminSidePanel title="Remake breakdown">
      <div className="space-y-2.5">
        {Object.entries(remakeByReason).map(([reason, count]) => (
          <div key={reason} className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-[var(--pd-slate)]">{REMAKE_REASONS[reason] || reason}</span>
            <div className="flex items-center gap-2 min-w-[88px]">
              <div className="flex-1 h-1.5 bg-[var(--pd-border)] overflow-hidden">
                <div
                  className="h-full bg-red-400"
                  style={{ width: `${(count / remakeCount) * 100}%` }}
                />
              </div>
              <span className="text-[12px] font-medium text-[var(--pd-navy)] w-4 text-right">{count}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--pd-border)] flex justify-between text-[12px]">
        <span className="text-[var(--pd-muted)]">Total remakes</span>
        <span className="font-semibold text-red-600">
          {remakeCount} ({remakeRate}%)
        </span>
      </div>
    </AdminSidePanel>
  );
}

export function AdminCustomerQuickActions({
  customerId,
  phone,
}: {
  customerId: string;
  phone: string | null;
}) {
  return (
    <AdminSidePanel title="Quick actions">
      <div className="space-y-2">
        <Link
          href={`/admin/orders?practice=${customerId}`}
          className={`${ORDER_BTN_BACK} w-full h-9 px-3 text-[13px] justify-between`}
        >
          <span>View all orders</span>
          <span>→</span>
        </Link>
        {phone && (
          <a
            href={`tel:${phone}`}
            className={`${ORDER_BTN_BACK} w-full h-9 px-3 text-[13px] justify-between`}
          >
            <span>Call practice</span>
            <span className="text-[var(--pd-muted)] text-[12px]">{phone}</span>
          </a>
        )}
      </div>
    </AdminSidePanel>
  );
}

export type AdminCustomerOrderRow = {
  id: string;
  case_number?: number | null;
  product_name: string;
  total_price: number;
  status: string;
  created_at: string;
  paid_at?: string | null;
  is_remake: boolean;
  remake_reason?: string | null;
  shade: string | null;
  tooth_numbers: number[] | null;
  tooth_number: string | null;
};

export function AdminCustomerOrdersTable({
  orders,
  onOrderClick,
}: {
  orders: AdminCustomerOrderRow[];
  onOrderClick: (orderId: string) => void;
}) {
  return (
    <div className="border border-[var(--pd-border)] bg-white overflow-x-auto">
      <div className="px-4 py-3 border-b border-[var(--pd-border)] bg-[var(--pd-surface)] flex items-center justify-between">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)]">
          Order history
        </h2>
        <span className="text-[12px] text-[var(--pd-muted)]">{orders.length} total</span>
      </div>
      <table className="w-full min-w-[640px] text-[14px]">
        <thead>
          <tr className="border-b border-[var(--pd-border)] bg-white">
            {["Order", "Product", "Status", "Amount", "Date"].map((h) => (
              <th
                key={h}
                className="text-left px-4 py-2.5 text-[11px] font-semibold text-[var(--pd-muted)] uppercase tracking-[0.1em]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--pd-border)]">
          {orders.map((order) => {
            const teeth = order.tooth_numbers?.length
              ? order.tooth_numbers.sort((a, b) => a - b).map((n) => `#${n}`).join(", ")
              : order.tooth_number
                ? `#${order.tooth_number}`
                : null;

            return (
              <tr
                key={order.id}
                onClick={() => onOrderClick(order.id)}
                className="cursor-pointer hover:bg-[var(--pd-surface)] transition-colors"
              >
                <td className="px-4 py-3">
                  <AdminOrderIdChip id={order.id} caseNumber={order.case_number} />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--pd-navy)]">{order.product_name}</p>
                  {(order.shade || teeth) && (
                    <p className="text-[12px] text-[var(--pd-muted)] mt-0.5">
                      {[order.shade, teeth].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <AdminStatusBadge status={order.status} />
                    {order.is_remake && (
                      <AdminTagBadge className="bg-red-50 text-red-600 border-red-200">Remake</AdminTagBadge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("font-semibold", order.is_remake ? "text-red-400" : "text-[var(--pd-navy)]")}>
                    {order.is_remake ? "—" : `$${order.total_price}`}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[12px] text-[var(--pd-muted)]">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </td>
              </tr>
            );
          })}
          {orders.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-12 text-[14px] text-[var(--pd-muted)]">
                No orders yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export { AdminSortIcon };
