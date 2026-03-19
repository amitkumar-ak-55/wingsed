"use client";

import { ScrollReveal } from "@/components/ui/scroll-reveal";

const features = [
  {
    title: "We listen before suggesting",
    description: "Understanding your full aspirations and story, not just your GPA.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    title: "We don't inflate options",
    description: "We give you 8 real options, not 40 meaningless ones.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    ),
  },
  {
    title: "You talk to real people",
    description: "Expert advisors helping on directly, not automated chatbots.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: "We give honest feedback",
    description: "Proprietary dataset of 10 years of international admission cycles.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

const chatMessages = [
  { sender: "student", text: "Should I apply to NYU?" },
  {
    sender: "advisor",
    text: "Based on your GPA, it's a reach, but we can position your SOP strategically.",
  },
];

export function AdvisorChatSection() {
  return (
    <section className="py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left: Chat Mockup ── */}
          <ScrollReveal direction="up">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 max-w-md mx-auto lg:mx-0 shadow-sm">
              {/* Chat header */}
              <div className="flex items-center gap-3 pb-4 border-b border-[#E2E8F0] mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>

              {/* Messages */}
              <div className="space-y-4">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === "student"
                          ? "bg-[#3B82F6] text-white rounded-br-md"
                          : "bg-white border border-[#E2E8F0] text-[#0F172A] rounded-bl-md"
                      }`}
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wider mb-1 opacity-70">
                        {msg.sender === "student" ? "Student:" : "Advisor:"}
                      </p>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* ── Right: Features ── */}
          <div>
            <ScrollReveal>
              <span className="text-[#F59E0B] font-bold tracking-[0.2em] uppercase text-xs">
                The Logic
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F172A] mt-2 mb-10 tracking-tight">
                What Working With Us Feels Like
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((f, i) => (
                <ScrollReveal key={f.title} delay={i * 80}>
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-[#0F172A]">
                      {f.icon}
                    </div>
                    <h4 className="text-base font-bold text-[#0F172A]">{f.title}</h4>
                    <p className="text-sm text-[#64748B] leading-relaxed">{f.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
