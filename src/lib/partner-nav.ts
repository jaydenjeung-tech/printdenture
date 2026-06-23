export type PartnerNavItem = {
  label: string;
  href: string;
  description?: string;
};

export type PartnerNavSection = {
  id: string;
  label: string;
  items: PartnerNavItem[];
};

export const PARTNER_NAV_SECTIONS: PartnerNavSection[] = [
  {
    id: "cases",
    label: "Your work",
    items: [{ label: "Case queue", href: "/partner", description: "Assigned design cases" }],
  },
];

export const PARTNER_NAV = PARTNER_NAV_SECTIONS.flatMap((section) => section.items);

export function isPartnerNavActive(pathname: string, href: string): boolean {
  if (href === "/partner") {
    return pathname === "/partner" || pathname.startsWith("/partner/cases/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
