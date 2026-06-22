"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createAppClient } from "@/lib/supabase";
import { verifyAdminAccess } from "@/lib/admin-auth";
import {
  AdminCustomerBreadcrumb,
  AdminCustomerDetailHeader,
  AdminCustomerInfoPanel,
  AdminCustomerMetrics,
  AdminCustomerOrdersTable,
  AdminCustomerQuickActions,
  AdminCustomerRemakePanel,
  AdminCustomersLoading,
  type AdminCustomerOrderRow,
  type AdminCustomerProfile,
} from "@/components/admin/admin-customers-ui";

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [profile, setProfile] = useState<AdminCustomerProfile | null>(null);
  const [orders, setOrders] = useState<AdminCustomerOrderRow[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [customerId]);

  async function loadData() {
    const supabase = createAppClient();

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", customerId).single();
    if (!profileData) {
      router.push("/admin/customers");
      return;
    }
    setProfile(profileData);

    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", customerId)
      .order("created_at", { ascending: false });
    setOrders(ordersData || []);

    setLoading(false);
  }

  if (loading) return <AdminCustomersLoading />;
  if (!profile) return null;

  const nonRemakeOrders = orders.filter((o) => !o.is_remake);
  const remakeOrders = orders.filter((o) => o.is_remake);
  const paidOrders = orders.filter((o) => o.paid_at && !o.is_remake);
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_price, 0);
  const remakeRate =
    nonRemakeOrders.length > 0 ? Math.round((remakeOrders.length / nonRemakeOrders.length) * 100) : 0;
  const pendingOrders = orders.filter((o) => !["shipped", "delivered"].includes(o.status)).length;

  const remakeByReason = remakeOrders.reduce(
    (acc, o) => {
      const reason = o.remake_reason || "other";
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="max-w-6xl w-full mx-auto">
      <AdminCustomerBreadcrumb practiceName={profile.practice_name || "—"} />
      <AdminCustomerDetailHeader profile={profile} />

      <AdminCustomerMetrics
        items={[
          { label: "Total orders", value: nonRemakeOrders.length },
          { label: "Total revenue", value: `$${totalRevenue.toLocaleString()}` },
          {
            label: "Remake rate",
            value: `${remakeRate}%`,
            tone:
              remakeRate >= 20 ? "text-red-600" : remakeRate >= 10 ? "text-amber-700" : "text-[var(--pd-teal-dark)]",
          },
          {
            label: "Pending",
            value: pendingOrders,
            tone: pendingOrders > 0 ? "text-amber-700" : "text-[var(--pd-navy)]",
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AdminCustomerOrdersTable orders={orders} onOrderClick={(id) => router.push(`/admin/orders/${id}`)} />
        </div>

        <div className="space-y-4">
          <AdminCustomerInfoPanel profile={profile} />
          <AdminCustomerRemakePanel
            remakeByReason={remakeByReason}
            remakeCount={remakeOrders.length}
            remakeRate={remakeRate}
          />
          <AdminCustomerQuickActions customerId={customerId} phone={profile.phone} />
        </div>
      </div>
    </div>
  );
}
