"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Navbar from "@/components/navbar";

const STATUS_STEPS = ["received", "printing", "qc", "shipped", "delivered"];

const STATUS_CONFIG: Record<string, { label: string; color: string; next: string | null }> = {
  received:  { label: "Received",  color: "bg-blue-50 text-blue-600 border-blue-200",       next: "printing" },
  printing:  { label: "Printing",  color: "bg-amber-50 text-amber-600 border-amber-200",    next: "qc" },
  qc:        { label: "QC Check",  color: "bg-purple-50 text-purple-600 border-purple-200", next: "shipped" },
  shipped:   { label: "Shipped",   color: "bg-green-50 text-green-600 border-green-200",    next: "delivered" },
  delivered: { label: "Delivered", color: "bg-gray-50 text-gray-500 border-gray-200",       next: null },
};

type ScanResult = {
  id: string;
  caseId: string;
  productName: string;
  oldStatus: string;
  newStatus: string | null;
  practiceName: string;
  timestamp: Date;
  success: boolean;
  message: string;
};

export default function ScanPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanValue, setScanValue] = useState("");
  const [processing, setProcessing] = useState(false);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => { checkAdmin(); }, []);

  useEffect(() => {
    if (authorized) inputRef.current?.focus();
  }, [authorized, history]);

  async function checkAdmin() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_admin")
      .eq("id", user.id)
      .single();

    const isAllowed = profile?.role === "admin" || profile?.role === "lab" || profile?.is_admin;
    if (!isAllowed) { router.push("/dashboard"); return; }
    setAuthorized(true);
  }

  async function handleScan(rawValue: string) {
    const value = rawValue.trim();
    if (!value || processing) return;

    setProcessing(true);
    setScanValue("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase.from("orders").select(`
      id, product_name, status, user_id,
      profiles!orders_user_id_fkey(practice_name)
    `);

    if (value.length === 36) {
      query = query.eq("id", value);
    } else {
      query = query.ilike("id", `${value.toLowerCase()}%`);
    }

    const { data: orders } = await query.limit(1);
    const order = orders?.[0] as any;

    if (!order) {
      setHistory(prev => [{
        id: value,
        caseId: value.slice(0, 6).toUpperCase(),
        productName: "—",
        oldStatus: "—",
        newStatus: null,
        practiceName: "—",
        timestamp: new Date(),
        success: false,
        message: "Case not found",
      }, ...prev.slice(0, 19)]);
      setProcessing(false);
      return;
    }

    const currentStatus = order.status;
    const nextStatus = STATUS_CONFIG[currentStatus]?.next;

    if (!nextStatus) {
      setHistory(prev => [{
        id: order.id,
        caseId: order.id.slice(0, 6).toUpperCase(),
        productName: order.product_name,
        oldStatus: currentStatus,
        newStatus: null,
        practiceName: order.profiles?.practice_name || "—",
        timestamp: new Date(),
        success: false,
        message: "Already delivered — no further steps",
      }, ...prev.slice(0, 19)]);
      setProcessing(false);
      return;
    }

    await supabase.from("orders").update({ status: nextStatus }).eq("id", order.id);
    await supabase.from("order_status_history").insert({
      order_id: order.id,
      changed_by: user?.id,
      from_status: currentStatus,
      to_status: nextStatus,
    });

    setHistory(prev => [{
      id: order.id,
      caseId: order.id.slice(0, 6).toUpperCase(),
      productName: order.product_name,
      oldStatus: currentStatus,
      newStatus: nextStatus,
      practiceName: order.profiles?.practice_name || "—",
      timestamp: new Date(),
      success: true,
      message: `${STATUS_CONFIG[currentStatus]?.label} → ${STATUS_CONFIG[nextStatus]?.label}`,
    }, ...prev.slice(0, 19)]);

    setProcessing(false);
    inputRef.current?.focus();
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <p className="text-sm text-[#9B9B9B]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 pt-24 pb-10">

        {/* Scanner input */}
        <div className="bg-white rounded-2xl border border-[#E2E0D8] p-8 mb-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            processing ? "bg-amber-50" : "bg-[#F0FDF4]"
          }`}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={processing ? "#D97706" : "#16A34A"} strokeWidth="2">
              <path d="M3 5v14M7 5v14M11 5v14M15 5v7M19 5v7M15 16h4M17 14v4"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-1">
            {processing ? "Processing..." : "Ready to scan"}
          </h2>
          <p className="text-sm text-[#9B9B9B] mb-6">
            Point scanner at barcode on Work Order. Case will automatically advance to next step.
          </p>
          <input
            ref={inputRef}
            type="text"
            value={scanValue}
            onChange={(e) => setScanValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleScan(scanValue); }}
            placeholder="Scan barcode or type case ID..."
            className="w-full h-12 px-4 rounded-xl border-2 border-[#E2E0D8] bg-white text-[#1A1A1A] text-center text-lg focus:outline-none focus:border-[#2563EB] placeholder:text-[#C8C6BE]"
            autoFocus
            disabled={processing}
          />
          <p className="text-xs text-[#9B9B9B] mt-2">Press Enter or scan to process</p>
        </div>

        {/* Pipeline reference */}
        <div className="bg-white rounded-2xl border border-[#E2E0D8] p-5 mb-6">
          <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-3">Pipeline</p>
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_STEPS.map((step, idx) => (
              <div key={step} className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_CONFIG[step].color}`}>
                  {STATUS_CONFIG[step].label}
                </span>
                {idx < STATUS_STEPS.length - 1 && (
                  <span className="text-[#C8C6BE] text-xs">→</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-[#9B9B9B] mt-2">Each scan advances the case to the next step</p>
        </div>

        {/* Scan history */}
        {history.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-3">
              Scan history ({history.length})
            </p>
            <div className="space-y-2">
              {history.map((result, idx) => (
                <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border ${
                  result.success ? "bg-white border-[#E2E0D8]" : "bg-red-50 border-red-200"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      result.success ? "bg-[#F0FDF4]" : "bg-red-100"
                    }`}>
                      <span className={`text-sm font-bold ${result.success ? "text-green-600" : "text-red-500"}`}>
                        {result.success ? "✓" : "✗"}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#9B9B9B] bg-[#F8F7F4] px-1.5 py-0.5 rounded">
                          #{result.caseId}
                        </span>
                        <span className="text-sm font-medium text-[#1A1A1A]">{result.productName}</span>
                      </div>
                      <p className={`text-xs mt-0.5 ${result.success ? "text-[#6B6B6B]" : "text-red-500"}`}>
                        {result.message}
                      </p>
                      <p className="text-xs text-[#9B9B9B]">{result.practiceName}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#9B9B9B] flex-shrink-0">
                    {result.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}