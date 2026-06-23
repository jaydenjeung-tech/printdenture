"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyPartnerAccess } from "@/lib/partner-auth";
import {
  PartnerCaseList,
  PartnerPageHeader,
  type PartnerCaseSummary,
} from "@/components/partner/partner-case-ui";

export default function PartnerPage() {
  const router = useRouter();
  const [cases, setCases] = useState<PartnerCaseSummary[]>([]);
  const [partnerName, setPartnerName] = useState("JD");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const access = await verifyPartnerAccess();
      if (cancelled) return;
      if (!access.ok) {
        router.push(access.reason === "unauthenticated" ? "/auth?next=/partner" : "/dashboard");
        return;
      }

      const res = await fetch("/api/partner/cases");
      const data = await res.json();
      if (!cancelled) {
        if (res.ok) {
          setCases(data.cases ?? []);
          if (data.partnerName) setPartnerName(data.partnerName);
          setLoadError("");
        } else {
          setLoadError(data.error || "Could not load cases.");
        }
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <>
      <PartnerPageHeader
        title={`${partnerName} design portal`}
        subtitle="Download practice scans and upload finished CAD designs"
      />
      {loading ? (
        <p className="text-[14px] text-[var(--pd-muted)]">Loading cases…</p>
      ) : loadError ? (
        <div className="border border-red-200 bg-red-50 p-4 text-[14px] text-red-700 leading-relaxed">
          {loadError}
        </div>
      ) : (
        <PartnerCaseList cases={cases} />
      )}
    </>
  );
}
