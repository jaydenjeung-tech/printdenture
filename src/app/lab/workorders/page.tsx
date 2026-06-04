"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createAppClient } from "@/lib/supabase";

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
  tooth_numbers: number[] | null;
  notes: string | null;
  stl_file_path: string | null;
  created_at: string;
  due_date: string | null;
};

type Rx = {
  order_id: string;
  shade: string | null;
  margin_type: string | null;
  occlusion: string | null;
  guard_type: string | null;
  arch: string | null;
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
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
};

function Barcode({ value }: { value: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (ref.current && typeof window !== "undefined") {
      import("jsbarcode").then((JsBarcode) => {
        JsBarcode.default(ref.current, value, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 12,
          margin: 4,
          background: "transparent",
        });
      });
    }
  }, [value]);
  return <svg ref={ref} />;
}

function WorkOrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];

  const [orders, setOrders] = useState<Order[]>([]);
  const [rxMap, setRxMap] = useState<Record<string, Rx>>({});
  const [profileMap, setProfileMap] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { router.push("/lab"); return; }
    load();
  }, []);

  async function load() {
    const supabase = createAppClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { data: adminProfile } = await supabase
      .from("profiles").select("is_admin").eq("id", user.id).single();
    if (!adminProfile?.is_admin) { router.push("/dashboard"); return; }

    const { data: ordersData } = await supabase
      .from("orders").select("*").in("id", ids);

    if (!ordersData) { setLoading(false); return; }
    ordersData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    setOrders(ordersData);

    const userIds = [...new Set(ordersData.map(o => o.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, practice_name, address, city, state, zip, phone")
      .in("id", userIds);

    const pMap: Record<string, Profile> = {};
    profiles?.forEach(p => { pMap[p.id] = p; });
    setProfileMap(pMap);

    const { data: rxData } = await supabase.from("rx").select("*").in("order_id", ids);
    const rMap: Record<string, Rx> = {};
    rxData?.forEach(rx => { rMap[rx.order_id] = rx; });
    setRxMap(rMap);

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading work orders...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-after: always; }
          body { margin: 0; background: white; }
        }
        @page { margin: 0; size: letter; }
      `}</style>

      <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
        <button onClick={() => router.back()}
          className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50">
          Back
        </button>
        <button onClick={() => window.print()}
          className="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#2A2A2A]">
          Print {orders.length} Work Order{orders.length > 1 ? "s" : ""}
        </button>
      </div>

      <div className="no-print max-w-2xl mx-auto pt-16 pb-4 px-10">
        <p className="text-sm text-gray-500">{orders.length} work order{orders.length > 1 ? "s" : ""} ready to print</p>
      </div>

      {orders.map((order, idx) => {
        const rx = rxMap[order.id];
        const profile = profileMap[order.user_id];
        const isLast = idx === orders.length - 1;
        const date = new Date(order.created_at).toLocaleDateString("en-US", {
          month: "long", day: "numeric", year: "numeric",
        });
        const dueDate = order.due_date
          ? new Date(order.due_date).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            })
          : null;
        const teeth = order.tooth_numbers?.length
          ? order.tooth_numbers.sort((a, b) => a - b).map(n => `#${n}`).join(", ")
          : order.tooth_number ? `#${order.tooth_number}` : "—";
        const caseId = order.id.slice(0, 6).toUpperCase();

        return (
          <div key={order.id} className={`max-w-2xl mx-auto px-10 py-8 bg-white ${!isLast ? "page-break" : ""}`}>

            {/* Header */}
            <div className="flex items-start justify-between mb-5 pb-4 border-b-2 border-black">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">PC</span>
                  </div>
                  <span className="font-bold text-lg tracking-tight">PrintDenture</span>
                </div>
                <p className="text-xs text-gray-500">Work Order · Dental Lab Rx</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold font-mono">#{caseId}</p>
                <p className="text-xs text-gray-500 mt-0.5">{date}</p>
                {dueDate && (
                  <p className="text-xs font-bold text-red-600 mt-0.5">Due: {dueDate}</p>
                )}
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-0.5">
                  {order.status}
                </p>
              </div>
            </div>

            {/* Barcode */}
            <div className="flex justify-center mb-5">
              <Barcode value={order.id} />
            </div>

            {/* Practice */}
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Practice</p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-bold">{profile?.practice_name || "—"}</p>
                {rx && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    Dr. {rx.dentist_name} · License #{rx.dentist_license_no} ({rx.license_state})
                  </p>
                )}
                {profile?.address && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {profile.address}, {profile.city}, {profile.state} {profile.zip}
                  </p>
                )}
                {profile?.phone && <p className="text-xs text-gray-400">{profile.phone}</p>}
              </div>
            </div>

            {/* Restoration */}
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Restoration</p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-500 w-36">Product</td>
                      <td className="px-3 py-2 font-bold">{order.product_name}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="px-3 py-2 font-medium text-gray-500">Quantity</td>
                      <td className="px-3 py-2">{order.quantity} unit{order.quantity > 1 ? "s" : ""}</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-500">Tooth #</td>
                      <td className="px-3 py-2 font-bold text-base">{teeth}</td>
                    </tr>
                    {(order.shade || rx?.shade) && (
                      <tr className="border-b border-gray-100">
                        <td className="px-3 py-2 font-medium text-gray-500">Shade</td>
                        <td className="px-3 py-2 font-bold">{order.shade || rx?.shade}</td>
                      </tr>
                    )}
                    {rx?.margin_type && (
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-500">Margin</td>
                        <td className="px-3 py-2">{rx.margin_type}</td>
                      </tr>
                    )}
                    {rx?.occlusion && (
                      <tr className="border-b border-gray-100">
                        <td className="px-3 py-2 font-medium text-gray-500">Occlusion</td>
                        <td className="px-3 py-2">{rx.occlusion}</td>
                      </tr>
                    )}
                    {rx?.guard_type && (
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-500">Guard type</td>
                        <td className="px-3 py-2">{rx.guard_type}</td>
                      </tr>
                    )}
                    {rx?.arch && (
                      <tr className="border-b border-gray-100">
                        <td className="px-3 py-2 font-medium text-gray-500">Arch</td>
                        <td className="px-3 py-2 font-bold capitalize">{rx.arch}</td>
                      </tr>
                    )}
                    {rx?.color && (
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-500">Color</td>
                        <td className="px-3 py-2">{rx.color}</td>
                      </tr>
                    )}
                    {order.stl_file_path && (
                      <tr>
                        <td className="px-3 py-2 font-medium text-gray-500">STL file</td>
                        <td className="px-3 py-2 text-xs font-mono text-gray-400">
                          {order.stl_file_path.split("/").pop()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Notes</p>
              <div className="border border-gray-200 rounded-lg p-3 min-h-12">
                <p className="text-sm text-gray-700">{order.notes || rx?.notes || ""}</p>
              </div>
            </div>

            {/* Authorization */}
            {rx && (
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Authorization</p>
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      rx.authorized ? "bg-black border-black" : "border-gray-400"
                    }`}>
                      {rx.authorized && <span className="text-white text-[9px] font-bold">✓</span>}
                    </div>
                    <div>
                      <p className="text-xs">
                        I, Dr. {rx.dentist_name}, License #{rx.dentist_license_no} ({rx.license_state}),
                        hereby authorize the fabrication of the dental restoration described above.
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        E-SIGN Act · {rx.authorized_at ? new Date(rx.authorized_at).toLocaleDateString("en-US") : date}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lab use */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Lab use only</p>
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-gray-400 mb-1">Technician</p>
                    <div className="border-b border-gray-300 h-5"></div>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Date completed</p>
                    <div className="border-b border-gray-300 h-5"></div>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">QC initials</p>
                    <div className="border-b border-gray-300 h-5"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 pt-3 border-t border-gray-200 flex justify-between text-[10px] text-gray-400">
              <span>PrintDenture · printdenture.com</span>
              <span>Case #{caseId} · {idx + 1} of {orders.length}</span>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default function WorkOrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    }>
      <WorkOrdersContent />
    </Suspense>
  );
}