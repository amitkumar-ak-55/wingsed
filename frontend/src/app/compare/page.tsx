"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components";
import { Card, Button, Skeleton, EmptyState, ImageFallback } from "@/components/ui";
import { getUniversityById } from "@/lib/api";
import { formatINR, formatUSD, getCountryFlag } from "@/lib/utils";
import type { University } from "@/types";

// Loading fallback
function CompareLoading() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Card className="p-6">
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<CompareLoading />}>
      <CompareContent />
    </Suspense>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [universities, setUniversities] = useState<(University | null)[]>([null, null, null]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUniversities = async () => {
      setIsLoading(true);
      const ids = searchParams.get("ids")?.split(",") || [];
      
      const results = await Promise.all(
        [0, 1, 2].map(async (index) => {
          const id = ids[index];
          if (!id) return null;
          const result = await getUniversityById(id);
          return result.data?.university || null;
        })
      );
      
      setUniversities(results);
      setIsLoading(false);
    };

    fetchUniversities();
  }, [searchParams]);

  const removeUniversity = (index: number) => {
    const ids = searchParams.get("ids")?.split(",") || [];
    ids.splice(index, 1);
    if (ids.length > 0) {
      router.push(`/compare?ids=${ids.join(",")}`);
    } else {
      router.push("/compare");
    }
  };

  const ComparisonRow = ({ 
    label, 
    values, 
    highlight = false 
  }: { 
    label: string; 
    values: React.ReactNode[]; 
    highlight?: boolean;
  }) => (
    <div className={`grid grid-cols-4 gap-4 py-4 border-b border-[#E2E8F0] ${highlight ? 'bg-[#F59E0B]/5' : ''}`}>
      <div className="font-medium text-[#64748B] text-sm">{label}</div>
      {values.map((value, i) => (
        <div key={i} className="text-[#0F172A] font-medium text-sm">
          {value ?? "—"}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/universities"
            className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Universities
          </Link>
          <span className="block text-[#F59E0B] font-bold tracking-[0.2em] uppercase text-xs mb-2">
            Side-by-Side Analysis
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F172A] mb-2">
            Compare Universities
          </h1>
          <p className="text-[#64748B]">
            Compare up to 3 universities side by side
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <Card className="p-6">
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </Card>
        )}

        {/* Comparison Table */}
        {!isLoading && (
          <Card className="overflow-hidden">
            {/* University Headers */}
            <div className="grid grid-cols-4 gap-4 p-6 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <div className="font-display font-bold text-[#0F172A]">Compare</div>
              {[0, 1, 2].map((index) => (
                <div key={index}>
                  {universities[index] ? (
                    <div className="relative">
                      <button
                        onClick={() => removeUniversity(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center text-sm transition-colors"
                      >
                        ×
                      </button>
                      <div className="flex items-center gap-3">
                        <ImageFallback
                          src={universities[index]!.logoUrl}
                          alt={universities[index]!.name}
                          initial={universities[index]!.name.charAt(0)}
                          className="w-12 h-12 rounded-lg"
                        />
                        <div>
                          <Link 
                            href={`/universities/${universities[index]!.id}`}
                            className="font-semibold text-[#0F172A] hover:text-[#F59E0B] transition-colors line-clamp-1"
                          >
                            {universities[index]!.name}
                          </Link>
                          <p className="text-sm text-[#64748B]">
                            {getCountryFlag(universities[index]!.country)} {universities[index]!.city}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href="/universities"
                      className="flex items-center justify-center h-16 border-2 border-dashed border-[#E2E8F0] rounded-lg hover:border-[#F59E0B] hover:bg-[#F59E0B]/5 transition-colors group"
                    >
                      <span className="text-[#64748B] group-hover:text-[#F59E0B] text-sm">
                        + Add University
                      </span>
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Comparison Data */}
            <div className="p-6">
              {universities.some(u => u) ? (
                <>
                  <ComparisonRow
                    label="Country"
                    values={universities.map(u => u ? `${getCountryFlag(u.country)} ${u.country}` : null)}
                  />
                  <ComparisonRow
                    label="City"
                    values={universities.map(u => u?.city)}
                  />
                  <ComparisonRow
                    label="Annual Tuition (USD)"
                    values={universities.map(u => u ? formatUSD(u.tuitionFee) : null)}
                    highlight
                  />
                  <ComparisonRow
                    label="Annual Tuition (INR)"
                    values={universities.map(u => u ? formatINR(u.tuitionFee * 83) : null)}
                    highlight
                  />
                  <ComparisonRow
                    label="Type"
                    values={universities.map(u => u?.publicPrivate)}
                  />
                  <ComparisonRow
                    label="Website"
                    values={universities.map(u => 
                      u?.websiteUrl ? (
                        <a 
                          href={u.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#3B82F6] hover:underline text-sm"
                        >
                          Visit →
                        </a>
                      ) : null
                    )}
                  />

                  {/* Description Section */}
                  <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
                    <h3 className="font-semibold text-[#0F172A] mb-4">About</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <div></div>
                      {universities.map((u, i) => (
                        <div key={i} className="text-sm text-[#64748B]">
                          {u?.description || "No description available."}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                  title="No universities to compare"
                  body="Add universities from the listing page to compare them side by side."
                  primaryCta={{ label: "Browse Universities", href: "/universities" }}
                />
              )}
            </div>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
