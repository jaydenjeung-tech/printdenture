import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import JbTrayGuideContent from "@/components/jb-tray-guide-content";

export const metadata: Metadata = {
  title: "JB Tray Clinical Guide & Videos | PrintDenture",
  description:
    "Complete JB Tray (Just Border) chairside guide — features, tray structure, maxillary and mandibular steps, and instructional videos. Order kits and send cases to PrintDenture.",
};

export default function JbTrayGuidePage() {
  return (
    <main className="min-h-screen bg-[#F8F7F4] text-[#1A1A1A]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <Link
          href="/#jb-tray"
          className="inline-flex text-sm text-[#378ADD] hover:underline font-medium mb-6"
        >
          ← Back to homepage overview
        </Link>
        <JbTrayGuideContent />
      </div>
      <Footer />
    </main>
  );
}
