import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { GuideBreadcrumb } from "@/components/marketing/guide-ui";
import JbForkGuideContent from "@/components/jb-fork-guide-content";

export const metadata: Metadata = {
  title: "JB Fork Radi+ Clinical Guide & Videos | PrintDenture",
  description:
    "Complete JB Fork Radi+ chairside guide — components, digital and conventional workflows, Radi+ alignment, and instructional videos.",
};

export default function JbForkGuidePage() {
  return (
    <MarketingShell>
      <GuideBreadcrumb deviceName="JB Fork" systemHref="/the-system#jb-fork" />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <JbForkGuideContent />
      </div>
    </MarketingShell>
  );
}
