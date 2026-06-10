import Image from "next/image";
import Link from "next/link";
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

function SectionHeader({
  id,
  num,
  title,
  description,
}: {
  id: string;
  num: number;
  title: string;
  description?: string;
}) {
  return (
    <div id={id} className="scroll-mt-24 mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-8 h-8 rounded-lg bg-[#E1F5EE] text-[#0F6E56] text-sm font-bold flex items-center justify-center shrink-0">
          {num}
        </span>
        <h2 className="text-xl md:text-2xl font-semibold text-[#1B2B3A] tracking-tight">{title}</h2>
      </div>
      {description && <p className="text-sm text-[#6B7280] leading-relaxed max-w-3xl">{description}</p>}
    </div>
  );
}

export default function JbTrayGuideContent({ showHero = true }: { showHero?: boolean }) {
  return (
    <article>
      {showHero && (
        <header className="mb-12 pb-10 border-b border-[#E5E7EB]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[11px] font-medium text-[#0F6E56] uppercase tracking-[0.08em] mb-2">
                {JB_TRAY_HERO.eyebrow}
              </p>
              <h1 className="text-[32px] md:text-[40px] font-semibold text-[#1B2B3A] tracking-tight leading-tight mb-3">
                {JB_TRAY_HERO.title}
              </h1>
              <p className="text-lg font-medium text-[#1B2B3A] mb-3">{JB_TRAY_HERO.subtitle}</p>
              <p className="text-[15px] text-[#6B7280] leading-relaxed mb-6">{JB_TRAY_HERO.description}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/shop?family=jb_tray"
                  className="h-11 px-5 rounded-xl bg-[#0F6E56] hover:bg-[#085041] text-white text-sm font-medium inline-flex items-center transition-colors"
                >
                  Order JB Tray kits
                </Link>
                <Link
                  href="/order"
                  className="h-11 px-5 rounded-xl border border-[#E2E0D8] bg-white hover:border-[#0F6E56] text-sm font-medium text-[#1B2B3A] inline-flex items-center transition-colors"
                >
                  Start a lab case
                </Link>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#E5E7EB] bg-[#F7FAF9]">
              <Image
                src="/images/jb-tray/product.jpg"
                alt="JB Tray — Just Border impression tray by PNUADD"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>

          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Guide sections">
            {JB_TRAY_GUIDE_SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-[#F7FAF9] text-[#0F6E56] hover:border-[#9FE1CB] hover:bg-[#E1F5EE]/50 transition-colors"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </header>
      )}

      <SectionHeader
        id="features"
        num={1}
        title="Key features"
        description="Complete the final impression and jaw relation recording simultaneously with a single tray."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
        {JB_TRAY_FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-[#E5E7EB] bg-[#F7FAF9] p-5 hover:border-[#0F6E56]/40 transition-colors"
          >
            <h3 className="text-[15px] font-semibold text-[#1B2B3A] mb-2">{f.title}</h3>
            <p className="text-[13px] text-[#6B7280] leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>

      <SectionHeader
        id="package"
        num={2}
        title="Package contents"
        description="Tray box: five upper + lower sets (no POP Bow). ADD POP Bow is sold separately as a pouch."
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
        {JB_TRAY_PACKAGE.map((item) => (
          <div key={item.label} className="rounded-xl border border-[#E5E7EB] overflow-hidden bg-white">
            <div className="relative aspect-square bg-[#F3F4F6]">
              <Image src={item.image} alt={item.alt} fill className="object-cover" sizes="33vw" />
            </div>
            <p className="text-sm font-medium text-[#1B2B3A] p-4 text-center">{item.label}</p>
          </div>
        ))}
      </div>

      <SectionHeader
        id="structure"
        num={3}
        title="Tray structure"
        description="Functionally segmented design enables border molding, impression taking, jaw relation recording, and POP Bow connection in one workflow."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="relative aspect-[4/3] bg-[#F7FAF9]">
            <Image
              src="/images/jb-tray/maxilla-structure.jpg"
              alt="JB Tray maxillary structure"
              fill
              className="object-contain p-4"
              sizes="50vw"
            />
          </div>
          <div className="p-5">
            <h3 className="font-semibold text-[#1B2B3A] mb-3">Maxillary tray</h3>
            <ul className="space-y-1.5 text-[13px] text-[#6B7280]">
              {JB_TRAY_MAXILLA_PARTS.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-[#0F6E56]">·</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="relative aspect-[4/3] bg-[#F7FAF9]">
            <Image
              src="/images/jb-tray/mandible-structure.jpg"
              alt="JB Tray mandibular structure with VD rods"
              fill
              className="object-contain p-4"
              sizes="50vw"
            />
          </div>
          <div className="p-5">
            <h3 className="font-semibold text-[#1B2B3A] mb-3">Mandibular tray</h3>
            <ul className="space-y-1.5 text-[13px] text-[#6B7280]">
              {JB_TRAY_MANDIBLE_PARTS.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-[#0F6E56]">·</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        <div>
          <SectionHeader
            id="maxilla"
            num={4}
            title="Maxillary application"
            description="Tray softening, border molding, and final impression for the maxilla."
          />
          <ol className="space-y-4">
            {JB_TRAY_MAXILLA_STEPS.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="w-8 h-8 rounded-lg bg-[#E1F5EE] text-[#0F6E56] text-sm font-bold flex items-center justify-center shrink-0">
                  {s.n}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1B2B3A]">{s.title}</p>
                  <p className="text-[13px] text-[#6B7280] mt-1 leading-relaxed">{s.body}</p>
                  {"tip" in s && s.tip && (
                    <p className="text-[12px] text-[#085041] mt-2 bg-[#E1F5EE]/60 border border-[#9FE1CB] rounded-lg px-3 py-2 leading-relaxed">
                      <span className="font-semibold">Tip: </span>
                      {s.tip}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <SectionHeader
            id="mandible"
            num={5}
            title="Mandibular application"
            description="From tray softening through vertical dimension and centric relation recording."
          />
          <ol className="space-y-4">
            {JB_TRAY_MANDIBLE_STEPS.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="w-8 h-8 rounded-lg bg-[#E1F5EE] text-[#0F6E56] text-sm font-bold flex items-center justify-center shrink-0">
                  {s.n}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1B2B3A]">{s.title}</p>
                  <p className="text-[13px] text-[#6B7280] mt-1 leading-relaxed">{s.body}</p>
                  {"tip" in s && s.tip && (
                    <p className="text-[12px] text-[#085041] mt-2 bg-[#E1F5EE]/60 border border-[#9FE1CB] rounded-lg px-3 py-2 leading-relaxed">
                      <span className="font-semibold">Tip: </span>
                      {s.tip}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <SectionHeader id="outcomes" num={6} title="Clinical outcomes" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
        {JB_TRAY_OUTCOMES.map((item) => (
          <div key={item.label} className="rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="relative aspect-[4/3]">
              <Image src={item.image} alt={item.alt} fill className="object-cover" sizes="50vw" />
            </div>
            <p className="text-sm font-medium text-[#1B2B3A] p-4 text-center">{item.label}</p>
          </div>
        ))}
      </div>

      <SectionHeader
        id="videos"
        num={7}
        title="Instructional videos"
        description="Watch the JB Tray in action with step-by-step demonstration videos."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {JB_TRAY_VIDEOS.map((video) => (
          <div key={video.youtubeId} className="rounded-xl border border-[#E5E7EB] overflow-hidden bg-white">
            <div className="relative aspect-video bg-[#1B2B3A]">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-[#1B2B3A]">{video.title}</p>
              <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">{video.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#9FE1CB] bg-[#E1F5EE]/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <p className="text-sm font-semibold text-[#085041] mb-1">Ready to use JB Tray with PrintDenture?</p>
          <p className="text-[13px] text-[#0F6E56] leading-relaxed max-w-xl">
            Order kits from our shop, take chairside records, then upload scans for definitive dentures without
            try-in when digital criteria are met.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Link
            href="/shop?family=jb_tray"
            className="h-11 px-5 rounded-xl bg-[#0F6E56] hover:bg-[#085041] text-white text-sm font-medium inline-flex items-center justify-center transition-colors"
          >
            Shop JB Tray
          </Link>
          <Link
            href="/order"
            className="h-11 px-5 rounded-xl border border-[#9FE1CB] bg-white text-[#085041] text-sm font-medium inline-flex items-center justify-center hover:bg-[#E1F5EE] transition-colors"
          >
            Start an order
          </Link>
        </div>
      </div>

      <p className="text-[12px] text-[#9B9B9B] leading-relaxed border-t border-[#E5E7EB] pt-6">
        {JB_TRAY_ATTRIBUTION.manufacturer}. {JB_TRAY_ATTRIBUTION.note}
      </p>
    </article>
  );
}
