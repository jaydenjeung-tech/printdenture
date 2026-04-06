// app/admin/customers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import Navbar from "@/components/navbar";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  practice_name: string | null;
  phone: string | null;
  dentist_name: string | null;
  license_no: string | null;
  license_state: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
};

type CustomerStats = {
  profile: Profile;
  totalOrders: number;
  totalRevenue: number;
  remakeCount: number;
  remakeRate: number;
  lastOrderDate: string | null;
  daysSinceLastOrder: number | null;
  pendingOrders: number;
};

type SortKey = "practice_name" | "totalOrders" | "totalRevenue" | "remakeRate" | "lastOrderDate";
type SortDir = "asc" | "desc";

function StatusBadge({ days }: { days: number | null }) {
  if (days === null) return (
    <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-[#F8F7F4] text-[#9B9B9B] border-[#E2E0D8]">
      No orders
    </span>
  );
  if (days > 60) return (
    <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-red-50 text-red-500 border-red-200">
      Dormant {days}d
    </span>
  );
  if (days > 30) return (
    <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-amber-50 text-amber-600 border-amber-200">
      Inactive {days}d
    </span>
  );
  return (
    <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-green-50 text-green-600 border-green-200">
      Active
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

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "dormant" | "high_remake">("all");
  const [sortKey, setSortKey] = useState<SortKey>("lastOrderDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => { checkAndLoad(); }, []);

  async function checkAndLoad() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }
    const { data: prof } = await supabase.from("profiles").select("role, is_admin").eq("id", user.id).single();
    if (prof?.role !== "admin" && !prof?.is_admin) { router.push("/dashboard"); return; }
    await loadData();
  }

  async function loadData() {
    const supabase = createClient();

   // 변경 — practice_name이 있는 계정만 (실제 치과 유저)
    const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .not("practice_name", "is", null)
    .order("created_at", { ascending: false });

    if (!profiles) { setLoading(false); return; }

    // 모든 주문
    const { data: orders } = await supabase
      .from("orders")
      .select("id, user_id, total_price, status, created_at, paid_at, is_remake, remake_of");

    const now = new Date();

    const stats: CustomerStats[] = profiles.map(profile => {
      const userOrders = orders?.filter(o => o.user_id === profile.id) || [];
      const paidOrders = userOrders.filter(o => o.paid_at && !o.is_remake);
      const remakeOrders = userOrders.filter(o => o.is_remake);
      const nonRemakeOrders = userOrders.filter(o => !o.is_remake);

      const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_price, 0);
      const remakeRate = nonRemakeOrders.length > 0
        ? Math.round((remakeOrders.length / nonRemakeOrders.length) * 100)
        : 0;

      const sortedOrders = [...userOrders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const lastOrderDate = sortedOrders[0]?.created_at || null;
      const daysSinceLastOrder = lastOrderDate
        ? Math.floor((now.getTime() - new Date(lastOrderDate).getTime()) / 86400000)
        : null;

      const pendingOrders = userOrders.filter(
        o => !["shipped", "delivered"].includes(o.status)
      ).length;

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

    setCustomers(stats);
    setLoading(false);
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  const filtered = customers
    .filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        (c.profile.practice_name || "").toLowerCase().includes(q) ||
        (c.profile.dentist_name || "").toLowerCase().includes(q) ||
        (c.profile.city || "").toLowerCase().includes(q);

      const days = c.daysSinceLastOrder;
      const matchFilter =
        filter === "all" ? true :
        filter === "active" ? (days !== null && days <= 30) :
        filter === "inactive" ? (days !== null && days > 30 && days <= 60) :
        filter === "dormant" ? (days !== null && days > 60) :
        filter === "high_remake" ? c.remakeRate >= 20 :
        true;

      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      let valA: string | number = 0, valB: string | number = 0;
      if (sortKey === "practice_name") { valA = a.profile.practice_name || ""; valB = b.profile.practice_name || ""; }
      else if (sortKey === "totalOrders") { valA = a.totalOrders; valB = b.totalOrders; }
      else if (sortKey === "totalRevenue") { valA = a.totalRevenue; valB = b.totalRevenue; }
      else if (sortKey === "remakeRate") { valA = a.remakeRate; valB = b.remakeRate; }
      else if (sortKey === "lastOrderDate") {
        valA = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
        valB = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
      }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  // Summary stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.daysSinceLastOrder !== null && c.daysSinceLastOrder <= 30).length;
  const dormantCustomers = customers.filter(c => c.daysSinceLastOrder !== null && c.daysSinceLastOrder > 60).length;
  const highRemakeCustomers = customers.filter(c => c.remakeRate >= 20).length;

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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Customers</h1>
          <p className="text-sm text-[#9B9B9B] mt-1">{totalCustomers} practices</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total practices", value: totalCustomers, color: "text-[#1A1A1A]", filter: "all" },
            { label: "Active (30d)",    value: activeCustomers,  color: "text-green-600", filter: "active" },
            { label: "Dormant (60d+)",  value: dormantCustomers, color: "text-red-500",   filter: "dormant" },
            { label: "High remake rate", value: highRemakeCustomers, color: "text-amber-600", filter: "high_remake" },
          ].map(s => (
            <button key={s.label}
              onClick={() => setFilter(filter === s.filter as any ? "all" : s.filter as any)}
              className={`bg-white rounded-xl border p-4 text-center transition-all hover:border-[#1A1A1A] ${
                filter === s.filter ? "border-[#1A1A1A] ring-1 ring-[#1A1A1A]" : "border-[#E2E0D8]"
              }`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[#9B9B9B] mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Search & filters */}
        <div className="flex gap-2 mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C8C6BE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search practice, doctor, city..."
              className="h-9 pl-8 pr-3 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE] w-64"
            />
          </div>
          <div className="ml-auto text-xs text-[#9B9B9B] flex items-center">
            {filtered.length} practices
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E2E0D8] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E0D8] bg-[#F8F7F4]">
                {[
                  { key: "practice_name", label: "Practice" },
                  { key: null,            label: "Location" },
                  { key: "totalOrders",   label: "Orders" },
                  { key: "totalRevenue",  label: "Revenue" },
                  { key: "remakeRate",    label: "Remake rate" },
                  { key: "lastOrderDate", label: "Last order" },
                  { key: null,            label: "Status" },
                  { key: null,            label: "" },
                ].map((col, i) => (
                  <th key={i}
                    className={`text-left px-4 py-3 text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider ${col.key ? "cursor-pointer hover:text-[#1A1A1A] select-none" : ""}`}
                    onClick={() => col.key && handleSort(col.key as SortKey)}>
                    {col.label}
                    {col.key && <SortIcon active={sortKey === col.key} dir={sortDir} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr key={c.profile.id}
                  onClick={() => router.push(`/admin/customers/${c.profile.id}`)}
                  className={`border-b border-[#F0EEE8] cursor-pointer hover:bg-[#FAFAF8] transition-colors ${idx === filtered.length - 1 ? "border-b-0" : ""}`}>

                  {/* Practice */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1A1A1A]">{c.profile.practice_name || "—"}</p>
                    {c.profile.dentist_name && (
                      <p className="text-xs text-[#9B9B9B] mt-0.5">Dr. {c.profile.dentist_name}</p>
                    )}
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3">
                    <p className="text-sm text-[#6B6B6B]">
                      {[c.profile.city, c.profile.state].filter(Boolean).join(", ") || "—"}
                    </p>
                  </td>

                  {/* Orders */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1A1A1A]">{c.totalOrders}</p>
                    {c.pendingOrders > 0 && (
                      <p className="text-xs text-amber-600 mt-0.5">{c.pendingOrders} pending</p>
                    )}
                  </td>

                  {/* Revenue */}
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#1A1A1A]">${c.totalRevenue.toLocaleString()}</p>
                  </td>

                  {/* Remake rate */}
                  <td className="px-4 py-3">
                    {c.remakeCount > 0 ? (
                      <div>
                        <p className={`font-medium ${c.remakeRate >= 20 ? "text-red-500" : c.remakeRate >= 10 ? "text-amber-600" : "text-[#1A1A1A]"}`}>
                          {c.remakeRate}%
                        </p>
                        <p className="text-xs text-[#9B9B9B] mt-0.5">{c.remakeCount} remakes</p>
                      </div>
                    ) : (
                      <p className="text-sm text-[#C8C6BE]">—</p>
                    )}
                  </td>

                  {/* Last order */}
                  <td className="px-4 py-3">
                    {c.lastOrderDate ? (
                      <p className="text-sm text-[#6B6B6B]">
                        {new Date(c.lastOrderDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    ) : (
                      <p className="text-sm text-[#C8C6BE]">—</p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge days={c.daysSinceLastOrder} />
                  </td>

                  {/* Arrow */}
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs text-[#C8C6BE]">→</span>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <p className="text-[#9B9B9B] text-sm">No customers found.</p>
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