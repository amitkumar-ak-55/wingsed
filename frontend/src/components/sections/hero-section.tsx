"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { LANDING_STATS } from "@/data/constants";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

/* ── Animated counter (reused from original) ── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── Decision‑Engine Widget ── */
function DecisionEngineWidget() {
  const [gpa, setGpa] = useState(3.8);
  const [country, setCountry] = useState("USA");
  const [budget, setBudget] = useState(60);

  // Simulated chance calc based on GPA
  const chance = Math.min(99, Math.round(gpa * 22 + (country === "Germany" ? 2 : 0)));
  const budgetLabel = `₹${Math.max(10, budget - 20)}L – ₹${budget}L`;

  const previewUnis = [
    { name: "MIT", tag: "Safe", color: "text-green-600" },
    { name: "TU Munich", tag: "Target", color: "text-amber-600" },
    { name: "Imperial", tag: "Reach", color: "text-blue-600" },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-2xl shadow-[#0F172A]/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[#0F172A] font-bold text-lg">Your Personalized Shortlist</h3>
        <span className="text-[11px] bg-[#0F172A] text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
          Live Engine
        </span>
      </div>

      {/* Inputs */}
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {/* GPA */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              GPA (Scale 4.0)
            </label>
            <input
              type="number"
              step={0.1}
              min={0}
              max={4}
              value={gpa}
              onChange={(e) => setGpa(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-[#0F172A] font-bold text-sm focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] outline-none transition-colors"
            />
          </div>
          {/* Country */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-[#0F172A] font-bold text-sm focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] outline-none transition-colors"
            >
              <option>USA</option>
              <option>Germany</option>
              <option>UK</option>
              <option>Canada</option>
              <option>Australia</option>
            </select>
          </div>
        </div>

        {/* Budget slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Budget Range
            </label>
            <span className="text-sm font-bold text-[#F59E0B]">{budgetLabel}</span>
          </div>
          <input
            type="range"
            min={20}
            max={100}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-1.5 bg-[#E2E8F0] rounded-full appearance-none accent-[#F59E0B] cursor-pointer"
          />
        </div>

        {/* Chances */}
        <div className="pt-5 border-t border-[#E2E8F0]">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Profile Strength</p>
              <p className="text-lg font-bold text-[#0F172A]">{chance >= 80 ? "Strong" : chance >= 60 ? "Moderate" : "Building"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Your Chances</p>
              <p className="text-lg font-bold text-[#F59E0B]">{chance}%</p>
            </div>
          </div>
          <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${chance}%` }}
            />
          </div>

          {/* Preview colleges */}
          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Architect&apos;s Selection</p>
            <div className="grid grid-cols-3 gap-2">
              {previewUnis.map((u) => (
                <div key={u.name} className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] text-center">
                  <div className="text-xs font-bold text-[#0F172A] mb-1">{u.name}</div>
                  <div className={`text-[11px] font-bold uppercase ${u.color}`}>{u.tag}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/onboarding"
          className="block w-full text-center bg-[#F59E0B] hover:bg-[#D97706] text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg shadow-[#F59E0B]/25 transition-all duration-300 active:scale-[0.98]"
        >
          See Your Personalized Plan
        </Link>
      </div>
    </div>
  );
}

/* ── Main Hero Section ── */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0F172A]">
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full border-l border-white/5" />
        <div className="absolute top-1/4 left-0 w-full h-px border-t border-white/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#3B82F6]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pt-36 lg:pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left: Copy ── */}
          <ScrollReveal direction="up">
            <span className="inline-block text-[#F59E0B] font-bold tracking-[0.2em] uppercase text-xs mb-6">
              The Decision-First Architect
            </span>

            <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 font-display">
              Shortlist Universities That{" "}
              <span className="text-[#F59E0B]">Actually Fit You.</span>
            </h1>

            <p className="text-[#94A3B8] text-base sm:text-lg max-w-lg mb-10 leading-relaxed">
              Stop guessing. Use architectural precision and historical data to
              engineer your global education journey.
            </p>

            {/* Social proof avatars */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {["#3B82F6", "#F59E0B", "#22C55E"].map((bg, i) => (
                  <div
                    key={i}
                    className="w-11 h-11 rounded-full border-2 border-[#0F172A] flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: bg }}
                  >
                    {["A", "R", "P"][i]}
                  </div>
                ))}
                <div className="w-11 h-11 rounded-full border-2 border-[#0F172A] bg-[#F59E0B] flex items-center justify-center text-xs font-bold text-[#0F172A]">
                  98%
                </div>
              </div>
              <span className="text-white text-sm font-medium">
                Join <span className="font-bold">{LANDING_STATS.studentsHelped.toLocaleString()}+</span> successful alumni
              </span>
            </div>
          </ScrollReveal>

          {/* ── Right: Decision Engine Widget ── */}
          <ScrollReveal direction="up" delay={200}>
            <DecisionEngineWidget />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
