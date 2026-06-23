"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createAppClient } from "@/lib/supabase";
import Link from "next/link";
import {
  ADMIN_STATUS_CONFIG,
  ADMIN_STATUS_STEPS,
  AdminOrdersLoading,
  AdminStatusBadge,
} from "@/components/admin/admin-orders-ui";
import { ORDER_INPUT_CLASS } from "@/components/marketing/order-ui";
import { formatCaseNumberLabel, parseCaseScanInput } from "@/lib/case-number";

const STATUS_NEXT: Record<string, string | null> = {
  received: "printing",
  printing: "qc",
  qc: "shipped",
  shipped: "delivered",
  delivered: null,
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

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (authorized) inputRef.current?.focus();
  }, [authorized, history]);

  async function checkAdmin() {
    const supabase = createAppClient();
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

    const supabase = createAppClient();
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase.from("orders").select(`
      id, product_name, status, user_id, case_number,
      profiles!orders_user_id_fkey(practice_name)
    `);

    const parsed = parseCaseScanInput(value);
    if (parsed.kind === "uuid") {
      query = query.eq("id", parsed.value);
    } else if (parsed.kind === "case_number") {
      query = query.eq("case_number", parsed.value);
    } else {
      query = query.ilike("id", `${parsed.value}%`);
    }

    const { data: orders } = await query.limit(1);
    const order = orders?.[0] as {
      id: string;
      product_name: string;
      status: string;
      case_number: number | null;
      profiles?: { practice_name: string | null };
    } | undefined;

    if (!order) {
      setHistory((prev) => [
        {
          id: value,
          caseId: formatCaseNumberLabel(null, value),
          productName: "—",
          oldStatus: "—",
          newStatus: null,
          practiceName: "—",
          timestamp: new Date(),
          success: false,
          message: "Case not found",
        },
        ...prev.slice(0, 19),
      ]);
      setProcessing(false);
      return;
    }

    const currentStatus = order.status;
    const nextStatus = STATUS_NEXT[currentStatus] ?? null;

    if (!nextStatus) {
      setHistory((prev) => [
        {
          id: order.id,
          caseId: formatCaseNumberLabel(order.case_number, order.id),
          productName: order.product_name,
          oldStatus: currentStatus,
          newStatus: null,
          practiceName: order.profiles?.practice_name || "—",
          timestamp: new Date(),
          success: false,
          message: "Already delivered — no further steps",
        },
        ...prev.slice(0, 19),
      ]);
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

    setHistory((prev) => [
      {
        id: order.id,
        caseId: formatCaseNumberLabel(order.case_number, order.id),
        productName: order.product_name,
        oldStatus: currentStatus,
        newStatus: nextStatus,
        practiceName: order.profiles?.practice_name || "—",
        timestamp: new Date(),
        success: true,
        message: `${ADMIN_STATUS_CONFIG[currentStatus]?.label ?? currentStatus} → ${ADMIN_STATUS_CONFIG[nextStatus]?.label ?? nextStatus}`,
      },
      ...prev.slice(0, 19),
    ]);

    setProcessing(false);
    inputRef.current?.focus();
  }

  if (!authorized) return <AdminOrdersLoading />;

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)] mb-2">
          Lab workflow
        </p>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.03em]">
          Barcode scan
        </h1>
        <p className="text-[14px] text-[var(--pd-slate)] mt-2">
          Scan a work order barcode to advance the case to the next pipeline step.
        </p>
      </div>

      <div className="border border-[var(--pd-border)] bg-white p-6 sm:p-8 mb-6 text-center">
        <div
          className={`w-14 h-14 flex items-center justify-center mx-auto mb-4 border ${
            processing ? "border-[#FDE68A] bg-[#FFFBEB]" : "border-[#9FE1CB] bg-[#E1F5EE]"
          }`}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke={processing ? "#D97706" : "var(--pd-teal-dark)"}
            strokeWidth="2"
            aria-hidden
          >
            <path d="M3 5v14M7 5v14M11 5v14M15 5v7M19 5v7M15 16h4M17 14v4" />
          </svg>
        </div>
        <h2 className="text-[16px] font-semibold text-[var(--pd-navy)] mb-1">
          {processing ? "Processing…" : "Ready to scan"}
        </h2>
        <p className="text-[13px] text-[var(--pd-muted)] mb-6">
          Point scanner at barcode on work order. Case will automatically advance to the next step.
        </p>
        <input
          ref={inputRef}
          type="text"
          value={scanValue}
          onChange={(e) => setScanValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleScan(scanValue);
          }}
          placeholder="Scan barcode or type case ID…"
          className={`${ORDER_INPUT_CLASS} h-12 w-full text-center text-[16px]`}
          autoFocus
          disabled={processing}
        />
        <p className="text-[11px] text-[var(--pd-muted)] mt-2">Press Enter or scan to process</p>
      </div>

      <div className="border border-[var(--pd-border)] bg-white p-5 mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-3">
          Pipeline
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {ADMIN_STATUS_STEPS.map((step, idx) => (
            <div key={step} className="flex items-center gap-2">
              <AdminStatusBadge status={step} />
              {idx < ADMIN_STATUS_STEPS.length - 1 && (
                <span className="text-[var(--pd-muted)] text-[11px]">→</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-[12px] text-[var(--pd-muted)] mt-3">Each scan advances the case to the next step</p>
      </div>

      {history.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-3">
            Scan history ({history.length})
          </p>
          <div className="space-y-px bg-[var(--pd-border)] border border-[var(--pd-border)]">
            {history.map((result, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-4 gap-3 ${
                  result.success ? "bg-white" : "bg-red-50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 flex items-center justify-center shrink-0 border ${
                      result.success
                        ? "border-[#9FE1CB] bg-[#E1F5EE] text-[var(--pd-teal-dark)]"
                        : "border-red-200 bg-red-100 text-red-600"
                    }`}
                  >
                    <span className="text-[13px] font-bold">{result.success ? "✓" : "✗"}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] text-[var(--pd-muted)] border border-[var(--pd-border)] bg-[var(--pd-surface)] px-2 py-0.5">
                        #{result.caseId}
                      </span>
                      <span className="text-[13px] font-medium text-[var(--pd-navy)] truncate">
                        {result.productName}
                      </span>
                    </div>
                    <p
                      className={`text-[12px] mt-0.5 ${result.success ? "text-[var(--pd-slate)]" : "text-red-600"}`}
                    >
                      {result.message}
                    </p>
                    <p className="text-[11px] text-[var(--pd-muted)]">{result.practiceName}</p>
                  </div>
                </div>
                <span className="text-[11px] text-[var(--pd-muted)] shrink-0">
                  {result.timestamp.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 text-[12px] text-[var(--pd-muted)]">
        <Link href="/lab" className="text-[var(--pd-teal-dark)] hover:underline">
          ← Back to lab queue
        </Link>
      </p>
    </div>
  );
}
