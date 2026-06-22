"use client";

import Link from "next/link";
import {
  getEquipmentNoticeForCategory,
  getRequiredEquipment,
  type EquipmentKind,
} from "@/lib/equipment-requirements";
import { ORDER_BTN_PRIMARY, ORDER_BTN_BACK } from "@/components/marketing/order-ui";

const SHOP_FAMILY: Record<EquipmentKind, string> = {
  jb_tray: "jb_tray",
  jb_fork: "jb_fork",
};

type Props = {
  productCategory: string;
};

export function JbShopBanner({ productCategory }: Props) {
  const required = getRequiredEquipment(productCategory);
  const kind = required[0];
  const notice = getEquipmentNoticeForCategory(productCategory);

  if (!kind || !notice) return null;

  const shopHref = `/shop?family=${SHOP_FAMILY[kind]}`;

  return (
    <div className="mb-6 border border-amber-200 bg-amber-50 p-4 sm:p-5">
      <p className="text-[14px] font-semibold text-amber-950">New to {notice.equipmentLabel}?</p>
      <p className="text-[14px] text-amber-900/90 mt-1 leading-relaxed">
        Order JB Tray or JB Fork supplies from PrintDenture, mark received on your dashboard when they arrive,
        then capture records and upload scans here. Not sure Fork or Tray?{" "}
        <Link href="/shop#protocol-chooser" className="font-medium text-[var(--pd-teal-dark)] hover:underline">
          See the protocol guide
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <Link href={shopHref} className={ORDER_BTN_PRIMARY}>
          Open Shop — order {notice.equipmentLabel} kit
        </Link>
        <Link href="/dashboard" className={`${ORDER_BTN_BACK} h-10`}>
          Mark kit received
        </Link>
      </div>
    </div>
  );
}
