import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Providers — PrintDenture",
  description:
    "Become a certified PrintDenture provider. Faculty-led training, CE credits, and workflow certification.",
};

export default function ProvidersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
