"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAppClient } from "@/lib/supabase";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CaseFilesList } from "@/components/case-files-list";
import { AdminDesignOutsourceStatusBadge } from "@/components/admin/admin-design-outsource-panel";
import {
  ADMIN_STATUS_STEPS,
  ADMIN_STATUS_CONFIG,
  AdminDueDateChip,
  AdminOrderIdChip,
  AdminOrdersEmptyRow,
  AdminOrdersLoading,
  AdminOrdersTableHead,
  AdminOrdersTableShell,
  AdminStatusBadge,
  AdminTagBadge,
} from "@/components/admin/admin-orders-ui";
import {
  ORDER_BTN_NAVY,
  ORDER_INPUT_CLASS,
  chipClass,
} from "@/components/marketing/order-ui";

type Order = {
  id: string;
  user_id: string;
  product_name: string;
  product_id: string;
  quantity: number;
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
  case_number: number | null;
  design_outsource_status: "sent" | "completed" | null;
};

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  practice_name: string | null;
};

type Rx = {
  order_id: string;
  dentist_name: string;
  dentist_license_no: string;
  license_state: string;
  margin_type: string | null;
  occlusion: string | null;
  guard_type: string | null;
  shade: string | null;
  authorized: boolean;
};

const CATEGORY_CONFIG: Record<string, { label: string; className: string }> = {
  zirconia: { label: "Zirconia Crown", className: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]" },
  printed: { label: "Print Crown", className: "bg-[#E1F5EE] text-[var(--pd-teal-dark)] border-[#9FE1CB]" },
  nightguard: { label: "Night Guard", className: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]" },
  sportsguard: { label: "Sports Guard", className: "bg-[#FDF4FF] text-[#9333EA] border-[#E9D5FF]" },
  removable: { label: "Removable", className: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]" },
};

const DATE_FILTERS = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
];

type SortKey = "created_at" | "product_name" | "status" | "due_date" | "practice_name";
type SortDir = "asc" | "desc";

const TABLE_COLUMNS = [
  { key: null, label: "", width: "w-10" },
  { key: null, label: "Case", width: "w-28" },
  { key: "product_name", label: "Product", width: "w-44" },
  { key: "practice_name", label: "Practice", width: "" },
  { key: "status", label: "Status", width: "w-32" },
  { key: "due_date", label: "Due", width: "w-36" },
  { key: "created_at", label: "Date", width: "w-28" },
  { key: null, label: "", width: "w-10" },
] as const;

const TOOLBAR_BTN =
  "inline-flex items-center justify-center h-8 px-4 text-[12px] font-medium border transition-colors shrink-0";
const TOOLBAR_BTN_PRIMARY = `${TOOLBAR_BTN} bg-[var(--pd-navy)] text-white border-[var(--pd-navy)] hover:bg-[var(--pd-navy-light)] disabled:opacity-40 disabled:cursor-not-allowed`;
const TOOLBAR_BTN_SECONDARY = `${TOOLBAR_BTN} bg-white text-[var(--pd-slate)] border-[var(--pd-border)] hover:border-[var(--pd-navy)] hover:text-[var(--pd-navy)] disabled:opacity-40 disabled:cursor-not-allowed`;

