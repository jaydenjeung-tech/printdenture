"use client";

import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { createAppClient } from "@/lib/supabase";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";
import {
  AdminDueDateChip,
  AdminOrderExpandedPanel,
  AdminOrderIdChip,
  AdminOrdersEmptyRow,
  AdminOrdersHeader,
  AdminOrdersLoading,
  AdminOrdersMetricRow,
  AdminOrdersStatusFilters,
  AdminOrdersTableHead,
  AdminOrdersTableShell,
  AdminOrdersToolbar,
  AdminStatusBadge,
  AdminTagBadge,
} from "@/components/admin/admin-orders-ui";

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
  is_remake: boolean;
  remake_of: string | null;
  remake_reason: string | null;
};

type Rx = {
  id: string;
  order_id: string;
  tooth_numbers: number[] | null;
  shade: string | null;
  margin_type: string | null;
  occlusion: string | null;
  guard_type: string | null;
  color: string | null;
  dentist_name: string;
  dentist_license_no: string;
  license_state: string;
  authorized: boolean;
  authorized_at: string | null;
  notes: string | null;
};

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  practice_name: string | null;
  phone?: string | null;
};

type SortKey = "created_at" | "total_price" | "status" | "product_name" | "due_date";
type SortDir = "asc" | "desc";

