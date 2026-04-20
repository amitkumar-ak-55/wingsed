"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Header, Footer, SaveButton } from "@/components";
import { Card, Skeleton, Button, EmptyState, ImageFallback } from "@/components/ui";
import { api, getRecommendations } from "@/lib/api";
import { formatINR, formatUSD, getCountryFlag } from "@/lib/utils";
import type { University } from "@/types";

const GUEST_SAVED_KEY = "wingsed_saved_universities";
const USD_TO_INR_RATE = 83; // Fixed reference rate; update periodically.

// Get saved universities from localStorage for guests
function getGuestSavedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(GUEST_SAVED_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function SavedUniversitiesPage() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [universities, setUniversities] = useState<University[]>([]);
  const [recommendations, setRecommendations] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedUniversities = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (isSignedIn) {
          // Logged-in user: fetch from API
          const token = await getToken();
          if (!token) {
            router.push("/sign-in");
            return;
          }

          const saved = await api.getSavedUniversities(token);
          setUniversities(saved.map((s: { university: University }) => s.university));
        } else {
          // Guest user: fetch from localStorage and API
          const savedIds = getGuestSavedIds();
          if (savedIds.length === 0) {
            setUniversities([]);
          } else {
            // Get all universities and filter
            const response = await api.getUniversities();
            const allUniversities = (response.data as { data?: University[] })?.data || [];
            const filtered = allUniversities.filter((u: University) => savedIds.includes(u.id));
            setUniversities(filtered);
          }
        }

        // Also fetch recommendations
        try {
          const recsResult = await getRecommendations({ limit: 4 });
          if (recsResult.data?.recommendations) {
            setRecommendations(recsResult.data.recommendations);
          }
        } catch (err) {
          console.error("Error fetching recommendations:", err);
        }
      } catch (err) {
        console.error("Error fetching saved universities:", err);
        setError("Failed to load saved universities");
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded) {
      fetchSavedUniversities();
    }
  }, [isSignedIn, isLoaded, getToken, router]);

  const handleRemove = (universityId: string) => {
    setUniversities((prev) => prev.filter((u) => u.id !== universityId));
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <span className="text-[#F59E0B] font-bold tracking-[0.2em] uppercase text-xs">
            My Shortlist
          </span>
          <h1 className="font-display text-3xl font-extrabold text-[var(--foreground)] mt-1 mb-1">
            Saved Universities
          </h1>
          <p className="text-[var(--text-secondary)]">
            {isSignedIn
              ? "Your shortlisted universities for easy access"
              : "Your shortlisted universities (sign in to save across devices)"}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <EmptyState
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            title="Something went wrong"
            body={error}
            primaryCta={{ label: "Try Again", onClick: () => window.location.reload() }}
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && universities.length === 0 && (
          <>
            <EmptyState
              icon={
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              }
              title="No saved universities yet"
              body="Start exploring and click the heart icon to shortlist your favorites."
              primaryCta={{ label: "Browse Universities", href: "/universities" }}
            />

            {/* Recommendations when empty */}
            {recommendations.length > 0 && (
              <div className="mt-4 text-left">
                <h3 className="font-display text-lg font-bold text-[var(--foreground)] mb-4 text-center">
                  ✨ Discover Popular Universities
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {recommendations.map((uni) => (
                    <Link key={uni.id} href={`/universities/${uni.id}`}>
                      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full border-[#E2E8F0]">
                        <div className="flex items-start gap-3 mb-3">
                          <ImageFallback
                            src={uni.logoUrl}
                            alt={uni.name}
                            initial={uni.name.charAt(0)}
                            className="w-10 h-10 shrink-0 rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-[var(--foreground)] line-clamp-1">{uni.name}</h4>
                            <p className="text-xs text-[var(--text-secondary)]">{getCountryFlag(uni.country)} {uni.city}</p>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-[var(--foreground)]">{formatUSD(uni.tuitionFee)}/yr</div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Universities Grid */}
        {!isLoading && !error && universities.length > 0 && (
          <>
            <div className="text-sm text-[var(--text-secondary)] mb-4">
              {universities.length} {universities.length === 1 ? "university" : "universities"} saved
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {universities.map((university) => (
                <SavedUniversityCard
                  key={university.id}
                  university={university}
                  onRemove={() => handleRemove(university.id)}
                />
              ))}
            </div>
          </>
        )}

        {/* Sign-in prompt for guests */}
        {!isSignedIn && isLoaded && universities.length > 0 && (
          <div className="mt-8 p-4 bg-[#F59E0B]/5 rounded-xl border border-[#F59E0B]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F59E0B]/10 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[var(--foreground)]">
                  <strong>Want to access your saved universities on any device?</strong>
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Sign in to sync your shortlist across all your devices.
                </p>
              </div>
              <Link href="/sign-in">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Saved University Card Component
function SavedUniversityCard({
  university,
  onRemove,
}: {
  university: University;
  onRemove: () => void;
}) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-300 relative border-[#E2E8F0]">
      {/* Save Button */}
      <div className="absolute top-4 right-4 z-10">
        <SaveButton
          universityId={university.id}
          initialSaved={true}
          size="sm"
          onSaveChange={(saved) => {
            if (!saved) onRemove();
          }}
        />
      </div>

      {/* Header with Logo */}
      <div className="flex items-start gap-4 mb-4 pr-10">
        {/* Logo */}
        <ImageFallback
          src={university.logoUrl}
          alt={`${university.name} logo`}
          initial={university.name.charAt(0)}
          className="w-14 h-14 shrink-0 rounded-lg"
        />

        {/* Title and Location */}
        <div className="flex-1 min-w-0">
          <Link href={`/universities/${university.id}`}>
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1 line-clamp-2 hover:text-[#F59E0B] transition-colors cursor-pointer">
              {university.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span>{getCountryFlag(university.country)}</span>
            <span className="truncate">{university.city}, {university.country}</span>
          </div>
        </div>
      </div>

      {/* Fees */}
      <div className="mb-4 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
        <div className="text-xs text-[var(--text-secondary)] mb-1">Annual Tuition</div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-[var(--foreground)]">
            {formatUSD(university.tuitionFee)}
          </span>
          <span className="text-sm text-[var(--text-secondary)]">
            ({formatINR(university.tuitionFee * USD_TO_INR_RATE)})
          </span>
        </div>
      </div>

      {/* View Details Button */}
      <Link href={`/universities/${university.id}`}>
        <Button variant="outline" className="w-full">
          View Details
        </Button>
      </Link>
    </Card>
  );
}
