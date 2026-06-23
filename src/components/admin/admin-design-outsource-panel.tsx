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
  DESIGN_OUTSOURCE_CATEGORY_LABELS,
  orderQualifiesForDesignOutsourceFromOrder,
  outsourceFileSummary,
  resolveOrderProductCategory,
  type DesignOutsourceFields,
} from "@/lib/design-outsource";
import {
  downloadDesignDeliverable,
  parseDesignDeliverables,
  type DesignDeliverable,
} from "@/lib/design-deliverables";

type Props = {
  orderId: string;
  productCategory: string | null;
  order: {
    case_files: unknown;
    stl_file_path: string | null;
    product_name: string;
  };
  outsource: DesignOutsourceFields;
  designDeliverables?: unknown;
  defaultPartnerEmail?: string;
  defaultPartnerName?: string;
  onSent: (fields: Partial<DesignOutsourceFields>) => void;
  className?: string;
};

export function AdminDesignOutsourcePanel({
  orderId,
  productCategory,
  order,
  outsource,
  designDeliverables,
  defaultPartnerEmail = "",
  defaultPartnerName = "JD",
  onSent,
  className,
}: Props) {
  const resolvedCategory = resolveOrderProductCategory(productCategory, order.product_name);
  const qualifies = orderQualifiesForDesignOutsourceFromOrder({
    productCategory,
    product_name: order.product_name,
  });
  const files = useMemo(() => collectOrderCaseFiles(order), [order]);
  const deliverables = useMemo(() => parseDesignDeliverables(designDeliverables), [designDeliverables]);
  const showDeliverables =
    deliverables.length > 0 ||
    outsource.design_outsource_status === "sent" ||
    outsource.design_outsource_status === "completed";

  const [partnerEmail, setPartnerEmail] = useState(
    outsource.design_outsource_email || defaultPartnerEmail
  );
  const [notes, setNotes] = useState(outsource.design_outsource_notes || "");
  const [sendEmail, setSendEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [successNote, setSuccessNote] = useState("");
  const [error, setError] = useState("");
  const [markingDone, setMarkingDone] = useState(false);

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
      !window.confirm(
        `This case was already assigned to ${defaultPartnerName}. Assign again${sendEmail ? " (with a new email)" : ""}?`
      )
    ) {
      return;
    }

    setError("");
    setSuccessNote("");
    setSending(true);
    try {
      const res = await fetch("/api/admin/design-outsource", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          partnerEmail: partnerEmail.trim(),
          notes: notes.trim(),
          sendEmail,
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
      setSuccessNote(
        data.partnerLinked
          ? `Case added to /partner for ${data.partnerEmail}.`
          : `Case added to /partner. No login linked to ${data.partnerEmail} — set profiles.role to design_partner on that account.`
      );
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
            {defaultPartnerName} design outsource
          </h2>
          <p className="text-[12px] text-[var(--pd-slate)] mt-0.5">
            Assign scans &amp; Rx to {defaultPartnerName} for CAD design via the partner portal
          </p>
        </div>
        <AdminDesignOutsourceStatusBadge
          status={outsource.design_outsource_status}
          partnerName={defaultPartnerName}
        />
      </div>

      <div className="p-4 space-y-4">
        {!qualifies ? (
          <p className="text-[13px] text-[var(--pd-slate)] border border-[var(--pd-border)] bg-[var(--pd-surface)] px-3 py-2.5 leading-relaxed">
            JD outsource is for denture cases (complete, partial, immediate, overdenture, reline).
            {order.product_name ? (
              <>
                {" "}
                This order: <span className="font-medium text-[var(--pd-navy)]">{order.product_name}</span>
                {resolvedCategory ? ` (${DESIGN_OUTSOURCE_CATEGORY_LABELS[resolvedCategory] ?? resolvedCategory})` : ""}.
              </>
            ) : (
              " No product category detected."
            )}
          </p>
        ) : (
          <>
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
            Partner account email
          </label>
          <input
            type="email"
            value={partnerEmail}
            onChange={(e) => setPartnerEmail(e.target.value)}
            placeholder={`${defaultPartnerName.toLowerCase()}@partner.com`}
            className={`${ORDER_INPUT_CLASS} h-9 text-[13px]`}
          />
          <p className="text-[11px] text-[var(--pd-muted)] mt-1.5">
            Must match the email on the {defaultPartnerName} portal login (
            <span className="font-mono text-[10px]">design_partner</span> role).
          </p>
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

        {successNote && (
          <p className="text-[13px] text-[var(--pd-teal-dark)] border border-[#9FE1CB] bg-[#E1F5EE] px-3 py-2 leading-relaxed">
            {successNote}
          </p>
        )}

        {error && (
          <p className="text-[13px] text-red-600 border border-red-200 bg-red-50 px-3 py-2 leading-relaxed">
            {error}
          </p>
        )}

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="mt-0.5 w-4 h-4 shrink-0 cursor-pointer"
          />
          <span className="text-[13px] text-[var(--pd-slate)] leading-relaxed">
            Also send email notification with 72-hour download links and case summary (English + Korean)
          </span>
        </label>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            disabled={sending || files.length === 0}
            onClick={() => void handleSend()}
            className={`${ORDER_BTN_PRIMARY} flex-1 h-9 text-[13px]`}
          >
            {sending
              ? "Assigning…"
              : outsource.design_outsource_status === "sent"
                ? `Reassign to ${defaultPartnerName}`
                : `Assign to ${defaultPartnerName}`}
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
          <strong className="font-medium text-[var(--pd-slate)]">Assign</strong> adds the case to{" "}
          <span className="font-mono text-[10px]">/partner</span> for {defaultPartnerName} (
          {outsourceFileSummary(files) || "case files"}). Partner email must match their login.
          {sendEmail
            ? " Email will include signed download links."
            : " No email — partner works in the portal only."}
        </p>
          </>
        )}

        {showDeliverables && (
          <AdminDesignDeliverablesList
            orderId={orderId}
            deliverables={deliverables}
            partnerName={defaultPartnerName}
            status={outsource.design_outsource_status}
          />
        )}
      </div>
    </div>
  );
}

function AdminDesignDeliverablesList({
  deliverables,
  partnerName,
  status,
}: {
  orderId: string;
  deliverables: DesignDeliverable[];
  partnerName: string;
  status: DesignOutsourceFields["design_outsource_status"];
}) {
  return (
    <div className="border-t border-[var(--pd-border)] pt-4 space-y-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--pd-muted)]">
          {partnerName} design files
        </p>
        <p className="text-[12px] text-[var(--pd-slate)] mt-0.5">
          Uploaded via partner portal
          {status === "completed" ? " · case marked complete" : ""}
        </p>
      </div>

      {deliverables.length === 0 ? (
        <p className="text-[13px] text-[var(--pd-muted)] border border-dashed border-[var(--pd-border)] px-3 py-2.5">
          No design files yet — waiting for {partnerName} to upload via the portal.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--pd-border)] border border-[var(--pd-border)]">
          {deliverables.map((file) => (
            <li key={file.path} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[var(--pd-navy)] truncate">{file.fileName}</p>
                <p className="text-[11px] text-[var(--pd-muted)]">
                  {new Date(file.uploadedAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void downloadDesignDeliverable(file.path)}
                className="text-[13px] font-medium text-[var(--pd-teal-dark)] hover:underline shrink-0"
              >
                Download
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminDesignOutsourceStatusBadge({
  status,
  partnerName = "JD",
}: {
  status: DesignOutsourceFields["design_outsource_status"];
  partnerName?: string;
}) {
  if (status === "completed") {
    return (
      <span className="text-[11px] font-medium px-2 py-0.5 border bg-[#E1F5EE] text-[var(--pd-teal-dark)] border-[#9FE1CB]">
        {partnerName} design received
      </span>
    );
  }
  if (status === "sent") {
    return (
      <span className="text-[11px] font-medium px-2 py-0.5 border bg-amber-50 text-amber-800 border-amber-200">
        Sent to {partnerName}
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
