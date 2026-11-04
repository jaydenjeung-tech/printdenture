import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — PrintDenture",
  description:
    "Lab services for records, a printed try-in, and final delivery — design, QC, and finishing included.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
