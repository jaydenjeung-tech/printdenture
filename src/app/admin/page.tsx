"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { ADMIN_STATUS_STEPS } from "@/components/admin/admin-orders-ui";
import {
  AdminOverviewDetailPanel,
  AdminOverviewDetailPlaceholder,
  AdminOverviewHeader,
  AdminOverviewLoading,
  AdminOverviewMetrics,
  AdminOverviewOrderList,
  AdminOverviewStatusTabs,
  type AdminOverviewOrder,
} from "@/components/admin/admin-overview-ui";

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOverviewOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOverviewOrder | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [carrierInput, setCarrierInput] = useState("UPS");
  const [filterStatus, setFilterStatus] = useState("all");
  const [updating, setUpdating] = useState(false);
  const [productCategoryById, setProductCategoryById] = useState<Record<string, string>>({});
  const [defaultPartnerEmail, setDefaultPartnerEmail] = useState("");

  useEffect(() => {
    void fetch("/api/admin/design-outsource")
      .then((r) => r.json())
      .then((data) => {
        if (data.defaultPartnerEmail) setDefaultPartnerEmail(data.defaultPartnerEmail);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = await verifyAdminAccess();
      if (cancelled) return;
      if (!access.ok) {
        router.push(access.reason === "unauthenticated" ? "/auth" : "/dashboard");
        return;
      }

      const { data } = await access.supabase
        .from("orders")
        .select(
          `id, user_id, product_id, product_name, quantity, unit_price, total_price, status, shade, tooth_number, notes, stl_file_path, case_files, tracking_number, carrier, created_at, design_outsource_status, design_outsource_sent_at, design_outsource_email, design_outsource_notes, design_outsource_sent_by, profiles(first_name, last_name, practice_name, phone, address, city, state, zip)`
        )
        .order("created_at", { ascending: false });

      if (data) {
        setOrders(
          data.map((row) => ({
            ...row,
            profiles: Array.isArray(row.profiles) ? (row.profiles[0] ?? null) : row.profiles,
          })) as AdminOverviewOrder[]
        );
      }

      const { data: products } = await access.supabase.from("products").select("id, category");
      if (products) {
        setProductCategoryById(Object.fromEntries(products.map((p) => [p.id, p.category])));
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function updateStatus(orderId: string, status: string) {
    setUpdating(true);
    const access = await verifyAdminAccess();
    if (!access.ok) return;
    await access.supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status } : prev));
    }
    setUpdating(false);
  }

  async function updateTracking(orderId: string) {
    if (!trackingInput) return;
    setUpdating(true);
    const access = await verifyAdminAccess();
    if (!access.ok) return;
    await access.supabase
      .from("orders")
      .update({
        tracking_number: trackingInput,
        carrier: carrierInput,
        status: "shipped",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, tracking_number: trackingInput, carrier: carrierInput, status: "shipped" }
          : o
      )
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? { ...prev, tracking_number: trackingInput, carrier: carrierInput, status: "shipped" }
          : prev
      );
    }
    setTrackingInput("");
    setUpdating(false);
  }

  async function downloadSTL(filePath: string, orderId: string) {
    const access = await verifyAdminAccess();
    if (!access.ok) return;
    const { data } = await access.supabase.storage.from("stl-files").createSignedUrl(filePath, 60);
    if (data?.signedUrl) {
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = `${orderId}.stl`;
      a.click();
    }
  }

  function selectOrder(order: AdminOverviewOrder) {
    setSelectedOrder(order);
    setTrackingInput(order.tracking_number || "");
    setCarrierInput(order.carrier || "UPS");
  }

  function handleOutsourceSent(orderId: string, fields: Partial<AdminOverviewOrder>) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...fields } : o)));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, ...fields } : prev));
    }
  }

  const filtered = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);

  const statusCounts = ADMIN_STATUS_STEPS.reduce(
    (acc, s) => {
      acc[s] = orders.filter((o) => o.status === s).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const stats = {
    total: orders.length,
    received: statusCounts.received ?? 0,
    printing: statusCounts.printing ?? 0,
    shipped: statusCounts.shipped ?? 0,
    revenue: orders.reduce((sum, o) => sum + o.total_price, 0),
  };

  if (loading) {
    return <AdminOverviewLoading />;
  }

  return (
    <div className="max-w-6xl w-full">
      <AdminOverviewHeader />

      <AdminOverviewMetrics
        items={[
          { label: "Total orders", value: stats.total },
          { label: "New", value: stats.received },
          { label: "In progress", value: stats.printing },
          { label: "Shipped", value: stats.shipped },
          { label: "Revenue", value: `$${stats.revenue.toLocaleString()}` },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div>
          <AdminOverviewStatusTabs
            active={filterStatus}
            onChange={setFilterStatus}
            counts={statusCounts}
            total={orders.length}
          />
          <AdminOverviewOrderList
            orders={filtered}
            selectedId={selectedOrder?.id ?? null}
            onSelect={selectOrder}
          />
        </div>

        {selectedOrder ? (
          <AdminOverviewDetailPanel
            order={selectedOrder}
            trackingInput={trackingInput}
            carrierInput={carrierInput}
            updating={updating}
            onTrackingChange={setTrackingInput}
            onCarrierChange={setCarrierInput}
            onStatusChange={(status) => void updateStatus(selectedOrder.id, status)}
            onSaveTracking={() => void updateTracking(selectedOrder.id)}
            onDownloadStl={() => void downloadSTL(selectedOrder.stl_file_path!, selectedOrder.id)}
            productCategory={
              selectedOrder.product_id ? productCategoryById[selectedOrder.product_id] ?? null : null
            }
            defaultPartnerEmail={defaultPartnerEmail}
            onOutsourceSent={(fields) => handleOutsourceSent(selectedOrder.id, fields)}
          />
        ) : (
          <AdminOverviewDetailPlaceholder />
        )}
      </div>
    </div>
  );
}
