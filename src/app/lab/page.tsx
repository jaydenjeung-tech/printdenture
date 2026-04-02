"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

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
  paid_at: string | null;
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

const STATUS_STEPS = ["received", "printing", "qc", "shipped", "delivered"];

const STATUS_CONFIG: Record<string, { label: string; color: string; next: string | null }> = {
  received:  { label: "Received",    color: "bg-blue-50 text-blue-600 border-blue-200",     next: "printing" },
  printing:  { label: "Printing",    color: "bg-amber-50 text-amber-600 border-amber-200",  next: "qc" },
  qc:        { label: "QC Check",    color: "bg-purple-50 text-purple-600 border-purple-200", next: "shipped" },
  shipped:   { label: "Shipped",     color: "bg-green-50 text-green-600 border-green-200",  next: "delivered" },
  delivered: { label: "Delivered",   color: "bg-gray-50 text-gray-500 border-gray-200",     next: null },
};

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  zirconia:    { label: "Zirconia Crown", color: "bg-blue-50 text-blue-700 border-blue-200" },
  printed:     { label: "Print Crown",    color: "bg-green-50 text-green-700 border-green-200" },
  nightguard:  { label: "Night Guard",    color: "bg-amber-50 text-amber-700 border-amber-200" },
  sportsguard: { label: "Sports Guard",   color: "bg-purple-50 text-purple-700 border-purple-200" },
};

