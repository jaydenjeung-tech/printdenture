import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 px-6 bg-[#1A1A1A] text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center">
                <span className="text-[#1A1A1A] text-xs font-bold">PC</span>
              </div>
              <span className="font-semibold text-lg">
                Print<span className="text-[#60A5FA]">Crown</span>
              </span>
            </div>
            <p className="text-sm text-[#9B9B9B] leading-relaxed">
              US-based digital dental lab. Zirconia crowns, printed restorations,
              and custom appliances — shipped to your practice.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] mb-4">Products</p>
              <ul className="space-y-2 text-sm text-[#9B9B9B]">
                <li><Link href="#" className="hover:text-white transition-colors">Zirconia Crown</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Printed Crown</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Night Guard</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Sports Guard</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] mb-4">Company</p>
              <ul className="space-y-2 text-sm text-[#9B9B9B]">
                <li><Link href="#" className="hover:text-white transition-colors">How it works</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy policy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-[#2A2A2A] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#6B6B6B]">© 2025 PrintCrown. All rights reserved.</p>
          <p className="text-xs text-[#6B6B6B]">Made in the USA · HIPAA Compliant</p>
        </div>
      </div>
    </footer>
  );
}