"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase";

type Order = {
  id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  status: string;
  tracking_number: string | null;
  created_at: string;
  shade: string | null;
  tooth_number: string | null;
};

type Profile = {
  first_name: string;
  last_name: string;
  practice_name: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  received:  { label: "Received",  color: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]" },
  printing:  { label: "Printing",  color: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]" },
  qc:        { label: "QC",        color: "bg-[#FDF4FF] text-[#9333EA] border-[#E9D5FF]" },
  shipped:   { label: "Shipped",   color: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]" },
  delivered: { label: "Delivered", color: "bg-[#F1EFF8] text-[#6B6B6B] border-[#E2E0D8]" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

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

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
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
      {/* Navbar */}
      <div className="h-14 border-b border-[#E2E0D8] bg-white flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#1A1A1A] rounded-sm flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">PC</span>
          </div>
          <span className="font-semibold text-[#1A1A1A]">
            Print<span className="text-[#2563EB]">Crown</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#6B6B6B] hidden sm:block">
            {profile?.practice_name || "My Practice"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-sm text-[#6B6B6B]"
          >
            Sign out
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">
              {profile ? `Hi, Dr. ${profile.last_name}` : "My cases"}
            </h1>
            <p className="text-sm text-[#6B6B6B] mt-0.5">
              {orders.length} total case{orders.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/order">
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-9 px-5 rounded-lg text-sm">
              + New order
            </Button>
          </Link>
        </div>

        {/* Orders list */}
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
            {orders.map((order) => {
              const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.received;
              const date = new Date(order.created_at).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              });
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-[#E2E0D8] p-5 hover:border-[#C8C6BE] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-[#1A1A1A]">{order.product_name}</p>
                        <Badge className={`text-xs border ${status.color}`}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-[#9B9B9B]">Qty: {order.quantity}</span>
                        {order.shade && (
                          <span className="text-xs text-[#9B9B9B]">Shade: {order.shade}</span>
                        )}
                        {order.tooth_number && (
                          <span className="text-xs text-[#9B9B9B]">Tooth #{order.tooth_number}</span>
                        )}
                        <span className="text-xs text-[#9B9B9B]">{date}</span>
                      </div>
                      {order.tracking_number && (
                        <p className="text-xs text-[#2563EB] mt-1">
                          Tracking: {order.tracking_number}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1A1A1A]">${order.total_price}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}