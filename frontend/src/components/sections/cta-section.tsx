"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function CTASection() {
  return (
    <section className="py-20 lg:py-24 bg-[#0F172A] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F59E0B]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <ScrollReveal>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Let&apos;s Plan Your
            <br />
            Journey Together.
          </h2>

          <p className="text-[#94A3B8] text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            We work with a limited number of students per intake to ensure personal
            attention. Skip the generic counseling sessions. Get an engineered shortlist
            built for your specific profile today.
          </p>

          {/* Buttons — Clear hierarchy: 1 primary gold, 1 ghost secondary */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center px-10 py-4 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold uppercase tracking-wider text-sm rounded-xl shadow-lg shadow-[#F59E0B]/25 transition-all duration-300 active:scale-[0.98]"
            >
              Get Free Shortlist
            </Link>
            <Link
              href="/universities"
              className="inline-flex items-center justify-center px-10 py-4 text-white/70 hover:text-white font-semibold text-sm rounded-xl border border-white/10 hover:border-white/25 hover:bg-white/5 transition-all duration-300"
            >
              Talk to an Expert
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
