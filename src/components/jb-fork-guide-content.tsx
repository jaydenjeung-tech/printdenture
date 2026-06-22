import Link from "next/link";
import {
  JB_FORK_ATTRIBUTION,
  JB_FORK_COMPONENTS,
  JB_FORK_CONVENTIONAL_STEPS,
  JB_FORK_DIGITAL_STEPS,
  JB_FORK_FEATURES,
  JB_FORK_GUIDE_SECTIONS,
  JB_FORK_HERO,
  JB_FORK_OUTCOMES,
  JB_FORK_RADI_PLUS,
  JB_FORK_SCAN_METHODS,
  JB_FORK_VIDEOS,
} from "@/lib/guides/jb-fork-guide";
import { JB_TRAY_GUIDE_PATH } from "@/lib/guides/jb-tray-guide";
import {
  GuideAttribution,
  GuideCallout,
  GuideCtaBand,
  GuideFeatureGrid,
  GuideHero,
  GuideImageGrid,
  GuideNavPills,
  GuideSectionHeader,
  GuideStepList,
  GuideTagList,
  GuideVideoGrid,
} from "@/components/marketing/guide-ui";
import { CtaLink } from "@/components/marketing/primitives";

export default function JbForkGuideContent({ showHero = true }: { showHero?: boolean }) {
  return (
    <article>
      {showHero && (
        <GuideHero
          eyebrow={JB_FORK_HERO.eyebrow}
          title={JB_FORK_HERO.title}
          subtitle={JB_FORK_HERO.subtitle}
          description={JB_FORK_HERO.description}
          image="/images/jb-fork/product.jpg"
          imageAlt="JB Fork Radi+ impression and jaw relation device"
          nav={<GuideNavPills sections={JB_FORK_GUIDE_SECTIONS} />}
        >
          <GuideTagList tags={JB_FORK_SCAN_METHODS} />
          <div className="flex flex-wrap gap-3">
            <CtaLink href="/shop?family=jb_fork">Order JB Fork kits</CtaLink>
            <CtaLink href="/order" variant="secondary">
              Start a lab case
            </CtaLink>
          </div>
        </GuideHero>
      )}

      <GuideSectionHeader
        id="features"
        num={1}
        title="Key features"
        description="Replace wax rims and multiple record visits with a single verified jaw-relation protocol."
      />
      <GuideFeatureGrid features={JB_FORK_FEATURES} />

      <GuideSectionHeader
        id="components"
        num={2}
        title="Components"
        description="Each JB Fork Radi+ unit includes plates, anterior teeth, and Radi+ alignment features."
      />
      <GuideImageGrid items={JB_FORK_COMPONENTS} columns={3} />

      <GuideSectionHeader
        id="radi-plus"
        num={3}
        title="Radi+ multi-modal alignment"
        description="Radiopaque markers tie facial, CBCT, and IOS datasets together for implant and full-arch digital cases."
      />
      <GuideCallout>
        <ul className="space-y-3">
          {JB_FORK_RADI_PLUS.map((item) => (
            <li key={item} className="flex gap-3 text-[14px] text-[var(--pd-slate)] leading-relaxed">
              <span className="text-[var(--pd-teal)] shrink-0">→</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="text-[13px] text-[var(--pd-muted)] mt-5 leading-relaxed">
          For chairside final impressions without Radi+ alignment, see the{" "}
          <Link href={JB_TRAY_GUIDE_PATH} className="text-[var(--pd-teal-dark)] font-medium hover:underline">
            JB Tray guide
          </Link>
          .
        </p>
      </GuideCallout>

      <GuideSectionHeader
        id="digital"
        num={4}
        title="Digital workflow"
        description="Recommended path for complete dentures and implant overdentures on PrintDenture."
      />
      <GuideStepList steps={JB_FORK_DIGITAL_STEPS} />

      <GuideSectionHeader
        id="conventional"
        num={5}
        title="Conventional workflow"
        description="Analog denture fabrication using JB Fork records and optional POP Bow transfer."
      />
      <GuideStepList steps={JB_FORK_CONVENTIONAL_STEPS} />

      <GuideSectionHeader id="outcomes" num={6} title="Clinical outcomes" />
      <GuideImageGrid
        items={JB_FORK_OUTCOMES.map((o) => ({ label: o.label, image: o.image, alt: o.alt }))}
        columns={2}
        variant="clinical"
      />

      <GuideSectionHeader
        id="videos"
        num={7}
        title="Instructional videos"
        description="Official demonstrations — digital denture workflow and JB Fork Radi+ with CBCT."
      />
      <GuideVideoGrid videos={JB_FORK_VIDEOS} />

      <GuideCtaBand
        title="Ready to use JB Fork Radi+ with PrintDenture?"
        description="Order kits from our shop, capture aligned scan sets, then submit cases. Verify esthetics and occlusion with the printed try-in before final delivery."
        primaryHref="/shop?family=jb_fork"
        primaryLabel="Shop JB Fork"
        secondaryHref="/order"
        secondaryLabel="Start an order"
      />

      <GuideAttribution
        text={`${JB_FORK_ATTRIBUTION.manufacturer}. ${JB_FORK_ATTRIBUTION.note}`}
        link={{ href: JB_TRAY_GUIDE_PATH, label: "JB Tray guide" }}
      />
    </article>
  );
}
