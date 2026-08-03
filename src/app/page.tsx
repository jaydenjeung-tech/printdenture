import {
  HeroSection,
  OfferStrip,
  StatRow,
  ProblemSection,
  HowItWorksPreview,
  ClinicalDemoSection,
  SystemPreview,
  ClinicalPreview,
  PrinterSection,
  ComparisonSection,
  ProviderTeaser,
  FinalCta,
} from "@/components/marketing/landing-sections";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export default function Home() {
  return (
    <MarketingShell>
      <HeroSection />
      <OfferStrip />
      <StatRow />
      <ProblemSection />
      <HowItWorksPreview />
      <ClinicalDemoSection />
      <SystemPreview />
      <ClinicalPreview />
      <PrinterSection />
      <ComparisonSection />
      <ProviderTeaser />
      <FinalCta />
    </MarketingShell>
  );
}
