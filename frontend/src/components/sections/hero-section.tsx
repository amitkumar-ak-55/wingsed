"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { COUNTRIES, LANDING_STATS } from "@/data/constants";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { getCountries, getLiveRecommendations } from "@/lib/api";
import { getCountryFlag } from "@/lib/utils";
import type { AdmitBucket, LiveRecommendationResult } from "@/types";

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

function DecisionEngineWidget() {
  const [gpa, setGpa] = useState(3.8);
  const [country, setCountry] = useState("");
  const [budget, setBudget] = useState(60);
  const [countries, setCountries] = useState<string[]>(() => COUNTRIES.map((item) => item.value));
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [liveEngine, setLiveEngine] = useState<LiveRecommendationResult | null>(null);
  const [isLiveEngineLoading, setIsLiveEngineLoading] = useState(false);
  const countryMenuRef = useRef<HTMLDivElement>(null);
  const liveEngineRequestId = useRef(0);

  const budgetMin = Math.max(10, budget - 20) * 100000;
  const budgetMax = budget * 100000;
  const chance = liveEngine?.summary.chance ?? Math.min(94, Math.max(36, Math.round(gpa * 20 + 10)));
  const profileStrength = liveEngine?.summary.profileStrength ?? (chance >= 80 ? "Strong" : chance >= 60 ? "Moderate" : "Building");
  const budgetLabel = `\u20B9${Math.max(10, budget - 20)}L - \u20B9${budget}L`;
  const selectedCountryLabel = country ? `${getCountryFlag(country)} ${country}` : "All Countries";

  const previewUnis = liveEngine?.recommendations.map((item) => ({
    id: item.university.id,
    name: getShortUniversityName(item.university.name),
    tag: item.bucket,
  })) ?? [
    { id: "fallback-safe", name: "Waterloo", tag: "Safe" as AdmitBucket },
    { id: "fallback-target", name: "TU Munich", tag: "Target" as AdmitBucket },
    { id: "fallback-reach", name: "Imperial", tag: "Reach" as AdmitBucket },
  ];

  useEffect(() => {
    let isActive = true;

    getCountries()
      .then((result) => {
        if (isActive && result.data?.countries.length) {
          setCountries(result.data.countries);
        }
      })
      .catch(() => {
        if (isActive) {
          setCountries(COUNTRIES.map((item) => item.value));
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!countryMenuRef.current?.contains(event.target as Node)) {
        setIsCountryMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    let isActive = true;
    const requestId = liveEngineRequestId.current + 1;
    liveEngineRequestId.current = requestId;
    setIsLiveEngineLoading(true);

    getLiveRecommendations({
      country: country || undefined,
      budgetMin,
      budgetMax,
      gpa,
      limit: 3,
    })
      .then((result) => {
        if (isActive && requestId === liveEngineRequestId.current && result.data) {
          setLiveEngine(result.data);
        }
      })
      .catch(() => {
        if (isActive && requestId === liveEngineRequestId.current) {
          setLiveEngine(null);
        }
      })
      .finally(() => {
        if (isActive && requestId === liveEngineRequestId.current) {
          setIsLiveEngineLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [budgetMax, budgetMin, country, gpa]);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-2xl shadow-[#0F172A]/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[#0F172A] font-bold text-lg">Your Personalized Shortlist</h3>
        <span className="text-[11px] bg-[#0F172A] text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
          Live Engine
        </span>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
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
              onChange={(event) => setGpa(Math.min(4, Math.max(0, parseFloat(event.target.value) || 0)))}
              className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-[#0F172A] font-bold text-sm focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Country
            </label>
            <div ref={countryMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsCountryMenuOpen((isOpen) => !isOpen)}
                className="flex w-full items-center justify-between bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-[#0F172A] font-bold text-sm focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] outline-none transition-colors"
                aria-haspopup="listbox"
                aria-expanded={isCountryMenuOpen}
              >
                <span className="truncate">{selectedCountryLabel}</span>
                <svg className="ml-2 h-4 w-4 shrink-0 text-[#0F172A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isCountryMenuOpen && (
                <div
                  className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-[#E2E8F0] bg-white py-1 shadow-xl shadow-[#0F172A]/15"
                  role="listbox"
                >
                  {["", ...countries].map((option) => {
                    const isSelected = option === country;
                    const label = option ? `${getCountryFlag(option)} ${option}` : "All Countries";

                    return (
                      <button
                        key={option || "all-countries"}
                        type="button"
                        className={`block w-full px-3 py-2 text-left text-sm font-semibold transition-colors ${
                          isSelected
                            ? "bg-[#F59E0B] text-white"
                            : "text-[#0F172A] hover:bg-[#F59E0B] hover:text-white"
                        }`}
                        onClick={() => {
                          setCountry(option);
                          setIsCountryMenuOpen(false);
                        }}
                        role="option"
                        aria-selected={isSelected}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

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
            max={120}
            value={budget}
            onChange={(event) => setBudget(Number(event.target.value))}
            className="w-full h-1.5 bg-[#E2E8F0] rounded-full appearance-none accent-[#F59E0B] cursor-pointer"
          />
        </div>

        <div className="pt-5 border-t border-[#E2E8F0]">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Profile Strength</p>
              <p className="text-lg font-bold text-[#0F172A]">{profileStrength}</p>
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

          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Architect&apos;s Selection</p>
            <div className="grid grid-cols-3 gap-2">
              {isLiveEngineLoading
                ? [0, 1, 2].map((index) => (
                  <div
                    key={`selection-skeleton-${index}`}
                    className="min-h-[70px] rounded-lg border border-[#E2E8F0] bg-white/70 p-3 shadow-md shadow-[#0F172A]/10"
                    aria-hidden="true"
                  >
                    <div className="mx-auto mb-2 h-3 w-16 animate-pulse rounded-full bg-[#CBD5E1]" />
                    <div className="mx-auto h-2.5 w-10 animate-pulse rounded-full bg-[#F59E0B]/35" />
                  </div>
                ))
                : previewUnis.map((university) => (
                  <div
                    key={university.id}
                    className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] text-center transition-colors hover:bg-[#FEF3C7] hover:border-[#F59E0B]/50"
                  >
                    <div className="text-xs font-bold text-[#0F172A] mb-1 truncate">{university.name}</div>
                    <div className={`text-[11px] font-bold uppercase ${getBucketColor(university.tag)}`}>
                      {university.tag}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

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

function getShortUniversityName(name: string) {
  const aliases: Record<string, string> = {
    "Massachusetts Institute of Technology": "MIT",
    "Technical University of Munich": "TU Munich",
    "Imperial College London": "Imperial",
    "National University of Singapore": "NUS",
    "University of California, Berkeley": "UC Berkeley",
  };

  return aliases[name] ?? name.replace(/^University of /, "U. of ");
}

function getBucketColor(bucket: AdmitBucket) {
  if (bucket === "Safe") return "text-green-600";
  if (bucket === "Target") return "text-[#D97706]";
  return "text-[#F59E0B]";
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0F172A]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full border-l border-white/5" />
        <div className="absolute top-1/4 left-0 w-full h-px border-t border-white/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#3B82F6]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pt-36 lg:pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
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

            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {["#3B82F6", "#F59E0B", "#22C55E"].map((bg, index) => (
                  <div
                    key={bg}
                    className="w-11 h-11 rounded-full border-2 border-[#0F172A] flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: bg }}
                  >
                    {["A", "R", "P"][index]}
                  </div>
                ))}
                <div className="w-11 h-11 rounded-full border-2 border-[#0F172A] bg-[#F59E0B] flex items-center justify-center text-xs font-bold text-[#0F172A]">
                  98%
                </div>
              </div>
              <span className="text-white text-sm font-medium">
                Join <span className="font-bold"><AnimatedCounter target={LANDING_STATS.studentsHelped} suffix="+" /></span> successful alumni
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200}>
            <DecisionEngineWidget />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
