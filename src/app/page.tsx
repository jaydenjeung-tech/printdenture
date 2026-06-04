import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import VisitComparison from "@/components/visit-comparison";
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
      <JBFork />
      <HowItWorks />
      <Products />
      <WhyPrintDenture />
      <Footer />
    </main>
  );
}
