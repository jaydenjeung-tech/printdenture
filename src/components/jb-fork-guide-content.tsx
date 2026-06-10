import Image from "next/image";
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

export default function JbForkGuideContent({ showHero = true }: { showHero?: boolean }) {
  return (
    <article>
      {showHero && (
        <header className="mb-12 pb-10 border-b border-[#E5E7EB]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[11px] font-medium text-[#0F6E56] uppercase tracking-[0.08em] mb-2">
                {JB_FORK_HERO.eyebrow}
              </p>
              <h1 className="text-[32px] md:text-[40px] font-semibold text-[#1B2B3A] tracking-tight leading-tight mb-3">
                {JB_FORK_HERO.title}
              </h1>
              <p className="text-lg font-medium text-[#1B2B3A] mb-3">{JB_FORK_HERO.subtitle}</p>
              <p className="text-[15px] text-[#6B7280] leading-relaxed mb-6">{JB_FORK_HERO.description}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {JB_FORK_SCAN_METHODS.map((m) => (
                  <span
                    key={m}
                    className="text-[12px] px-3 py-1.5 rounded-full bg-[#F7FAF9] border border-[#9FE1CB] text-[#085041]"
                  >
                    {m}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/shop?family=jb_fork"
                  className="h-11 px-5 rounded-xl bg-[#0F6E56] hover:bg-[#085041] text-white text-sm font-medium inline-flex items-center transition-colors"
                >
                  Order JB Fork kits
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
                src="/images/jb-fork/product.jpg"
                alt="JB Fork Radi+ impression and jaw relation device"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>

          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Guide sections">
            {JB_FORK_GUIDE_SECTIONS.map((s) => (
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
        description="Replace wax rims and multiple record visits with a single verified jaw-relation protocol."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
        {JB_FORK_FEATURES.map((f) => (
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
        id="components"
        num={2}
        title="Components"
        description="Each JB Fork Radi+ unit includes plates, anterior teeth, and Radi+ alignment features."
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
        {JB_FORK_COMPONENTS.map((item) => (
          <div key={item.label} className="rounded-xl border border-[#E5E7EB] overflow-hidden bg-white">
            <div className="relative aspect-square bg-[#F3F4F6]">
              <Image src={item.image} alt={item.alt} fill className="object-cover" sizes="33vw" />
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-[#1B2B3A] mb-1">{item.label}</p>
              <p className="text-[12px] text-[#6B7280] leading-relaxed">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionHeader
        id="radi-plus"
        num={3}
        title="Radi+ multi-modal alignment"
        description="Radiopaque markers tie facial, CBCT, and IOS datasets together for implant and full-arch digital cases."
      />
      <div className="rounded-xl border border-[#BFDBFE] bg-[#F0F9FF] p-6 mb-16">
        <ul className="space-y-3">
          {JB_FORK_RADI_PLUS.map((item) => (
            <li key={item} className="flex gap-2.5 text-[14px] text-[#1B2B3A] leading-relaxed">
              <span className="text-[#378ADD] shrink-0 mt-0.5">→</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="text-[13px] text-[#4B5563] mt-5 leading-relaxed">
          For chairside final impressions without Radi+ alignment, see the{" "}
          <Link href={JB_TRAY_GUIDE_PATH} className="text-[#0F6E56] font-medium hover:underline">
            JB Tray guide
          </Link>
          .
        </p>
      </div>

      <SectionHeader
        id="digital"
        num={4}
        title="Digital workflow"
        description="Recommended path for complete dentures and implant overdentures on PrintDenture."
      />
      <ol className="space-y-4 mb-16">
        {JB_FORK_DIGITAL_STEPS.map((s) => (
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

      <SectionHeader
        id="conventional"
        num={5}
        title="Conventional workflow"
        description="Analog denture fabrication using JB Fork records and optional POP Bow transfer."
      />
      <ol className="space-y-4 mb-16">
        {JB_FORK_CONVENTIONAL_STEPS.map((s) => (
          <li key={s.n} className="flex gap-4">
            <span className="w-8 h-8 rounded-lg bg-[#E1F5EE] text-[#0F6E56] text-sm font-bold flex items-center justify-center shrink-0">
              {s.n}
            </span>
            <div>
              <p className="text-sm font-semibold text-[#1B2B3A]">{s.title}</p>
              <p className="text-[13px] text-[#6B7280] mt-1 leading-relaxed">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <SectionHeader id="outcomes" num={6} title="Clinical outcomes" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
        {JB_FORK_OUTCOMES.map((item) => (
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
        description="Official PNU ADD demonstrations — digital denture workflow and JB Fork Radi+ with CBCT."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {JB_FORK_VIDEOS.map((video) => (
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
          <p className="text-sm font-semibold text-[#085041] mb-1">Ready to use JB Fork Radi+ with PrintDenture?</p>
          <p className="text-[13px] text-[#0F6E56] leading-relaxed max-w-xl">
            Order kits from our shop, capture aligned scan sets, then submit complete or overdenture cases without
            try-in when digital criteria are met.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Link
            href="/shop?family=jb_fork"
            className="h-11 px-5 rounded-xl bg-[#0F6E56] hover:bg-[#085041] text-white text-sm font-medium inline-flex items-center justify-center transition-colors"
          >
            Shop JB Fork
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
        {JB_FORK_ATTRIBUTION.manufacturer}. {JB_FORK_ATTRIBUTION.note} See also the{" "}
        <Link href={JB_TRAY_GUIDE_PATH} className="text-[#0F6E56] hover:underline">
          JB Tray guide
        </Link>
        .
      </p>
    </article>
  );
}
