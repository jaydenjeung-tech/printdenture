const reasons = [
  {
    iconClass: "text-[#1D9E75] bg-[#E1F5EE]",
    title: "No contracts or minimums",
    description:
      "Order one arch or twenty. Pay per case with published pricing — no hidden setup fees or annual commitments.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    iconClass: "text-[#378ADD] bg-[#DBEAFE]",
    title: "Denture-first workflow",
    description:
      "Rx fields, tooth molds, try-in options, and implant components are built for removable cases — not retrofitted from crown software.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    iconClass: "text-[#0F6E56] bg-[#E1F5EE]",
    title: "California fabrication",
    description:
      "US-based technicians with predictable FedEx delivery. No international customs delays on patient cases.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m0 0A9.004 9.004 0 0112 21" />
      </svg>
    ),
  },
  {
    iconClass: "text-[#1D9E75] bg-[#E1F5EE]",
    title: "Free adjustment guarantee",
    description:
      "If the fit needs a minor tweak after delivery, we cover the adjustment — your chair time stays protected.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
      </svg>
    ),
  },
  {
    iconClass: "text-[#378ADD] bg-[#DBEAFE]",
    title: "Same account as PrintCrown",
    description:
      "Use one login across our digital lab family when your practice orders crowns and dentures — shared order history optional.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    iconClass: "text-[#0F6E56] bg-[#E1F5EE]",
    title: "Live case support",
    description:
      "Message technicians on active cases. Get shade, mold, and implant questions answered without waiting on hold.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
];

const materials = [
  { name: "Ivoclar Ivotion", sub: "Modular denture system", tag: "Premium teeth" },
  { name: "Dentsply Lucitone", sub: "Acrylic & liners", tag: "Industry standard" },
  { name: "Valplast Flexible", sub: "Clasp-free partials", tag: "Flexible partial" },
  { name: "Zest Locator", sub: "Overdenture attachments", tag: "Implant retained" },
];

export default function WhyPrintDenture() {
  return (
    <section className="py-20 px-6 bg-[#F7FAF9] border-t border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-[11px] font-medium text-[#0F6E56] mb-2 tracking-[0.08em] uppercase">
            Why PrintDenture
          </p>
          <h2 className="text-[32px] font-semibold text-[#1B2B3A] tracking-tight leading-tight">
            Built for removable
            <br />
            prosthetics teams
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="p-6 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#1B2B3A] transition-colors duration-200"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${r.iconClass}`}>
                {r.icon}
              </div>
              <h3 className="text-[14px] font-semibold text-[#1B2B3A] mb-2">{r.title}</h3>
              <p className="text-[13px] text-[#6B7280] leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-shrink-0">
              <p className="text-[11px] font-medium text-[#0F6E56] uppercase tracking-[0.08em] mb-2">
                Materials
              </p>
              <h3 className="text-[20px] font-semibold text-[#1B2B3A] mb-1">
                Brands your patients already trust
              </h3>
              <p className="text-[13px] text-[#6B7280] max-w-[260px]">
                We fabricate with the same material families used in leading US removable labs.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
              {materials.map((m) => (
                <div
                  key={m.name}
                  className="bg-[#F7FAF9] rounded-lg border border-[#E5E7EB] px-4 py-3 text-center"
                >
                  <p className="text-[12px] font-semibold text-[#1B2B3A]">{m.name}</p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">{m.sub}</p>
                  <span className="inline-block mt-2 text-[10px] font-medium bg-[#E1F5EE] text-[#085041] border border-[#9FE1CB] rounded px-2 py-0.5">
                    {m.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
