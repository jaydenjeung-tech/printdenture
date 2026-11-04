import SiteHeader from "@/components/marketing/site-header";
import SiteFooter from "@/components/marketing/site-footer";
import { LAB_PARTNER } from "@/lib/marketing/copy";
import { LabPartnerLink } from "@/components/marketing/lab-partner";

export function MarketingShell({
  children,
  labName,
}: {
  children: React.ReactNode;
  labName?: string;
}) {
  return (
    <>
      <SiteHeader labName={labName} />
      <main className="min-h-screen bg-[var(--pd-bg)] text-[var(--pd-navy)]">{children}</main>
      <SiteFooter labName={labName} />
    </>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  labName,
  showLabPartner = true,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  labName?: string;
  showLabPartner?: boolean;
}) {
  const partnerName = labName ?? LAB_PARTNER.name;
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
        {lead && (
          <p className={`text-[17px] leading-relaxed text-[#A8C4D4] ${showLabPartner ? "mb-4" : ""}`}>{lead}</p>
        )}
        {showLabPartner && (
          <p className="text-[13px] font-medium text-[#8BB3C8]">
            Lab partner ·{" "}
            <LabPartnerLink className="text-white/90 hover:text-white">{partnerName}</LabPartnerLink>
          </p>
        )}
      </div>
    </section>
  );
}
