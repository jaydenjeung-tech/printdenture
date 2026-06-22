import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — PrintDenture",
  description:
    "Lab services for the two-visit denture workflow — design, printed try-in, QC, and finishing included.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
