"use client";

import Link from "next/link";
import { useState } from "react";
import { createAppClient } from "@/lib/supabase";
import {
  EQUIPMENT_STATUS_LABELS,
  type EquipmentProfile,
  type EquipmentStatus,
} from "@/lib/equipment-requirements";

type Props = {
  userId: string;
  profile: EquipmentProfile;
  onUpdate: (patch: EquipmentProfile) => void;
};

function StatusRow({
  label,
  status,
  trained,
  onMarkReceived,
  marking,
}: {
  label: string;
  status: EquipmentStatus;
  trained: boolean;
  onMarkReceived: () => void;
  marking: boolean;
}) {
  const ready = status === "have" && trained;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-[var(--pd-border)] last:border-0">
      <div>
        <p className="text-[14px] font-medium text-[var(--pd-navy)]">{label}</p>
        <p className="text-[12px] text-[var(--pd-muted)] mt-0.5">
          {ready
            ? "Ready for lab cases"
            : `${EQUIPMENT_STATUS_LABELS[status]}${trained ? "" : " · training not confirmed"}`}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-[11px] font-medium px-2.5 py-1 border uppercase tracking-wide ${
            ready
              ? "bg-[#E1F5EE] text-[var(--pd-teal-dark)] border-[#9FE1CB]"
              : status === "ordered"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-[var(--pd-surface)] text-[var(--pd-slate)] border-[var(--pd-border)]"
          }`}
        >
          {ready ? "Ready" : EQUIPMENT_STATUS_LABELS[status]}
        </span>
        {status === "ordered" && (
          <button
            type="button"
            disabled={marking}
            onClick={onMarkReceived}
            className="h-8 px-3 bg-[var(--pd-teal)] hover:bg-[var(--pd-teal-dark)] text-white text-[12px] font-medium transition-colors disabled:opacity-40"
          >
            {marking ? "Saving…" : "Mark received"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function WorkflowReadinessCard({ userId, profile, onUpdate }: Props) {
  const [marking, setMarking] = useState<"jb_tray" | "jb_fork" | null>(null);

  const trayStatus = (profile.jb_tray_status as EquipmentStatus) || "need";
  const forkStatus = (profile.jb_fork_status as EquipmentStatus) || "need";

  async function markReceived(kind: "jb_tray" | "jb_fork") {
    setMarking(kind);
    const supabase = createAppClient();
    const patch =
      kind === "jb_tray"
        ? { jb_tray_status: "have" as const, jb_tray_trained: true }
        : { jb_fork_status: "have" as const, jb_fork_trained: true };
    const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
    setMarking(null);
    if (!error) onUpdate({ ...profile, ...patch });
  }

  const allReady =
    trayStatus === "have" &&
    forkStatus === "have" &&
    profile.jb_tray_trained &&
    profile.jb_fork_trained;

  return (
    <div className="border border-[var(--pd-border)] bg-white mb-6 overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b border-[var(--pd-border)] flex items-center justify-between gap-3 bg-[var(--pd-surface)]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-teal-dark)] mb-1">
            Capture readiness
          </p>
          <p className="text-[14px] font-medium text-[var(--pd-navy)]">JB starter kit status</p>
          <p className="text-[12px] text-[var(--pd-muted)] mt-0.5">
            Order kit → mark received → submit JB Fork / JB Tray lab cases
          </p>
        </div>
        <Link href="/shop" className="text-[12px] font-medium text-[var(--pd-teal-dark)] hover:underline shrink-0">
          Order equipment →
        </Link>
      </div>
      <div className="px-4 sm:px-5">
        <StatusRow
          label="JB Tray"
          status={trayStatus}
          trained={!!profile.jb_tray_trained}
          marking={marking === "jb_tray"}
          onMarkReceived={() => void markReceived("jb_tray")}
        />
        <StatusRow
          label="JB Fork Radi+"
          status={forkStatus}
          trained={!!profile.jb_fork_trained}
          marking={marking === "jb_fork"}
          onMarkReceived={() => void markReceived("jb_fork")}
        />
      </div>
      {!allReady && (
        <div className="px-4 sm:px-5 py-3 bg-[var(--pd-surface)] border-t border-[var(--pd-border)]">
          <p className="text-[12px] text-[var(--pd-slate)] leading-relaxed">
            Complete denture and overdenture cases that use JB Fork or JB Tray require a PrintDenture
            starter kit in your practice before checkout. Order from the shop, mark received here when it
            arrives, then upload scans from your order dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
