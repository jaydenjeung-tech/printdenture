"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { ADMIN_STATUS_STEPS } from "@/components/admin/admin-orders-ui";
import {
  AdminOverviewAtAGlance,
  AdminOverviewDetailPanel,
  AdminOverviewHeader,
  AdminOverviewLoadError,
  AdminOverviewLoading,
  AdminOverviewMetrics,
  AdminOverviewOrderList,
  AdminOverviewStatusTabs,
  getOverviewAttentionOrders,
  type AdminOverviewOrder,
} from "@/components/admin/admin-overview-ui";

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOverviewOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOverviewOrder | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [carrierInput, setCarrierInput] = useState("UPS");
  const [filterStatus, setFilterStatus] = useState("active");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [productCategoryById, setProductCategoryById] = useState<Record<string, string>>({});
  const [defaultPartnerEmail, setDefaultPartnerEmail] = useState("");
  const [defaultPartnerName, setDefaultPartnerName] = useState("JD");

  useEffect(() => {
    void fetch("/api/admin/design-outsource")
      .then((r) => r.json())
      .then((data) => {
        if (data.defaultPartnerEmail) setDefaultPartnerEmail(data.defaultPartnerEmail);
        if (data.defaultPartnerName) setDefaultPartnerName(data.defaultPartnerName);
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

      const { data, error } = await access.supabase
        .from("orders")
        .select(
          `*, profiles!orders_user_id_fkey(first_name, last_name, practice_name, phone, address, city, state, zip)`
        )
        .order("created_at", { ascending: false });

      if (error) {
        setLoadError(error.message);
        setLoading(false);
        return;
      }

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

  const activeOrders = orders.filter((o) => o.status !== "delivered");
  const filtered =
    filterStatus === "all"
      ? orders
      : filterStatus === "active"
        ? activeOrders
        : orders.filter((o) => o.status === filterStatus);

  const statusCounts = ADMIN_STATUS_STEPS.reduce(
    (acc, s) => {
      acc[s] = orders.filter((o) => o.status === s).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const atJd = orders.filter((o) => o.design_outsource_status === "sent").length;
  const inLab = (statusCounts.printing ?? 0) + (statusCounts.qc ?? 0);
  const attentionOrders = getOverviewAttentionOrders(activeOrders);

  const stats = {
    active: activeOrders.length,
    received: statusCounts.received ?? 0,
    inLab,
    shipped: statusCounts.shipped ?? 0,
    atJd,
  };

  if (loading) {
    return <AdminOverviewLoading />;
  }

  if (loadError) {
    return <AdminOverviewLoadError message={loadError} />;
  }

  return (
    <div className="max-w-6xl w-full">
      <AdminOverviewHeader activeCount={stats.active} attentionCount={attentionOrders.length} />

      <AdminOverviewMetrics
        items={[
          { label: "Active cases", value: stats.active },
          { label: "New", value: stats.received },
          { label: "In lab", value: stats.inLab },
          { label: "Shipped", value: stats.shipped },
          { label: "At JD", value: stats.atJd },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div>
          <AdminOverviewStatusTabs
            active={filterStatus}
            onChange={setFilterStatus}
            counts={statusCounts}
            total={orders.length}
            activeCount={activeOrders.length}
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
            defaultPartnerName={defaultPartnerName}
            onOutsourceSent={(fields) => handleOutsourceSent(selectedOrder.id, fields)}
          />
        ) : (
          <AdminOverviewAtAGlance
            stats={stats}
            attentionOrders={attentionOrders}
            onSelect={selectOrder}
          />
        )}
      </div>
    </div>
  );
}
