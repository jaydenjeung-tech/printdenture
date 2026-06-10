import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "One-visit records — JB Tray or JB Fork",
    description:
      "JB Tray: soften at 70–75°C, border mold, final impression plus VD and centric relation with POP Bow as needed. JB Fork Radi+: capture facial/CBCT/IOS alignment in the same philosophy.",
    detail: "Clinical · 1 appointment",
    highlight: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Scan & upload your records",
    description:
      "Export scan files from intraoral, model, or CBCT capture. No denture design in your office — upload the dataset and release the case to PrintDenture.",
    detail: "IOS · Model · CBCT",
    highlight: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Complete your Rx & release",
    description:
      "Choose product, shade, and clinical notes in our online Rx, then checkout. Once submitted, our lab owns design and fabrication — no try-in path for verified JB workflows.",
    detail: "Online · HIPAA secure",
    highlight: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Lab design & fabrication",
    description:
      "Our California technicians design the definitive prosthesis in CAD from your aligned record set, then fabricate — no interim try-in shipment or extra patient visit for approval.",
    detail: "Skip try-in stage",
    highlight: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: "05",
    title: "Delivery to your practice",
    description:
      "UPS tracked shipment of the definitive denture. Patient returns for insertion — chair time focused on delivery and minor adjustment, not a try-in fitting.",
    detail: "UPS · CA lab",
    highlight: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-white border-t border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 max-w-2xl">
          <p className="text-[11px] font-medium text-[#0F6E56] mb-2 tracking-[0.08em] uppercase">
            How it works
          </p>
          <h2 className="text-[32px] font-semibold text-[#1B2B3A] tracking-tight leading-tight">
            From JB Fork impression to definitive denture
          </h2>
          <p className="text-[14px] text-[#6B7280] mt-3 leading-relaxed">
            Your practice handles records and scan upload. PrintDenture handles CAD design,
            fabrication, and delivery — no chairside denture design required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-[calc(100%_-_8px)] w-4 h-px bg-[#D1E8E0] z-10" />
              )}
              <div
                className={`rounded-xl border p-6 h-full transition-colors duration-200 ${
                  step.highlight
                    ? "bg-[#E1F5EE]/50 border-[#9FE1CB] hover:border-[#0F6E56]"
                    : "bg-[#F7FAF9] border-[#E5E7EB] hover:border-[#1B2B3A]"
                }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[28px] font-semibold text-[#D1E8E0] leading-none tracking-tight">
                    {step.number}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      step.highlight ? "bg-[#0F6E56] text-white" : "bg-[#E1F5EE] text-[#0F6E56]"
                    }`}
                  >
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-[14px] font-semibold text-[#1B2B3A] mb-2">{step.title}</h3>
                <p className="text-[13px] text-[#6B7280] leading-relaxed mb-5">{step.description}</p>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-[#6B7280] bg-white px-2.5 py-1 rounded-full border border-[#E1F5EE]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] flex-shrink-0" />
                  {step.detail}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth?next=%2Forder"
            className="bg-[#0F6E56] hover:bg-[#085041] text-white text-[13px] font-medium px-6 py-3 rounded-xl transition-colors"
          >
            Upload scans & order
          </Link>
          <Link href="/support" className="text-[13px] text-[#0F6E56] hover:text-[#085041] font-medium">
            Questions about JB Fork cases? Contact us →
          </Link>
        </div>
      </div>
    </section>
  );
}
