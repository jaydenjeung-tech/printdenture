const reasons = [
  {
    icon: "⚡",
    title: "No contracts or minimums",
    description: "Order one unit or a hundred. No monthly commitments, no setup fees.",
  },
  {
    icon: "📦",
    title: "5–7 day turnaround",
    description: "Same-day case processing. FedEx shipping with real-time tracking.",
  },
  {
    icon: "🎯",
    title: "Under 3% remake rate",
    description: "Digital precision means fewer remakes. Free remake if we get it wrong.",
  },
  {
    icon: "💬",
    title: "Direct lab communication",
    description: "Message your technician directly on every case. No middlemen.",
  },
  {
    icon: "🔒",
    title: "HIPAA compliant",
    description: "All patient files are encrypted and stored securely.",
  },
  {
    icon: "🇺🇸",
    title: "Made in the USA",
    description: "All restorations fabricated in our US facility.",
  },
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="p-6 rounded-2xl border border-[#E2E0D8] bg-[#F8F7F4] hover:border-[#C8C6BE] transition-colors"
            >
              <div className="text-2xl mb-4">{r.icon}</div>
              <h3 className="font-semibold text-[#1A1A1A] mb-2">{r.title}</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}