"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAppClient } from "@/lib/supabase";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { isOrderPaid, isOrderUnpaid } from "@/lib/order-payment";
import {
  AdminPaymentActions,
  AdminPaymentStatusBadge,
  AdminPaymentsEmptyRow,
  AdminPaymentsFilters,
  AdminPaymentsHeader,
  AdminPaymentsLoading,
  AdminPaymentsMetricRow,
  runAdminPaymentAction,
  type AdminPaymentOrder,
} from "@/components/admin/admin-payments-ui";
import { AdminOrderIdChip, AdminOrdersTableHead, AdminOrdersTableShell } from "@/components/admin/admin-orders-ui";

type Profile = {
  id: string;
  practice_name: string | null;
};

const TABLE_COLUMNS = [
  { key: null, label: "Case", width: "w-28" },
  { key: null, label: "Practice", width: "" },
  { key: null, label: "Product", width: "w-44" },
  { key: null, label: "Payment", width: "w-28" },
  { key: "total_price", label: "Amount", width: "w-24" },
  { key: "paid_at", label: "Paid", width: "w-32" },
  { key: "created_at", label: "Created", width: "w-28" },
  { key: null, label: "Actions", width: "w-36" },
] as const;

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminPaymentOrder[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionMessages, setActionMessages] = useState<Record<string, string>>({});

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
      .select("id, user_id, product_name, total_price, status, created_at, paid_at, stripe_session_id, case_number, is_remake, order_type")
      .order("created_at", { ascending: false });

    if (!ordersData) {
      setLoading(false);
      return;
    }

    setOrders(ordersData as AdminPaymentOrder[]);

    const userIds = [...new Set(ordersData.map((o) => o.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, practice_name")
      .in("id", userIds);

    const profileMap: Record<string, Profile> = {};
    profilesData?.forEach((p) => {
      profileMap[p.id] = p;
    });
    setProfiles(profileMap);
    setLoading(false);
  }

  async function handleAction(orderId: string, action: "mark-paid" | "sync-stripe") {
    setBusyId(orderId);
    setActionMessages((prev) => ({ ...prev, [orderId]: "" }));

    const result = await runAdminPaymentAction(action, orderId);
    setActionMessages((prev) => ({ ...prev, [orderId]: result.message }));

    if (result.ok && result.paid_at) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, paid_at: result.paid_at!, status: o.status === "pending_payment" ? "received" : o.status }
            : o
        )
      );
    }

    setBusyId(null);
  }

  const now = new Date();
  const chargeable = orders.filter((o) => !o.is_remake);
  const unpaidOrders = chargeable.filter((o) => isOrderUnpaid(o));
  const paidOrders = chargeable.filter((o) => isOrderPaid(o) && o.paid_at);

  const unpaidTotal = unpaidOrders.reduce((sum, o) => sum + o.total_price, 0);
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_price, 0);
  const todayRevenue = paidOrders
    .filter((o) => new Date(o.paid_at!).toDateString() === now.toDateString())
    .reduce((sum, o) => sum + o.total_price, 0);
  const monthRevenue = paidOrders
    .filter((o) => {
      const d = new Date(o.paid_at!);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, o) => sum + o.total_price, 0);

  const filtered = orders
    .filter((o) => {
      const profile = profiles[o.user_id];
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        o.id.toLowerCase().includes(q) ||
        o.product_name.toLowerCase().includes(q) ||
        (profile?.practice_name || "").toLowerCase().includes(q);

      const matchPayment =
        paymentFilter === "all" ||
        (paymentFilter === "paid" && isOrderPaid(o)) ||
        (paymentFilter === "unpaid" && isOrderUnpaid(o));

      let matchDate = true;
      if (dateFilter !== "all") {
        const anchor = o.paid_at ? new Date(o.paid_at) : new Date(o.created_at);
        if (dateFilter === "today") matchDate = anchor.toDateString() === now.toDateString();
        else if (dateFilter === "week") {
          const w = new Date();
          w.setDate(now.getDate() - 7);
          matchDate = anchor >= w;
        } else if (dateFilter === "month") {
          matchDate =
            anchor.getMonth() === now.getMonth() && anchor.getFullYear() === now.getFullYear();
        }
      }

      return matchSearch && matchPayment && matchDate;
    })
    .sort((a, b) => {
      if (paymentFilter === "unpaid") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      const aTime = a.paid_at ? new Date(a.paid_at).getTime() : new Date(a.created_at).getTime();
      const bTime = b.paid_at ? new Date(b.paid_at).getTime() : new Date(b.created_at).getTime();
      return bTime - aTime;
    });

  const filteredPaidTotal = filtered
    .filter((o) => o.paid_at && !o.is_remake)
    .reduce((sum, o) => sum + o.total_price, 0);

  if (loading) return <AdminPaymentsLoading />;

  return (
    <div className="max-w-[1400px] w-full">
      <AdminPaymentsHeader unpaidCount={unpaidOrders.length} />

      <AdminPaymentsMetricRow
        unpaidCount={unpaidOrders.length}
        unpaidTotal={unpaidTotal}
        todayRevenue={todayRevenue}
        monthRevenue={monthRevenue}
        totalRevenue={totalRevenue}
        paidCount={paidOrders.length}
      />

      <AdminPaymentsFilters
        search={search}
        onSearchChange={setSearch}
        paymentFilter={paymentFilter}
        onPaymentFilterChange={setPaymentFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        showClear={!!search || paymentFilter !== "all" || dateFilter !== "all"}
        onClear={() => {
          setSearch("");
          setPaymentFilter("all");
          setDateFilter("all");
        }}
        filteredCount={filtered.length}
        filteredPaidTotal={filteredPaidTotal}
      />

      <AdminOrdersTableShell>
        <AdminOrdersTableHead columns={[...TABLE_COLUMNS]} sortKey="" sortDir="desc" onSort={() => {}} />
        <tbody className="divide-y divide-[var(--pd-border)]">
          {filtered.map((order) => {
            const profile = profiles[order.user_id];
            const created = new Date(order.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const paidLabel = order.paid_at
              ? new Date(order.paid_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "—";

            return (
              <tr key={order.id} className="hover:bg-[var(--pd-surface)] transition-colors">
                <td className="px-4 py-3">
                  <AdminOrderIdChip id={order.id} caseNumber={order.case_number} />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[var(--pd-slate)]">{profile?.practice_name || "—"}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-[var(--pd-navy)] truncate max-w-[200px]">{order.product_name}</p>
                  {order.order_type === "equipment" && (
                    <p className="text-[11px] text-[var(--pd-muted)] mt-0.5">Equipment</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <AdminPaymentStatusBadge order={order} />
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-[var(--pd-navy)]">
                    {order.is_remake ? "—" : `$${order.total_price}`}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[12px] text-[var(--pd-muted)]">{paidLabel}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[12px] text-[var(--pd-muted)]">{created}</span>
                </td>
                <td className="px-4 py-3">
                  <AdminPaymentActions
                    order={order}
                    busy={busyId === order.id}
                    message={actionMessages[order.id] || null}
                    onMarkPaid={() => void handleAction(order.id, "mark-paid")}
                    onSyncStripe={() => void handleAction(order.id, "sync-stripe")}
                  />
                </td>
              </tr>
            );
          })}

          {filtered.length === 0 && <AdminPaymentsEmptyRow colSpan={8} />}
        </tbody>
      </AdminOrdersTableShell>
    </div>
  );
}
