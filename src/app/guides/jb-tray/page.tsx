import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { GuideBreadcrumb } from "@/components/marketing/guide-ui";
import JbTrayGuideContent from "@/components/jb-tray-guide-content";

export const metadata: Metadata = {
  title: "JB Tray Clinical Guide & Videos | PrintDenture",
  description:
    "Complete JB Tray (Just Border) chairside guide — features, tray structure, maxillary and mandibular steps, and instructional videos.",
};

export default function JbTrayGuidePage() {
  return (
    <MarketingShell>
      <GuideBreadcrumb deviceName="JB Tray" systemHref="/the-system#jb-tray" />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <JbTrayGuideContent />
      </div>
    </MarketingShell>
  );
}
