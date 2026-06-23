"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ORDER_BTN_PRIMARY,
  ORDER_INPUT_CLASS,
} from "@/components/marketing/order-ui";
import { DESIGN_DELIVERABLE_ACCEPT } from "@/lib/design-deliverables";

export type PartnerCaseSummary = {
  id: string;
  caseId: string;
  productName: string;
  quantity: number;
  shade: string | null;
  dueDate: string | null;
  createdAt: string;
  status: "sent" | "completed" | null;
  sentAt: string | null;
  fileCount: number;
  deliverableCount: number;
};

export type PartnerCaseDetail = {
  id: string;
  caseId: string;
  productName: string;
  quantity: number;
  shade: string | null;
  teeth: string | null;
  notes: string | null;
  rxNotes: string | null;
  occlusion: string | null;
  dentistName: string | null;
  practiceName: string | null;
  practiceLocation: string | null;
  dueDate: string | null;
  createdAt: string;
  status: "sent" | "completed" | null;
  instructions: string | null;
  caseFiles: { fileName: string; label: string; url: string }[];
  deliverables: { fileName: string; uploadedAt: string; url: string }[];
};

export function PartnerPageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)] mb-2">
        Design partner
      </p>
      <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.03em]">
        {title}
      </h1>
      {subtitle && <p className="text-[14px] text-[var(--pd-slate)] mt-2">{subtitle}</p>}
    </div>
  );
}

