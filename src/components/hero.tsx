// ─── hero.tsx ───────────────────────────────────────────────────────────────
"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Hero() {
  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <Badge className="mb-6 bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] hover:bg-[#EFF6FF] text-xs font-medium px-3 py-1">
            Same-day processing · Ships in 5–7 days
          </Badge>

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

          <div className="flex flex-col sm:flex-row gap-3">
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

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["#BFDBFE","#BBF7D0","#FDE68A","#FECACA"].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#F8F7F4]" style={{ background: c }} />
                ))}
              </div>
              <span className="text-sm text-[#6B6B6B]">Trusted by GP practices across the US</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 fill-[#F59E0B]" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                ))}
              </div>
              <span className="text-sm text-[#6B6B6B]">5.0 · Remake rate under 3%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}