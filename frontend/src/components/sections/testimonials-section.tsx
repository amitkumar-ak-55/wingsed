"use client";

import { ScrollReveal } from "@/components/ui/scroll-reveal";

const testimonials = [
  {
    name: "Nothari Suran",
    before: "Tier 2 College",
    after: "TU Munich, RWTH Aachen",
    outcome: "3 Admits",
    funding: "₹18L Scholarship",
    quote:
      "The AI engine caught details in my profile that consultants missed. I went from a Tier 2 college to a world-class German University.",
    avatar: "NS",
    avatarBg: "#3B82F6",
  },
  {
    name: "Ananya Verma",
    before: "Liberal Arts Major",
    after: "UPenn, Columbia University",
    outcome: "Ivy League Admit",
    funding: "Fully Funded RA",
    quote:
      "WingsEd treats your career like an architectural project. Precise, structured, and focused on the end goal.",
    avatar: "AV",
    avatarBg: "#F59E0B",
  },
];

function StarRow() {
  return (
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className="w-4 h-4 text-[#F59E0B]"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-24 bg-[#F1F5F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="mb-14">
            <span className="text-[#F59E0B] font-bold tracking-[0.2em] uppercase text-xs">
              Architecting Outcomes
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F172A] mt-2 tracking-tight">
              Student Success Stories
            </h2>
          </div>
        </ScrollReveal>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 120}>
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E2E8F0] flex flex-col sm:flex-row gap-6 sm:gap-8 items-start hover:shadow-lg transition-shadow duration-300">
                {/* Avatar */}
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0"
                  style={{ background: t.avatarBg }}
                >
                  {t.avatar}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <StarRow />

                  <h4 className="text-xl font-bold text-[#0F172A] mb-1">{t.name}</h4>
                  <p className="text-sm text-[#64748B] font-medium mb-5">
                    Previous: {t.before} | Final:{" "}
                    <span className="text-[#0F172A] font-semibold">{t.after}</span>
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-3 bg-[#F8FAFC] rounded-xl">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        Outcome
                      </p>
                      <p className="text-sm font-bold text-[#0F172A]">{t.outcome}</p>
                    </div>
                    <div className="p-3 bg-[#F8FAFC] rounded-xl">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        Funding
                      </p>
                      <p className="text-sm font-bold text-[#F59E0B]">{t.funding}</p>
                    </div>
                  </div>

                  {/* Quote */}
                  <p className="text-[#64748B] text-sm italic leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
