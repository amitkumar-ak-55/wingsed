"use client";

import { testimonials } from "@/data/testimonials";
import Link from "next/link";

export function TestimonialsSection() {
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-[#F59E0B] rounded-full" />
              <span className="text-sm font-semibold text-[#F59E0B] uppercase tracking-wider">
                Case Study
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111827]">
              Success stories
            </h2>
          </div>
          <p className="text-[#6B7280] max-w-md">
            Explore real-life examples of students who achieved their 
            study abroad dreams through WingsEd.
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <div
              key={index}
              className="group bg-[#FAFAFA] border-2 border-[#E5E7EB] rounded-2xl p-6 hover:border-[#111827] transition-all duration-300 animate-slideUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Country flag */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">
                  {testimonial.country === "United Kingdom" && "🇬🇧"}
                  {testimonial.country === "United States" && "🇺🇸"}
                  {testimonial.country === "Germany" && "🇩🇪"}
                  {testimonial.country === "Australia" && "🇦🇺"}
                  {testimonial.country === "Canada" && "🇨🇦"}
                  {!["United Kingdom", "United States", "Germany", "Australia", "Canada"].includes(testimonial.country) && "🎓"}
                </span>
                <span className="text-sm font-medium text-[#6B7280]">
                  {testimonial.country}
                </span>
              </div>

              {/* Quote preview */}
              <p className="text-[#374151] mb-6 line-clamp-4">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author info */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#E5E7EB]">
                <div className="w-10 h-10 bg-[#111827] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-[#111827] text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-[#6B7280]">
                    {testimonial.program}
                  </div>
                </div>
              </div>

              {/* University */}
              <div className="text-sm text-[#111827] font-medium mb-4">
                {testimonial.university}
              </div>

              {/* Link */}
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] group-hover:underline underline-offset-4"
              >
                Start your journey
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
