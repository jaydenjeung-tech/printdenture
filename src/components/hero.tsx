"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const SLIDES = [
  {
    id: "complete",
    name: "Complete dentures",
    sub: "Premium teeth · Custom gingiva · Try-in workflow",
    specs: [
      { label: "Arch", value: "Upper / lower / set" },
      { label: "Turnaround", value: "10–14 days" },
      { label: "Teeth", value: "Premium & economy lines" },
      { label: "Guarantee", value: "Free adjustment" },
    ],
    gradient: "from-[#0F6E56] to-[#1B2B3A]",
  },
  {
    id: "partial",
    name: "Flexible partials",
    sub: "Valplast-style · Metal framework · Digital design",
    specs: [
      { label: "Type", value: "Flexible / cast metal" },
      { label: "Turnaround", value: "7–10 days" },
      { label: "Records", value: "Scan or impression" },
      { label: "Guarantee", value: "Free adjustment" },
    ],
    gradient: "from-[#1D9E75] to-[#085041]",
  },
  {
    id: "overdenture",
    name: "Implant overdentures",
    sub: "Locator · Bar · All-on-4 compatible",
    specs: [
      { label: "System", value: "Locator / bar retained" },
      { label: "Turnaround", value: "12–16 days" },
      { label: "Records", value: "Scan + implant info" },
      { label: "Guarantee", value: "Free adjustment" },
    ],
    gradient: "from-[#378ADD] to-[#1B2B3A]",
  },
];

function DentureVisual({ slideId }: { slideId: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-10">
      <svg viewBox="0 0 200 120" className="w-full max-w-[280px] opacity-90" aria-hidden>
        <ellipse cx="100" cy="72" rx="78" ry="28" fill="white" fillOpacity="0.15" />
        <path
          d="M28 72 Q100 28 172 72 Q100 98 28 72"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeOpacity="0.6"
        />
        {slideId === "partial" && (
          <path d="M55 68 L95 58 L145 68" stroke="#9FE1CB" strokeWidth="3" fill="none" strokeLinecap="round" />
        )}
        {slideId === "overdenture" && (
          <>
            <circle cx="72" cy="78" r="4" fill="#9FE1CB" />
            <circle cx="100" cy="82" r="4" fill="#9FE1CB" />
            <circle cx="128" cy="78" r="4" fill="#9FE1CB" />
          </>
        )}
        {[40, 58, 76, 94, 112, 130, 148, 160].map((x, i) => (
          <rect
            key={x}
            x={x - 5}
            y={58 - (i % 2) * 2}
            width="10"
            height="14"
            rx="2"
            fill="white"
            fillOpacity={0.35 + (i % 3) * 0.1}
          />
        ))}
      </svg>
      <p className="absolute bottom-6 left-6 right-6 text-[11px] text-white/70 uppercase tracking-widest">
        {slideId === "complete" && "Full arch restoration"}
        {slideId === "partial" && "Removable partial"}
        {slideId === "overdenture" && "Implant retained"}
      </p>
    </div>
  );
}

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <section className="bg-[#E1F5EE] pt-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[620px]">
          <div className="flex flex-col justify-center py-20 pr-0 lg:pr-16 border-b lg:border-b-0 lg:border-r border-[#9FE1CB]">
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { label: "Digital Rx online", dot: "#378ADD" },
                { label: "HIPAA compliant", dot: "#0F6E56" },
                { label: "7–14 day delivery", dot: "#5DCAA5" },
              ].map((t) => (
                <span
                  key={t.label}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full bg-white border border-[#9FE1CB] text-[#085041]"
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: t.dot }} />
                  {t.label}
                </span>
              ))}
            </div>

            <h1 className="text-5xl md:text-[56px] font-semibold text-[#0F2336] leading-[1.06] tracking-[-2px] mb-5">
              Dentures your patients
              <br />
              love — ordered
              <br />
              <span className="text-[#0F6E56]">online in minutes.</span>
            </h1>

            <p className="text-[17px] text-[#085041] leading-relaxed mb-10 max-w-[460px]">
              Upload scans or impressions, complete a digital Rx for complete, partial, or implant
              overdenture cases, and track every case from your practice dashboard. California lab
              fabrication with transparent per-arch pricing.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link
                href="/order"
                className="bg-[#0F6E56] hover:bg-[#085041] text-white h-12 px-8 text-[15px] font-medium rounded-xl inline-flex items-center justify-center transition-colors"
              >
                Start an order
              </Link>
              <Link
                href="#how-it-works"
                className="h-12 px-8 text-[15px] rounded-xl border border-[#9FE1CB] bg-transparent text-[#0F6E56] hover:bg-[#9FE1CB]/30 inline-flex items-center justify-center transition-colors"
              >
                See how it works
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-[#9FE1CB]">
              {[
                { value: "100%", label: "Digital workflow" },
                { value: "< 3%", label: "Remake rate" },
                { value: "7–14d", label: "Avg. delivery" },
                { value: "$0", label: "Setup fee" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-[22px] font-semibold text-[#0F2336] tracking-tight">{s.value}</p>
                  <p className="text-[11px] text-[#1D9E75] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center items-center pt-12 pb-16 px-8 bg-[#E1F5EE] min-h-[520px] lg:min-h-[620px]">
            <div className="w-full max-w-[520px] mx-auto mb-3">
              <p className="text-[11px] font-medium text-[#1D9E75] uppercase tracking-[0.08em]">
                Featured product
              </p>
            </div>

            <div className="w-full max-w-[520px] mx-auto bg-white rounded-2xl border border-[#9FE1CB] overflow-hidden">
              <Link href="/order" className="block">
                <div
                  className={`relative overflow-hidden bg-gradient-to-br ${slide.gradient}`}
                  style={{ aspectRatio: "4/3" }}
                >
                  <DentureVisual slideId={slide.id} />
                </div>
              </Link>

              <div className="p-6">
                <div className="mb-4">
                  <p className="font-semibold text-[#0F2336] text-[16px]">{slide.name}</p>
                  <p className="text-[11px] text-[#1D9E75] mt-0.5">{slide.sub}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-4 border-b border-[#E1F5EE]">
                  {slide.specs.map((s) => (
                    <div key={s.label}>
                      <p className="text-[10px] text-[#5DCAA5] uppercase tracking-wide">{s.label}</p>
                      <p className="text-[12px] font-semibold text-[#0F2336] mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {SLIDES.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Show slide ${i + 1}`}
                        onClick={() => setCurrent(i)}
                        className={`h-1 rounded-full transition-all duration-200 ${
                          i === current ? "bg-[#0F6E56] w-5" : "bg-[#9FE1CB] w-1.5"
                        }`}
                      />
                    ))}
                  </div>
                  <Link
                    href="/order"
                    className="bg-[#0F6E56] hover:bg-[#085041] text-white h-8 px-4 text-[12px] font-medium rounded-lg inline-flex items-center transition-colors"
                  >
                    Order now →
                  </Link>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[520px] mx-auto mt-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F6E56]" />
              <span className="text-[11px] text-[#1D9E75]">
                Try-in included · FedEx tracked · Free adjustment guarantee
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
