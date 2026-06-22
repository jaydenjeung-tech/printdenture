import { GuideImageCard } from "@/components/marketing/guide-image";
import {
  JB_TRAY_ATTRIBUTION,
  JB_TRAY_FEATURES,
  JB_TRAY_GUIDE_SECTIONS,
  JB_TRAY_HERO,
  JB_TRAY_MANDIBLE_PARTS,
  JB_TRAY_MANDIBLE_STEPS,
  JB_TRAY_MAXILLA_PARTS,
  JB_TRAY_MAXILLA_STEPS,
  JB_TRAY_OUTCOMES,
  JB_TRAY_PACKAGE,
  JB_TRAY_VIDEOS,
} from "@/lib/guides/jb-tray-guide";
import {
  GuideAttribution,
  GuideCtaBand,
  GuideFeatureGrid,
  GuideHero,
  GuideImageGrid,
  GuideNavPills,
  GuideSectionHeader,
  GuideStepList,
  GuideVideoGrid,
} from "@/components/marketing/guide-ui";
import { CtaLink } from "@/components/marketing/primitives";

export default function JbTrayGuideContent({ showHero = true }: { showHero?: boolean }) {
  return (
    <article>
      {showHero && (
        <GuideHero
          eyebrow={JB_TRAY_HERO.eyebrow}
          title={JB_TRAY_HERO.title}
          subtitle={JB_TRAY_HERO.subtitle}
          description={JB_TRAY_HERO.description}
          image="/images/jb-tray/product.jpg"
          imageAlt="JB Tray — Just Border impression tray"
          nav={<GuideNavPills sections={JB_TRAY_GUIDE_SECTIONS} />}
        >
          <div className="flex flex-wrap gap-3">
            <CtaLink href="/shop?family=jb_tray">Order JB Tray kits</CtaLink>
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
        description="Complete the final impression and jaw relation recording simultaneously with a single tray."
      />
      <GuideFeatureGrid features={JB_TRAY_FEATURES} />

      <GuideSectionHeader
        id="package"
        num={2}
        title="Package contents"
        description="Tray box: five upper + lower sets (no POP Bow). ADD POP Bow is sold separately as a pouch."
      />
      <GuideImageGrid items={JB_TRAY_PACKAGE} columns={3} />

      <GuideSectionHeader
        id="structure"
        num={3}
        title="Tray structure"
        description="Functionally segmented design enables border molding, impression taking, jaw relation recording, and POP Bow connection in one workflow."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
        {[
          {
            title: "Maxillary tray",
            image: "/images/jb-tray/maxilla-structure.jpg",
            alt: "JB Tray maxillary structure",
            parts: JB_TRAY_MAXILLA_PARTS,
          },
          {
            title: "Mandibular tray",
            image: "/images/jb-tray/mandible-structure.jpg",
            alt: "JB Tray mandibular structure with VD rods",
            parts: JB_TRAY_MANDIBLE_PARTS,
          },
        ].map((block) => (
          <GuideImageCard
            key={block.title}
            src={block.image}
            alt={block.alt}
            variant="diagram"
            title={block.title}
          >
            <ul className="space-y-1.5 text-[13px] text-[var(--pd-slate)] mt-3">
              {block.parts.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-[var(--pd-teal)]">·</span>
                  {p}
                </li>
              ))}
            </ul>
          </GuideImageCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        <div>
          <GuideSectionHeader
            id="maxilla"
            num={4}
            title="Maxillary application"
            description="Tray softening, border molding, and final impression for the maxilla."
          />
          <GuideStepList steps={JB_TRAY_MAXILLA_STEPS} className="mb-0" />
        </div>
        <div>
          <GuideSectionHeader
            id="mandible"
            num={5}
            title="Mandibular application"
            description="From tray softening through vertical dimension and centric relation recording."
          />
          <GuideStepList steps={JB_TRAY_MANDIBLE_STEPS} className="mb-0" />
        </div>
      </div>

      <GuideSectionHeader id="outcomes" num={6} title="Clinical outcomes" />
      <GuideImageGrid
        items={JB_TRAY_OUTCOMES.map((o) => ({ label: o.label, image: o.image, alt: o.alt }))}
        columns={2}
        variant="clinical"
      />

      <GuideSectionHeader
        id="videos"
        num={7}
        title="Instructional videos"
        description="Watch the JB Tray in action with step-by-step demonstration videos."
      />
      <GuideVideoGrid videos={JB_TRAY_VIDEOS} />

      <GuideCtaBand
        title="Ready to use JB Tray with PrintDenture?"
        description="Order kits from our shop, take chairside records, then upload scans. A printed try-in is included before final delivery."
        primaryHref="/shop?family=jb_tray"
        primaryLabel="Shop JB Tray"
        secondaryHref="/order"
        secondaryLabel="Start an order"
      />

      <GuideAttribution text={`${JB_TRAY_ATTRIBUTION.manufacturer}. ${JB_TRAY_ATTRIBUTION.note}`} />
    </article>
  );
}
