import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import VisitComparison from "@/components/visit-comparison";
import { JbProtocolChooser } from "@/components/jb-protocol-chooser";
import JBTray from "@/components/jb-tray";
import JBFork from "@/components/jb-fork";
import HowItWorks from "@/components/how-it-works";
import Products from "@/components/products";
import WhyPrintDenture from "@/components/why-printdenture";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8F7F4] text-[#1A1A1A]">
      <Navbar />
      <Hero />
      <VisitComparison />
      <section className="py-16 px-6 bg-[#F7FAF9] border-y border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto">
          <JbProtocolChooser variant="full" />
        </div>
      </section>
      <JBTray />
      <JBFork />
      <HowItWorks />
      <Products />
      <WhyPrintDenture />
      <Footer />
    </main>
  );
}
