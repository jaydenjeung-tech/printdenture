"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image"

export default function Hero() {
  return (
    <section className="pt-32 pb-24 px-6 bg-[#F8F7F4]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — Copy */}
          <div>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-[#E2E0D8] text-[#4B4B4B]">
                <svg className="w-3.5 h-3.5 text-[#16A34A]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1a9 9 0 100 18A9 9 0 0010 1zm3.707 7.293a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                HIPAA Compliant
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-[#E2E0D8] text-[#4B4B4B]">
                <svg className="w-3.5 h-3.5 text-[#2563EB]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                </svg>
                Made in California
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-[#E2E0D8] text-[#4B4B4B]">
                <svg className="w-3.5 h-3.5 text-[#D97706]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                5–7 Day Delivery
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-[#1A1A1A] leading-[1.08] tracking-tight mb-6">
              Dental restorations,
              <br />
              <span className="text-[#2563EB]">ordered in minutes.</span>
            </h1>

            <p className="text-xl text-[#6B6B6B] leading-relaxed mb-10 max-w-xl">
              Upload your STL, choose your restoration, and get precision-milled
              zirconia crowns and 3D-printed appliances delivered to your practice.
              No contracts. No minimums.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link href="/order">
                <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-12 px-8 text-base rounded-xl">
                  Start your first order
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" className="h-12 px-8 text-base rounded-xl border-[#E2E0D8] text-[#6B6B6B] hover:text-[#1A1A1A]">
                  See how it works
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#E2E0D8]">
              {[
                { value: "< 3%", label: "Remake rate" },
                { value: "5–7d", label: "Avg. delivery" },
                { value: "$0", label: "Setup fee" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{s.value}</p>
                  <p className="text-sm text-[#9B9B9B] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Product card */}
          <div>
            <div className="bg-white rounded-3xl border border-[#E2E0D8] p-6 shadow-xl">

              {/* Image area — replace with actual photo */}
              <Link href="/order">
                <div className="rounded-2xl mb-5 overflow-hidden relative cursor-pointer" style={{ aspectRatio: "4/3" }}>
                  <Image
                    src="/main_zirsample.png"
                    alt="Zirconia Crown"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-top hover:scale-105 transition-transform duration-300"
                    priority
                  />
                </div>
              </Link>

              {/* Product info */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">Full Contour Zirconia</p>
                    <p className="text-xs text-[#9B9B9B] mt-0.5">Milled · Sintered · Polished</p>
                  </div>
                  <p className="text-xl font-bold text-[#1A1A1A]">$59</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] font-medium">
                    Ships in 5–7d
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] font-medium">
                    In stock
                  </span>
                </div>

                {/* Specs grid */}
                <div className="border-t border-[#F0EEE8] pt-4 grid grid-cols-2 gap-3">
                  {[
                    { label: "Material", value: "Vatech Zirconia" },
                    { label: "Turnaround", value: "7-day" },
                    { label: "Shades", value: "A1–D4" },
                    { label: "Guarantee", value: "Free remake" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-[10px] text-[#9B9B9B] uppercase tracking-wide">{s.label}</p>
                      <p className="text-xs font-semibold text-[#1A1A1A] mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}