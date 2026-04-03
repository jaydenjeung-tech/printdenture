const reasons = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    color: "text-[#16A34A] bg-[#F0FDF4]",
    title: "No contracts or minimums",
    description: "Order one unit or a hundred. No monthly commitments, no setup fees, no surprises.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    color: "text-[#2563EB] bg-[#EFF6FF]",
    title: "5–7 day turnaround",
    description: "Same-day case processing. FedEx shipping with real-time tracking on every order.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
      </svg>
    ),
    color: "text-[#D97706] bg-[#FFFBEB]",
    title: "Under 3% remake rate",
    description: "Digital precision means fewer remakes. Free remake guaranteed if we get it wrong.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
    ),
    color: "text-[#9333EA] bg-[#FDF4FF]",
    title: "Direct lab communication",
    description: "Message your technician directly on every case. No phone tag, no middlemen.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
      </svg>
    ),
    color: "text-[#0891B2] bg-[#ECFEFF]",
    title: "HIPAA compliant",
    description: "All patient files are encrypted, stored securely, and never shared with third parties.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/>
      </svg>
    ),
    color: "text-[#DC2626] bg-[#FEF2F2]",
    title: "Made in California",
    description: "All restorations fabricated in our California facility. Fast domestic shipping, every time.",
  },
];

const materials = [
  { name: "Vatech Zirconia", sub: "Made from Japanese powder" },
  { name: "Rodin (Sculpture 2.0)", sub: "60% ceramic filler" },
  { name: "Keystone Industries", sub: "KeySplint Soft" },
  { name: "Grpahy(TE-151)", sub: "Tera flex" },
];

export default function WhyPrintCrown() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <p className="text-sm font-medium text-[#2563EB] mb-2 tracking-wide uppercase">Why PrintCrown</p>
          <h2 className="text-4xl font-bold text-[#1A1A1A] tracking-tight">
            Built for independent
            <br />
            dental practices
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {reasons.map((r) => (
            <div key={r.title}
              className="p-6 rounded-2xl border border-[#E2E0D8] bg-[#F8F7F4] hover:border-[#C8C6BE] hover:shadow-sm transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${r.color}`}>
                {r.icon}
              </div>
              <h3 className="font-semibold text-[#1A1A1A] mb-2">{r.title}</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>

        {/* Materials section */}
        <div className="bg-[#F8F7F4] rounded-3xl border border-[#E2E0D8] p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9B9B9B] mb-2">Materials</p>
              <h3 className="text-xl font-bold text-[#1A1A1A]">Premium materials only</h3>
              <p className="text-sm text-[#6B6B6B] mt-1 max-w-xs">
                We use the same materials trusted by top dental labs worldwide.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {materials.map((m) => (
                <div key={m.name} className="bg-white rounded-xl border border-[#E2E0D8] px-4 py-3 text-center">
                  <p className="text-xs font-semibold text-[#1A1A1A]">{m.name}</p>
                  <p className="text-[10px] text-[#9B9B9B] mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}