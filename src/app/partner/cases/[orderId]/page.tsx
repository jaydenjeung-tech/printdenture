"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { verifyPartnerAccess } from "@/lib/partner-auth";
import {
  PartnerCaseDetailView,
  PartnerPageHeader,
  type PartnerCaseDetail,
} from "@/components/partner/partner-case-ui";
import { ORDER_BTN_BACK } from "@/components/marketing/order-ui";

export default function PartnerCasePage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  const [detail, setDetail] = useState<PartnerCaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  async function loadDetail() {
    const res = await fetch(`/api/partner/cases/${orderId}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load case");
      setDetail(null);
      return;
    }
    setDetail(data.case);
    setError("");
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const access = await verifyPartnerAccess();
      if (cancelled) return;
      if (!access.ok) {
        router.push(access.reason === "unauthenticated" ? `/auth?next=/partner/cases/${orderId}` : "/dashboard");
        return;
      }
      await loadDetail();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, router]);

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`/api/partner/cases/${orderId}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }
      await loadDetail();
    } catch {
      setError("Network error — try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleComplete() {
    if (!window.confirm("Submit your design files and mark this case complete?")) return;
    setCompleting(true);
    setError("");
    try {
      const res = await fetch(`/api/partner/cases/${orderId}/complete`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not mark complete");
        return;
      }
      await loadDetail();
    } catch {
      setError("Network error — try again.");
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return <p className="text-[14px] text-[var(--pd-muted)]">Loading case…</p>;
  }

  if (!detail) {
    return (
      <>
        <PartnerPageHeader title="Case not found" />
        <p className="text-[14px] text-red-600 mb-4">{error || "This case is not available."}</p>
        <Link href="/partner" className={`${ORDER_BTN_BACK} h-9 px-4 text-[13px] inline-flex`}>
          Back to queue
        </Link>
      </>
    );
  }

  return (
    <>
      <PartnerPageHeader title="Case detail" subtitle={detail.productName} />
      <PartnerCaseDetailView
        detail={detail}
        uploading={uploading}
        completing={completing}
        error={error}
        onUpload={(file) => void handleUpload(file)}
        onComplete={() => void handleComplete()}
      />
    </>
  );
}
