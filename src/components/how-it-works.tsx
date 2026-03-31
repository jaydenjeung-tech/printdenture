const steps = [
  {
    number: "01",
    title: "Upload your scan",
    description:
      "Drag and drop your STL file directly from 3Shape, Medit, or any intraoral scanner. No special software needed.",
  },
  {
    number: "02",
    title: "Choose & confirm",
    description:
      "Select product type, shade, and material. Get an instant price. No hidden fees, no account minimums.",
  },
  {
    number: "03",
    title: "We fabricate & ship",
    description:
      "Our team processes your case same day. Ships via FedEx with tracking. Delivered in 5–7 business days.",
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
            in three steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[calc(100%_-_16px)] w-8 h-px bg-[#E2E0D8] z-10" />
              )}
              <div className="text-5xl font-bold text-[#E2E0D8] mb-4 leading-none">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">{step.title}</h3>
              <p className="text-[#6B6B6B] leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}