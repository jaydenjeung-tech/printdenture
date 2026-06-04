export type AdminNavItem = {
  label: string;
  href: string;
  description?: string;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Overview", href: "/admin", description: "Dashboard & stats" },
  { label: "Orders", href: "/admin/orders", description: "Manage cases" },
  { label: "Customers", href: "/admin/customers", description: "Practices" },
  { label: "Products", href: "/admin/products", description: "Catalog & pricing" },
  { label: "Support", href: "/admin/support", description: "Inbox" },
];

export const ADMIN_FOOTER_LINKS: AdminNavItem[] = [
  { label: "Lab queue", href: "/lab" },
  { label: "Customer view", href: "/dashboard" },
];

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
