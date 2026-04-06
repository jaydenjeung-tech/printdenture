// app/admin/customers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  created_at: string;
};

type Order = {
  id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  due_date: string | null;
  is_remake: boolean;
  remake_reason: string | null;
  shade: string | null;
  tooth_numbers: number[] | null;
  tooth_number: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  received:  { label: "Received",    color: "bg-blue-50 text-blue-600 border-blue-200",      dot: "bg-blue-500" },
  printing:  { label: "In Progress", color: "bg-amber-50 text-amber-600 border-amber-200",   dot: "bg-amber-500" },
  qc:        { label: "QC Check",    color: "bg-purple-50 text-purple-600 border-purple-200", dot: "bg-purple-500" },
  shipped:   { label: "Shipped",     color: "bg-green-50 text-green-600 border-green-200",   dot: "bg-green-500" },
  delivered: { label: "Delivered",   color: "bg-gray-50 text-gray-500 border-gray-200",      dot: "bg-gray-400" },
};

const REMAKE_REASONS: Record<string, string> = {
  shade: "Shade Mismatch",
  fit: "Fit Issue",
  fracture: "Fracture",
  design: "Design Change",
  other: "Other",
};

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAndLoad(); }, [customerId]);

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

    const { data: profileData } = await supabase
      .from("profiles").select("*").eq("id", customerId).single();
    if (!profileData) { router.push("/admin/customers"); return; }
    setProfile(profileData);

    const { data: ordersData } = await supabase
      .from("orders").select("*").eq("user_id", customerId)
      .order("created_at", { ascending: false });
    setOrders(ordersData || []);

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <p className="text-sm text-[#9B9B9B]">Loading...</p>
      </div>
    );
  }

  if (!profile) return null;

  // Stats
  const nonRemakeOrders = orders.filter(o => !o.is_remake);
  const remakeOrders = orders.filter(o => o.is_remake);
  const paidOrders = orders.filter(o => o.paid_at && !o.is_remake);
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_price, 0);
  const remakeRate = nonRemakeOrders.length > 0
    ? Math.round((remakeOrders.length / nonRemakeOrders.length) * 100) : 0;
  const pendingOrders = orders.filter(o => !["shipped", "delivered"].includes(o.status)).length;

  // Remake breakdown by reason
  const remakeByReason = remakeOrders.reduce((acc, o) => {
    const reason = o.remake_reason || "other";
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/admin/customers" className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            Customers
          </Link>
          <span className="text-[#C8C6BE]">/</span>
          <span className="text-[#1A1A1A]">{profile.practice_name || "—"}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">{profile.practice_name || "—"}</h1>
            {profile.dentist_name && (
              <p className="text-sm text-[#6B6B6B] mt-1">Dr. {profile.dentist_name}</p>
            )}
            <p className="text-xs text-[#9B9B9B] mt-1">
              Customer since {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total orders",  value: nonRemakeOrders.length, color: "text-[#1A1A1A]" },
            { label: "Total revenue", value: `$${totalRevenue.toLocaleString()}`, color: "text-[#1A1A1A]" },
            { label: "Remake rate",   value: `${remakeRate}%`, color: remakeRate >= 20 ? "text-red-500" : remakeRate >= 10 ? "text-amber-600" : "text-green-600" },
            { label: "Pending",       value: pendingOrders, color: pendingOrders > 0 ? "text-amber-600" : "text-[#1A1A1A]" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E2E0D8] p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[#9B9B9B] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* ── Left (2/3) — Orders ── */}
          <div className="col-span-2 space-y-4">

            <div className="bg-white rounded-2xl border border-[#E2E0D8] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E0D8] flex items-center justify-between">
                <h2 className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider">Order History</h2>
                <span className="text-xs text-[#9B9B9B]">{orders.length} total</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F0EEE8] bg-[#F8F7F4]">
                    {["Order", "Product", "Status", "Amount", "Date"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => {
                    const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.received;
                    const teeth = order.tooth_numbers?.length
                      ? order.tooth_numbers.sort((a, b) => a - b).map(n => `#${n}`).join(", ")
                      : order.tooth_number ? `#${order.tooth_number}` : null;

                    return (
                      <tr key={order.id}
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className={`border-b border-[#F0EEE8] cursor-pointer hover:bg-[#FAFAF8] transition-colors ${idx === orders.length - 1 ? "border-b-0" : ""}`}>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-[#9B9B9B] bg-[#F0EEE8] px-1.5 py-0.5 rounded">
                            #{order.id.slice(0, 6).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#1A1A1A]">{order.product_name}</p>
                          <p className="text-xs text-[#9B9B9B] mt-0.5">
                            {order.shade && `${order.shade}`}{teeth && ` · ${teeth}`}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${status.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                              {status.label}
                            </span>
                            {order.is_remake && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full border font-medium bg-red-50 text-red-500 border-red-200">
                                Remake
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${order.is_remake ? "text-red-400" : "text-[#1A1A1A]"}`}>
                            {order.is_remake ? "—" : `$${order.total_price}`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-[#9B9B9B]">
                            {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-[#9B9B9B] text-sm">
                        No orders yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Right (1/3) ── */}
          <div className="space-y-4">

            {/* Practice info */}
            <div className="bg-white rounded-2xl border border-[#E2E0D8] p-5">
              <h2 className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider mb-4">Practice Info</h2>
              <div className="space-y-2.5 text-sm">
                {[
                  { label: "Practice", value: profile.practice_name },
                  { label: "Doctor",   value: profile.dentist_name ? `Dr. ${profile.dentist_name}` : null },
                  { label: "License",  value: profile.license_no ? `#${profile.license_no} · ${profile.license_state}` : null },
                  { label: "Phone",    value: profile.phone },
                  { label: "Address",  value: [profile.address, profile.city, profile.state, profile.zip].filter(Boolean).join(", ") || null },
                ].filter(item => item.value).map(item => (
                  <div key={item.label} className="flex justify-between gap-3">
                    <span className="text-[#9B9B9B] flex-shrink-0">{item.label}</span>
                    <span className="text-[#1A1A1A] text-right text-xs">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Remake breakdown */}
            {remakeOrders.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E2E0D8] p-5">
                <h2 className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider mb-4">
                  Remake Breakdown
                </h2>
                <div className="space-y-2">
                  {Object.entries(remakeByReason).map(([reason, count]) => (
                    <div key={reason} className="flex items-center justify-between">
                      <span className="text-sm text-[#6B6B6B]">{REMAKE_REASONS[reason] || reason}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-[#F0EEE8] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-red-400"
                            style={{ width: `${(count / remakeOrders.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-[#1A1A1A] w-4 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-[#F0EEE8] flex justify-between text-xs">
                  <span className="text-[#9B9B9B]">Total remakes</span>
                  <span className="font-semibold text-red-500">{remakeOrders.length} ({remakeRate}%)</span>
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-[#E2E0D8] p-5">
              <h2 className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wider mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link href={`/admin/orders?practice=${customerId}`}
                  className="flex items-center justify-between w-full h-9 px-3 rounded-lg border border-[#E2E0D8] text-sm text-[#1A1A1A] hover:border-[#1A1A1A] transition-all">
                  <span>View all orders</span>
                  <span className="text-[#9B9B9B]">→</span>
                </Link>
                {profile.phone && (
                  <a href={`tel:${profile.phone}`}
                    className="flex items-center justify-between w-full h-9 px-3 rounded-lg border border-[#E2E0D8] text-sm text-[#1A1A1A] hover:border-[#1A1A1A] transition-all">
                    <span>Call practice</span>
                    <span className="text-[#9B9B9B] text-xs">{profile.phone}</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}