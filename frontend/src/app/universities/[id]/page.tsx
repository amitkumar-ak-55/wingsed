"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer, WhatsAppButton, SaveButton, TrackButton } from "@/components";
import { Button, Card, Skeleton } from "@/components/ui";
import { getUniversityById } from "@/lib/api";
import { formatINR, formatUSD, getCountryFlag } from "@/lib/utils";
import type { University, Program } from "@/types";

// ===========================================
// Helper Components
// ===========================================

function StatCard({ label, value, icon, color = "blue" }: { label: string; value: string | number; icon: React.ReactNode; color?: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-lg ${colorMap[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-[#111827]">{value}</div>
      <div className="text-sm text-[#6B7280] mt-1">{label}</div>
    </div>
  );
}

function RankBadge({ label, rank }: { label: string; rank: number | null }) {
  if (!rank) return null;
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
        #{rank}
      </div>
      <div>
        <div className="text-sm font-semibold text-[#111827]">{label}</div>
        <div className="text-xs text-[#6B7280]">World Ranking</div>
      </div>
    </div>
  );
}

function SectionTitle({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-[#111827]">{children}</h2>
    </div>
  );
}

function DegreeTypeBadge({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    BACHELORS: "bg-blue-100 text-blue-700",
    MASTERS: "bg-purple-100 text-purple-700",
    PHD: "bg-red-100 text-red-700",
    DIPLOMA: "bg-green-100 text-green-700",
    CERTIFICATE: "bg-amber-100 text-amber-700",
  };
  const labelMap: Record<string, string> = {
    BACHELORS: "Bachelor's",
    MASTERS: "Master's",
    PHD: "PhD",
    DIPLOMA: "Diploma",
    CERTIFICATE: "Certificate",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colorMap[type] || "bg-gray-100 text-gray-700"}`}>
      {labelMap[type] || type}
    </span>
  );
}

function ProgramCard({ program }: { program: Program }) {
  const deadlineDate = program.applicationDeadline 
    ? new Date(program.applicationDeadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all hover:border-blue-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-[#111827] text-base">{program.name}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <DegreeTypeBadge type={program.degreeType} />
            {program.duration && (
              <span className="text-xs text-[#6B7280]">{program.duration}</span>
            )}
            {program.intakes?.length > 0 && (
              <span className="text-xs text-[#6B7280]">| {program.intakes.join(", ")}</span>
            )}
          </div>
        </div>
        {program.tuitionFee && (
          <div className="text-right shrink-0 ml-4">
            <div className="text-sm font-bold text-[#111827]">{formatUSD(program.tuitionFee)}</div>
            <div className="text-xs text-[#6B7280]">{formatINR(program.tuitionFee * 83)}</div>
          </div>
        )}
      </div>

      {program.description && (
        <p className="text-sm text-[#6B7280] mb-3 line-clamp-2">{program.description}</p>
      )}

      {/* Requirements Grid */}
      <div className="flex flex-wrap gap-2 mb-3">
        {program.greRequired && (
          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            GRE Required
          </span>
        )}
        {program.gmatRequired && (
          <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-medium">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            GMAT Required
          </span>
        )}
        {program.ieltsMinScore && (
          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md font-medium">
            IELTS {program.ieltsMinScore}+
          </span>
        )}
        {program.toeflMinScore && (
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-medium">
            TOEFL {program.toeflMinScore}+
          </span>
        )}
        {program.gpaMinScore && (
          <span className="text-xs bg-rose-50 text-rose-700 px-2 py-1 rounded-md font-medium">
            GPA {program.gpaMinScore}+
          </span>
        )}
      </div>

      {/* Deadline & Department */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        {deadlineDate ? (
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Deadline: <span className="font-medium text-[#111827]">{deadlineDate}</span>
          </div>
        ) : (
          <span />
        )}
        {program.department && (
          <span className="text-xs text-[#6B7280]">{program.department}</span>
        )}
      </div>
    </div>
  );
}

// ===========================================
// Main Page
// ===========================================

export default function UniversityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [university, setUniversity] = useState<University | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "programs" | "costs">("overview");

  useEffect(() => {
    const fetchUniversity = async () => {
      setIsLoading(true);
      setError(null);

      const response = await getUniversityById(id);

      if (response.error || !response.data) {
        setError(response.error || "University not found");
        setIsLoading(false);
        return;
      }

      setUniversity(response.data.university);
      setIsLoading(false);
    };

    if (id) {
      fetchUniversity();
    }
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-6 w-40 mb-6" />
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
            <div className="flex items-start gap-6 mb-6">
              <Skeleton className="w-24 h-24 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-8 w-3/4 mb-3" />
                <Skeleton className="h-5 w-1/2 mb-3" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !university) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              University Not Found
            </h2>
            <p className="text-[#6B7280] mb-6">
              {error || "The university you're looking for doesn't exist."}
            </p>
            <Button variant="primary" onClick={() => router.push("/universities")}>
              Browse Universities
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hasRankings = university.qsRanking || university.timesRanking || university.usNewsRanking;
  const programs = university.programs || [];
  const programsByDegree = programs.reduce((acc, p) => {
    if (!acc[p.degreeType]) acc[p.degreeType] = [];
    acc[p.degreeType].push(p);
    return acc;
  }, {} as Record<string, Program[]>);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/universities"
          className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#111827] mb-6 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Universities
        </Link>

        {/* ===== HERO CARD ===== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          {/* Header Image / Gradient Banner */}
          <div className="h-32 bg-linear-to-r from-[#2563EB] to-[#7C3AED] relative">
            {university.imageUrl && (
              <img
                src={university.imageUrl}
                alt={university.name}
                className="w-full h-full object-cover opacity-40"
              />
            )}
          </div>
          
          <div className="px-6 sm:px-8 pb-6 -mt-12 relative">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Logo */}
              <div className="w-24 h-24 shrink-0 bg-white rounded-xl overflow-hidden flex items-center justify-center shadow-lg border-4 border-white">
                {university.logoUrl ? (
                  <img
                    src={university.logoUrl}
                    alt={`${university.name} logo`}
                    className="w-full h-full object-contain p-3"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <span className={`text-3xl font-bold text-gray-400 ${university.logoUrl ? "hidden" : ""}`}>
                  {university.name.charAt(0)}
                </span>
              </div>

              {/* Title Area */}
              <div className="flex-1 pt-2 sm:pt-14">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-1.5">
                  {university.name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[#6B7280]">
                  <span className="flex items-center gap-1.5">
                    <span className="text-lg">{getCountryFlag(university.country)}</span>
                    {university.city}, {university.country}
                  </span>
                  {university.campusType && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {university.campusType.charAt(0) + university.campusType.slice(1).toLowerCase()} Campus
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {university.publicPrivate && (
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      university.publicPrivate === "Public"
                        ? "bg-green-100 text-green-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {university.publicPrivate}
                    </span>
                  )}
                  {university.acceptanceRate && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                      {university.acceptanceRate}% Acceptance Rate
                    </span>
                  )}
                  {programs.length > 0 && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
                      {programs.length} Program{programs.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col gap-2 pt-2 sm:pt-14 shrink-0">
                <SaveButton universityId={university.id} size="md" />
                <TrackButton
                  universityId={university.id}
                  universityName={university.name}
                  variant="button"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===== RANKINGS ===== */}
        {hasRankings && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <RankBadge label="QS World Ranking" rank={university.qsRanking} />
            <RankBadge label="THE World Ranking" rank={university.timesRanking} />
            <RankBadge label="US News Ranking" rank={university.usNewsRanking} />
          </div>
        )}

        {/* ===== KEY STATS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Annual Tuition"
            value={formatUSD(university.tuitionFee)}
            color="blue"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          {university.acceptanceRate && (
            <StatCard
              label="Acceptance Rate"
              value={`${university.acceptanceRate}%`}
              color="green"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          )}
          {university.totalStudents && (
            <StatCard
              label="Total Students"
              value={university.totalStudents.toLocaleString()}
              color="purple"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
          )}
          {university.employmentRate && (
            <StatCard
              label="Employment Rate"
              value={`${university.employmentRate}%`}
              color="amber"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />
          )}
        </div>

        {/* ===== TAB NAVIGATION ===== */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 mb-6">
          {(["overview", "programs", "costs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-[#2563EB] text-white shadow-sm"
                  : "text-[#6B7280] hover:text-[#111827] hover:bg-gray-50"
              }`}
            >
              {tab === "overview" && "Overview"}
              {tab === "programs" && `Programs (${programs.length})`}
              {tab === "costs" && "Costs & Aid"}
            </button>
          ))}
        </div>

        {/* ===== TAB CONTENT ===== */}

        {/* --- OVERVIEW TAB --- */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* About */}
            {university.description && (
              <Card className="p-6">
                <SectionTitle icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }>
                  About {university.name}
                </SectionTitle>
                <p className="text-[#6B7280] leading-relaxed">{university.description}</p>
              </Card>
            )}

            {/* Campus & Student Life */}
            <Card className="p-6">
              <SectionTitle icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }>
                Campus & Student Life
              </SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {university.address && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#6B7280] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-[#111827]">Address</div>
                      <div className="text-sm text-[#6B7280]">{university.address}</div>
                    </div>
                  </div>
                )}
                {university.campusType && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#6B7280] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-[#111827]">Campus Type</div>
                      <div className="text-sm text-[#6B7280]">
                        {university.campusType.charAt(0) + university.campusType.slice(1).toLowerCase()}
                      </div>
                    </div>
                  </div>
                )}
                {university.totalStudents && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#6B7280] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-[#111827]">Total Students</div>
                      <div className="text-sm text-[#6B7280]">{university.totalStudents.toLocaleString()}</div>
                    </div>
                  </div>
                )}
                {university.internationalStudentPercent && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#6B7280] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-[#111827]">International Students</div>
                      <div className="text-sm text-[#6B7280]">{university.internationalStudentPercent}%</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Programs Preview */}
            {programs.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <SectionTitle icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  }>
                    Popular Programs
                  </SectionTitle>
                  <button
                    onClick={() => setActiveTab("programs")}
                    className="text-sm font-medium text-[#2563EB] hover:text-blue-800 transition-colors"
                  >
                    View All ({programs.length})
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {programs.slice(0, 4).map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* --- PROGRAMS TAB --- */}
        {activeTab === "programs" && (
          <div className="space-y-6">
            {programs.length === 0 ? (
              <Card className="p-8 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-[#6B7280]">No programs listed yet for this university.</p>
              </Card>
            ) : (
              Object.entries(programsByDegree).map(([degreeType, degreePrograms]) => (
                <div key={degreeType}>
                  <div className="flex items-center gap-2 mb-3">
                    <DegreeTypeBadge type={degreeType} />
                    <span className="text-sm text-[#6B7280]">
                      {degreePrograms.length} program{degreePrograms.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {degreePrograms.map((program) => (
                      <ProgramCard key={program.id} program={program} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* --- COSTS & AID TAB --- */}
        {activeTab === "costs" && (
          <div className="space-y-6">
            {/* Tuition Breakdown */}
            <Card className="p-6">
              <SectionTitle icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }>
                Cost Breakdown
              </SectionTitle>
              <div className="space-y-4">
                {/* Tuition */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div>
                    <div className="text-sm font-medium text-[#111827]">Annual Tuition</div>
                    <div className="text-xs text-[#6B7280]">Per academic year</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#111827]">{formatUSD(university.tuitionFee)}</div>
                    <div className="text-sm text-[#6B7280]">{formatINR(university.tuitionFee * 83)}</div>
                  </div>
                </div>

                {/* Food & Housing */}
                {university.foodHousingCost && (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <div>
                      <div className="text-sm font-medium text-[#111827]">Food & Housing</div>
                      <div className="text-xs text-[#6B7280]">Per academic year (estimated)</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#111827]">{formatUSD(university.foodHousingCost)}</div>
                      <div className="text-sm text-[#6B7280]">{formatINR(university.foodHousingCost * 83)}</div>
                    </div>
                  </div>
                )}

                {/* Application Fee */}
                {university.applicationFee && (
                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                    <div>
                      <div className="text-sm font-medium text-[#111827]">Application Fee</div>
                      <div className="text-xs text-[#6B7280]">One-time, non-refundable</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#111827]">{formatUSD(university.applicationFee)}</div>
                      <div className="text-sm text-[#6B7280]">{formatINR(university.applicationFee * 83)}</div>
                    </div>
                  </div>
                )}

                {/* Total Estimated */}
                <div className="flex items-center justify-between p-4 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                  <div>
                    <div className="text-sm font-bold text-[#111827]">Total Annual Cost (Est.)</div>
                    <div className="text-xs text-[#6B7280]">Tuition + Food & Housing</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-[#111827]">
                      {formatUSD(university.tuitionFee + (university.foodHousingCost || 0))}
                    </div>
                    <div className="text-sm text-[#6B7280]">
                      {formatINR((university.tuitionFee + (university.foodHousingCost || 0)) * 83)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Scholarships & Financial Aid */}
            <Card className="p-6">
              <SectionTitle icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              }>
                Scholarships & Financial Aid
              </SectionTitle>
              {university.avgScholarshipAmount ? (
                <div className="bg-green-50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-800">
                        Avg. Scholarship: {formatUSD(university.avgScholarshipAmount)}
                      </div>
                      <div className="text-sm text-green-700">
                        {formatINR(university.avgScholarshipAmount * 83)} per year
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    This is the average scholarship amount awarded to eligible international students. Actual amounts vary based on merit and financial need.
                  </p>
                  {/* Net cost */}
                  <div className="mt-4 pt-3 border-t border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Estimated Net Tuition (after avg. scholarship)</span>
                      <span className="font-bold text-green-800">
                        {formatUSD(Math.max(0, university.tuitionFee - university.avgScholarshipAmount))}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-5 text-center">
                  <p className="text-[#6B7280] text-sm">Scholarship information not available yet. Contact the university for financial aid options.</p>
                </div>
              )}
            </Card>

            {/* Employment */}
            {university.employmentRate && (
              <Card className="p-6">
                <SectionTitle icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }>
                  Return on Investment
                </SectionTitle>
                <div className="flex items-center gap-5 bg-amber-50 rounded-xl p-5">
                  <div className="relative w-20 h-20 shrink-0">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#fde68a" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray={`${university.employmentRate}, 100`} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-amber-800">{university.employmentRate}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-base font-semibold text-amber-900">Graduate Employment Rate</div>
                    <div className="text-sm text-amber-700 mt-1">
                      {university.employmentRate}% of graduates secure employment within 6 months of graduation.
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ===== CTA SECTION ===== */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-[#111827] mb-1">
                Interested in {university.name}?
              </h3>
              <p className="text-sm text-[#6B7280]">
                Get personalized guidance from our counselors. We&apos;ll help you with applications, scholarships, and visa support.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              {university.websiteUrl && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.open(university.websiteUrl!, "_blank", "noopener,noreferrer")}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visit Website
                </Button>
              )}
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  const message = `Hi, I'm interested in ${university.name} in ${university.country}. Can you tell me more about admission requirements and application process?`;
                  const whatsappUrl = `https://wa.me/918658805653?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp Us
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
