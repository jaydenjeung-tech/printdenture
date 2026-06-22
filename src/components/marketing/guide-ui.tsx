import Image from "next/image";
import Link from "next/link";
import { CtaLink } from "@/components/marketing/primitives";
import { GuideImageFrame, GuideImageCard, type GuideImageVariant } from "@/components/marketing/guide-image";

export function GuideBreadcrumb({
  deviceName,
  systemHref,
}: {
  deviceName: string;
  systemHref: string;
}) {
  return (
    <div className="pt-28 border-b border-[var(--pd-border)] bg-[var(--pd-surface)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex flex-wrap items-center gap-2 text-[13px]">
        <Link href="/the-system" className="text-[var(--pd-muted)] hover:text-[var(--pd-navy)] transition-colors">
          The system
        </Link>
        <span className="text-[var(--pd-border-strong)]">/</span>
        <Link href={systemHref} className="text-[var(--pd-muted)] hover:text-[var(--pd-navy)] transition-colors">
          {deviceName}
        </Link>
        <span className="text-[var(--pd-border-strong)]">/</span>
        <span className="text-[var(--pd-navy)] font-medium">Clinical guide</span>
      </div>
    </div>
  );
}

export function GuideSectionHeader({
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
    <div id={id} className="scroll-mt-28 mb-8 pb-6 border-b border-[var(--pd-border)]">
      <div className="flex items-start gap-4">
        <span className="w-10 h-10 border border-[var(--pd-teal)]/30 bg-[var(--pd-teal)]/5 text-[var(--pd-teal-dark)] text-sm font-semibold flex items-center justify-center shrink-0">
          {String(num).padStart(2, "0")}
        </span>
        <div>
          <h2 className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.02em]">
            {title}
          </h2>
          {description && (
            <p className="text-[14px] text-[var(--pd-slate)] leading-relaxed mt-2 max-w-3xl">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function GuideNavPills({ sections }: { sections: readonly { id: string; label: string }[] }) {
  return (
    <nav className="flex flex-wrap gap-0 border border-[var(--pd-border)] bg-white" aria-label="Guide sections">
      {sections.map((s, i) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`text-[12px] font-medium px-4 py-2.5 text-[var(--pd-slate)] hover:bg-[var(--pd-surface)] hover:text-[var(--pd-navy)] transition-colors ${
            i > 0 ? "border-l border-[var(--pd-border)]" : ""
          }`}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}

export function GuideHero({
  eyebrow,
  title,
  subtitle,
  description,
  image,
  imageAlt,
  children,
  nav,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  children?: React.ReactNode;
  nav?: React.ReactNode;
}) {
  return (
    <header className="mb-14 pb-14 border-b border-[var(--pd-border)]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)] mb-3">
            {eyebrow}
          </p>
          <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.03em] leading-tight mb-3">
            {title}
          </h1>
          <p className="text-[16px] font-medium text-[var(--pd-navy)] mb-3">{subtitle}</p>
          <p className="text-[15px] text-[var(--pd-slate)] leading-relaxed mb-6">{description}</p>
          {children}
        </div>
        <GuideImageFrame src={image} alt={imageAlt} variant="hero" priority />
      </div>
      {nav}
    </header>
  );
}

export function GuideFeatureGrid({ features }: { features: readonly { title: string; description: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-[var(--pd-border)] bg-white mb-16">
      {features.map((f, i) => (
        <div
          key={f.title}
          className={`p-6 ${i % 2 === 1 ? "sm:border-l border-[var(--pd-border)]" : ""} ${
            i >= 2 ? "border-t border-[var(--pd-border)]" : ""
          }`}
        >
          <h3 className="text-[15px] font-semibold text-[var(--pd-navy)] mb-2">{f.title}</h3>
          <p className="text-[13px] text-[var(--pd-slate)] leading-relaxed">{f.description}</p>
        </div>
      ))}
    </div>
  );
}

export function GuideImageGrid({
  items,
  columns = 3,
  variant = "product",
}: {
  items: readonly { label: string; image: string; alt: string; detail?: string }[];
  columns?: 2 | 3;
  variant?: GuideImageVariant;
}) {
  const colClass = columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className={`grid grid-cols-1 ${colClass} gap-4 mb-16`}>
      {items.map((item) => (
        <GuideImageCard
          key={item.label}
          src={item.image}
          alt={item.alt}
          variant={variant}
          label={item.label}
          detail={item.detail}
        />
      ))}
    </div>
  );
}

export function GuideStepList({
  steps,
  className = "mb-16",
}: {
  steps: readonly { n: number; title: string; body: string; tip?: string }[];
  className?: string;
}) {
  return (
    <ol className={`space-y-0 border border-[var(--pd-border)] bg-white divide-y divide-[var(--pd-border)] ${className}`}>
      {steps.map((s) => (
        <li key={s.n} className="flex gap-4 p-5 sm:p-6">
          <span className="w-8 h-8 border border-[var(--pd-teal)]/30 bg-[var(--pd-teal)]/5 text-[var(--pd-teal-dark)] text-sm font-semibold flex items-center justify-center shrink-0">
            {s.n}
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--pd-navy)]">{s.title}</p>
            <p className="text-[13px] text-[var(--pd-slate)] mt-1 leading-relaxed">{s.body}</p>
            {s.tip && <GuideTip>{s.tip}</GuideTip>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function GuideTip({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] text-[var(--pd-teal-dark)] mt-3 border-l-2 border-[var(--pd-teal)] pl-3 leading-relaxed">
      <span className="font-semibold">Tip: </span>
      {children}
    </p>
  );
}

export function GuideCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-[var(--pd-border)] bg-[var(--pd-surface)] p-6 mb-16">{children}</div>
  );
}

export function GuideVideoGrid({
  videos,
}: {
  videos: readonly { youtubeId: string; title: string; description: string }[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
      {videos.map((video) => (
        <div key={video.youtubeId} className="border border-[var(--pd-border)] bg-white overflow-hidden">
          <div className="relative aspect-video bg-[var(--pd-navy)]">
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
          <div className="p-4 border-t border-[var(--pd-border)]">
            <p className="text-sm font-semibold text-[var(--pd-navy)]">{video.title}</p>
            <p className="text-xs text-[var(--pd-muted)] mt-1 leading-relaxed">{video.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function GuideCtaBand({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) {
  return (
    <section className="py-10 px-6 bg-[var(--pd-navy)] text-white mb-10 relative overflow-hidden">
      <div className="absolute inset-0 pd-grid-bg opacity-[0.06]" aria-hidden />
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <p className="text-[16px] font-semibold mb-2">{title}</p>
          <p className="text-[14px] text-[#A8C4D4] leading-relaxed max-w-xl">{description}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <CtaLink href={primaryHref}>{primaryLabel}</CtaLink>
          <CtaLink href={secondaryHref} variant="secondary" className="border-white/30 text-white hover:bg-white hover:text-[var(--pd-navy)]">
            {secondaryLabel}
          </CtaLink>
        </div>
      </div>
    </section>
  );
}

export function GuideAttribution({ text, link }: { text: string; link?: { href: string; label: string } }) {
  return (
    <p className="text-[12px] text-[var(--pd-muted)] leading-relaxed border-t border-[var(--pd-border)] pt-6">
      {text}
      {link && (
        <>
          {" "}
          See also the{" "}
          <Link href={link.href} className="text-[var(--pd-teal-dark)] hover:underline">
            {link.label}
          </Link>
          .
        </>
      )}
    </p>
  );
}

export function GuideTagList({ tags }: { tags: readonly string[] }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-[12px] px-3 py-1.5 border border-[var(--pd-border)] bg-[var(--pd-surface)] text-[var(--pd-slate)]"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