export function PartnerCaseList({ cases }: { cases: PartnerCaseSummary[] }) {
  if (cases.length === 0) {
    return (
      <div className="border border-dashed border-[var(--pd-border)] bg-white p-10 text-center">
        <p className="text-[15px] font-medium text-[var(--pd-navy)] mb-2">No assigned cases</p>
        <p className="text-[14px] text-[var(--pd-muted)]">
          Cases appear here after the lab sends a design request to your account.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[var(--pd-border)] bg-white divide-y divide-[var(--pd-border)]">
      {cases.map((item) => (
        <Link
          key={item.id}
          href={`/partner/cases/${item.id}`}
          className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-[var(--pd-surface)] transition-colors"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[12px] font-mono text-[var(--pd-muted)]">#{item.caseId}</span>
              <PartnerStatusBadge status={item.status} />
            </div>
            <p className="font-semibold text-[var(--pd-navy)]">{item.productName}</p>
            <p className="text-[13px] text-[var(--pd-muted)] mt-1">
              {item.fileCount} input file{item.fileCount === 1 ? "" : "s"}
              {item.deliverableCount > 0
                ? ` · ${item.deliverableCount} design file${item.deliverableCount === 1 ? "" : "s"} uploaded`
                : ""}
            </p>
          </div>
          <div className="text-right shrink-0 text-[12px] text-[var(--pd-muted)]">
            {item.dueDate && (
              <p className="font-medium text-[var(--pd-navy)] mb-1">
                Due{" "}
                {new Date(item.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
            {item.sentAt && (
              <p>
                Sent{" "}
                {new Date(item.sentAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

export function PartnerCaseDetailView({
  detail,
  uploading,
  completing,
  error,
  onUpload,
  onComplete,
}: {
  detail: PartnerCaseDetail;
  uploading: boolean;
  completing: boolean;
  error: string;
  onUpload: (file: File) => void;
  onComplete: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-mono text-[var(--pd-muted)] mb-1">Case #{detail.caseId}</p>
          <h2 className="text-[1.35rem] font-semibold text-[var(--pd-navy)]">{detail.productName}</h2>
          <p className="text-[14px] text-[var(--pd-slate)] mt-1">
            {detail.practiceName || "Practice"}
            {detail.practiceLocation ? ` · ${detail.practiceLocation}` : ""}
          </p>
        </div>
        <PartnerStatusBadge status={detail.status} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <PartnerInfoCard title="Case details">
          <dl className="space-y-2 text-[13px]">
            <Row label="Quantity" value={String(detail.quantity)} />
            {detail.shade && <Row label="Shade" value={detail.shade} />}
            {detail.teeth && <Row label="Arch / teeth" value={detail.teeth} />}
            {detail.occlusion && <Row label="Occlusion" value={detail.occlusion} />}
            {detail.dentistName && <Row label="Doctor" value={`Dr. ${detail.dentistName}`} />}
            {detail.dueDate && (
              <Row
                label="Target due"
                value={new Date(detail.dueDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              />
            )}
          </dl>
        </PartnerInfoCard>

        <PartnerInfoCard title="Clinical notes">
          {detail.instructions && (
            <p className="text-[13px] text-[var(--pd-slate)] whitespace-pre-wrap mb-3">
              <span className="font-medium text-[var(--pd-navy)]">Lab instructions: </span>
              {detail.instructions}
            </p>
          )}
          {(detail.notes || detail.rxNotes) && (
            <p className="text-[13px] text-[var(--pd-slate)] whitespace-pre-wrap">
              { [detail.notes, detail.rxNotes].filter(Boolean).join("\n\n") }
            </p>
          )}
          {!detail.instructions && !detail.notes && !detail.rxNotes && (
            <p className="text-[13px] text-[var(--pd-muted)]">No additional notes.</p>
          )}
        </PartnerInfoCard>
      </div>

      <PartnerInfoCard title="Practice files — download">
        {detail.caseFiles.length === 0 ? (
          <p className="text-[13px] text-amber-700">No files attached to this case.</p>
        ) : (
          <ul className="divide-y divide-[var(--pd-border)] border border-[var(--pd-border)]">
            {detail.caseFiles.map((file) => (
              <li key={file.url} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[var(--pd-navy)] truncate">{file.fileName}</p>
                  <p className="text-[11px] text-[var(--pd-muted)]">{file.label}</p>
                </div>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-medium text-[var(--pd-teal-dark)] hover:underline shrink-0"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </PartnerInfoCard>

      <PartnerInfoCard title="Your design files — upload">
        {detail.deliverables.length > 0 && (
          <ul className="divide-y divide-[var(--pd-border)] border border-[var(--pd-border)] mb-4">
            {detail.deliverables.map((file) => (
              <li key={file.url} className="flex items-center justify-between gap-3 px-3 py-2.5">
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
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-medium text-[var(--pd-teal-dark)] hover:underline shrink-0"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}

        {detail.status === "sent" && (
          <div className="space-y-3">
            <input
              type="file"
              accept={DESIGN_DELIVERABLE_ACCEPT}
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
                e.target.value = "";
              }}
              className={`${ORDER_INPUT_CLASS} text-[13px] py-2`}
            />
            <p className="text-[12px] text-[var(--pd-muted)]">
              Upload finished CAD (STL, PLY, OBJ, or ZIP). Max 500MB per file.
            </p>
            <button
              type="button"
              disabled={completing || detail.deliverables.length === 0}
              onClick={onComplete}
              className={`${ORDER_BTN_PRIMARY} h-10 px-4 text-[13px]`}
            >
              {completing ? "Submitting…" : "Submit design & mark complete"}
            </button>
          </div>
        )}

        {detail.status === "completed" && (
          <p className="text-[13px] text-[var(--pd-teal-dark)]">
            This case is marked complete. Contact the lab if you need to upload additional files.
          </p>
        )}
      </PartnerInfoCard>

      {error && <p className="text-[13px] text-red-600">{error}</p>}
    </div>
  );
}

function PartnerInfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-[var(--pd-border)] bg-white">
      <div className="px-4 py-3 border-b border-[var(--pd-border)] bg-[var(--pd-surface)]">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)]">
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[var(--pd-muted)]">{label}</dt>
      <dd className="text-[var(--pd-navy)] font-medium text-right">{value}</dd>
    </div>
  );
}

function PartnerStatusBadge({ status }: { status: "sent" | "completed" | null }) {
  if (status === "completed") {
    return (
      <span className="text-[11px] font-medium px-2 py-0.5 border bg-[#E1F5EE] text-[var(--pd-teal-dark)] border-[#9FE1CB]">
        Complete
      </span>
    );
  }
  return (
    <span
      className={cn(
        "text-[11px] font-medium px-2 py-0.5 border",
        status === "sent"
          ? "bg-amber-50 text-amber-800 border-amber-200"
          : "bg-[var(--pd-surface)] text-[var(--pd-muted)] border-[var(--pd-border)]"
      )}
    >
      {status === "sent" ? "Awaiting design" : "Pending"}
    </span>
  );
}
