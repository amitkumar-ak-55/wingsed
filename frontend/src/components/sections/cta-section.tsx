"use client";

import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-[#111827] border-2 border-[#111827] rounded-3xl p-8 sm:p-12 overflow-hidden shadow-[8px_8px_0px_0px_#2563EB]">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563EB]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#22C55E]/20 rounded-full blur-3xl" />
          
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            {/* Left content */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Let&apos;s make things happen
              </h2>
              <p className="text-gray-400 mb-8 max-w-md">
                Contact us today to learn more about how our counseling 
                services can help you achieve your study abroad dreams.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#111827] font-semibold rounded-full hover:bg-gray-100 transition-all duration-200 group"
              >
                Get your free proposal
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Right visual */}
            <div className="flex justify-center md:justify-end">
              <div className="relative">
                {/* Main circle */}
                <div className="w-48 h-48 bg-[#2563EB] rounded-full flex items-center justify-center">
                  <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#22C55E] rounded-xl flex items-center justify-center rotate-12">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                
                <div className="absolute -bottom-2 -left-6 w-10 h-10 bg-[#F59E0B] rounded-lg flex items-center justify-center -rotate-12">
                  <span className="text-white text-xl">✈️</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
