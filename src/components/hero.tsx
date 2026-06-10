import Link from "next/link";
import { JB_FORK_GUIDE_PATH, JB_FORK_VIDEOS } from "@/lib/guides/jb-fork-guide";
import { JB_TRAY_GUIDE_PATH, JB_TRAY_VIDEOS } from "@/lib/guides/jb-tray-guide";

const highlights = [
  { value: "5 → 3", label: "Visits with JB Tray protocol" },
  { value: "0", label: "Try-in with PrintDenture" },
  { value: "2", label: "Visits to delivery (some cases)" },
  { value: "1 step", label: "Impression + jaw relation" },
];

const heroVideos = [
  { ...JB_TRAY_VIDEOS[0], label: "JB Tray", guideHref: JB_TRAY_GUIDE_PATH },
  { ...JB_FORK_VIDEOS[0], label: "JB Fork Radi+", guideHref: JB_FORK_GUIDE_PATH },
] as const;

export default function Hero() {
  return (
    <section className="relative bg-[#0D1B2A] pt-[4.25rem] overflow-hidden">
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
              Your practice captures records with{" "}
              <strong className="text-[#E1F5EE] font-medium">JB Tray</strong> or{" "}
              <strong className="text-[#E1F5EE] font-medium">JB Fork Radi+</strong>, then scans and
              uploads — our California lab handles{" "}
              <strong className="text-[#E1F5EE] font-medium">design and fabrication</strong>. No
              chairside CAD, no try-in visit.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link
                href="/auth?next=%2Fshop"
                className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white h-12 px-8 text-[15px] font-medium rounded-xl inline-flex items-center justify-center transition-colors"
              >
                Get JB starter kit
              </Link>
              <Link
                href="/auth?next=%2Forder"
                className="h-12 px-8 text-[15px] rounded-xl border border-[#1E3347] text-[#9FE1CB] hover:bg-[#132337] inline-flex items-center justify-center transition-colors"
              >
                Submit a lab case
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
            <p className="text-[11px] font-medium text-[#5DCAA5] uppercase tracking-[0.1em] mb-2">
              The PrintDenture difference
            </p>
            <p className="text-[13px] text-[#7CA0B8] leading-relaxed mb-6">
              You capture and scan. We design and fabricate — no Exocad or 3Shape denture design
              required in your office.
            </p>
            <ol className="space-y-0">
              {[
                {
                  id: "records",
                  step: "Your practice",
                  title: "JB Tray or JB Fork records",
                  body: "Final impression, vertical dimension, and centric relation in one visit — JB Tray chairside protocol or JB Fork Radi+ for aligned facial, CBCT, and IOS data.",
                },
                {
                  id: "scan-submit",
                  step: "Your practice",
                  title: "Scan & submit",
                  body: "Export scan files from your intraoral, model, or CBCT scanner. Upload records and complete a digital Rx on PrintDenture — that is all we need from you.",
                },
                {
                  id: "lab-fabrication",
                  step: "PrintDenture lab",
                  title: "Design & fabrication",
                  body: "Our technicians design the definitive prosthesis in CAD from your scan set, then fabricate in our California lab.",
                },
                {
                  id: "delivery",
                  step: "Delivery",
                  title: "Definitive denture — no try-in",
                  body: "Patient returns for delivery, not a try-in fitting. Verified JB records let us skip the interim try-in stage.",
                },
              ].map((item, i) => (
                <li key={item.id} className="flex gap-4 pb-6 last:pb-0">
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

        <div className="mt-14 lg:mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
            <div>
              <p className="text-[11px] font-medium text-[#5DCAA5] uppercase tracking-[0.1em] mb-1">
                See it in action
              </p>
              <p className="text-[15px] text-[#9FE1CB] leading-relaxed">
                One chairside demo from each workflow — full guides have more videos and step-by-step
                protocols.
              </p>
            </div>
            <Link
              href="/guides/jb-fork"
              className="text-[13px] font-medium text-[#7CA0B8] hover:text-[#9FE1CB] shrink-0 transition-colors"
            >
              JB Fork guide →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {heroVideos.map((video) => (
              <div
                key={video.youtubeId}
                className="rounded-xl border border-[#1E3347] overflow-hidden bg-[#132337]/80 backdrop-blur-sm"
              >
                <div className="relative aspect-video bg-[#0D1B2A]">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}`}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-medium text-[#5DCAA5] uppercase tracking-wider mb-1">
                      {video.label}
                    </p>
                    <p className="text-[14px] font-semibold text-white">{video.title}</p>
                    <p className="text-[12px] text-[#7CA0B8] mt-1 leading-relaxed">{video.description}</p>
                  </div>
                  <Link
                    href={video.guideHref}
                    className="text-[13px] font-medium text-[#9FE1CB] hover:text-white shrink-0 transition-colors"
                  >
                    Full guide →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
