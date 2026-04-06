"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import Navbar from "@/components/navbar";


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

const STATUS_STEPS = ["received", "printing", "qc", "shipped", "delivered"];

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  received:  { label: "Received",    color: "bg-blue-50 text-blue-600 border-blue-200",     dot: "bg-blue-500" },
  printing:  { label: "In Progress", color: "bg-amber-50 text-amber-600 border-amber-200",  dot: "bg-amber-500" },
  qc:        { label: "QC Check",    color: "bg-purple-50 text-purple-600 border-purple-200", dot: "bg-purple-500" },
  shipped:   { label: "Shipped",     color: "bg-green-50 text-green-600 border-green-200",  dot: "bg-green-500" },
  delivered: { label: "Delivered",   color: "bg-gray-50 text-gray-500 border-gray-200",     dot: "bg-gray-400" },
};

function DueDateChip({ dueDate }: { dueDate: string | null }) {
  if (!dueDate) return <span className="text-xs text-[#C8C6BE]">—</span>;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - today.getTime()) / 86400000);
  const formatted = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const label = days < 0 ? `${Math.abs(days)}d late`
    : days === 0 ? "Today"
    : days === 1 ? "Tomorrow"
    : `${days}d`;
  const color = days < 0 ? "text-red-600 bg-red-50 border-red-200"
    : days <= 1 ? "text-orange-600 bg-orange-50 border-orange-200"
    : days <= 3 ? "text-yellow-600 bg-yellow-50 border-yellow-200"
    : "text-[#6B6B6B]";
  return (
    <span className={`text-xs font-medium ${color}`}>
      {formatted} <span className="opacity-60">· {label}</span>
    </span>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`ml-1 text-[10px] transition-opacity ${active ? "opacity-100" : "opacity-30"}`}>
      {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
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

  // Filters & sort
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => { checkAdminAndLoad(); }, []);

  async function checkAdminAndLoad() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }
    const { data: profile } = await supabase.from("profiles").select("role, is_admin").eq("id", user.id).single();
    const isAdmin = profile?.role === "admin" || profile?.is_admin;
    if (!isAdmin) { router.push("/dashboard"); return; }
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

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  // Stats
  const paidOrders = orders.filter(o => o.paid_at && !o.is_remake);
  const now = new Date();
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_price, 0);
  const thisMonthRevenue = paidOrders
    .filter(o => { const d = new Date(o.paid_at!); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
    .reduce((sum, o) => sum + o.total_price, 0);
  const todayRevenue = paidOrders
    .filter(o => new Date(o.paid_at!).toDateString() === now.toDateString())
    .reduce((sum, o) => sum + o.total_price, 0);

  const statusStats = {
    received:   orders.filter(o => o.status === "received").length,
    inProgress: orders.filter(o => ["printing", "qc"].includes(o.status)).length,
    shipped:    orders.filter(o => o.status === "shipped").length,
    delivered:  orders.filter(o => o.status === "delivered").length,
  };

  // Filter + sort
  const filtered = orders
    .filter(o => {
      const profile = profiles[o.user_id];
      const q = search.toLowerCase();
      const matchSearch = !search ||
        o.id.toLowerCase().includes(q) ||
        o.product_name.toLowerCase().includes(q) ||
        (profile?.practice_name || "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      let matchDate = true;
      if (dateFilter !== "all") {
        const created = new Date(o.created_at);
        if (dateFilter === "today") matchDate = created.toDateString() === now.toDateString();
        else if (dateFilter === "week") { const w = new Date(); w.setDate(now.getDate() - 7); matchDate = created >= w; }
        else if (dateFilter === "month") matchDate = created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }
      return matchSearch && matchStatus && matchDate;
    })
    .sort((a, b) => {
      let valA: string | number = 0, valB: string | number = 0;
      if (sortKey === "created_at") { valA = new Date(a.created_at).getTime(); valB = new Date(b.created_at).getTime(); }
      else if (sortKey === "total_price") { valA = a.total_price; valB = b.total_price; }
      else if (sortKey === "due_date") { valA = a.due_date ? new Date(a.due_date).getTime() : 9999999999999; valB = b.due_date ? new Date(b.due_date).getTime() : 9999999999999; }
      else if (sortKey === "status") { valA = a.status; valB = b.status; }
      else if (sortKey === "product_name") { valA = a.product_name; valB = b.product_name; }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const filteredRevenue = filtered.filter(o => o.paid_at && !o.is_remake).reduce((sum, o) => sum + o.total_price, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <p className="text-sm text-[#9B9B9B]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Order Management</h1>
          <p className="text-sm text-[#9B9B9B] mt-1">{orders.length} total orders</p>
        </div>

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

        {/* Status stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "New orders",  value: statusStats.received,   color: "text-[#2563EB]", highlight: statusStats.received > 0, filter: "received" },
            { label: "In progress", value: statusStats.inProgress, color: "text-[#D97706]", highlight: false, filter: "printing" },
            { label: "Shipped",     value: statusStats.shipped,    color: "text-[#16A34A]", highlight: false, filter: "shipped" },
            { label: "Delivered",   value: statusStats.delivered,  color: "text-[#6B6B6B]", highlight: false, filter: "delivered" },
          ].map(s => (
            <button key={s.label}
              onClick={() => setStatusFilter(statusFilter === s.filter ? "all" : s.filter)}
              className={`bg-white rounded-xl border p-4 text-center transition-all hover:border-[#1A1A1A] ${
                statusFilter === s.filter ? "border-[#1A1A1A] ring-1 ring-[#1A1A1A]" : s.highlight ? "border-[#2563EB]" : "border-[#E2E0D8]"
              }`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[#9B9B9B] mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C8C6BE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search ID, practice, product..."
              className="h-9 pl-8 pr-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE] w-64"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]">
            <option value="all">All statuses</option>
            {STATUS_STEPS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s]?.label}</option>)}
          </select>
          <div className="flex gap-1 bg-white border border-[#E2E0D8] rounded-lg p-1">
            {[{ key: "all", label: "All" }, { key: "today", label: "Today" }, { key: "week", label: "This week" }, { key: "month", label: "This month" }].map(d => (
              <button key={d.key} onClick={() => setDateFilter(d.key)}
                className={`px-3 h-7 rounded-md text-xs font-medium transition-all ${dateFilter === d.key ? "bg-[#1A1A1A] text-white" : "text-[#6B6B6B] hover:text-[#1A1A1A]"}`}>
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
          <div className="ml-auto flex items-center gap-2 text-xs text-[#9B9B9B]">
            <span>{filtered.length} orders</span>
            {filtered.length > 0 && <span>· Revenue: <span className="font-semibold text-[#1A1A1A]">${filteredRevenue}</span></span>}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E2E0D8] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E0D8] bg-[#F8F7F4]">
                {[
                  { key: null,           label: "Order",    width: "w-28" },
                  { key: "product_name", label: "Product",  width: "w-44" },
                  { key: null,           label: "Practice", width: "" },
                  { key: "status",       label: "Status",   width: "w-32" },
                  { key: "due_date",     label: "Due",      width: "w-36" },
                  { key: "total_price",  label: "Amount",   width: "w-24" },
                  { key: "created_at",   label: "Date",     width: "w-28" },
                  { key: null,           label: "",         width: "w-8" },
                ].map((col, i) => (
                  <th key={i} className={`text-left px-4 py-3 text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider ${col.width} ${col.key ? "cursor-pointer hover:text-[#1A1A1A] select-none" : ""}`}
                    onClick={() => col.key && handleSort(col.key as SortKey)}>
                    {col.label}
                    {col.key && <SortIcon active={sortKey === col.key} dir={sortDir} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, idx) => {
                const profile = profiles[order.user_id];
                const rx = rxMap[order.id];
                const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.received;
                const isExpanded = expandedId === order.id;
                const date = new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                const teeth = order.tooth_numbers?.length
                  ? order.tooth_numbers.sort((a, b) => a - b).map(n => `#${n}`).join(", ")
                  : order.tooth_number ? `#${order.tooth_number}` : null;

                return (
                  <Fragment key={order.id}>
                    {/* Main row */}
                    <tr
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className={`border-b border-[#F0EEE8] cursor-pointer transition-colors ${isExpanded ? "bg-[#F8F7F4]" : "hover:bg-[#FAFAF8]"} ${idx === filtered.length - 1 && !isExpanded ? "border-b-0" : ""}`}>

                      {/* Order ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-[#9B9B9B] bg-[#F0EEE8] px-2 py-0.5 rounded">
                          #{order.id.slice(0, 6).toUpperCase()}
                        </span>
                      </td>

                      {/* Product */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1A1A1A] truncate max-w-[160px]">{order.product_name}</p>
                        <p className="text-xs text-[#9B9B9B] mt-0.5">
                          Qty {order.quantity}{order.shade ? ` · ${order.shade}` : ""}{teeth ? ` · ${teeth}` : ""}
                        </p>
                      </td>

                      {/* Practice */}
                      <td className="px-4 py-3">
                        <p className="text-[#4B4B4B] font-medium">{profile?.practice_name || "—"}</p>
                        {rx && <p className="text-xs text-[#9B9B9B] mt-0.5">Dr. {rx.dentist_name}</p>}
                      </td>

                     {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${status.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                          {order.paid_at && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full border font-medium bg-green-50 text-green-600 border-green-200">
                              Paid
                            </span>
                          )}
                          {order.is_remake && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full border font-medium bg-red-50 text-red-500 border-red-200 whitespace-nowrap">
                              Remake
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Due date */}
                      <td className="px-4 py-3">
                        <DueDateChip dueDate={order.due_date} />
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3">
                        <span className="font-bold text-[#1A1A1A]">${order.total_price}</span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#9B9B9B]">{date}</span>
                      </td>

                      {/* Expand */}
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs text-[#9B9B9B] transition-transform inline-block ${isExpanded ? "rotate-180" : ""}`}>▼</span>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr key={`${order.id}-detail`} className="border-b border-[#E2E0D8] bg-[#F8F7F4]">
                        <td colSpan={8} className="px-6 py-5">
                          <div className="grid grid-cols-3 gap-6">

                            {/* Status update */}
                            <div>
                              <p className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider mb-2">Update Status</p>
                              <div className="flex flex-wrap gap-1.5">
                                {STATUS_STEPS.map(step => (
                                  <button key={step} onClick={e => { e.stopPropagation(); updateStatus(order.id, step); }}
                                    disabled={saving[order.id]}
                                    className={`h-7 px-2.5 rounded-lg text-xs font-medium border transition-all ${
                                      order.status === step
                                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                                        : "bg-white text-[#6B6B6B] border-[#E2E0D8] hover:border-[#1A1A1A]"
                                    }`}>
                                    {STATUS_CONFIG[step]?.label}
                                  </button>
                                ))}
                              </div>

                              {/* Tracking */}
                              <p className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider mb-2 mt-4">Tracking</p>
                              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                <input type="text" value={trackingInputs[order.id] || ""}
                                  onChange={e => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                                  placeholder="UPS / FedEx number..."
                                  className="flex-1 h-8 px-2.5 rounded-lg border border-[#E2E0D8] bg-white text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]"
                                />
                                <button onClick={e => { e.stopPropagation(); updateTracking(order.id); }}
                                  disabled={saving[`track_${order.id}`]}
                                  className="h-8 px-3 rounded-lg bg-[#16A34A] text-white text-xs font-medium hover:bg-[#15803D] transition-all disabled:opacity-40">
                                  {saving[`track_${order.id}`] ? "..." : "Ship"}
                                </button>
                              </div>
                              {order.tracking_number && (
                                <a href={`https://www.ups.com/track?tracknum=${order.tracking_number}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="text-xs text-[#2563EB] hover:underline mt-1 block"
                                  onClick={e => e.stopPropagation()}>
                                  Track: {order.tracking_number}
                                </a>
                              )}
                            </div>

                            {/* Customer + Payment */}
                            <div>
                              <p className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider mb-2">Customer</p>
                              <div className="bg-white rounded-xl border border-[#E2E0D8] p-3 text-sm space-y-0.5 mb-4">
                                <p className="font-medium text-[#1A1A1A]">{profile?.practice_name || "—"}</p>
                                {rx && <p className="text-xs text-[#6B6B6B]">Dr. {rx.dentist_name} · #{rx.dentist_license_no} ({rx.license_state})</p>}
                                {profile?.phone && <p className="text-xs text-[#9B9B9B]">{profile.phone}</p>}
                                <p className="text-xs font-mono text-[#C8C6BE]">{order.id}</p>
                              </div>

                              <p className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider mb-2">Payment</p>
                              <div className="bg-white rounded-xl border border-[#E2E0D8] p-3">
                                <div className="flex justify-between text-xs text-[#6B6B6B] mb-1">
                                  <span>${order.unit_price} × {order.quantity}</span>
                                  <span className="font-bold text-[#1A1A1A]">${order.total_price}</span>
                                </div>
                                {order.paid_at && (
                                  <p className="text-xs text-[#9B9B9B]">
                                    Paid {new Date(order.paid_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Rx + STL */}
                            <div>
                              {rx && (
                                <>
                                  <p className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider mb-2">Rx</p>
                                  <div className="bg-white rounded-xl border border-[#E2E0D8] p-3 text-xs space-y-1 mb-4">
                                    <span className={`font-medium ${rx.authorized ? "text-green-600" : "text-red-500"}`}>
                                      {rx.authorized ? "✓ Authorized" : "✗ Not authorized"}
                                    </span>
                                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[#6B6B6B] mt-1">
                                      {rx.margin_type && <span>Margin: {rx.margin_type}</span>}
                                      {rx.occlusion && <span>Occlusion: {rx.occlusion}</span>}
                                      {rx.guard_type && <span>Guard: {rx.guard_type}</span>}
                                    </div>
                                    {rx.notes && <p className="text-[#9B9B9B]">Notes: {rx.notes}</p>}
                                  </div>
                                </>
                              )}
                              {order.stl_file_path && (
                                <>
                                  <p className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider mb-2">STL File</p>
                                  <button onClick={e => { e.stopPropagation(); downloadStl(order.stl_file_path!); }}
                                    className="h-8 px-4 rounded-lg border border-[#E2E0D8] bg-white text-xs text-[#2563EB] font-medium hover:border-[#2563EB] transition-all">
                                    ↓ Download STL
                                  </button>
                                </>
                              )}
                              {order.notes && (
                                <>
                                  <p className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider mb-2 mt-4">Notes</p>
                                  <p className="text-xs text-[#6B6B6B] bg-white rounded-xl border border-[#E2E0D8] p-3">{order.notes}</p>
                                </>
                              )}
                            </div>

                          </div>
                        </td>
                      </tr>
                        )}
                  </Fragment>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <p className="text-[#9B9B9B] text-sm">No orders found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}