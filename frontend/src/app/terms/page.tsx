import { Header, Footer } from "@/components";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />
      
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <span className="text-[#F59E0B] font-bold tracking-[0.2em] uppercase text-xs">
          Legal
        </span>
        <h1 className="font-display text-3xl font-extrabold text-[#0F172A] mt-2 mb-8">Terms of Service</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-[#64748B] mb-6">
            Last updated: January 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-4 border-l-4 border-[#F59E0B] pl-4">1. Acceptance of Terms</h2>
            <p className="text-[#64748B]">
              By accessing or using WingsEd, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-4 border-l-4 border-[#F59E0B] pl-4">2. Services Description</h2>
            <p className="text-[#64748B] mb-4">
              WingsEd provides:
            </p>
            <ul className="list-disc pl-6 text-[#64748B] space-y-2">
              <li>University discovery and search tools for Indian students seeking postgraduate education abroad</li>
              <li>Personalized university recommendations based on your preferences</li>
              <li>Connection to counseling services via WhatsApp</li>
              <li>Educational content and guidance about studying abroad</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-4 border-l-4 border-[#F59E0B] pl-4">3. User Responsibilities</h2>
            <p className="text-[#64748B] mb-4">
              As a user, you agree to:
            </p>
            <ul className="list-disc pl-6 text-[#64748B] space-y-2">
              <li>Provide accurate and truthful information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the platform for legitimate educational purposes only</li>
              <li>Not attempt to abuse, hack, or disrupt our services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-4 border-l-4 border-[#F59E0B] pl-4">4. Information Accuracy</h2>
            <p className="text-[#64748B]">
              While we strive to provide accurate and up-to-date information about universities, 
              fees, and requirements, this information is subject to change. We recommend verifying 
              all details directly with the respective universities before making decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-4 border-l-4 border-[#F59E0B] pl-4">5. Counseling Services</h2>
            <p className="text-[#64748B]">
              Our counselors provide guidance based on their expertise and the information you provide. 
              Final admission decisions are made by universities, and we cannot guarantee acceptance 
              to any specific institution.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-4 border-l-4 border-[#F59E0B] pl-4">6. Intellectual Property</h2>
            <p className="text-[#64748B]">
              All content on WingsEd, including text, graphics, logos, and software, is the 
              property of WingsEd and protected by intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-4 border-l-4 border-[#F59E0B] pl-4">7. Limitation of Liability</h2>
            <p className="text-[#64748B]">
              WingsEd provides services &ldquo;as is&rdquo; without warranties of any kind. We are not 
              liable for any damages arising from the use of our platform or reliance on 
              information provided through our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-4 border-l-4 border-[#F59E0B] pl-4">8. Modifications</h2>
            <p className="text-[#64748B]">
              We reserve the right to modify these terms at any time. Continued use of our 
              services after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-4 border-l-4 border-[#F59E0B] pl-4">9. Contact</h2>
            <p className="text-[#64748B]">
              For questions about these terms, contact us via WhatsApp or email at legal@wingsed.com
            </p>
          </section>
        </div>

        <div className="mt-8 pt-8 border-t border-[#E2E8F0]">
          <Link href="/" className="text-[#3B82F6] hover:text-[#2563EB] hover:underline transition-colors">
            ← Back to Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
