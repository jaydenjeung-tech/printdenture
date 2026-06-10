/**
 * Chairside equipment aligned with PNUADD / Add-on Dental dental-device line.
 * @see https://www.add-ondental.com/sub/sub_0201.php
 */

export const ADD_ON_DENTAL_ATTRIBUTION =
  "Dental devices from PNUADD (JB & JD Design), distributed in the US by Add-on Dental Products.";

/** Retired equipment SKUs — deactivated on catalog sync. */
export const RETIRED_EQUIPMENT_PRODUCT_NAMES: readonly string[] = [
  "JB Tray Starter Kit",
  "JB Tray — Upper Tray Box (5 EA)",
  "JB Tray — Lower Tray Box (5 EA)",
  "JB Tray — POP Bow Box (5 sets)",
  "ADD POP Bow — Box (5 sets)",
  "JB Fork Radi+ — Single Unit",
  "JB Fork Radi+ — Practice 2-Pack",
  "JB Fork Radi+ — Box (5 EA)",
];

export const CHAIRSIDE_EQUIPMENT_PRICES = {
  jbTrayBox: 99,
  jbForkBox: 99,
  popBowPouch: 21,
} as const;
