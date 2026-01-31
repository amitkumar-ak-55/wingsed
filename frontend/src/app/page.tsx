import { Header, Footer, WhatsAppButton } from "@/components";
import {
  HeroSection,
  CountryStrip,
  HowItWorksSection,
  TestimonialsSection,
  CTASection,
} from "@/components/sections";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        <CountryStrip />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