export default function LabPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [rxMap, setRxMap] = useState<Record<string, Rx>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<string>("active");

  useEffect(() => {
    checkAndLoad();
  }, []);

  async function checkAndLoad() {
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
      .order("created_at", { ascending: true });

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
    ordersData.forEach(o => { trackingMap[o.id] = o.tracking_number || ""; });
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
    await supabase.from("orders")
      .update({ tracking_number: tracking, status: "shipped" })
      .eq("id", orderId);
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, tracking_number: tracking, status: "shipped" } : o
    ));
    setSaving(prev => ({ ...prev, [`track_${orderId}`]: false }));
  }

  async function downloadStl(filePath: string) {
    const supabase = createClient();
    const { data } = await supabase.storage.from("stl-files").createSignedUrl(filePath, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  const activeOrders = orders.filter(o => !["delivered"].includes(o.status));
  const completedOrders = orders.filter(o => o.status === "delivered");
  const displayOrders = activeTab === "active" ? activeOrders : completedOrders;

  const stats = {
    received: orders.filter(o => o.status === "received").length,
    printing: orders.filter(o => o.status === "printing").length,
    qc: orders.filter(o => o.status === "qc").length,
    shipped: orders.filter(o => o.status === "shipped").length,
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
          <span className="text-sm text-[#6B6B6B]">Lab Workqueue</span>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/orders" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A]">Orders</Link>
          <Link href="/admin/products" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A]">Products</Link>
          <Link href="/dashboard" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A]">Dashboard</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "New orders", value: stats.received, color: "text-[#2563EB]", border: stats.received > 0 },
            { label: "Printing", value: stats.printing, color: "text-[#D97706]", border: false },
            { label: "QC Check", value: stats.qc, color: "text-[#9333EA]", border: false },
            { label: "Shipped", value: stats.shipped, color: "text-[#16A34A]", border: false },
          ].map((s) => (
            <div key={s.label} className={`bg-white rounded-xl border p-4 text-center ${s.border ? "border-[#2563EB]" : "border-[#E2E0D8]"}`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[#9B9B9B] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-[#E2E0D8] rounded-xl p-1 w-fit">
          {[
            { key: "active", label: `Active (${activeOrders.length})` },
            { key: "completed", label: `Completed (${completedOrders.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 h-8 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-[#1A1A1A] text-white"
                  : "text-[#6B6B6B] hover:text-[#1A1A1A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        <div className="space-y-3">
          {displayOrders.map((order) => {
            const profile = profiles[order.user_id];
            const rx = rxMap[order.id];
            const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.received;
            const category = CATEGORY_CONFIG[order.product_id] ?? { label: order.product_name, color: "bg-gray-50 text-gray-600 border-gray-200" };
            const isExpanded = expandedId === order.id;
            const date = new Date(order.created_at).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            });
            const teeth = order.tooth_numbers?.length
              ? order.tooth_numbers.sort((a, b) => a - b).map(n => `#${n}`).join(", ")
              : order.tooth_number ? `#${order.tooth_number}` : null;
            const nextStatus = status.next;

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-[#E2E0D8] overflow-hidden">
                <div
                    className="w-full text-left p-5 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-mono text-xs text-[#9B9B9B] bg-[#F8F7F4] px-2 py-0.5 rounded">
                          #{order.id.slice(0, 6).toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${category.color}`}>
                          {category.label}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap text-xs text-[#9B9B9B]">
                        <span className="font-medium text-[#4B4B4B]">
                          {profile?.practice_name || "Unknown practice"}
                        </span>
                        {order.shade && <span>Shade: {order.shade}</span>}
                        {teeth && <span>Tooth: {teeth}</span>}
                        <span>{date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {nextStatus && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatus(order.id, nextStatus); }}
                          disabled={saving[order.id]}
                          className="h-8 px-3 rounded-lg text-xs font-medium bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] transition-all disabled:opacity-40"
                        >
                          {saving[order.id] ? "..." : `Move to ${STATUS_CONFIG[nextStatus]?.label}`}
                        </button>
                      )}
                      <p className="text-xs text-[#9B9B9B]">{isExpanded ? "▲" : "▼"}</p>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[#E2E0D8] p-5 bg-[#F8F7F4] space-y-5">

                    {/* Status pipeline */}
                    <div>
                      <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Pipeline</p>
                      <div className="flex gap-2 flex-wrap">
                        {STATUS_STEPS.filter(s => s !== "delivered").map((step) => (
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

                    {/* Rx */}
                    {rx && (
                      <div>
                        <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Rx</p>
                        <div className="bg-white rounded-xl border border-[#E2E0D8] p-4 space-y-1.5">
                          <div className="flex gap-4 flex-wrap text-sm">
                            <span><span className="text-[#9B9B9B]">Dr.</span> {rx.dentist_name}</span>
                            <span><span className="text-[#9B9B9B]">License:</span> #{rx.dentist_license_no} ({rx.license_state})</span>
                            <span className={`font-medium text-xs ${rx.authorized ? "text-green-600" : "text-red-500"}`}>
                              {rx.authorized ? "Authorized" : "Not authorized"}
                            </span>
                          </div>
                          {(rx.margin_type || rx.occlusion || rx.guard_type) && (
                            <div className="flex gap-4 flex-wrap text-xs text-[#6B6B6B]">
                              {rx.margin_type && <span>Margin: {rx.margin_type}</span>}
                              {rx.occlusion && <span>Occlusion: {rx.occlusion}</span>}
                              {rx.guard_type && <span>Guard: {rx.guard_type}</span>}
                              {rx.shade && <span>Shade: {rx.shade}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STL */}
                    {order.stl_file_path && (
                      <div>
                        <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">STL File</p>
                        <button
                          onClick={() => downloadStl(order.stl_file_path!)}
                          className="h-9 px-4 rounded-lg border border-[#2563EB] bg-white text-sm text-[#2563EB] font-medium hover:bg-[#EFF6FF] transition-all"
                        >
                          Download STL
                        </button>
                      </div>
                    )}

                    {/* Tracking */}
                    <div>
                      <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">
                        Shipping (tracking number saved = auto Shipped)
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={trackingInputs[order.id] || ""}
                          onChange={(e) => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                          placeholder="UPS tracking number..."
                          className="flex-1 h-9 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]"
                        />
                        <button
                          onClick={() => updateTracking(order.id)}
                          disabled={saving[`track_${order.id}`]}
                          className="h-9 px-4 rounded-lg bg-[#16A34A] text-white text-sm font-medium hover:bg-[#15803D] transition-all disabled:opacity-40"
                        >
                          {saving[`track_${order.id}`] ? "Saving..." : "Ship"}
                        </button>
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div>
                        <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1">Notes from practice</p>
                        <p className="text-sm text-[#4B4B4B] bg-white rounded-lg border border-[#E2E0D8] p-3">{order.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {displayOrders.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#E2E0D8]">
              <p className="text-[#9B9B9B] text-sm">
                {activeTab === "active" ? "No active cases." : "No completed cases."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}