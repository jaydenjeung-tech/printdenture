export type AdminNavItem = {
  label: string;
  href: string;
  description?: string;
};

export type AdminNavSection = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

/** Grouped by how lab staff actually work through a case. */
export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    id: "operations",
    label: "Operations",
    items: [
      { label: "Overview", href: "/admin", description: "Today’s triage & quick actions" },
      { label: "Orders", href: "/admin/orders", description: "All cases · status & messages" },
      { label: "Payments", href: "/admin/payments", description: "Stripe · paid & unpaid cases" },
      { label: "Support", href: "/admin/support", description: "Practice messages" },
    ],
  },
  {
    id: "workflow",
    label: "Lab workflow",
    items: [
      { label: "Lab queue", href: "/lab", description: "Print work orders & ship" },
      { label: "Barcode scan", href: "/lab/scan", description: "Advance cases on the floor" },
      { label: "Partner portal", href: "/partner", description: "JD design outsource" },
    ],
  },
  {
    id: "directory",
    label: "Directory",
    items: [
      { label: "Customers", href: "/admin/customers", description: "Practices" },
      { label: "Products", href: "/admin/products", description: "Catalog & pricing" },
    ],
  },
  {
    id: "preview",
    label: "Preview",
    items: [
      { label: "Customer view", href: "/dashboard", description: "Preview practice portal" },
      { label: "Marketing site", href: "/", description: "Public website" },
    ],
  },
];

/** Preview links — same items as the Preview nav section (mobile optgroup, etc.). */
export const ADMIN_UTILITY_LINKS: AdminNavItem[] =
  ADMIN_NAV_SECTIONS.find((s) => s.id === "preview")?.items ?? [];

/** Flat list for mobile nav and other consumers. */
export const ADMIN_NAV = ADMIN_NAV_SECTIONS.flatMap((section) => section.items);

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  if (href === "/admin/payments") return pathname.startsWith("/admin/payments");
  if (href === "/lab") return pathname === "/lab";
  if (href === "/lab/scan") return pathname.startsWith("/lab/scan");
  if (href === "/partner") return pathname.startsWith("/partner");
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
