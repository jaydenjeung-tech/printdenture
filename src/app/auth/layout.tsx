import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Provider login — PrintDenture",
  description: "Sign in or register your practice to access the PrintDenture provider portal.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
