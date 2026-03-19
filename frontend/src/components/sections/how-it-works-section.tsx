"use client";

import { ScrollReveal } from "@/components/ui/scroll-reveal";

const valueProps = [
  {
    title: "1-on-1 guidance for every student",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    title: "Personalized shortlist strategy",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: "Honest advice over volume",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "We treat your journey personally",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="text-[#F59E0B] font-bold tracking-[0.2em] uppercase text-xs">
              Architect-Led Outcomes
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F172A] mt-3 tracking-tight">
              You&apos;re Not Just Another Applicant
            </h2>
          </div>
        </ScrollReveal>

        {/* Value Prop Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {valueProps.map((prop, i) => (
            <ScrollReveal key={prop.title} delay={i * 80}>
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 text-center hover:border-[#CBD5E1] hover:shadow-lg transition-all duration-300 group h-full">
                <div className="w-14 h-14 rounded-xl bg-[#0F172A]/5 flex items-center justify-center mx-auto mb-5 text-[#0F172A] group-hover:bg-[#F59E0B]/10 group-hover:text-[#F59E0B] transition-colors duration-300">
                  {prop.icon}
                </div>
                <h3 className="text-sm font-bold text-[#0F172A] leading-snug">
                  {prop.title}
                </h3>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Founder Quote */}
        <ScrollReveal delay={350}>
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto text-center">
            <blockquote className="text-[#0F172A] text-base sm:text-lg font-medium italic leading-relaxed">
              &ldquo;I personally review every shortlist before it reaches you&rdquo;
            </blockquote>
            <p className="text-[#64748B] text-sm font-semibold mt-4">
              — Founder, WingsEd
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
