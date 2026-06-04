import Image from "next/image";
import Link from "next/link";

const captureItems = [
  {
    title: "Final impressions",
    description:
      "Upper and lower impressions with JB Fork in place — patient closes comfortably with the device centered in the oral cavity.",
    tag: "Chairside",
    image: "/images/jb-fork/impression-chairside.jpg",
    alt: "JB Fork Radi+ intraoral impression in the maxilla",
  },
  {
    title: "Bite & jaw relation",
    description:
      "Centric relation and vertical dimension captured in the same session, compatible with closed-mouth techniques used with JB Tray.",
    tag: "One step",
    image: "/images/jb-fork/records-complete.jpg",
    alt: "Completed JB Fork jaw relation and intraoral records",
  },
  {
    title: "Facial & CBCT alignment",
    description:
      "Radiopaque anterior markers and guide pins align facial scanner data (e.g. RAYFace), CBCT, and intraoral scans into one dataset.",
    tag: "JB Fork Radi+",
    image: "/images/jb-fork/components.jpg",
    alt: "JB Fork Radi+ components with anterior markers",
  },
  {
    title: "Esthetic reference",
    description:
      "Lip line and anterior tooth position transfer to the lab — analogous to POP bow information in the JB Tray system.",
    tag: "Lab-ready",
    image: "/images/jb-fork/jb-tray.jpg",
    alt: "JB Tray for one-step impression and jaw relation",
  },
];

const scanMethods = [
  "Intraoral scanner",
  "Desktop model scanner",
  "CBCT object scan",
  "3Shape · Exocad workflow",
];

export default function JBFork() {
  return (
    <section id="jb-fork" className="py-20 px-6 bg-[#F7FAF9] border-t border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-14">
          <div>
            <p className="text-[11px] font-medium text-[#0F6E56] uppercase tracking-[0.08em] mb-2">
              JB Fork Radi+ · digital workflow
            </p>
            <h2 className="text-[32px] font-semibold text-[#1B2B3A] tracking-tight leading-tight mb-4">
              Align facial scan,
              <br />
              CBCT & IOS in one dataset.
            </h2>
            <p className="text-[15px] text-[#6B7280] leading-relaxed mb-6">
              JB Fork is designed for edentulous and full-arch cases: an impression plate with
              anterior markers and guide pins so facial scan, CBCT, and IOS data register together —
              the foundation for a true one-visit clinical protocol.
            </p>
            <p className="text-[14px] text-[#6B7280] leading-relaxed mb-6">
              Pair with{" "}
              <a href="#jb-tray" className="text-[#0F6E56] font-medium hover:underline">
                JB Tray
              </a>{" "}
              chairside records (see{" "}
              <a
                href="https://tomabranding.mycafe24.com/jb-jd/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0F6E56] font-medium hover:underline"
              >
                JB & JD Design
              </a>
              ) or use JB Fork Radi+ alone for implant and full-arch digital cases — then send
              aligned scans to PrintDenture.
            </p>
            <div className="flex flex-wrap gap-2">
              {scanMethods.map((m) => (
                <span
                  key={m}
                  className="text-[12px] px-3 py-1.5 rounded-full bg-white border border-[#9FE1CB] text-[#085041]"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white shadow-sm">
            <div className="relative aspect-[4/3] bg-[#0D1B2A]">
              <Image
                src="/images/jb-fork/product.jpg"
                alt="JB Fork Radi+ impression and jaw relation device"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/90 via-[#0D1B2A]/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <p className="text-[11px] font-medium text-[#5DCAA5] uppercase tracking-widest mb-2">
                  Digital capture → PrintDenture
                </p>
                <p className="text-[13px] text-[#E2E8F0] leading-relaxed">
                  Markers align facial scanner, CBCT, and impression scans — then you order at{" "}
                  <span className="text-[#5DCAA5] font-medium">printdenture.com</span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[#E5E7EB]">
              <div className="relative aspect-[16/10] bg-[#F7FAF9]">
                <Image
                  src="/images/jb-fork/digital-workflow.jpg"
                  alt="Digital denture workflow with JB Fork"
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </div>
              <div className="relative aspect-[16/10] bg-[#F7FAF9]">
                <Image
                  src="/images/jb-fork/workflow-benefits.jpg"
                  alt="JB Fork one-visit jaw relation recording benefits"
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </div>
            </div>
            <p className="text-[10px] text-[#9CA3AF] px-4 py-2.5 border-t border-[#E5E7EB]">
              Product photos:{" "}
              <a
                href="https://seilglobal.com/ProstheticDentistry/?bmode=view&idx=170650429"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0F6E56] hover:underline"
              >
                Seil Global — JB FORK RADI+
              </a>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {captureItems.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden hover:border-[#0F6E56] transition-colors"
            >
              <div className="relative aspect-[4/3] bg-[#F3F4F6]">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="p-5">
                <span className="text-[10px] font-medium text-[#0F6E56] bg-[#E1F5EE] border border-[#9FE1CB] px-2 py-0.5 rounded-full">
                  {item.tag}
                </span>
                <h3 className="text-[15px] font-semibold text-[#1B2B3A] mt-3 mb-2">{item.title}</h3>
                <p className="text-[13px] text-[#6B7280] leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-xl border border-[#BFDBFE] bg-[#F0F9FF] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[14px] font-semibold text-[#1B2B3A] mb-1">Why skip try-in?</p>
            <p className="text-[13px] text-[#4B5563] max-w-xl leading-relaxed">
              When impression, jaw relation, and facial references are captured and aligned in one
              verified digital workflow, our technicians can proceed directly to definitive
              fabrication — saving a chair appointment and weeks on the schedule.
            </p>
          </div>
          <Link
            href="#how-it-works"
            className="flex-shrink-0 text-[13px] font-medium text-[#378ADD] hover:text-[#1D4ED8]"
          >
            Full step-by-step →
          </Link>
        </div>
      </div>
    </section>
  );
}
