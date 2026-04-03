const steps = [
  {
    number: "01",
    title: "Upload your scan",
    description: "Drag and drop your STL file directly from 3Shape, Medit, or any intraoral scanner. No special software needed.",
    detail: "Compatible with all major scanners",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
      </svg>
    ),
  },
  {
    number: "02",
    title: "Choose & confirm",
    description: "Select product type, shade, and material. Complete your Rx online. Get an instant price with no hidden fees.",
    detail: "Digital Rx — paperless & HIPAA compliant",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/>
      </svg>
    ),
  },
  {
    number: "03",
    title: "We fabricate",
    description: "Your case enters our California lab same day. CAD/CAM milled, sintered, and quality-checked by our technicians.",
    detail: "CAD/CAM milled in California",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"/>
      </svg>
    ),
  },
  {
    number: "04",
    title: "Delivered to your door",
    description: "Ships via UPS with tracking. Arrives in 5–7 business days, packaged to protect every restoration.",
    detail: "UPS tracked · 5–7 business days",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-[#F8F7F4]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <p className="text-sm font-medium text-[#2563EB] mb-2 tracking-wide uppercase">How it works</p>
          <h2 className="text-4xl font-bold text-[#1A1A1A] tracking-tight">
            From scan to delivery
            <br />
            in four steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(100%_-_12px)] w-6 h-px bg-[#E2E0D8] z-10" />
              )}

              <div className="bg-white rounded-2xl border border-[#E2E0D8] p-6 h-full hover:border-[#C8C6BE] hover:shadow-sm transition-all">
                {/* Number + Icon */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl font-bold text-[#E2E0D8] leading-none">{step.number}</span>
                  <div className="w-10 h-10 rounded-xl bg-[#F8F7F4] flex items-center justify-center text-[#2563EB]">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-base font-semibold text-[#1A1A1A] mb-2">{step.title}</h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed mb-4">{step.description}</p>

                {/* Detail badge */}
                <div className="mt-auto">
                  <span className="inline-flex items-center gap-1 text-xs text-[#9B9B9B] bg-[#F8F7F4] px-2.5 py-1 rounded-full border border-[#E2E0D8]">
                    <svg className="w-3 h-3 text-[#16A34A]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    {step.detail}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-[#9B9B9B]">
            Questions? <a href="/support" className="text-[#2563EB] hover:underline font-medium">Talk to our team</a>
          </p>
        </div>
      </div>
    </section>
  );
}