"use client";

import Link from "next/link";
import {
  getEquipmentNoticeForCategory,
  getRequiredEquipment,
  type EquipmentKind,
} from "@/lib/equipment-requirements";

const SHOP_FAMILY: Record<EquipmentKind, string> = {
  jb_tray: "jb_tray",
  jb_fork: "jb_fork",
};

type Props = {
  productCategory: string;
};

/** Prominent shop CTA when a JB kit is recommended but not yet in practice. */
export function JbShopBanner({ productCategory }: Props) {
  const required = getRequiredEquipment(productCategory);
  const kind = required[0];
  const notice = getEquipmentNoticeForCategory(productCategory);

  if (!kind || !notice) return null;

  const shopHref = `/shop?family=${SHOP_FAMILY[kind]}`;

  return (
    <div className="mb-6 rounded-xl border border-[#D97706]/30 bg-amber-50 p-4 sm:p-5">
      <p className="text-sm font-semibold text-amber-950">
        New to {notice.equipmentLabel}?
      </p>
      <p className="text-sm text-amber-900/90 mt-1 leading-relaxed">
        Order JB Tray or JB Fork supplies from PrintDenture, mark received on your dashboard when they arrive,
        then capture records and upload scans here. Not sure Fork or Tray?{" "}
        <Link href="/shop#protocol-chooser" className="font-medium text-[#0F6E56] hover:underline">
          See the protocol guide
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Link
          href={shopHref}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0F6E56] px-5 text-sm font-medium text-white hover:bg-[#085041] transition-colors"
        >
          Open Shop — order {notice.equipmentLabel} kit
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-300 bg-white px-5 text-sm font-medium text-amber-950 hover:bg-amber-100/80 transition-colors"
        >
          Mark kit received
        </Link>
      </div>
    </div>
  );
}
