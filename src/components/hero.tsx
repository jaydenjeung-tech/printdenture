"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";

const SLIDES = [
  {
    image: "/main_zirsample.png",
    alt: "Full Contour Zirconia",
    name: "Full Contour Zirconia",
    sub: "Milled · Sintered · Polished · Glazed",
    price: "$59",
    specs: [
      { label: "Material",   value: "Vatech Zirconia" },
      { label: "Turnaround", value: "7-day" },
      { label: "Shades",     value: "A1–D4, OM" },
      { label: "Guarantee",  value: "Free adjustment" },
    ],
  },
  {
    image: "/Hard-Night-Guard.png",
    alt: "Night Guard",
    name: "Hard Night Guard",
    sub: "3D Printed · Polished · Dual-laminate",
    price: "$49",
    specs: [
      { label: "Material",   value: "Keystone KeySplint" },
      { label: "Turnaround", value: "5-day" },
      { label: "Type",       value: "Hard / Dual-laminate" },
      { label: "Guarantee",  value: "Free adjustment" },
    ],
  },
  {
    image: "/Sculpture.png",
    alt: "Print Crown",
    name: "Print Crown",
    sub: "3D Printed · Custom fit",
    price: "$45",
    specs: [
      { label: "Material",   value: "Rodin 2.0 sculpture" },
      { label: "Turnaround", value: "5-day" },
      { label: "Colors",     value: "6 options" },
      { label: "Guarantee",  value: "Free adjustment" },
    ],
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <section className="bg-[#E1F5EE]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[620px]">

          {/* Left */}
          <div className="flex flex-col justify-center py-20 pr-0 lg:pr-16 border-b lg:border-b-0 lg:border-r border-[#9FE1CB]">

            {/* Trust pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { label: "HIPAA compliant",    dot: "#0F6E56" },
                { label: "Made in California", dot: "#1D9E75" },
                { label: "5–7 day delivery",   dot: "#5DCAA5" },
              ].map((t) => (
                <span key={t.label}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full bg-white border border-[#9FE1CB] text-[#085041]">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: t.dot }} />
                  {t.label}
                </span>
              ))}
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-[56px] font-semibold text-[#0F2336] leading-[1.06] tracking-[-2px] mb-5">
              From your scanner
              <br />
              to your patient,
              <br />
              <span className="text-[#0F6E56]">in days.</span>
            </h1>

            <p className="text-[17px] text-[#085041] leading-relaxed mb-10 max-w-[440px]">
              Upload your STL, choose your restoration, and get precision-milled
              zirconia crowns and 3D-printed appliances delivered to your practice.
              No contracts. No minimums.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link href="/order">
                <Button className="bg-[#0F6E56] hover:bg-[#085041] text-white h-12 px-8 text-[15px] font-medium rounded-xl transition-colors">
                  Start your first order
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline"
                  className="h-12 px-8 text-[15px] rounded-xl border-[#9FE1CB] bg-transparent text-[#0F6E56] hover:bg-[#9FE1CB]/30 hover:border-[#0F6E56] transition-colors">
                  See how it works
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 pt-8 border-t border-[#9FE1CB]">
              {[
                { value: "< 3%", label: "Remake rate" },
                { value: "5–7d", label: "Avg. delivery" },
                { value: "$0",   label: "Setup fee" },
                { value: "500+", label: "Active practices" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-[22px] font-semibold text-[#0F2336] tracking-tight">{s.value}</p>
                  <p className="text-[11px] text-[#1D9E75] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Card */}
          <div className="flex flex-col justify-center items-center pt-28 pb-16 px-8 bg-[#E1F5EE] min-h-[620px]">

          <div className="w-full max-w-[520px] mx-auto mb-3">
            <p className="text-[11px] font-medium text-[#1D9E75] uppercase tracking-[0.08em]">
              Featured product
            </p>
          </div>

          <div className="w-full max-w-[520px] mx-auto bg-white rounded-2xl border border-[#9FE1CB] overflow-hidden">

            <Link href="/order">
              <div className="relative overflow-hidden cursor-pointer" style={{ aspectRatio: "4/3" }}>
                <Image
                  key={slide.image}
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  sizes="520px"
                  className="object-cover object-top hover:scale-105 transition-transform duration-300"
                  priority
                />
                <span className="absolute top-3 left-3 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#0F2336]/70 text-white border border-white/20 backdrop-blur-sm z-10">
                  {slide.alt}
                </span>
                <span className="absolute top-3 right-3 text-[14px] font-semibold px-3 py-1.5 rounded-lg bg-[#0F6E56] text-white z-10">
                  {slide.price}
                </span>
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
                    <button key={i} onClick={() => setCurrent(i)}
                      className={`h-1 rounded-full transition-all duration-200 ${
                        i === current ? "bg-[#0F6E56] w-5" : "bg-[#9FE1CB] w-1.5"
                      }`}
                    />
                  ))}
                </div>
                <Link href="/order">
                  <Button className="bg-[#0F6E56] hover:bg-[#085041] text-white h-8 px-4 text-[12px] font-medium rounded-lg transition-colors">
                    Order now →
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[520px] mx-auto mt-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F6E56]" />
            <span className="text-[11px] text-[#1D9E75]">In stock · Ships today · Free adjustment guarantee</span>
          </div>

        </div>

        </div>
      </div>
    </section>
  );
}