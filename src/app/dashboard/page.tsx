"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase";
import Navbar from "@/components/navbar";
import { useSearchParams } from "next/navigation";

type Order = {
  id: string;
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
  stripe_session_id: string | null;
  paid_at: string | null;
  due_date: string | null;
};

type Profile = {
  first_name: string;
  last_name: string;
  practice_name: string;
};

const STATUS_STEPS = ["received", "printing", "qc", "shipped", "delivered"];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  received:  { label: "Received",    color: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]" },
  printing:  { label: "In Progress", color: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]" },
  qc:        { label: "QC Check",    color: "bg-[#FDF4FF] text-[#9333EA] border-[#E9D5FF]" },
  shipped:   { label: "Shipped",     color: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]" },
  delivered: { label: "Delivered",   color: "bg-[#F1EFF8] text-[#6B6B6B] border-[#E2E0D8]" },
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
      Est. delivery {formatted} · {label}
    </span>
  );
}

function StatusProgress({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-3">
      {STATUS_STEPS.map((step, idx) => (
        <div key={step} className="flex items-center gap-1 flex-1">
          <div className={`h-1.5 flex-1 rounded-full transition-all ${
            idx <= currentIdx ? "bg-[#2563EB]" : "bg-[#E2E0D8]"
          }`} />
        </div>
      ))}
    </div>
  );
}

function OrderCard({ order, onReorder }: { order: Order; onReorder: (order: Order) => void }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.received;
  const date = new Date(order.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  const teeth = order.tooth_numbers?.length
    ? order.tooth_numbers.sort((a, b) => a - b).map(n => `#${n}`).join(", ")
    : order.tooth_number ? `#${order.tooth_number}` : null;
  const upsUrl = `https://www.ups.com/track?tracknum=${order.tracking_number}`;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E0D8] overflow-hidden hover:border-[#C8C6BE] transition-colors">
      <button className="w-full text-left p-5" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <p className="font-semibold text-[#1A1A1A]">{order.product_name}</p>
              <Badge className={`text-xs border ${status.color}`}>{status.label}</Badge>
              {order.paid_at && (
                <Badge className="text-xs border bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]">Paid</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-[#9B9B9B]">Qty: {order.quantity}</span>
              {order.shade && <span className="text-xs text-[#9B9B9B]">Shade: {order.shade}</span>}
              {teeth && <span className="text-xs text-[#9B9B9B]">Tooth {teeth}</span>}
              <span className="text-xs text-[#9B9B9B]">{date}</span>
            </div>
            <DueDateChip dueDate={order.due_date} />
            <StatusProgress status={order.status} />
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-[#1A1A1A]">${order.total_price}</p>
            <p className="text-xs text-[#9B9B9B] mt-0.5">{expanded ? "▲" : "▼"}</p>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#E2E0D8] px-5 py-4 bg-[#F8F7F4] space-y-3">
          {order.tracking_number && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#6B6B6B] w-24">Tracking</span>
              <a href={upsUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#2563EB] hover:underline font-medium">
                {order.tracking_number}
              </a>
            </div>
          )}
          {order.notes && (
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-[#6B6B6B] w-24">Notes</span>
              <span className="text-xs text-[#4B4B4B]">{order.notes}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#6B6B6B] w-24">Order ID</span>
            <span className="text-xs text-[#9B9B9B] font-mono">{order.id.slice(0, 8)}...</span>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => onReorder(order)}
              className="h-8 px-4 rounded-lg text-xs font-medium border border-[#E2E0D8] text-[#6B6B6B] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-all bg-white">
              Reorder
            </button>
            {order.status === "shipped" && order.tracking_number && (
              <a href={upsUrl} target="_blank" rel="noopener noreferrer"
                className="h-8 px-4 rounded-lg text-xs font-medium bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] transition-all flex items-center">
                Track package
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 결제 완료 후 order 업데이트
  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (!orderId) return;

    async function completeOrder() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await fetch("/api/order-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, userId: user.id }),
      });

      router.replace("/dashboard");
    }

    completeOrder();
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }

      const [{ data: profileData }, { data: ordersData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);

      if (profileData) setProfile(profileData);
      if (ordersData) setOrders(ordersData);
      setLoading(false);
    }
    load();
  }, [router]);

  function handleReorder(order: Order) {
    router.push(`/order?reorder=${order.id}`);
  }

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
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">
              {profile ? `Hi, Dr. ${profile.last_name}` : "My cases"}
            </h1>
            <p className="text-sm text-[#6B6B6B] mt-0.5">
              {orders.length} total case{orders.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {orders.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Total orders", value: orders.length },
              { label: "In progress", value: orders.filter(o => ["received","printing","qc"].includes(o.status)).length },
              { label: "Shipped", value: orders.filter(o => ["shipped","delivered"].includes(o.status)).length },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-[#E2E0D8] p-4 text-center">
                <p className="text-2xl font-bold text-[#1A1A1A]">{stat.value}</p>
                <p className="text-xs text-[#9B9B9B] mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E2E0D8]">
            <p className="text-4xl mb-4">📦</p>
            <p className="font-semibold text-[#1A1A1A] mb-1">No cases yet</p>
            <p className="text-sm text-[#9B9B9B] mb-6">Place your first order to get started.</p>
            <Link href="/order">
              <Button className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-lg">
                Start first order
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onReorder={handleReorder} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <p className="text-sm text-[#9B9B9B]">Loading...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}