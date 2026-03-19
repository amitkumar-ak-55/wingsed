"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { LANDING_STATS } from "@/data/constants";

/* ── Animated counter ── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const dur = 2000, steps = 60, inc = target / steps;
          let cur = 0;
          const t = setInterval(() => {
            cur += inc;
            if (cur >= target) { setCount(target); clearInterval(t); }
            else setCount(Math.floor(cur));
          }, dur / steps);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── Stats data ── */
const trustStats = [
  { value: LANDING_STATS.studentsHelped, suffix: "+", label: "Students Placed" },
  { value: LANDING_STATS.universitiesCount, suffix: "+", label: "Partner Universities" },
  { value: LANDING_STATS.successRate, suffix: "%", label: "Visa Success Rate" },
  { value: 120, suffix: "Cr+", label: "Scholarships Secured", prefix: "₹" },
];

/* ── University shortlist preview data ── */
const previewUniversities = [
  {
    abbr: "MIT",
    name: "Massachusetts Institute of Technology",
    location: "Cambridge, USA",
    rank: "#1",
    fitScore: "92%",
    tuition: "₹45L/Yr",
    admitProb: "85%",
    admitColor: "text-green-600",
  },
  {
    abbr: "TUM",
    name: "Technical University of Munich",
    location: "Munich, Germany",
    rank: "#50",
    fitScore: "95%",
    tuition: "₹0 – ₹2L/Yr",
    admitProb: "65%",
    admitColor: "text-amber-600",
  },
  {
    abbr: "ICL",
    name: "Imperial College London",
    location: "London, UK",
    rank: "#6",
    fitScore: "88%",
    tuition: "₹38L/Yr",
    admitProb: "72%",
    admitColor: "text-amber-600",
  },
];

export function CountryStrip() {
  return (
    <>
      {/* ──── Trust Bar ──── */}
      <section className="bg-white py-12 border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {trustStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl sm:text-4xl font-black text-[#0F172A] font-display">
                    {stat.prefix || ""}
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mt-1.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── Shortlist Preview Carousel ──── */}
      <section className="py-20 lg:py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <div>
                <span className="text-[#F59E0B] font-bold tracking-[0.2em] uppercase text-xs">
                  Curated Selection
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F172A] mt-2 tracking-tight">
                  The Shortlist Preview
                </h2>
              </div>
            </div>
          </ScrollReveal>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {previewUniversities.map((uni, i) => (
              <ScrollReveal key={uni.abbr} delay={i * 100}>
                <div className="bg-white p-6 rounded-2xl shadow-[0_4px_24px_rgba(15,23,42,0.04)] border border-[#E2E8F0] flex flex-col h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 bg-[#F1F5F9] rounded-xl flex items-center justify-center font-bold text-[#0F172A] text-sm">
                      {uni.abbr}
                    </div>
                    <span className="text-[11px] bg-[#EFF6FF] text-[#3B82F6] font-bold uppercase px-2.5 py-1 rounded-full">
                      Rank {uni.rank}
                    </span>
                  </div>

                  {/* Name + location */}
                  <h4 className="text-lg font-bold text-[#0F172A] mb-1 leading-tight">{uni.name}</h4>
                  <p className="text-sm text-[#64748B] mb-6">{uni.location}</p>

                  {/* Stats */}
                  <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Fit Score</span>
                      <span className="text-sm font-bold text-[#F59E0B]">{uni.fitScore}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Avg Tuition</span>
                      <span className="text-sm font-bold text-[#0F172A]">{uni.tuition}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Admit Prob.</span>
                      <span className={`text-sm font-bold ${uni.admitColor}`}>{uni.admitProb}</span>
                    </div>
                  </div>

                  {/* CTA button — solid soft fill (not outline) */}
                  <button className="w-full py-3 text-sm font-bold bg-[#F1F5F9] text-[#0F172A] rounded-xl hover:bg-[#0F172A] hover:text-white transition-all duration-300">
                    View Details
                  </button>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
