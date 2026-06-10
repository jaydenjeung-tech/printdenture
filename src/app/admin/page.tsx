"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createAppClient, getClientUser } from "@/lib/supabase";

type Order = {
  id: string;
  user_id: string;
  product_name: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  shade: string | null;
  tooth_number: string | null;
  notes: string | null;
  stl_file_path: string | null;
  tracking_number: string | null;
  carrier: string | null;
  created_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    practice_name: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  };
};

const STATUSES = ["received", "printing", "qc", "shipped", "delivered"];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  received:  { label: "Received",  color: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]" },
  printing:  { label: "Printing",  color: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]" },
  qc:        { label: "QC",        color: "bg-[#FDF4FF] text-[#9333EA] border-[#E9D5FF]" },
  shipped:   { label: "Shipped",   color: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]" },
  delivered: { label: "Delivered", color: "bg-[#F1EFF8] text-[#6B6B6B] border-[#E2E0D8]" },
};

const ADMIN_EMAIL = "jayden@idocdentallab.com"; // 본인 이메일로 변경

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [carrierInput, setCarrierInput] = useState("UPS");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createAppClient();
      const { user } = await getClientUser(supabase);

      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/");
        return;
      }

      const { data } = await supabase
        .from("orders")
        .select(`*, profiles(first_name, last_name, practice_name, phone, address, city, state, zip)`)
        .order("created_at", { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    }
    load();
  }, [router]);

  async function updateStatus(orderId: string, status: string) {
    setUpdating(true);
    const supabase = createAppClient();
    await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", orderId);
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    if (selectedOrder?.id === orderId) setSelectedOrder((prev) => prev ? { ...prev, status } : prev);
    setUpdating(false);
  }

  async function updateTracking(orderId: string) {
    if (!trackingInput) return;
    setUpdating(true);
    const supabase = createAppClient();
    await supabase.from("orders").update({
      tracking_number: trackingInput,
      carrier: carrierInput,
      status: "shipped",
      updated_at: new Date().toISOString(),
    }).eq("id", orderId);
    setOrders((prev) => prev.map((o) =>
      o.id === orderId ? { ...o, tracking_number: trackingInput, carrier: carrierInput, status: "shipped" } : o
    ));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, tracking_number: trackingInput, carrier: carrierInput, status: "shipped" } : prev);
    }
    setTrackingInput("");
    setUpdating(false);
  }

  async function downloadSTL(filePath: string, orderId: string) {
    const supabase = createAppClient();
    const { data } = await supabase.storage.from("stl-files").createSignedUrl(filePath, 60);
    if (data?.signedUrl) {
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = `${orderId}.stl`;
      a.click();
    }
  }

  const filtered = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);

  const stats = {
    total: orders.length,
    received: orders.filter((o) => o.status === "received").length,
    printing: orders.filter((o) => o.status === "printing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    revenue: orders.reduce((sum, o) => sum + o.total_price, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <p className="text-sm text-[#9B9B9B]">Loading...</p>
      </div>
    );
  }

  return (
    <>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Overview</h1>
          <p className="text-sm text-[#9B9B9B] mt-1">Recent orders and revenue</p>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total orders", value: stats.total },
            { label: "New", value: stats.received },
            { label: "Printing", value: stats.printing },
            { label: "Shipped", value: stats.shipped },
            { label: "Revenue", value: `$${stats.revenue.toLocaleString()}` },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E2E0D8] p-4">
              <p className="text-xs text-[#9B9B9B] mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-[#1A1A1A]">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Order list */}
          <div className="flex-1">
            {/* Filter tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {["all", ...STATUSES].map((s) => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 h-8 rounded-lg text-xs font-medium border transition-all capitalize
                    ${filterStatus === s ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#6B6B6B] border-[#E2E0D8] hover:border-[#1A1A1A]"}`}>
                  {s === "all" ? `All (${orders.length})` : `${STATUS_CONFIG[s].label} (${orders.filter(o => o.status === s).length})`}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-[#E2E0D8]">
                  <p className="text-sm text-[#9B9B9B]">No orders</p>
                </div>
              ) : (
                filtered.map((order) => {
                  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.received;
                  const date = new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <div key={order.id}
                      onClick={() => { setSelectedOrder(order); setTrackingInput(order.tracking_number || ""); }}
                      className={`bg-white rounded-xl border p-4 cursor-pointer transition-all
                        ${isSelected ? "border-[#1A1A1A] shadow-sm" : "border-[#E2E0D8] hover:border-[#C8C6BE]"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-[#1A1A1A] text-sm">{order.product_name}</p>
                            <Badge className={`text-xs border ${status.color}`}>{status.label}</Badge>
                          </div>
                          <p className="text-xs text-[#9B9B9B]">
                            {order.profiles?.practice_name || "—"} · {date}
                          </p>
                          {order.shade && (
                            <p className="text-xs text-[#9B9B9B]">Shade {order.shade} · Tooth #{order.tooth_number}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#1A1A1A] text-sm">${order.total_price}</p>
                          <p className="text-xs text-[#9B9B9B]">×{order.quantity}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Detail panel */}
          {selectedOrder ? (
            <div className="w-80 shrink-0">
              <div className="bg-white rounded-xl border border-[#E2E0D8] p-5 sticky top-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-[#1A1A1A]">{selectedOrder.product_name}</p>
                    <p className="text-xs text-[#9B9B9B] mt-0.5">
                      {new Date(selectedOrder.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <Badge className={`text-xs border ${STATUS_CONFIG[selectedOrder.status]?.color}`}>
                    {STATUS_CONFIG[selectedOrder.status]?.label}
                  </Badge>
                </div>

                {/* Practice info */}
                {selectedOrder.profiles && (
                  <div className="mb-4 p-3 bg-[#F8F7F4] rounded-lg">
                    <p className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wide mb-2">Practice</p>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      Dr. {selectedOrder.profiles.first_name} {selectedOrder.profiles.last_name}
                    </p>
                    <p className="text-xs text-[#6B6B6B]">{selectedOrder.profiles.practice_name}</p>
                    {selectedOrder.profiles.phone && (
                      <p className="text-xs text-[#6B6B6B]">{selectedOrder.profiles.phone}</p>
                    )}
                    {selectedOrder.profiles.address && (
                      <p className="text-xs text-[#6B6B6B] mt-1">
                        {selectedOrder.profiles.address}, {selectedOrder.profiles.city}, {selectedOrder.profiles.state} {selectedOrder.profiles.zip}
                      </p>
                    )}
                  </div>
                )}

                {/* Case details */}
                <div className="mb-4 p-3 bg-[#F8F7F4] rounded-lg">
                  <p className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wide mb-2">Case details</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#9B9B9B]">Qty</span>
                      <span className="text-[#1A1A1A]">{selectedOrder.quantity}</span>
                    </div>
                    {selectedOrder.shade && (
                      <div className="flex justify-between text-xs">
                        <span className="text-[#9B9B9B]">Shade</span>
                        <span className="text-[#1A1A1A]">{selectedOrder.shade}</span>
                      </div>
                    )}
                    {selectedOrder.tooth_number && (
                      <div className="flex justify-between text-xs">
                        <span className="text-[#9B9B9B]">Tooth</span>
                        <span className="text-[#1A1A1A]">#{selectedOrder.tooth_number}</span>
                      </div>
                    )}
                    {selectedOrder.notes && (
                      <div className="flex justify-between text-xs">
                        <span className="text-[#9B9B9B]">Notes</span>
                        <span className="text-[#1A1A1A] text-right max-w-[140px]">{selectedOrder.notes}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-medium pt-1 border-t border-[#E2E0D8]">
                      <span className="text-[#9B9B9B]">Total</span>
                      <span className="text-[#1A1A1A]">${selectedOrder.total_price}</span>
                    </div>
                  </div>
                </div>

                {/* STL download */}
                {selectedOrder.stl_file_path && (
                  <Button variant="outline" size="sm"
                    className="w-full mb-4 border-[#E2E0D8] text-[#1A1A1A] text-xs h-9"
                    onClick={() => downloadSTL(selectedOrder.stl_file_path!, selectedOrder.id)}>
                    Download STL file
                  </Button>
                )}

                {/* Status update */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wide mb-2">Update status</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {STATUSES.map((s) => (
                      <button key={s} onClick={() => updateStatus(selectedOrder.id, s)}
                        disabled={updating || selectedOrder.status === s}
                        className={`h-8 rounded-lg text-xs font-medium border transition-all capitalize
                          ${selectedOrder.status === s
                            ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                            : "bg-white text-[#6B6B6B] border-[#E2E0D8] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"}`}>
                        {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tracking */}
                <div>
                  <p className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wide mb-2">Tracking</p>
                  {selectedOrder.tracking_number && (
                    <p className="text-xs text-[#2563EB] mb-2">
                      {selectedOrder.carrier}: {selectedOrder.tracking_number}
                    </p>
                  )}
                  <div className="flex gap-2 mb-2">
                    {["UPS", "USPS"].map((c) => (
                      <button key={c} onClick={() => setCarrierInput(c)}
                        className={`flex-1 h-7 rounded text-xs border transition-all
                          ${carrierInput === c ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#6B6B6B] border-[#E2E0D8]"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                  <input type="text" value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="Tracking number"
                    className="w-full h-9 px-3 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] text-xs focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE] mb-2" />
                  <Button size="sm" className="w-full h-9 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs"
                    disabled={!trackingInput || updating}
                    onClick={() => updateTracking(selectedOrder.id)}>
                    Save & mark shipped
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-80 shrink-0">
              <div className="bg-white rounded-xl border border-[#E2E0D8] p-8 text-center">
                <p className="text-sm text-[#9B9B9B]">Select an order to view details</p>
              </div>
            </div>
          )}
        </div>
    </>
  );
}