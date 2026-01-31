"use client";

import Link from "next/link";
import { LANDING_STATS } from "@/data/constants";

export function HeroSection() {
  return (
    <section className="relative bg-[#FAFAFA] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="animate-fadeIn">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#111827] rounded-full text-sm font-semibold mb-8">
              <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
              {LANDING_STATS.studentsHelped}+ students placed
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111827] leading-[1.1] mb-6">
              Navigate your
              <br />
              <span className="relative inline-block">
                study abroad
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8.5C50 2.5 150 2.5 198 8.5" stroke="#2563EB" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </span>
              <br />
              journey
            </h1>

            {/* Description */}
            <p className="text-lg text-[#6B7280] mb-8 max-w-md">
              Our platform helps Indian postgrad students discover their perfect 
              university through personalized recommendations, budget filters, 
              and expert WhatsApp counseling.
            </p>

            {/* CTA */}
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#111827] text-white font-semibold rounded-full hover:bg-[#374151] transition-all duration-200 group"
            >
              Book a consultation
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Right Visual */}
          <div className="relative animate-slideUp">
            {/* Main illustration container */}
            <div className="relative bg-white border-2 border-[#111827] rounded-3xl p-8 shadow-[8px_8px_0px_0px_#111827]">
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#2563EB] rounded-xl flex items-center justify-center rotate-12">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              
              <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-[#22C55E] rounded-lg flex items-center justify-center -rotate-6">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-6 text-center">
                  <div className="text-4xl font-bold text-[#111827] mb-1">{LANDING_STATS.universitiesCount}+</div>
                  <div className="text-sm text-[#6B7280]">Universities</div>
                </div>
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-6 text-center">
                  <div className="text-4xl font-bold text-[#111827] mb-1">{LANDING_STATS.countriesCount}</div>
                  <div className="text-sm text-[#6B7280]">Countries</div>
                </div>
                <div className="bg-[#2563EB] rounded-2xl p-6 text-center">
                  <div className="text-4xl font-bold text-white mb-1">{LANDING_STATS.successRate}%</div>
                  <div className="text-sm text-blue-100">Success Rate</div>
                </div>
                <div className="bg-[#111827] rounded-2xl p-6 text-center">
                  <div className="text-4xl font-bold text-white mb-1">24/7</div>
                  <div className="text-sm text-gray-300">Support</div>
                </div>
              </div>

              {/* Floating icons */}
              <div className="absolute top-1/2 -left-6 w-12 h-12 bg-white border-2 border-[#E5E7EB] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎓</span>
              </div>
              <div className="absolute top-4 left-1/2 w-10 h-10 bg-white border-2 border-[#E5E7EB] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xl">✈️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
