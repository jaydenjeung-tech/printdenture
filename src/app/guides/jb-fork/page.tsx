import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import JbForkGuideContent from "@/components/jb-fork-guide-content";

export const metadata: Metadata = {
  title: "JB Fork Radi+ Clinical Guide & Videos | PrintDenture",
  description:
    "Complete JB Fork Radi+ chairside guide — components, digital and conventional workflows, Radi+ CBCT/facial/IOS alignment, and PNU ADD instructional videos.",
};

export default function JbForkGuidePage() {
  return (
    <main className="min-h-screen bg-[#F8F7F4] text-[#1A1A1A]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <Link
          href="/#jb-fork"
          className="inline-flex text-sm text-[#378ADD] hover:underline font-medium mb-6"
        >
          ← Back to homepage overview
        </Link>
        <JbForkGuideContent />
      </div>
      <Footer />
    </main>
  );
}
