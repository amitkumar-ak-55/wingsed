import { Header, Footer, WhatsAppButton, FlightPathOverlay } from "@/components";
import {
  HeroSection,
  CountryStrip,
  HowItWorksSection,
  TestimonialsSection,
  AdvisorChatSection,
  CTASection,
} from "@/components/sections";

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <CountryStrip />
        <TestimonialsSection />
        <AdvisorChatSection />
        <CTASection />
      </main>

      <Footer />
      <WhatsAppButton />
      <FlightPathOverlay />
    </div>
  );
}