const TABLE_COLUMNS = [
  { key: null, label: "Order", width: "w-28" },
  { key: "product_name", label: "Product", width: "w-44" },
  { key: null, label: "Practice", width: "" },
  { key: "status", label: "Status", width: "w-36" },
  { key: "due_date", label: "Due", width: "w-36" },
  { key: "total_price", label: "Amount", width: "w-24" },
  { key: "created_at", label: "Date", width: "w-28" },
  { key: null, label: "", width: "w-10" },
] as const;

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [rxMap, setRxMap] = useState<Record<string, Rx>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = await verifyAdminAccess();
      if (cancelled) return;
      if (!access.ok) {
        router.push(access.reason === "unauthenticated" ? "/auth" : "/dashboard");
        return;
      }
      await loadData();
    })();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    const supabase = createAppClient();
    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!ordersData) {
      setLoading(false);
      return;
    }
    setOrders(ordersData);

    const userIds = [...new Set(ordersData.map((o) => o.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, practice_name, phone")
      .in("id", userIds);
    const profileMap: Record<string, Profile> = {};
    profilesData?.forEach((p) => {
      profileMap[p.id] = p;
    });
    setProfiles(profileMap);

    const orderIds = ordersData.map((o) => o.id);
    const { data: rxData } = await supabase.from("rx").select("*").in("order_id", orderIds);
    const rxMapData: Record<string, Rx> = {};
    rxData?.forEach((rx) => {
      rxMapData[rx.order_id] = rx;
    });
    setRxMap(rxMapData);

    const trackingMap: Record<string, string> = {};
    ordersData.forEach((o) => {
      trackingMap[o.id] = o.tracking_number || "";
    });
    setTrackingInputs(trackingMap);
    setLoading(false);
  }

  async function updateStatus(orderId: string, newStatus: string) {
    setSaving((prev) => ({ ...prev, [orderId]: true }));
    const supabase = createAppClient();
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    setSaving((prev) => ({ ...prev, [orderId]: false }));
  }

  async function updateTracking(orderId: string) {
    setSaving((prev) => ({ ...prev, [`track_${orderId}`]: true }));
    const supabase = createAppClient();
    const tracking = trackingInputs[orderId] || null;
    await supabase.from("orders").update({ tracking_number: tracking, status: "shipped" }).eq("id", orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, tracking_number: tracking, status: "shipped" } : o))
    );
    setSaving((prev) => ({ ...prev, [`track_${orderId}`]: false }));
  }

  async function downloadStl(filePath: string) {
    const supabase = createAppClient();
    const { data } = await supabase.storage.from("stl-files").createSignedUrl(filePath, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  function handleSort(key: string) {
    const sort = key as SortKey;
    if (sortKey === sort) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(sort);
      setSortDir("desc");
    }
  }

  const paidOrders = orders.filter((o) => o.paid_at && !o.is_remake);
  const now = new Date();
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_price, 0);
  const thisMonthRevenue = paidOrders
    .filter((o) => {
      const d = new Date(o.paid_at!);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, o) => sum + o.total_price, 0);
  const todayRevenue = paidOrders
    .filter((o) => new Date(o.paid_at!).toDateString() === now.toDateString())
    .reduce((sum, o) => sum + o.total_price, 0);

  const statusStats = {
    received: orders.filter((o) => o.status === "received").length,
    inProgress: orders.filter((o) => ["printing", "qc"].includes(o.status)).length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  const filtered = orders
    .filter((o) => {
      const profile = profiles[o.user_id];
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        o.id.toLowerCase().includes(q) ||
        o.product_name.toLowerCase().includes(q) ||
        (profile?.practice_name || "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      let matchDate = true;
      if (dateFilter !== "all") {
        const created = new Date(o.created_at);
        if (dateFilter === "today") matchDate = created.toDateString() === now.toDateString();
        else if (dateFilter === "week") {
          const w = new Date();
          w.setDate(now.getDate() - 7);
          matchDate = created >= w;
        } else if (dateFilter === "month") {
          matchDate = created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }
      }
      return matchSearch && matchStatus && matchDate;
    })
    .sort((a, b) => {
      let valA: string | number = 0;
      let valB: string | number = 0;
      if (sortKey === "created_at") {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      } else if (sortKey === "total_price") {
        valA = a.total_price;
        valB = b.total_price;
      } else if (sortKey === "due_date") {
        valA = a.due_date ? new Date(a.due_date).getTime() : 9999999999999;
        valB = b.due_date ? new Date(b.due_date).getTime() : 9999999999999;
      } else if (sortKey === "status") {
        valA = a.status;
        valB = b.status;
      } else if (sortKey === "product_name") {
        valA = a.product_name;
        valB = b.product_name;
      }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const filteredRevenue = filtered.filter((o) => o.paid_at && !o.is_remake).reduce((sum, o) => sum + o.total_price, 0);

  if (loading) {
    return <AdminOrdersLoading />;
  }

  return (
    <div className="max-w-[1400px] w-full">
      <AdminOrdersHeader totalCount={orders.length} />

      <AdminOrdersMetricRow
        items={[
          {
            label: "Today's revenue",
            value: `$${todayRevenue}`,
            sub: `${orders.filter((o) => new Date(o.created_at).toDateString() === now.toDateString()).length} orders`,
          },
          {
            label: "This month",
            value: `$${thisMonthRevenue}`,
            sub: `${paidOrders.filter((o) => { const d = new Date(o.paid_at!); return d.getMonth() === now.getMonth(); }).length} paid orders`,
          },
          {
            label: "Total revenue",
            value: `$${totalRevenue}`,
            sub: `${paidOrders.length} total paid`,
          },
        ]}
      />

      <AdminOrdersStatusFilters
        activeFilter={statusFilter}
        onSelect={setStatusFilter}
        items={[
          { label: "New orders", value: statusStats.received, filter: "received", tone: "text-[#2563EB]", highlight: statusStats.received > 0 },
          { label: "In progress", value: statusStats.inProgress, filter: "printing", tone: "text-[#D97706]" },
          { label: "Shipped", value: statusStats.shipped, filter: "shipped", tone: "text-[var(--pd-teal-dark)]" },
          { label: "Delivered", value: statusStats.delivered, filter: "delivered", tone: "text-[var(--pd-muted)]" },
        ]}
      />

      <AdminOrdersToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        showClear={!!search || statusFilter !== "all" || dateFilter !== "all"}
        onClear={() => {
          setSearch("");
          setStatusFilter("all");
          setDateFilter("all");
        }}
        filteredCount={filtered.length}
        filteredRevenue={filteredRevenue}
      />

      <AdminOrdersTableShell>
        <AdminOrdersTableHead
          columns={[...TABLE_COLUMNS]}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />
        <tbody className="divide-y divide-[var(--pd-border)]">
          {filtered.map((order) => {
            const profile = profiles[order.user_id];
            const rx = rxMap[order.id];
            const isExpanded = expandedId === order.id;
            const date = new Date(order.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const teeth = order.tooth_numbers?.length
              ? order.tooth_numbers.sort((a, b) => a - b).map((n) => `#${n}`).join(", ")
              : order.tooth_number
                ? `#${order.tooth_number}`
                : null;

            return (
              <Fragment key={order.id}>
                <tr
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-[var(--pd-surface)]",
                    isExpanded && "bg-[var(--pd-surface)]"
                  )}
                >
                  <td className="px-4 py-3">
                    <AdminOrderIdChip id={order.id} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[var(--pd-navy)] truncate max-w-[180px]">{order.product_name}</p>
                    <p className="text-[12px] text-[var(--pd-muted)] mt-0.5">
                      Qty {order.quantity}
                      {order.shade ? ` · ${order.shade}` : ""}
                      {teeth ? ` · ${teeth}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--pd-slate)]">{profile?.practice_name || "—"}</p>
                    {rx && <p className="text-[12px] text-[var(--pd-muted)] mt-0.5">Dr. {rx.dentist_name}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <AdminStatusBadge status={order.status} />
                      {order.paid_at && (
                        <AdminTagBadge className="bg-[#E1F5EE] text-[var(--pd-teal-dark)] border-[#9FE1CB]">
                          Paid
                        </AdminTagBadge>
                      )}
                      {order.is_remake && (
                        <AdminTagBadge className="bg-red-50 text-red-600 border-red-200">Remake</AdminTagBadge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <AdminDueDateChip dueDate={order.due_date} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-[var(--pd-navy)]">${order.total_price}</span>
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
                      <AdminOrderExpandedPanel
                        order={order}
                        profile={profile}
                        rx={rx}
                        trackingValue={trackingInputs[order.id] || ""}
                        onTrackingChange={(value) =>
                          setTrackingInputs((prev) => ({ ...prev, [order.id]: value }))
                        }
                        onStatusChange={(status) => void updateStatus(order.id, status)}
                        onShip={() => void updateTracking(order.id)}
                        onDownloadStl={() => void downloadStl(order.stl_file_path!)}
                        savingStatus={!!saving[order.id]}
                        savingTracking={!!saving[`track_${order.id}`]}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}

          {filtered.length === 0 && <AdminOrdersEmptyRow colSpan={8} />}
        </tbody>
      </AdminOrdersTableShell>
    </div>
  );
}
