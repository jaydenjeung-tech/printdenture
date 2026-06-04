import Link from "next/link";

const highlights = [
  { value: "5 → 3", label: "Visits with JB Tray protocol" },
  { value: "0", label: "Try-in with PrintDenture" },
  { value: "2", label: "Visits to delivery (some cases)" },
  { value: "1 step", label: "Impression + jaw relation" },
];

export default function Hero() {
  return (
    <section className="relative bg-[#0D1B2A] pt-16 overflow-hidden">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 20%, #1D9E75 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 10% 80%, #378ADD 0%, transparent 50%)",
        }}
        aria-hidden
      />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          <div>
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                "JB & JD · JB Tray workflow",
                "JB Fork Radi+ digital",
                "No try-in lab path",
              ].map((label) => (
                <span
                  key={label}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-[#1E3347] bg-[#132337] text-[#9FE1CB]"
                >
                  {label}
                </span>
              ))}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold text-white leading-[1.06] tracking-[-2px] mb-6">
              Capture everything
              <br />
              in one visit.
              <br />
              <span className="text-[#5DCAA5]">Deliver without try-in.</span>
            </h1>

            <p className="text-[17px] text-[#7CA0B8] leading-relaxed mb-8 max-w-[500px]">
              PrintDenture is built for practices using{" "}
              <strong className="text-[#E1F5EE] font-medium">JB Fork</strong> and the{" "}
              <strong className="text-[#E1F5EE] font-medium">JB Tray</strong> workflow: final
              impression, bite, and facial data in a single chairside session — then scan, order
              online, and receive a definitive denture from our California lab.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link
                href="/auth?next=%2Forder"
                className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white h-12 px-8 text-[15px] font-medium rounded-xl inline-flex items-center justify-center transition-colors"
              >
                Start an order
              </Link>
              <Link
                href="#jb-tray"
                className="h-12 px-8 text-[15px] rounded-xl border border-[#1E3347] text-[#9FE1CB] hover:bg-[#132337] inline-flex items-center justify-center transition-colors"
              >
                JB Tray guide
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-[#1E3347]">
              {highlights.map((s) => (
                <div key={s.label}>
                  <p className="text-[22px] font-semibold text-white tracking-tight">{s.value}</p>
                  <p className="text-[11px] text-[#5A7D94] mt-0.5 leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#132337]/80 backdrop-blur-sm border border-[#1E3347] rounded-2xl p-6 lg:p-8">
            <p className="text-[11px] font-medium text-[#5DCAA5] uppercase tracking-[0.1em] mb-6">
              The PrintDenture difference
            </p>
            <ol className="space-y-0">
              {[
                {
                  step: "Chairside",
                  title: "JB Tray or JB Fork records",
                  body: "JB Tray: final impression + VD & centric relation in one visit (no individual tray / wax rim). JB Fork Radi+: markers for facial, CBCT & IOS alignment.",
                },
                {
                  step: "Scan",
                  title: "Digitize with your scanner",
                  body: "Intraoral, model, or CBCT object scan into Exocad / 3Shape — aligned datasets from JB Fork Radi+.",
                },
                {
                  step: "Order",
                  title: "Submit to PrintDenture",
                  body: "Upload scans, complete a digital Rx, and release to lab — no phone tag, no paper Rx.",
                },
                {
                  step: "Deliver",
                  title: "Definitive denture — no try-in",
                  body: "We fabricate from verified digital records. Patient returns for delivery, not a try-in fitting.",
                },
              ].map((item, i) => (
                <li key={item.step} className="flex gap-4 pb-6 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-lg bg-[#1D9E75]/20 border border-[#1D9E75]/40 flex items-center justify-center text-[11px] font-bold text-[#5DCAA5]">
                      {i + 1}
                    </div>
                    {i < 3 && <div className="w-px flex-1 bg-[#1E3347] mt-2 min-h-[24px]" />}
                  </div>
                  <div className="pt-0.5">
                    <p className="text-[10px] font-medium text-[#5A7D94] uppercase tracking-wider mb-1">
                      {item.step}
                    </p>
                    <p className="text-[15px] font-semibold text-white mb-1">{item.title}</p>
                    <p className="text-[13px] text-[#7CA0B8] leading-relaxed">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
