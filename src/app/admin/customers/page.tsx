"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createAppClient } from "@/lib/supabase";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { useAdminSite } from "@/components/admin/admin-site";
import {
  AdminCustomersHeader,
  AdminCustomersLoading,
  AdminCustomersSummaryFilters,
  AdminCustomersTable,
  AdminCustomersToolbar,
  type AdminCustomerProfile,
  type AdminCustomerStats,
  type CustomerFilter,
} from "@/components/admin/admin-customers-ui";

type CustomerOrder = {
  id: string;
  user_id: string;
  product_id: string | null;
  product_name: string | null;
  total_price: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  is_remake: boolean | null;
};

type SortKey = "practice_name" | "totalOrders" | "totalRevenue" | "remakeRate" | "lastOrderDate";
type SortDir = "asc" | "desc";

export default function CustomersPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<AdminCustomerProfile[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { matchesOrder, site } = useAdminSite();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("lastOrderDate");
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

    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .not("practice_name", "is", null)
      .order("created_at", { ascending: false });

    if (!profiles) {
      setLoading(false);
      return;
    }

    const { data: orderRows } = await supabase
      .from("orders")
      .select("id, user_id, product_id, product_name, total_price, status, created_at, paid_at, is_remake");

    setProfiles((profiles ?? []) as AdminCustomerProfile[]);
    setOrders((orderRows ?? []) as CustomerOrder[]);
    setLoading(false);
  }

  const customers = useMemo(() => {
    const now = new Date();
    const scoped = orders.filter((order) => matchesOrder(order));
    const stats: AdminCustomerStats[] = profiles.map((profile) => {
      const userOrders = scoped.filter((order) => order.user_id === profile.id);
      const paidOrders = userOrders.filter((order) => order.paid_at && !order.is_remake);
      const remakeOrders = userOrders.filter((order) => order.is_remake);
      const nonRemakeOrders = userOrders.filter((order) => !order.is_remake);
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total_price, 0);
      const remakeRate =
        nonRemakeOrders.length > 0
          ? Math.round((remakeOrders.length / nonRemakeOrders.length) * 100)
          : 0;
      const sortedOrders = [...userOrders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const lastOrderDate = sortedOrders[0]?.created_at || null;
      const daysSinceLastOrder = lastOrderDate
        ? Math.floor((now.getTime() - new Date(lastOrderDate).getTime()) / 86400000)
        : null;
      const pendingOrders = userOrders.filter((order) => !["shipped", "delivered"].includes(order.status)).length;

      return {
        profile,
        totalOrders: nonRemakeOrders.length,
        totalRevenue,
        remakeCount: remakeOrders.length,
        remakeRate,
        lastOrderDate,
        daysSinceLastOrder,
        pendingOrders,
      };
    });
    return site === "all" ? stats : stats.filter((customer) => customer.totalOrders > 0);
  }, [matchesOrder, orders, profiles, site]);

  function handleSort(key: string) {
    const k = key as SortKey;
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  }

  const filtered = customers
    .filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        (c.profile.practice_name || "").toLowerCase().includes(q) ||
        (c.profile.dentist_name || "").toLowerCase().includes(q) ||
        (c.profile.city || "").toLowerCase().includes(q);

      const days = c.daysSinceLastOrder;
      const matchFilter =
        filter === "all"
          ? true
          : filter === "active"
            ? days !== null && days <= 30
            : filter === "inactive"
              ? days !== null && days > 30 && days <= 60
              : filter === "dormant"
                ? days !== null && days > 60
                : filter === "high_remake"
                  ? c.remakeRate >= 20
                  : true;

      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      let valA: string | number = 0;
      let valB: string | number = 0;
      if (sortKey === "practice_name") {
        valA = a.profile.practice_name || "";
        valB = b.profile.practice_name || "";
      } else if (sortKey === "totalOrders") {
        valA = a.totalOrders;
        valB = b.totalOrders;
      } else if (sortKey === "totalRevenue") {
        valA = a.totalRevenue;
        valB = b.totalRevenue;
      } else if (sortKey === "remakeRate") {
        valA = a.remakeRate;
        valB = b.remakeRate;
      } else if (sortKey === "lastOrderDate") {
        valA = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
        valB = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
      }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.daysSinceLastOrder !== null && c.daysSinceLastOrder <= 30).length;
  const dormantCustomers = customers.filter((c) => c.daysSinceLastOrder !== null && c.daysSinceLastOrder > 60).length;
  const highRemakeCustomers = customers.filter((c) => c.remakeRate >= 20).length;

  if (loading) return <AdminCustomersLoading />;

  return (
    <>
      <AdminCustomersHeader totalCount={totalCustomers} />

      <AdminCustomersSummaryFilters
        activeFilter={filter}
        onSelect={setFilter}
        items={[
          { label: "Total practices", value: totalCustomers, filter: "all", tone: "text-[var(--pd-navy)]" },
          { label: "Active (30d)", value: activeCustomers, filter: "active", tone: "text-[var(--pd-teal-dark)]" },
          { label: "Dormant (60d+)", value: dormantCustomers, filter: "dormant", tone: "text-red-600", highlight: dormantCustomers > 0 },
          {
            label: "High remake rate",
            value: highRemakeCustomers,
            filter: "high_remake",
            tone: "text-amber-700",
            highlight: highRemakeCustomers > 0,
          },
        ]}
      />

      <AdminCustomersToolbar search={search} onSearchChange={setSearch} resultCount={filtered.length} />

      <AdminCustomersTable
        rows={filtered}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        onRowClick={(id) => router.push(`/admin/customers/${id}`)}
      />
    </>
  );
}
