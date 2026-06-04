"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  first_name: string | null;
  last_name: string | null;
  practice_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
};

export default function RxPrintPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [rx, setRx] = useState<Rx | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [orderId]);

  async function load() {
    const supabase = createAppClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    if (!profileData?.is_admin) { router.push("/dashboard"); return; }

    const [{ data: orderData }, { data: rxData }] = await Promise.all([
      supabase.from("orders").select("*").eq("id", orderId).single(),
      supabase.from("rx").select("*").eq("order_id", orderId).single(),
    ]);

    if (orderData) {
      setOrder(orderData);
      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name, practice_name, address, city, state, zip, phone")
        .eq("id", orderData.user_id)
        .single();
      if (profileData) setProfile(profileData);
    }

    if (rxData) setRx(rxData);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400">Order not found.</p>
      </div>
    );
  }

  const date = new Date(order.created_at).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const teeth = order.tooth_numbers?.length
    ? order.tooth_numbers.sort((a, b) => a - b).map(n => `#${n}`).join(", ")
    : order.tooth_number ? `#${order.tooth_number}` : "—";

  const caseId = order.id.slice(0, 6).toUpperCase();

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          .print-page { padding: 32px !important; }
        }
        @page {
          margin: 0;
          size: letter;
        }
      `}</style>

      {/* Print button — hidden on print */}
      <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
        <button
          onClick={() => router.back()}
          className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={() => window.print()}
          className="h-9 px-4 rounded-lg bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#2A2A2A]"
        >
          Print Rx
        </button>
      </div>

      {/* Printable Rx */}
      <div className="print-page max-w-2xl mx-auto p-10 min-h-screen bg-white">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-5 border-b-2 border-black">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">PC</span>
              </div>
              <span className="font-bold text-lg tracking-tight">PrintDenture</span>
            </div>
            <p className="text-xs text-gray-500">Dental Lab Prescription</p>
            <p className="text-xs text-gray-500">printdenture.com</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold font-mono">#{caseId}</p>
            <p className="text-xs text-gray-500 mt-1">{date}</p>
            <p className="text-xs text-gray-500">Status: {order.status.toUpperCase()}</p>
          </div>
        </div>

        {/* Practice info */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">From</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-bold text-base">{profile?.practice_name || "—"}</p>
            {rx && (
              <p className="text-sm text-gray-700 mt-0.5">
                Dr. {rx.dentist_name} &nbsp;·&nbsp; License #{rx.dentist_license_no} ({rx.license_state})
              </p>
            )}
            {profile?.address && (
              <p className="text-sm text-gray-500 mt-1">
                {profile.address}, {profile.city}, {profile.state} {profile.zip}
              </p>
            )}
            {profile?.phone && (
              <p className="text-sm text-gray-500">{profile.phone}</p>
            )}
          </div>
        </div>

        {/* Restoration details */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Restoration</p>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-500 w-40">Product</td>
                  <td className="px-4 py-3 font-bold">{order.product_name}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-500">Quantity</td>
                  <td className="px-4 py-3">{order.quantity} unit{order.quantity > 1 ? "s" : ""}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-500">Tooth #</td>
                  <td className="px-4 py-3 font-bold">{teeth}</td>
                </tr>
                {(order.shade || rx?.shade) && (
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-500">Shade</td>
                    <td className="px-4 py-3 font-bold">{order.shade || rx?.shade}</td>
                  </tr>
                )}
                {rx?.margin_type && (
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-500">Margin</td>
                    <td className="px-4 py-3">{rx.margin_type}</td>
                  </tr>
                )}
                {rx?.occlusion && (
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-500">Occlusion</td>
                    <td className="px-4 py-3">{rx.occlusion}</td>
                  </tr>
                )}
                {rx?.guard_type && (
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-500">Guard type</td>
                    <td className="px-4 py-3">{rx.guard_type}</td>
                  </tr>
                )}
                {rx?.color && (
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-500">Color</td>
                    <td className="px-4 py-3">{rx.color}</td>
                  </tr>
                )}
                {order.stl_file_path && (
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-500">STL file</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-400">{order.stl_file_path.split("/").pop()}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {(order.notes || rx?.notes) && (
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Notes</p>
            <div className="border border-gray-200 rounded-lg p-4 min-h-16">
              <p className="text-sm text-gray-700">{order.notes || rx?.notes}</p>
            </div>
          </div>
        )}

        {/* Authorization */}
        {rx && (
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Authorization</p>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  rx.authorized ? "bg-black border-black" : "border-gray-400"
                }`}>
                  {rx.authorized && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    I, Dr. {rx.dentist_name}, License #{rx.dentist_license_no} ({rx.license_state}),
                    hereby authorize the fabrication of the dental restoration described above.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Electronic signature under E-SIGN Act · {rx.authorized_at ? new Date(rx.authorized_at).toLocaleDateString("en-US") : date}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lab use section */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Lab use only</p>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Technician</p>
                <div className="border-b border-gray-300 h-6"></div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Date completed</p>
                <div className="border-b border-gray-300 h-6"></div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">QC initials</p>
                <div className="border-b border-gray-300 h-6"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-400">
          <span>PrintDenture · printdenture.com</span>
          <span>Case #{caseId} · {date}</span>
        </div>

      </div>
    </>
  );
}