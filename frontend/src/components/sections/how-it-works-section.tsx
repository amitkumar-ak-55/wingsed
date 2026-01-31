"use client";

import Link from "next/link";

const services = [
  {
    title: "University Discovery",
    description: "Browse 50+ universities across 12 countries. Filter by budget, field of study, and location to find your perfect match.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    accent: "bg-[#2563EB]",
  },
  {
    title: "Personalized Matching",
    description: "Answer a few questions about your preferences and get AI-powered university recommendations tailored just for you.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    accent: "bg-[#22C55E]",
  },
  {
    title: "WhatsApp Counseling",
    description: "One tap to connect with expert counselors on WhatsApp. Get real-time guidance on applications, visas, and scholarships.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    accent: "bg-[#F59E0B]",
  },
  {
    title: "Application Support",
    description: "From document preparation to interview tips, we guide you through every step of your university application process.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    accent: "bg-[#8B5CF6]",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-[#22C55E] rounded-full" />
              <span className="text-sm font-semibold text-[#22C55E] uppercase tracking-wider">
                Services
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111827]">
              What we offer
            </h2>
          </div>
          <p className="text-[#6B7280] max-w-md">
            At WingsEd, we provide end-to-end support to help 
            Indian students achieve their study abroad dreams.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group bg-white border-2 border-[#E5E7EB] rounded-2xl p-8 hover:border-[#111827] transition-all duration-300 animate-slideUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col h-full">
                {/* Title */}
                <h3 className="text-xl font-bold text-[#111827] mb-3">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-[#6B7280] mb-6 flex-grow">
                  {service.description}
                </p>

                {/* Footer with icon and link */}
                <div className="flex items-center justify-between">
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors"
                  >
                    <span className={`w-8 h-8 ${service.accent} rounded-full flex items-center justify-center`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                    Learn more
                  </Link>

                  {/* Decorative icon */}
                  <div className="w-16 h-16 bg-[#F9FAFB] rounded-xl flex items-center justify-center text-[#374151] group-hover:bg-[#111827] group-hover:text-white transition-all duration-300">
                    {service.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
