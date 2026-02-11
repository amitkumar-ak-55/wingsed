"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Header, Footer, SaveButton } from "@/components";
import { Card, Skeleton, Button } from "@/components/ui";
import { api, getRecommendations } from "@/lib/api";
import { formatINR, formatUSD, getCountryFlag } from "@/lib/utils";
import type { University } from "@/types";

const GUEST_SAVED_KEY = "wingsed_saved_universities";

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
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111827] mb-2">
            Saved Universities
          </h1>
          <p className="text-[#6B7280]">
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
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              Something went wrong
            </h2>
            <p className="text-[#6B7280] mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && universities.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              No saved universities yet
            </h2>
            <p className="text-[#6B7280] mb-6 max-w-md mx-auto">
              Start exploring universities and click the heart icon to save your favorites for quick access.
            </p>
            <Link href="/universities">
              <Button variant="primary" size="lg">
                Browse Universities
              </Button>
            </Link>

            {/* Recommendations when empty */}
            {recommendations.length > 0 && (
              <div className="mt-12 text-left">
                <h3 className="text-lg font-semibold text-[#111827] mb-4 text-center">
                  ✨ Discover Popular Universities
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {recommendations.map((uni) => (
                    <Link key={uni.id} href={`/universities/${uni.id}`}>
                      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                            {uni.logoUrl ? (
                              <img src={uni.logoUrl} alt={uni.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <span className="text-sm font-bold text-gray-400">{uni.name.charAt(0)}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-[#111827] line-clamp-1">{uni.name}</h4>
                            <p className="text-xs text-[#6B7280]">{getCountryFlag(uni.country)} {uni.city}</p>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-[#111827]">{formatUSD(uni.tuitionFee)}/yr</div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Universities Grid */}
        {!isLoading && !error && universities.length > 0 && (
          <>
            <div className="text-sm text-[#6B7280] mb-4">
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
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#111827]">
                  <strong>Want to access your saved universities on any device?</strong>
                </p>
                <p className="text-sm text-[#6B7280]">
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
    <Card className="p-6 hover:shadow-lg transition-shadow duration-300 relative">
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
        <div className="w-14 h-14 shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          {university.logoUrl ? (
            <img
              src={university.logoUrl}
              alt={`${university.name} logo`}
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <span className={`text-xl font-bold text-gray-400 ${university.logoUrl ? "hidden" : ""}`}>
            {university.name.charAt(0)}
          </span>
        </div>

        {/* Title and Location */}
        <div className="flex-1 min-w-0">
          <Link href={`/universities/${university.id}`}>
            <h3 className="text-lg font-semibold text-[#111827] mb-1 line-clamp-2 hover:text-[#2563EB] transition-colors cursor-pointer">
              {university.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <span>{getCountryFlag(university.country)}</span>
            <span className="truncate">{university.city}, {university.country}</span>
          </div>
        </div>
      </div>

      {/* Fees */}
      <div className="mb-4 p-3 bg-[#F9FAFB] rounded-lg">
        <div className="text-xs text-[#6B7280] mb-1">Annual Tuition</div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-[#111827]">
            {formatUSD(university.tuitionFee)}
          </span>
          <span className="text-sm text-[#6B7280]">
            ({formatINR(university.tuitionFee * 83)})
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
