const reasons = [
  {
    iconClass: "text-[#0F6E56] bg-[#E1F5EE]",
    title: "Less chair time per denture",
    description:
      "One records visit with JB Fork instead of separate preliminary, custom tray, and wax-rim appointments — your team stays in production, not impression management.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    iconClass: "text-[#378ADD] bg-[#DBEAFE]",
    title: "Eliminate the try-in visit",
    description:
      "Aligned facial, CBCT, and IOS data give the lab enough confidence to fabricate the definitive prosthesis — patients skip a try-in appointment entirely.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    iconClass: "text-[#1D9E75] bg-[#E1F5EE]",
    title: "Scan once, order online",
    description:
      "No courier confusion or paper Rx — upload from 3Shape / Exocad and track the case in your dashboard from scan submission to FedEx delivery.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    iconClass: "text-[#0F6E56] bg-[#E1F5EE]",
    title: "Built for full-arch records",
    description:
      "Unlike crown-first lab portals, PrintDenture expects edentulous datasets — JB Fork markers, jaw relation, and esthetic references are first-class inputs.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    iconClass: "text-[#378ADD] bg-[#DBEAFE]",
    title: "California fabrication",
    description:
      "US technicians, predictable FedEx delivery, and HIPAA-compliant case handling — no offshore surprises on full-arch cases.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m0 0A9.004 9.004 0 0112 21" />
      </svg>
    ),
  },
  {
    iconClass: "text-[#1D9E75] bg-[#E1F5EE]",
    title: "Same login as PrintCrown",
    description:
      "One Supabase practice account across our digital lab family when you order crowns and dentures from the same group.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
];

export default function WhyPrintDenture() {
  return (
    <section id="why" className="py-20 px-6 bg-[#F7FAF9] border-t border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <p className="text-[11px] font-medium text-[#0F6E56] mb-2 tracking-[0.08em] uppercase">
            Why PrintDenture
          </p>
          <h2 className="text-[32px] font-semibold text-[#1B2B3A] tracking-tight leading-tight">
            The lab built for the JB Fork digital path
          </h2>
          <p className="text-[15px] text-[#6B7280] mt-3 max-w-2xl mx-auto">
            General online labs treat dentures like crowns with a try-in bolted on. We designed
            PrintDenture around one-visit capture and direct-to-definitive fabrication.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="p-6 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#0F6E56] transition-colors duration-200"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${r.iconClass}`}>
                {r.icon}
              </div>
              <h3 className="text-[14px] font-semibold text-[#1B2B3A] mb-2">{r.title}</h3>
              <p className="text-[13px] text-[#6B7280] leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
