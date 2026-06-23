import AdminShell from "@/components/admin/admin-shell";

export default function LabConsoleLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
