import Image from "next/image";
import Link from "next/link";

const JB_JD_URL = "https://tomabranding.mycafe24.com/jb-jd/";

const features = [
  {
    title: "One-step final impression & jaw relation",
    description:
      "After tray alteration and border molding, take the final impression while simultaneously recording vertical dimension and centric relation. Eliminates individual trays and occlusal wax rims.",
  },
  {
    title: "Fewer patient visits",
    description:
      "Reduce visits from the conventional five to three — with a simplified workflow, as few as two visits in some cases.",
  },
  {
    title: "Digital & analog solution",
    description:
      "Compatible with traditional denture fabrication and digital workflows using intra-oral or model scanners. Supports two-visit digital denture production.",
  },
  {
    title: "POP Bow system integration",
    description:
      "When used with the POP Bow, occlusal plane, upper lip position, and maxillary anterior tooth location transfer accurately to the technician.",
  },
];

const packageItems = [
  { label: "Upper tray × 5 EA", image: "/images/jb-tray/upper-tray.jpg", alt: "JB Tray upper tray" },
  { label: "Lower tray × 5 EA", image: "/images/jb-tray/lower-tray.jpg", alt: "JB Tray lower tray" },
  { label: "POP Bow × 5 sets", image: "/images/jb-tray/pop-bow.jpg", alt: "POP Bow for JB Tray" },
];

const maxillaSteps = [
  { n: 1, title: "Tray softening", body: "Soften in warm water at 70–75°C for about 1 minute until the moldable section is pliable." },
  { n: 2, title: "Border molding & shaping", body: "Working time over 2 minutes; repeat softening if needed for precise adaptation." },
  { n: 3, title: "Tray adhesive & impression", body: "Apply adhesive and impression material for the final maxillary impression. POP Bow can attach to the handle; remove handle if both jaws are taken at once for lip and facial evaluation." },
];

const mandibleSteps = [
  { n: 1, title: "Tray softening", body: "70–75°C for approximately 1 minute." },
  { n: 2, title: "Border molding & shaping", body: "Repeat as needed for mandibular adaptation." },
  { n: 3, title: "Vertical dimension", body: "Adjust VD rods using 1 mm graduations (anterior 5 mm / posterior 4 mm)." },
  { n: 4, title: "Tray adhesive & impression", body: "Closed-mouth impression technique with tray adhesive and impression material." },
  { n: 5, title: "Centric relation", body: "Record CR with silicone bite registration or wax. Attach POP Bow to the lower border of the upper lip in rest position to transfer occlusal plane and anterior tooth position." },
];

const maxillaParts = [
  "Moldable part — thermoplastic section",
  "Frame — rigid structural frame",
  "Handle — tray handle",
  "POP Bow connection",
  "V-cut — pre-scored line for handle removal",
];

const mandibleParts = [
  "Moldable part — thermoplastic section",
  "Frame — rigid structural frame",
  "Handle — tray handle",
  "VD rods — anterior 5 mm / posterior 4 mm, 1 mm graduations",
];

export default function JBTray() {
  return (
    <section id="jb-tray" className="py-20 px-6 bg-white border-t border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
          <div>
            <p className="text-[11px] font-medium text-[#0F6E56] uppercase tracking-[0.08em] mb-2">
              JB & JD Design · PNUADD
            </p>
            <h2 className="text-[32px] font-semibold text-[#1B2B3A] tracking-tight leading-tight mb-4">
              JB Tray — Just Border
            </h2>
            <p className="text-[15px] text-[#6B7280] leading-relaxed mb-4">
              The dental impression tray that replaces individual trays. Designed to complete both
              the final impression and jaw relation recording in a single streamlined procedure.
            </p>
            <p className="text-[14px] text-[#6B7280] leading-relaxed mb-6">
              Content aligned with the official{" "}
              <a
                href={JB_JD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0F6E56] font-medium hover:underline"
              >
                JB & JD Design
              </a>{" "}
              clinical guide. Scan your JB Tray records and order definitive dentures at PrintDenture
              — without a separate wax-rim visit.
            </p>
            <a
              href={JB_JD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-medium text-[#378ADD] hover:text-[#1D4ED8]"
            >
              Full JB Tray guide & videos →
            </a>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#E5E7EB] bg-[#F7FAF9]">
            <Image
              src="/images/jb-tray/product.jpg"
              alt="JB Tray — Just Border impression tray by PNUADD"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-[#E5E7EB] bg-[#F7FAF9] p-5 hover:border-[#0F6E56]/40 transition-colors"
            >
              <h3 className="text-[15px] font-semibold text-[#1B2B3A] mb-2">{f.title}</h3>
              <p className="text-[13px] text-[#6B7280] leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        <div className="mb-16">
          <h3 className="text-xl font-semibold text-[#1B2B3A] mb-2">Package contents</h3>
          <p className="text-sm text-[#6B7280] mb-6">Standard kit configuration per JB & JD Design.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {packageItems.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-[#E5E7EB] overflow-hidden bg-white"
              >
                <div className="relative aspect-square bg-[#F3F4F6]">
                  <Image src={item.image} alt={item.alt} fill className="object-cover" sizes="33vw" />
                </div>
                <p className="text-sm font-medium text-[#1B2B3A] p-4 text-center">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h3 className="text-xl font-semibold text-[#1B2B3A] mb-2">Tray structure</h3>
          <p className="text-sm text-[#6B7280] mb-8 max-w-2xl">
            Functionally segmented design enables border molding, impression taking, jaw relation
            recording, and POP Bow connection in one workflow.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <h4 className="font-semibold text-[#1B2B3A] mb-3">Maxillary tray</h4>
                <ul className="space-y-1.5 text-[13px] text-[#6B7280]">
                  {maxillaParts.map((p) => (
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
                <h4 className="font-semibold text-[#1B2B3A] mb-3">Mandibular tray</h4>
                <ul className="space-y-1.5 text-[13px] text-[#6B7280]">
                  {mandibleParts.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="text-[#0F6E56]">·</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          <div>
            <h3 className="text-lg font-semibold text-[#1B2B3A] mb-4">Maxillary application</h3>
            <ol className="space-y-4">
              {maxillaSteps.map((s) => (
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
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#1B2B3A] mb-4">Mandibular application</h3>
            <ol className="space-y-4">
              {mandibleSteps.map((s) => (
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
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-lg font-semibold text-[#1B2B3A] mb-4">Clinical outcomes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/images/jb-tray/articulator.jpg"
                  alt="Articulator mounting based on POP Bow plane"
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              </div>
              <p className="text-sm font-medium text-[#1B2B3A] p-4 text-center">
                Articulator mounting based on POP Bow plane
              </p>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image
                  src="/images/jb-tray/denture-fabrication.jpg"
                  alt="Artificial teeth arrangement and denture fabrication"
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              </div>
              <p className="text-sm font-medium text-[#1B2B3A] p-4 text-center">
                Artificial teeth arrangement & denture fabrication
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#9FE1CB] bg-[#E1F5EE]/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#085041] mb-1">Ready to send JB Tray cases?</p>
            <p className="text-[13px] text-[#0F6E56] leading-relaxed max-w-xl">
              After chairside records, upload scans to PrintDenture for definitive fabrication without
              try-in when digital criteria are met.
            </p>
          </div>
          <Link
            href="/auth?next=%2Forder"
            className="shrink-0 h-11 px-6 rounded-xl bg-[#0F6E56] hover:bg-[#085041] text-white text-sm font-medium inline-flex items-center justify-center transition-colors"
          >
            Start an order
          </Link>
        </div>
      </div>
    </section>
  );
}
