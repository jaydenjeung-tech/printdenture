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
  due_date: string | null;
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
  email?: string | null;
  phone?: string | null;
};

const STATUS_STEPS = ["received", "printing", "qc", "shipped", "delivered"];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  received:  { label: "Received",    color: "bg-blue-50 text-blue-600 border-blue-200" },
  printing:  { label: "In Progress", color: "bg-amber-50 text-amber-600 border-amber-200" },
  qc:        { label: "QC Check",    color: "bg-purple-50 text-purple-600 border-purple-200" },
  shipped:   { label: "Shipped",     color: "bg-green-50 text-green-600 border-green-200" },
  delivered: { label: "Delivered",   color: "bg-gray-50 text-gray-500 border-gray-200" },
  paid:      { label: "Paid",        color: "bg-blue-50 text-blue-600 border-blue-200" },
};

function DueDateChip({ dueDate }: { dueDate: string | null }) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - today.getTime()) / 86400000);
  const formatted = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const label = days < 0 ? `${Math.abs(days)}d overdue`
    : days === 0 ? "Due today"
    : days === 1 ? "Due tomorrow"
    : `Due in ${days}d`;
  const color = days < 0 ? "text-red-600 bg-red-50 border-red-200"
    : days <= 1 ? "text-orange-600 bg-orange-50 border-orange-200"
    : days <= 2 ? "text-yellow-600 bg-yellow-50 border-yellow-200"
    : "text-green-600 bg-green-50 border-green-200";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${color}`}>
      {formatted} · {label}
    </span>
  );
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [rxMap, setRxMap] = useState<Record<string, Rx>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => { checkAdminAndLoad(); }, []);

  async function checkAdminAndLoad() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
    if (!profile?.is_admin) { router.push("/dashboard"); return; }
    await loadData();
  }

  async function loadData() {
    const supabase = createClient();
    const { data: ordersData } = await supabase
      .from("orders").select("*").order("created_at", { ascending: false });
    if (!ordersData) { setLoading(false); return; }
    setOrders(ordersData);

    const userIds = [...new Set(ordersData.map(o => o.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles").select("id, first_name, last_name, practice_name, phone").in("id", userIds);
    const profileMap: Record<string, Profile> = {};
    profilesData?.forEach(p => { profileMap[p.id] = p; });
    setProfiles(profileMap);

    const orderIds = ordersData.map(o => o.id);
    const { data: rxData } = await supabase.from("rx").select("*").in("order_id", orderIds);
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
    await supabase.from("orders").update({ tracking_number: tracking, status: "shipped" }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, tracking_number: tracking, status: "shipped" } : o));
    setSaving(prev => ({ ...prev, [`track_${orderId}`]: false }));
  }

  async function downloadStl(filePath: string) {
    const supabase = createClient();
    const { data } = await supabase.storage.from("stl-files").createSignedUrl(filePath, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  // Revenue stats
  const paidOrders = orders.filter(o => o.paid_at);
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_price, 0);
  const now = new Date();
  const thisMonthRevenue = paidOrders
    .filter(o => {
      const d = new Date(o.paid_at!);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, o) => sum + o.total_price, 0);
  const todayRevenue = paidOrders
    .filter(o => new Date(o.paid_at!).toDateString() === now.toDateString())
    .reduce((sum, o) => sum + o.total_price, 0);

  const statusStats = {
    received: orders.filter(o => o.status === "received").length,
    inProgress: orders.filter(o => ["printing", "qc"].includes(o.status)).length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  // Filtering
  function matchesDate(order: Order) {
    if (dateFilter === "all") return true;
    const created = new Date(order.created_at);
    if (dateFilter === "today") return created.toDateString() === now.toDateString();
    if (dateFilter === "week") {
      const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
      return created >= weekAgo;
    }
    if (dateFilter === "month") {
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }
    return true;
  }

  const filtered = orders.filter(o => {
    const profile = profiles[o.user_id];
    const q = search.toLowerCase();
    const matchSearch = !search ||
      o.id.toLowerCase().includes(q) ||
      o.product_name.toLowerCase().includes(q) ||
      (profile?.practice_name || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus && matchesDate(o);
  });

  const filteredRevenue = filtered.filter(o => o.paid_at).reduce((sum, o) => sum + o.total_price, 0);

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
          <span className="text-sm text-[#6B6B6B]">Order Management</span>
        </div>
        <div className="flex gap-3">
        <Link href="/lab" className="...">Lab Queue</Link>
        <Link href="/admin/products" className="...">Products</Link>
        <Link href="/admin/support" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A]">Support</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Revenue stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Today's revenue", value: `$${todayRevenue}`, sub: `${orders.filter(o => new Date(o.created_at).toDateString() === now.toDateString()).length} orders` },
            { label: "This month", value: `$${thisMonthRevenue}`, sub: `${paidOrders.filter(o => { const d = new Date(o.paid_at!); return d.getMonth() === now.getMonth(); }).length} paid orders` },
            { label: "Total revenue", value: `$${totalRevenue}`, sub: `${paidOrders.length} total paid` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E2E0D8] p-4">
              <p className="text-xs text-[#9B9B9B] mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-[#1A1A1A]">{s.value}</p>
              <p className="text-xs text-[#9B9B9B] mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Order status stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "New orders", value: statusStats.received, color: "text-[#2563EB]", highlight: statusStats.received > 0 },
            { label: "In progress", value: statusStats.inProgress, color: "text-[#D97706]", highlight: false },
            { label: "Shipped", value: statusStats.shipped, color: "text-[#16A34A]", highlight: false },
            { label: "Delivered", value: statusStats.delivered, color: "text-[#6B6B6B]", highlight: false },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-xl border p-4 text-center ${s.highlight ? "border-[#2563EB]" : "border-[#E2E0D8]"}`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[#9B9B9B] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, practice, product..."
            className="h-9 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE] w-64"
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]">
            <option value="all">All statuses</option>
            {STATUS_STEPS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>)}
          </select>
          <div className="flex gap-1 bg-white border border-[#E2E0D8] rounded-lg p-1">
            {[
              { key: "all", label: "All" },
              { key: "today", label: "Today" },
              { key: "week", label: "This week" },
              { key: "month", label: "This month" },
            ].map(d => (
              <button key={d.key} onClick={() => setDateFilter(d.key)}
                className={`px-3 h-7 rounded-md text-xs font-medium transition-all ${
                  dateFilter === d.key ? "bg-[#1A1A1A] text-white" : "text-[#6B6B6B] hover:text-[#1A1A1A]"
                }`}>
                {d.label}
              </button>
            ))}
          </div>
          {(search || statusFilter !== "all" || dateFilter !== "all") && (
            <button onClick={() => { setSearch(""); setStatusFilter("all"); setDateFilter("all"); }}
              className="h-9 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#9B9B9B] hover:text-[#1A1A1A]">
              Clear
            </button>
          )}
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-[#9B9B9B]">{filtered.length} orders</p>
          {filtered.length > 0 && (
            <p className="text-xs text-[#9B9B9B]">
              Revenue: <span className="font-semibold text-[#1A1A1A]">${filteredRevenue}</span>
            </p>
          )}
        </div>

        {/* Orders */}
        <div className="space-y-3">
          {filtered.map(order => {
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
                <button className="w-full text-left p-5" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                        <DueDateChip dueDate={order.due_date} />
                      </div>
                      <div className="flex items-center gap-3 flex-wrap text-xs text-[#9B9B9B]">
                        <span className="font-medium text-[#4B4B4B]">{profile?.practice_name || "Unknown"}</span>
                        <span>Qty: {order.quantity}</span>
                        {order.shade && <span>Shade: {order.shade}</span>}
                        {teeth && <span>Tooth {teeth}</span>}
                        <span>{date}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-[#1A1A1A]">${order.total_price}</p>
                      <p className="text-xs text-[#9B9B9B] mt-0.5">{isExpanded ? "▲" : "▼"}</p>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-[#E2E0D8] p-5 bg-[#F8F7F4] space-y-5">

                    {/* Status */}
                    <div>
                      <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Update status</p>
                      <div className="flex gap-2 flex-wrap">
                        {STATUS_STEPS.map(step => (
                          <button key={step} onClick={() => updateStatus(order.id, step)}
                            disabled={saving[order.id]}
                            className={`h-8 px-3 rounded-lg text-xs font-medium border transition-all ${
                              order.status === step
                                ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                                : "bg-white text-[#6B6B6B] border-[#E2E0D8] hover:border-[#1A1A1A]"
                            }`}>
                            {STATUS_CONFIG[step]?.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tracking */}
                    <div>
                      <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Tracking number</p>
                      <div className="flex gap-2">
                        <input type="text" value={trackingInputs[order.id] || ""}
                          onChange={e => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                          placeholder="UPS / FedEx tracking number..."
                          className="flex-1 h-9 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]"
                        />
                        <button onClick={() => updateTracking(order.id)}
                          disabled={saving[`track_${order.id}`]}
                          className="h-9 px-4 rounded-lg bg-[#16A34A] text-white text-sm font-medium hover:bg-[#15803D] transition-all disabled:opacity-40">
                          {saving[`track_${order.id}`] ? "Saving..." : "Ship"}
                        </button>
                      </div>
                      {order.tracking_number && (
                        <a href={`https://www.ups.com/track?tracknum=${order.tracking_number}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-xs text-[#2563EB] hover:underline mt-1 block">
                          Track: {order.tracking_number}
                        </a>
                      )}
                    </div>

                    {/* Payment info */}
                    <div>
                      <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Payment</p>
                      <div className="bg-white rounded-xl border border-[#E2E0D8] p-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-[#9B9B9B] mb-0.5">Unit price</p>
                            <p className="font-medium">${order.unit_price}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#9B9B9B] mb-0.5">Quantity</p>
                            <p className="font-medium">{order.quantity}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#9B9B9B] mb-0.5">Total</p>
                            <p className="font-bold text-[#1A1A1A]">${order.total_price}</p>
                          </div>
                        </div>
                        {order.paid_at && (
                          <p className="text-xs text-[#9B9B9B] mt-2">
                            Paid: {new Date(order.paid_at).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Customer */}
                    <div>
                      <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Customer</p>
                      <div className="bg-white rounded-xl border border-[#E2E0D8] p-4 text-sm space-y-1">
                        <p className="font-medium text-[#1A1A1A]">{profile?.practice_name || "—"}</p>
                        {rx && <p className="text-[#6B6B6B]">Dr. {rx.dentist_name} · License #{rx.dentist_license_no} ({rx.license_state})</p>}
                        {profile?.phone && <p className="text-xs text-[#9B9B9B]">{profile.phone}</p>}
                        <p className="text-xs font-mono text-[#9B9B9B]">Order ID: {order.id}</p>
                      </div>
                    </div>

                    {/* Rx */}
                    {rx && (
                      <div>
                        <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Rx</p>
                        <div className="bg-white rounded-xl border border-[#E2E0D8] p-4 space-y-1.5 text-sm">
                          <div className="flex gap-4 flex-wrap">
                            <span className={`font-medium ${rx.authorized ? "text-green-600" : "text-red-500"}`}>
                              {rx.authorized ? "✓ Authorized" : "✗ Not authorized"}
                            </span>
                            {rx.margin_type && <span className="text-[#6B6B6B]">Margin: {rx.margin_type}</span>}
                            {rx.occlusion && <span className="text-[#6B6B6B]">Occlusion: {rx.occlusion}</span>}
                            {rx.guard_type && <span className="text-[#6B6B6B]">Guard: {rx.guard_type}</span>}
                          </div>
                          {rx.notes && <p className="text-xs text-[#9B9B9B]">Notes: {rx.notes}</p>}
                        </div>
                      </div>
                    )}

                    {/* STL */}
                    {order.stl_file_path && (
                      <div>
                        <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">STL file</p>
                        <button onClick={() => downloadStl(order.stl_file_path!)}
                          className="h-9 px-4 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#2563EB] font-medium hover:border-[#2563EB] transition-all">
                          Download STL
                        </button>
                      </div>
                    )}

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