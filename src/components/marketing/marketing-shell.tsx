import SiteHeader from "@/components/marketing/site-header";
import SiteFooter from "@/components/marketing/site-footer";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--pd-bg)] text-[var(--pd-navy)]">{children}</main>
      <SiteFooter />
    </>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
}) {
  return (
    <section className="pt-32 pb-16 lg:pt-36 lg:pb-20 px-6 bg-[var(--pd-navy)] text-white relative overflow-hidden">
      <div className="absolute inset-0 pd-grid-bg opacity-[0.07]" aria-hidden />
      <div className="relative max-w-3xl mx-auto text-center">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-light)] mb-4">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[clamp(2rem,4.5vw,3rem)] font-semibold tracking-[-0.04em] leading-[1.08] mb-5">
          {title}
        </h1>
        {lead && <p className="text-[17px] leading-relaxed text-[#A8C4D4]">{lead}</p>}
      </div>
    </section>
  );
}
