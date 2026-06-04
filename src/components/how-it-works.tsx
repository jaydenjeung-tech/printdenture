import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Create your practice account",
    description:
      "Sign up with your practice details. Invite team members and save shipping preferences for repeat orders.",
    detail: "Free account · No minimums",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Upload records",
    description:
      "Submit intraoral STL, desktop scan, or photos of impressions. Compatible with 3Shape, Medit, iTero, and more.",
    detail: "STL · PLY · impression photos",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Complete digital Rx",
    description:
      "Select denture type, tooth mold, shade, occlusal scheme, and implant components. See live pricing before checkout.",
    detail: "Paperless Rx · HIPAA compliant",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Try-in & lab fabrication",
    description:
      "Optional try-in denture ships first when selected. Our California technicians finish the definitive prosthesis after approval.",
    detail: "Try-in workflow available",
    highlight: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
      </svg>
    ),
  },
  {
    number: "05",
    title: "Delivered to your practice",
    description:
      "FedEx tracking on every case. Definitive denture arrives polished, adjusted, and ready for patient delivery.",
    detail: "FedEx tracked · 7–14 business days",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-[#F7FAF9] border-t border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-[11px] font-medium text-[#0F6E56] mb-2 tracking-[0.08em] uppercase">
            How it works
          </p>
          <h2 className="text-[32px] font-semibold text-[#1B2B3A] tracking-tight leading-tight">
            From records to delivery
            <br />
            in five steps
          </h2>
          <p className="text-[14px] text-[#6B7280] mt-3 max-w-xl">
            Built for general dentists and prosthodontic teams who want a predictable removable
            workflow without phone calls and paper Rx forms.
          </p>
        </div>

        <div className="mb-12 rounded-2xl border border-[#E1F5EE] bg-white p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <div>
              <p className="text-[11px] font-medium text-[#378ADD] uppercase tracking-[0.08em] mb-2">
                Practice dashboard
              </p>
              <h3 className="text-[24px] font-semibold text-[#1B2B3A] tracking-tight leading-tight mb-3">
                Track every denture case in one place.
              </h3>
              <p className="text-[14px] text-[#6B7280] leading-relaxed max-w-xl">
                See case status, shipping labels, try-in approvals, and message your technician —
                the same experience your team knows from digital crown labs, tuned for removable
                prosthetics.
              </p>
            </div>
            <ul className="space-y-3">
              {[
                "Order history and invoices for every arch you submit.",
                "Upload additional records mid-case without restarting the Rx.",
                "Request rush, reline, or repair on completed cases from the dashboard.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-xl border border-[#E1F5EE] bg-[#F7FAF9] px-4 py-3"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0F6E56] flex-shrink-0" />
                  <span className="text-[13px] text-[#4B5563] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-[calc(100%_-_8px)] w-4 h-px bg-[#D1E8E0] z-10" />
              )}
              <div
                className={`rounded-xl border p-6 h-full transition-colors duration-200 ${
                  "highlight" in step && step.highlight
                    ? "bg-[#F0F9FF] border-[#BFDBFE] hover:border-[#378ADD]"
                    : "bg-white border-[#E5E7EB] hover:border-[#1B2B3A]"
                }`}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[28px] font-semibold text-[#D1E8E0] leading-none tracking-tight">
                    {step.number}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      "highlight" in step && step.highlight
                        ? "bg-[#DBEAFE] text-[#378ADD]"
                        : "bg-[#E1F5EE] text-[#0F6E56]"
                    }`}
                  >
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-[14px] font-semibold text-[#1B2B3A] mb-2">{step.title}</h3>
                <p className="text-[13px] text-[#6B7280] leading-relaxed mb-5">{step.description}</p>
                <div className="mt-auto">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[#6B7280] bg-[#F7FAF9] px-2.5 py-1 rounded-full border border-[#E1F5EE]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] flex-shrink-0" />
                    {step.detail}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/pricing"
            className="text-[13px] text-[#0F6E56] hover:text-[#085041] font-medium transition-colors"
          >
            View full pricing →
          </Link>
          <span className="hidden sm:inline text-[#D1D5DB]">·</span>
          <p className="text-[13px] text-[#9CA3AF]">
            Questions?{" "}
            <Link href="/support" className="text-[#0F6E56] hover:text-[#085041] font-medium transition-colors">
              Talk to our team
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
