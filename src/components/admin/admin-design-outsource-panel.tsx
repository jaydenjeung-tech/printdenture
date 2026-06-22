"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ORDER_BTN_PRIMARY,
  ORDER_INPUT_CLASS,
} from "@/components/marketing/order-ui";
import {
  CASE_FILE_KIND_META,
  type StoredCaseFile,
} from "@/lib/products/case-files";
import {
  collectOrderCaseFiles,
  type DesignOutsourceFields,
  outsourceFileSummary,
} from "@/lib/design-outsource";

type Props = {
  orderId: string;
  productCategory: string | null;
  order: {
    case_files: unknown;
    stl_file_path: string | null;
    product_name: string;
  };
  outsource: DesignOutsourceFields;
  defaultPartnerEmail?: string;
  onSent: (fields: Partial<DesignOutsourceFields>) => void;
  className?: string;
};

export function AdminDesignOutsourcePanel({
  orderId,
  productCategory,
  order,
  outsource,
  defaultPartnerEmail = "",
  onSent,
  className,
}: Props) {
  const qualifies = productCategory === "complete" || productCategory === "jb_tray";
  const files = useMemo(() => collectOrderCaseFiles(order), [order]);

  const [partnerEmail, setPartnerEmail] = useState(
    outsource.design_outsource_email || defaultPartnerEmail
  );
  const [notes, setNotes] = useState(outsource.design_outsource_notes || "");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [markingDone, setMarkingDone] = useState(false);

  if (!qualifies) return null;

  async function handleSend(force = false) {
    if (!partnerEmail.trim()) {
      setError("Enter the design partner email.");
      return;
    }
    if (files.length === 0) {
      setError("No scan or case files to send.");
      return;
    }
    if (
      !force &&
      outsource.design_outsource_status === "sent" &&
      !window.confirm("This case was already sent to a design partner. Send again with fresh download links?")
    ) {
      return;
    }

    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/admin/design-outsource", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          partnerEmail: partnerEmail.trim(),
          notes: notes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send");
        return;
      }
      onSent({
        design_outsource_status: "sent",
        design_outsource_sent_at: data.sentAt,
        design_outsource_email: data.partnerEmail,
        design_outsource_notes: notes.trim() || null,
      });
    } catch {
      setError("Network error — try again.");
    } finally {
      setSending(false);
    }
  }

  async function markCompleted() {
    setMarkingDone(true);
    setError("");
    try {
      const res = await fetch("/api/admin/design-outsource", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: "completed" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update");
        return;
      }
      onSent({ design_outsource_status: "completed" });
    } catch {
      setError("Network error — try again.");
    } finally {
      setMarkingDone(false);
    }
  }

  return (
    <div className={cn("border border-[var(--pd-border)] bg-white", className)}>
      <div className="px-4 py-3 border-b border-[var(--pd-border)] bg-[var(--pd-surface)] flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)]">
            Design outsource
          </h2>
          <p className="text-[12px] text-[var(--pd-slate)] mt-0.5">Send practice scans to external CAD partner</p>
        </div>
        <OutsourceStatusBadge status={outsource.design_outsource_status} />
      </div>

      <div className="p-4 space-y-4">
        <FilePreviewList files={files} />

        {outsource.design_outsource_sent_at && (
          <p className="text-[12px] text-[var(--pd-muted)]">
            Last sent{" "}
            {new Date(outsource.design_outsource_sent_at).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
            {outsource.design_outsource_email ? ` → ${outsource.design_outsource_email}` : ""}
          </p>
        )}

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--pd-muted)] mb-1.5">
            Partner email
          </label>
          <input
            type="email"
            value={partnerEmail}
            onChange={(e) => setPartnerEmail(e.target.value)}
            placeholder="design@partner.com"
            className={`${ORDER_INPUT_CLASS} h-9 text-[13px]`}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--pd-muted)] mb-1.5">
            Instructions (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Arch selection, occlusal scheme, reference denture notes…"
            className={`${ORDER_INPUT_CLASS} text-[13px] py-2 resize-y min-h-[72px]`}
          />
        </div>

        {error && <p className="text-[13px] text-red-600">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            disabled={sending || files.length === 0}
            onClick={() => void handleSend()}
            className={`${ORDER_BTN_PRIMARY} flex-1 h-9 text-[13px]`}
          >
            {sending
              ? "Sending…"
              : outsource.design_outsource_status === "sent"
                ? "Resend scan package"
                : "Send to design partner"}
          </button>
          {outsource.design_outsource_status === "sent" && (
            <button
              type="button"
              disabled={markingDone}
              onClick={() => void markCompleted()}
              className="h-9 px-4 text-[13px] border border-[var(--pd-border)] bg-white text-[var(--pd-navy)] hover:bg-[var(--pd-surface)] transition-colors"
            >
              {markingDone ? "…" : "Mark design received"}
            </button>
          )}
        </div>

        <p className="text-[11px] text-[var(--pd-muted)] leading-relaxed">
          Email includes signed download links (72h) for {outsourceFileSummary(files) || "case files"} plus case and Rx
          summary.
        </p>
      </div>
    </div>
  );
}

function OutsourceStatusBadge({ status }: { status: DesignOutsourceFields["design_outsource_status"] }) {
  if (status === "completed") {
    return (
      <span className="text-[11px] font-medium px-2 py-0.5 border bg-[#E1F5EE] text-[var(--pd-teal-dark)] border-[#9FE1CB]">
        Design received
      </span>
    );
  }
  if (status === "sent") {
    return (
      <span className="text-[11px] font-medium px-2 py-0.5 border bg-amber-50 text-amber-800 border-amber-200">
        Sent to partner
      </span>
    );
  }
  return (
    <span className="text-[11px] font-medium px-2 py-0.5 border bg-[var(--pd-surface)] text-[var(--pd-muted)] border-[var(--pd-border)]">
      Not sent
    </span>
  );
}

function FilePreviewList({ files }: { files: StoredCaseFile[] }) {
  if (files.length === 0) {
    return (
      <p className="text-[13px] text-amber-700 border border-amber-200 bg-amber-50 px-3 py-2">
        No case files uploaded yet — cannot outsource until scans are attached.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--pd-border)] border border-[var(--pd-border)]">
      {files.map((file) => (
        <li key={file.path} className="flex items-center justify-between gap-3 px-3 py-2 text-[13px]">
          <div className="min-w-0">
            <p className="font-medium text-[var(--pd-navy)] truncate">{file.fileName}</p>
            <p className="text-[11px] text-[var(--pd-muted)]">{CASE_FILE_KIND_META[file.kind].label}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
