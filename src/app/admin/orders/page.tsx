"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

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
};

const STATUS_STEPS = ["received", "printing", "qc", "shipped", "delivered"];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  received:  { label: "Received",    color: "bg-blue-50 text-blue-600 border-blue-200" },
  printing:  { label: "In Progress", color: "bg-amber-50 text-amber-600 border-amber-200" },
  qc:        { label: "QC Check",    color: "bg-purple-50 text-purple-600 border-purple-200" },
  shipped:   { label: "Shipped",     color: "bg-green-50 text-green-600 border-green-200" },
  delivered: { label: "Delivered",   color: "bg-gray-50 text-gray-500 border-gray-200" },
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [rxMap, setRxMap] = useState<Record<string, Rx>>({});
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  async function checkAdminAndLoad() {
    const supabase = createClient();
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
    const supabase = createClient();

    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!ordersData) { setLoading(false); return; }
    setOrders(ordersData);

    const userIds = [...new Set(ordersData.map(o => o.user_id))];
   const { data: profilesData } = await supabase
  .from("profiles")
  .select("id, first_name, last_name, practice_name")
  .in("id", userIds);

    const profileMap: Record<string, Profile> = {};
    profilesData?.forEach(p => { profileMap[p.id] = p; });
    setProfiles(profileMap);

    const orderIds = ordersData.map(o => o.id);
    const { data: rxData } = await supabase
      .from("rx")
      .select("*")
      .in("order_id", orderIds);

    const rxMapData: Record<string, Rx> = {};
    rxData?.forEach(rx => { rxMapData[rx.order_id] = rx; });
    setRxMap(rxMapData);

    const trackingMap: Record<string, string> = {};
    ordersData.forEach(o => {
      trackingMap[o.id] = o.tracking_number || "";
    });
    setTrackingInputs(trackingMap);

    setLoading(false);
  }

  async function updateStatus(orderId: string, newStatus: string) {
    setSaving(prev => ({ ...prev, [orderId]: true }));
    const supabase = createClient();
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setSaving(prev => ({ ...prev, [orderId]: false }));
  }

  async function updateTracking(orderId: string) {
    setSaving(prev => ({ ...prev, [`track_${orderId}`]: true }));
    const supabase = createClient();
    const tracking = trackingInputs[orderId] || null;
    await supabase.from("orders").update({ tracking_number: tracking }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, tracking_number: tracking } : o));
    setSaving(prev => ({ ...prev, [`track_${orderId}`]: false }));
  }

  async function downloadStl(filePath: string) {
    const supabase = createClient();
    const { data } = await supabase.storage.from("stl-files").createSignedUrl(filePath, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  const uniqueUsers = Object.values(profiles);
  const filtered = filterUser === "all"
    ? orders
    : orders.filter(o => o.user_id === filterUser);

  const stats = {
    total: orders.length,
    received: orders.filter(o => o.status === "received").length,
    inProgress: orders.filter(o => ["printing", "qc"].includes(o.status)).length,
    shipped: orders.filter(o => ["shipped", "delivered"].includes(o.status)).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <p className="text-sm text-[#9B9B9B]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Header */}
      <div className="h-14 border-b border-[#E2E0D8] bg-white flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1A1A1A] rounded-sm flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">PC</span>
            </div>
            <span className="font-semibold text-[#1A1A1A]">Print<span className="text-[#2563EB]">Crown</span></span>
          </Link>
          <span className="text-[#E2E0D8]">/</span>
          <span className="text-sm text-[#6B6B6B]">Admin · Orders</span>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A]">Products</Link>
          <Link href="/dashboard" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A]">Dashboard</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total orders", value: stats.total },
            { label: "New (Received)", value: stats.received, highlight: stats.received > 0 },
            { label: "In progress", value: stats.inProgress },
            { label: "Shipped", value: stats.shipped },
          ].map((s) => (
            <div key={s.label} className={`bg-white rounded-xl border p-4 text-center ${s.highlight ? "border-[#2563EB]" : "border-[#E2E0D8]"}`}>
              <p className={`text-2xl font-bold ${s.highlight ? "text-[#2563EB]" : "text-[#1A1A1A]"}`}>{s.value}</p>
              <p className="text-xs text-[#9B9B9B] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm text-[#6B6B6B]">Filter by practice:</span>
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="h-9 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
          >
           <option value="all">All practices ({orders.length})</option>
  {uniqueUsers.map(p => (
    <option key={p.id} value={p.id}>
      {p.practice_name || p.id.slice(0, 8)}
    </option>
  ))}
          </select>
        </div>

        {/* Orders */}
        <div className="space-y-3">
          {filtered.map((order) => {
            const profile = profiles[order.user_id];
            const rx = rxMap[order.id];
            const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.received;
            const isExpanded = expandedId === order.id;
            const date = new Date(order.created_at).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            });
            const teeth = order.tooth_numbers?.length
              ? order.tooth_numbers.sort((a, b) => a - b).map(n => `#${n}`).join(", ")
              : order.tooth_number ? `#${order.tooth_number}` : null;

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-[#E2E0D8] overflow-hidden">
                {/* Main row */}
                <button
                  className="w-full text-left p-5"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="font-mono text-xs text-[#9B9B9B] bg-[#F8F7F4] px-2 py-0.5 rounded">
                          #{order.id.slice(0, 6).toUpperCase()}
                        </span>
                        <p className="font-semibold text-[#1A1A1A]">{order.product_name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${status.color}`}>
                          {status.label}
                        </span>
                        {order.paid_at && (
                          <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-green-50 text-green-600 border-green-200">
                            Paid
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap text-xs text-[#9B9B9B]">
                        <span>{profile?.practice_name || profile?.practice_name || "Unknown"}</span>
                        <span>·</span>
                        <span>Qty: {order.quantity}</span>
                        {order.shade && <span>Shade: {order.shade}</span>}
                        {teeth && <span>Tooth {teeth}</span>}
                        <span>·</span>
                        <span>{date}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-[#1A1A1A]">${order.total_price}</p>
                      <p className="text-xs text-[#9B9B9B] mt-0.5">{isExpanded ? "▲" : "▼"}</p>
                    </div>
                  </div>
                </button>

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t border-[#E2E0D8] p-5 bg-[#F8F7F4] space-y-5">
                    {/* Status update */}
                    <div>
                      <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Update status</p>
                      <div className="flex gap-2 flex-wrap">
                        {STATUS_STEPS.map((step) => (
                          <button
                            key={step}
                            onClick={() => updateStatus(order.id, step)}
                            disabled={saving[order.id]}
                            className={`h-8 px-3 rounded-lg text-xs font-medium border transition-all ${
                              order.status === step
                                ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                                : "bg-white text-[#6B6B6B] border-[#E2E0D8] hover:border-[#1A1A1A]"
                            }`}
                          >
                            {STATUS_CONFIG[step]?.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tracking */}
                    <div>
                      <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Tracking number</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={trackingInputs[order.id] || ""}
                          onChange={(e) => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                          placeholder="Enter FedEx tracking number..."
                          className="flex-1 h-9 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]"
                        />
                        <button
                          onClick={() => updateTracking(order.id)}
                          disabled={saving[`track_${order.id}`]}
                          className="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#2A2A2A] transition-all disabled:opacity-40"
                        >
                          {saving[`track_${order.id}`] ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>

                    {/* Rx info */}
                    {rx && (
                      <div>
                        <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Rx</p>
                        <div className="bg-white rounded-xl border border-[#E2E0D8] p-4 space-y-1.5 text-sm">
                          <div className="flex gap-4 flex-wrap">
                            <span><span className="text-[#9B9B9B]">Dentist:</span> {rx.dentist_name}</span>
                            <span><span className="text-[#9B9B9B]">License:</span> #{rx.dentist_license_no} ({rx.license_state})</span>
                            <span className={`font-medium ${rx.authorized ? "text-green-600" : "text-red-500"}`}>
                              {rx.authorized ? "Authorized" : "Not authorized"}
                            </span>
                          </div>
                          {rx.margin_type && (
                            <div className="flex gap-4 flex-wrap text-xs text-[#6B6B6B]">
                              <span>Margin: {rx.margin_type}</span>
                              {rx.occlusion && <span>Occlusion: {rx.occlusion}</span>}
                              {rx.guard_type && <span>Guard: {rx.guard_type}</span>}
                              {rx.color && <span>Color: {rx.color}</span>}
                            </div>
                          )}
                          {rx.notes && <p className="text-xs text-[#9B9B9B]">Notes: {rx.notes}</p>}
                        </div>
                      </div>
                    )}

                    {/* STL download */}
                    {order.stl_file_path && (
                      <div>
                        <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">STL file</p>
                        <button
                          onClick={() => downloadStl(order.stl_file_path!)}
                          className="h-9 px-4 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#2563EB] font-medium hover:border-[#2563EB] transition-all"
                        >
                          Download STL
                        </button>
                      </div>
                    )}

                    {/* Customer info */}
                    <div>
                      <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Customer</p>
                      <div className="text-sm text-[#4B4B4B] space-y-0.5">
                        <p>{profile?.practice_name || "—"}</p>
                        <p className="text-xs text-[#9B9B9B]">{profile?.practice_name || "—"}</p>
                        <p className="text-xs font-mono text-[#9B9B9B]">Order: {order.id}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#E2E0D8]">
              <p className="text-[#9B9B9B] text-sm">No orders found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}