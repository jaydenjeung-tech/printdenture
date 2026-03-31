import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Products from "@/components/products";
import HowItWorks from "@/components/how-it-works";
import WhyPrintCrown from "@/components/why-printcrown";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8F7F4] text-[#1A1A1A]">
      <Navbar />
      <Hero />
      <Products />
      <HowItWorks />
      <WhyPrintCrown />
      <Footer />
    </main>
  );
}