export default function LabPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [rxMap, setRxMap] = useState<Record<string, Rx>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<string>("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchStatus, setBatchStatus] = useState("");
  const [batchSaving, setBatchSaving] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("due_date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    checkAndLoad();
  }, []);

  async function checkAndLoad() {
    const supabase = createAppClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) { router.push("/dashboard"); return; }
    await loadData();
  }

  async function loadData() {
    const supabase = createAppClient();

    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!ordersData) { setLoading(false); return; }
    setOrders(ordersData);

    const userIds = [...new Set(ordersData.map((o) => o.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, practice_name")
      .in("id", userIds);

    const profileMap: Record<string, Profile> = {};
    profilesData?.forEach((p) => { profileMap[p.id] = p; });
    setProfiles(profileMap);

    const orderIds = ordersData.map((o) => o.id);
    const { data: rxData } = await supabase
      .from("rx")
      .select("*")
      .in("order_id", orderIds);

    const rxMapData: Record<string, Rx> = {};
    rxData?.forEach((rx) => { rxMapData[rx.order_id] = rx; });
    setRxMap(rxMapData);

    setLoading(false);
  }

  async function updateStatus(orderId: string, newStatus: string) {
    setSaving((prev) => ({ ...prev, [orderId]: true }));
    const supabase = createAppClient();
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    setSaving((prev) => ({ ...prev, [orderId]: false }));
  }

  async function handleBatchUpdate() {
    if (!batchStatus || selected.size === 0) return;
    setBatchSaving(true);
    const supabase = createAppClient();
    const ids = [...selected];
    await supabase.from("orders").update({ status: batchStatus }).in("id", ids);
    setOrders((prev) => prev.map((o) => (ids.includes(o.id) ? { ...o, status: batchStatus } : o)));
    setSelected(new Set());
    setBatchStatus("");
    setBatchSaving(false);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll(ids: string[]) {
    if (ids.every((id) => selected.has(id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(ids));
    }
  }

  function handleSort(key: string) {
    const sort = key as SortKey;
    if (sortKey === sort) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(sort);
      setSortDir("desc");
    }
  }

  function matchesDate(order: Order) {
    if (dateFilter === "all") return true;
    const created = new Date(order.created_at);
    const now = new Date();
    if (dateFilter === "today") {
      return created.toDateString() === now.toDateString();
    }
    if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return created >= weekAgo;
    }
    return true;
  }

  const activeOrders = orders.filter((o) => o.status !== "delivered");
  const completedOrders = orders.filter((o) => o.status === "delivered");
  const baseOrders = activeTab === "active" ? activeOrders : completedOrders;

  const filtered = baseOrders.filter((o) => {
    const profile = profiles[o.user_id];
    const practiceName = profile?.practice_name?.toLowerCase() || "";
    const q = search.toLowerCase();

    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(q) ||
      o.product_name.toLowerCase().includes(q) ||
      practiceName.includes(q);

    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchCategory = categoryFilter === "all" || o.product_id === categoryFilter;

    return matchSearch && matchStatus && matchCategory && matchesDate(o);
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA: string | number = 0;
    let valB: string | number = 0;

    if (sortKey === "created_at") {
      valA = new Date(a.created_at).getTime();
      valB = new Date(b.created_at).getTime();
    } else if (sortKey === "due_date") {
      valA = a.due_date ? new Date(a.due_date).getTime() : Number.POSITIVE_INFINITY;
      valB = b.due_date ? new Date(b.due_date).getTime() : Number.POSITIVE_INFINITY;
    } else if (sortKey === "status") {
      valA = a.status;
      valB = b.status;
    } else if (sortKey === "product_name") {
      valA = a.product_name.toLowerCase();
      valB = b.product_name.toLowerCase();
    } else if (sortKey === "practice_name") {
      valA = (profiles[a.user_id]?.practice_name || "").toLowerCase();
      valB = (profiles[b.user_id]?.practice_name || "").toLowerCase();
    }

    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const stats = {
    received: orders.filter((o) => o.status === "received").length,
    printing: orders.filter((o) => o.status === "printing").length,
    qc: orders.filter((o) => o.status === "qc").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
  };

  if (loading) return <AdminOrdersLoading />;

  return (
    <div className="p-6 md:p-8 max-w-[1400px] w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)] mb-2">
            Lab workflow
          </p>
          <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.03em]">
            Lab queue
          </h1>
          <p className="text-[14px] text-[var(--pd-slate)] mt-2 max-w-2xl leading-relaxed">
            Production floor — select cases, print work orders, and advance steps with{" "}
            <Link href="/lab/scan" className="text-[var(--pd-teal-dark)] hover:underline">
              barcode scan
            </Link>
            .
          </p>
          <p className="text-[12px] text-[var(--pd-muted)] mt-1.5">
            Payment, messages, and shipping labels →{" "}
            <Link href="/admin/orders" className="text-[var(--pd-teal-dark)] hover:underline">
              Orders
            </Link>
            {" "}or open a case from the table.
          </p>
        </div>
        <Link href="/lab/scan" className={`${ORDER_BTN_NAVY} h-9 px-4 text-[12px] shrink-0`}>
          Open barcode scan →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--pd-border)] border border-[var(--pd-border)] mb-6">
        {[
          { label: "New orders", value: stats.received, highlight: stats.received > 0 },
          { label: "Printing", value: stats.printing, highlight: false },
          { label: "QC check", value: stats.qc, highlight: false },
          { label: "Shipped", value: stats.shipped, highlight: false },
        ].map((s) => (
          <div
            key={s.label}
            className={`bg-white p-4 sm:p-5 ${s.highlight ? "ring-1 ring-inset ring-[#2563EB]" : ""}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--pd-muted)] mb-1">
              {s.label}
            </p>
            <p className="text-2xl font-semibold text-[var(--pd-navy)] tracking-[-0.02em]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 mb-5">
        {[
          { key: "active", label: `Active (${activeOrders.length})` },
          { key: "completed", label: `Completed (${completedOrders.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={chipClass(activeTab === tab.key, "h-8 px-3 text-[12px]")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, practice, product…"
          className={`${ORDER_INPUT_CLASS} h-9 w-64 text-[13px]`}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${ORDER_INPUT_CLASS} h-9 text-[13px]`}
        >
          <option value="all">All statuses</option>
          {ADMIN_STATUS_STEPS.map((s) => (
            <option key={s} value={s}>
              {ADMIN_STATUS_CONFIG[s]?.label ?? s}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={`${ORDER_INPUT_CLASS} h-9 text-[13px]`}
        >
          <option value="all">All products</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label}
            </option>
          ))}
        </select>
        <div className="flex gap-1 border border-[var(--pd-border)] bg-white p-0.5">
          {DATE_FILTERS.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDateFilter(d.key)}
              className={chipClass(dateFilter === d.key, "h-7 px-2.5 text-[11px]")}
            >
              {d.label}
            </button>
          ))}
        </div>
        {(search || statusFilter !== "all" || categoryFilter !== "all" || dateFilter !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setCategoryFilter("all");
              setDateFilter("all");
            }}
            className={chipClass(false, "h-9 px-3 text-[12px]")}
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-3 p-3 border border-[var(--pd-border)] bg-white">
        <label className="flex items-center gap-2 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={sorted.length > 0 && sorted.every((o) => selected.has(o.id))}
            onChange={() => toggleSelectAll(sorted.map((o) => o.id))}
            disabled={sorted.length === 0}
            className="w-4 h-4 cursor-pointer disabled:opacity-40"
          />
          <span className="text-[12px] text-[var(--pd-slate)]">
            Select all{sorted.length > 0 ? ` (${sorted.length})` : ""}
          </span>
        </label>

        <span className="hidden sm:block w-px h-5 bg-[var(--pd-border)]" aria-hidden />

        <span className="text-[12px] text-[var(--pd-muted)] shrink-0">
          {selected.size > 0 ? `${selected.size} selected` : "No cases selected"}
        </span>

        <select
          value={batchStatus}
          onChange={(e) => setBatchStatus(e.target.value)}
          disabled={selected.size === 0}
          className={`${ORDER_INPUT_CLASS} h-8 min-w-[140px] w-auto text-[12px] disabled:opacity-40`}
        >
          <option value="">Move to…</option>
          {ADMIN_STATUS_STEPS.map((s) => (
            <option key={s} value={s}>
              {ADMIN_STATUS_CONFIG[s]?.label ?? s}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleBatchUpdate}
          disabled={selected.size === 0 || !batchStatus || batchSaving}
          className={TOOLBAR_BTN_PRIMARY}
        >
          {batchSaving ? "Updating…" : "Apply status"}
        </button>

        {selected.size > 0 ? (
          <Link
            href={`/lab/workorders?ids=${[...selected].join(",")}`}
            target="_blank"
            className={TOOLBAR_BTN_SECONDARY}
          >
            Print work orders ({selected.size})
          </Link>
        ) : (
          <button type="button" disabled className={TOOLBAR_BTN_SECONDARY}>
            Print work orders
          </button>
        )}

        {selected.size > 0 && (
          <button
            type="button"
            onClick={() => {
              setSelected(new Set());
              setBatchStatus("");
            }}
            className={TOOLBAR_BTN_SECONDARY}
          >
            Clear
          </button>
        )}
      </div>

      <AdminOrdersTableShell>
        <AdminOrdersTableHead
          columns={[...TABLE_COLUMNS]}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />
        <tbody className="divide-y divide-[var(--pd-border)]">
          {sorted.map((order) => {
            const profile = profiles[order.user_id];
            const rx = rxMap[order.id];
            const category =
              CATEGORY_CONFIG[order.product_id] ?? {
                label: order.product_name,
                className: "bg-[var(--pd-surface)] text-[var(--pd-muted)] border-[var(--pd-border)]",
              };
            const isExpanded = expandedId === order.id;
            const isSelected = selected.has(order.id);
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

            return (
              <Fragment key={order.id}>
                <tr
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-[var(--pd-surface)]",
                    isExpanded && "bg-[var(--pd-surface)]",
                    isSelected && "bg-[#F0FAF7]"
                  )}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(order.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-block hover:opacity-80 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <AdminOrderIdChip id={order.id} caseNumber={order.case_number} />
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[var(--pd-navy)] truncate max-w-[180px]">
                      {order.product_name}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <AdminTagBadge className={category.className}>{category.label}</AdminTagBadge>
                    </div>
                    <p className="text-[12px] text-[var(--pd-muted)] mt-0.5">
                      Qty {order.quantity}
                      {order.shade ? ` · ${order.shade}` : ""}
                      {teeth ? ` · ${teeth}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--pd-slate)]">
                      {profile?.practice_name || "—"}
                    </p>
                    {rx && (
                      <p className="text-[12px] text-[var(--pd-muted)] mt-0.5">Dr. {rx.dentist_name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <AdminStatusBadge status={order.status} />
                      {order.design_outsource_status && (
                        <AdminDesignOutsourceStatusBadge status={order.design_outsource_status} />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <AdminDueDateChip dueDate={order.due_date} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-[var(--pd-muted)]">{date}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(isExpanded ? null : order.id);
                      }}
                      className="text-[12px] text-[var(--pd-muted)] hover:text-[var(--pd-navy)] p-1"
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? "Collapse details" : "Expand details"}
                    >
                      {isExpanded ? "▲" : "▼"}
                    </button>
                  </td>
                </tr>

                {isExpanded && (
                  <tr className="bg-[var(--pd-surface)]">
                    <td colSpan={8} className="px-4 sm:px-6 py-5 border-t border-[var(--pd-border)]">
                      <div className="space-y-4">
                        {order.design_outsource_status === "sent" && (
                          <p className="text-[13px] text-amber-800 border border-amber-200 bg-amber-50 px-3 py-2">
                            Waiting on JD design — confirm files are back before printing.
                          </p>
                        )}

                        {(order.case_files || order.stl_file_path) && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-2">
                              Case files
                            </p>
                            <CaseFilesList
                              caseFiles={order.case_files}
                              stlFilePath={order.stl_file_path}
                              compact
                            />
                          </div>
                        )}

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-2">
                            Quick status
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {ADMIN_STATUS_STEPS.filter((s) => s !== "delivered").map((step) => (
                              <button
                                key={step}
                                type="button"
                                onClick={() => updateStatus(order.id, step)}
                                disabled={saving[order.id]}
                                className={chipClass(order.status === step, "h-8 px-2.5 text-[12px]")}
                              >
                                {ADMIN_STATUS_CONFIG[step]?.label ?? step}
                              </button>
                            ))}
                          </div>
                          <p className="text-[11px] text-[var(--pd-muted)] mt-2">
                            Prefer scanning? Use{" "}
                            <Link href="/lab/scan" className="text-[var(--pd-teal-dark)] hover:underline">
                              barcode scan
                            </Link>{" "}
                            on the floor.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--pd-border)]">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className={`${ORDER_BTN_NAVY} inline-flex h-9 px-4 text-[12px]`}
                          >
                            Open full case →
                          </Link>
                          <span className="text-[12px] text-[var(--pd-muted)]">
                            Check row + toolbar above to print work orders.
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}

          {sorted.length === 0 && <AdminOrdersEmptyRow colSpan={8} />}
        </tbody>
      </AdminOrdersTableShell>
    </div>
  );
}
