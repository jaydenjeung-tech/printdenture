"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-[#F0EEE8] last:border-0">
      <div>
        <p className="text-sm font-medium text-[#1A1A1A]">{label}</p>
        <p className="text-xs text-[#9B9B9B] mt-0.5">
          {ready
            ? "Ready for lab cases"
            : `${EQUIPMENT_STATUS_LABELS[status]}${trained ? "" : " · training not confirmed"}`}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
            ready
              ? "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]"
              : status === "ordered"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-[#F8F7F4] text-[#6B6B6B] border-[#E2E0D8]"
          }`}
        >
          {ready ? "Ready" : EQUIPMENT_STATUS_LABELS[status]}
        </span>
        {status === "ordered" && (
          <Button
            size="sm"
            className="h-8 rounded-lg bg-[#0F6E56] hover:bg-[#085041] text-white text-xs"
            disabled={marking}
            onClick={onMarkReceived}
          >
            {marking ? "Saving…" : "Mark received"}
          </Button>
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
    <div className="bg-white rounded-xl border border-[#E2E0D8] mb-6 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#F0EEE8] flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#1A1A1A]">JB starter kit status</p>
          <p className="text-xs text-[#9B9B9B] mt-0.5">
            Order kit → mark received → submit JB Fork / JB Tray lab cases
          </p>
        </div>
        <Link
          href="/shop"
          className="text-xs font-medium text-[#0F6E56] hover:underline shrink-0"
        >
          Order equipment →
        </Link>
      </div>
      <div className="px-4">
        <StatusRow
          label="JB Tray"
          status={trayStatus}
          trained={!!profile.jb_tray_trained}
          marking={marking === "jb_tray"}
          onMarkReceived={() => markReceived("jb_tray")}
        />
        <StatusRow
          label="JB Fork Radi+"
          status={forkStatus}
          trained={!!profile.jb_fork_trained}
          marking={marking === "jb_fork"}
          onMarkReceived={() => markReceived("jb_fork")}
        />
      </div>
      {!allReady && (
        <div className="px-4 py-3 bg-[#F8F7F4] border-t border-[#F0EEE8]">
          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            Complete denture and overdenture cases that use JB Fork or JB Tray require a
            PrintDenture starter kit in your practice before checkout. Order from the shop, mark
            received here when it arrives, then upload scans from your order dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
