import { Header, Footer } from "@/components";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />
      
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <span className="text-[#F59E0B] font-bold tracking-[0.2em] uppercase text-xs">
          Legal
        </span>
        <h1 className="font-display text-3xl font-extrabold text-[#0F172A] mt-2 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-[#64748B] mb-6">
            Last updated: January 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-4 border-l-4 border-[#F59E0B] pl-4">1. Information We Collect</h2>
            <p className="text-[#64748B] mb-4">
              When you use WingsEd, we collect information you provide directly to us:
            </p>
            <ul className="list-disc pl-6 text-[#64748B] space-y-2">
              <li>Account information (name, email) via Clerk authentication</li>
              <li>Profile preferences (budget, preferred countries, field of study)</li>
              <li>Test scores you choose to share (GRE, GMAT, IELTS, TOEFL)</li>
              <li>University search and browsing activity</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-4 border-l-4 border-[#F59E0B] pl-4">2. How We Use Your Information</h2>
            <p className="text-[#64748B] mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-[#64748B] space-y-2">
              <li>Provide personalized university recommendations</li>
              <li>Connect you with our counselors via WhatsApp</li>
              <li>Improve our services and user experience</li>
              <li>Send you relevant updates about your application journey</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-4 border-l-4 border-[#F59E0B] pl-4">3. Data Sharing</h2>
            <p className="text-[#64748B] mb-4">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-[#64748B] space-y-2">
              <li>Our counseling team to provide personalized guidance</li>
              <li>Service providers who help us operate our platform (Clerk, hosting providers)</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-4 border-l-4 border-[#F59E0B] pl-4">4. Data Security</h2>
            <p className="text-[#64748B]">
              We implement industry-standard security measures to protect your data, including 
              encrypted connections (HTTPS), secure authentication via Clerk, and regular security 
              audits of our systems.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-4 border-l-4 border-[#F59E0B] pl-4">5. Your Rights</h2>
            <p className="text-[#64748B] mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-[#64748B] space-y-2">
              <li>Access your personal data</li>
              <li>Update or correct your information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-4 border-l-4 border-[#F59E0B] pl-4">6. Contact Us</h2>
            <p className="text-[#64748B]">
              For privacy-related questions, contact us via WhatsApp or email at privacy@wingsed.com
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
