"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Header, Footer, WhatsAppButton, SaveButton, TrackButton, CompareButton, CompareBar } from "@/components";
import { Button, Input, Select, Card, Skeleton } from "@/components/ui";
import { COUNTRIES, BUDGET_RANGES } from "@/data/constants";
import { api, getRecommendations } from "@/lib/api";
import { formatINR, formatUSD, getCountryFlag } from "@/lib/utils";
import type { University, StudentProfile } from "@/types";

interface Filters {
  search: string;
  country: string;
  budgetMin: number | null;
  budgetMax: number | null;
  field: string;
}

// Debounce utility
function debounce<T extends (...args: never[]) => void>(fn: T, ms: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

// Loading fallback
function UniversitiesLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/5 mb-4" />
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Main page wrapper with Suspense
export default function UniversitiesPage() {
  return (
    <Suspense fallback={<UniversitiesLoading />}>
      <UniversitiesContent />
    </Suspense>
  );
}

function UniversitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [universities, setUniversities] = useState<University[]>([]);
  const [recommendations, setRecommendations] = useState<University[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get("search") || "",
    country: searchParams.get("country") || "",
    budgetMin: searchParams.get("budgetMin") ? parseInt(searchParams.get("budgetMin")!) : null,
    budgetMax: searchParams.get("budgetMax") ? parseInt(searchParams.get("budgetMax")!) : null,
    field: searchParams.get("field") || "",
  });

  // Load user profile and recommendations if signed in
  useEffect(() => {
    const loadProfile = async () => {
      if (!isSignedIn) {
        // For guests, load general recommendations
        setIsLoadingRecs(true);
        try {
          const recsResult = await getRecommendations({ limit: 4 });
          if (recsResult.data?.recommendations) {
            setRecommendations(recsResult.data.recommendations);
          }
        } catch (error) {
          console.error("Failed to load recommendations:", error);
        } finally {
          setIsLoadingRecs(false);
        }
        return;
      }
      
      try {
        const token = await getToken();
        if (!token) return;

        const user = await api.getCurrentUser(token);
        if (user?.profile) {
          setProfile(user.profile);
          
          // Load personalized recommendations
          setIsLoadingRecs(true);
          try {
            const recsResult = await getRecommendations({
              country: user.profile.preferredCountries?.[0],
              budgetMin: user.profile.budgetMin ?? undefined,
              budgetMax: user.profile.budgetMax ?? undefined,
              limit: 4,
            });
            if (recsResult.data?.recommendations) {
              setRecommendations(recsResult.data.recommendations);
            }
          } catch (error) {
            console.error("Failed to load recommendations:", error);
          } finally {
            setIsLoadingRecs(false);
          }

          // Pre-fill filters from profile if no URL params
          if (!searchParams.toString()) {
            const profile = user.profile;
            setFilters((prev) => ({
              ...prev,
              country: profile.preferredCountries?.[0] || "",
              budgetMin: profile.budgetMin || null,
              budgetMax: profile.budgetMax || null,
              field: profile.targetField || "",
            }));
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    if (isLoaded) {
      loadProfile();
    }
  }, [isLoaded, isSignedIn, getToken, searchParams]);

  // Search universities
  const searchUniversities = useCallback(async (currentFilters: Filters, currentPage: number) => {
    setIsLoading(true);
    try {
      const token = isSignedIn ? await getToken() : null;
      
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: 12,
      };

      if (currentFilters.search) params.q = currentFilters.search;
      if (currentFilters.country) params.country = currentFilters.country;
      if (currentFilters.budgetMin) params.budgetMin = currentFilters.budgetMin;
      if (currentFilters.budgetMax) params.budgetMax = currentFilters.budgetMax;

      const result = await api.searchUniversities(token, params);
      
      if (currentPage === 1) {
        setUniversities(result.universities);
      } else {
        setUniversities((prev) => [...prev, ...result.universities]);
      }
      
      setTotalCount(result.total);
      setHasMore(result.page < result.totalPages);
    } catch (error) {
      console.error("Failed to search universities:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, getToken]);

  // Debounced search
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((currentFilters: Filters) => {
      setPage(1);
      searchUniversities(currentFilters, 1);
    }, 300),
    [searchUniversities]
  );

  // Initial load and filter changes
  useEffect(() => {
    if (isLoaded) {
      debouncedSearch(filters);
    }
  }, [isLoaded, filters, debouncedSearch]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.country) params.set("country", filters.country);
    if (filters.budgetMin) params.set("budgetMin", filters.budgetMin.toString());
    if (filters.budgetMax) params.set("budgetMax", filters.budgetMax.toString());
    if (filters.field) params.set("field", filters.field);

    const queryString = params.toString();
    router.replace(`/universities${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [filters, router]);

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleBudgetChange = (budgetValue: string) => {
    if (!budgetValue) {
      updateFilter("budgetMin", null);
      updateFilter("budgetMax", null);
      return;
    }
    
    const range = BUDGET_RANGES.find((r) => `${r.min}-${r.max}` === budgetValue);
    if (range) {
      setFilters((prev) => ({
        ...prev,
        budgetMin: range.min,
        budgetMax: range.max,
      }));
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    searchUniversities(filters, nextPage);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      country: "",
      budgetMin: null,
      budgetMax: null,
      field: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111827] mb-2">
            Find Your University
          </h1>
          <p className="text-[#6B7280]">
            {profile
              ? `Showing universities matching your preferences`
              : "Browse universities across 12 countries"}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Input
                placeholder="Search universities..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="w-full"
              />
            </div>

            {/* Country */}
            <Select
              options={[
                { value: "", label: "All Countries" },
                ...COUNTRIES.map((c) => ({ value: c.value, label: `${c.flag} ${c.label}` })),
              ]}
              value={filters.country}
              onChange={(e) => updateFilter("country", e.target.value)}
            />

            {/* Budget */}
            <Select
              options={[
                { value: "", label: "Any Budget" },
                ...BUDGET_RANGES.map((r) => ({ value: `${r.min}-${r.max}`, label: r.label })),
              ]}
              value={filters.budgetMin && filters.budgetMax ? `${filters.budgetMin}-${filters.budgetMax}` : ""}
              onChange={(e) => handleBudgetChange(e.target.value)}
            />

            {/* Clear */}
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && !filters.search && !filters.country && !filters.budgetMin && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <h2 className="text-lg font-semibold text-[#111827]">
                {profile ? "Recommended for You" : "Popular Universities"}
              </h2>
              {profile && (
                <span className="text-xs text-[#6B7280] bg-blue-50 px-2 py-1 rounded-full">
                  Based on your profile
                </span>
              )}
            </div>
            {isLoadingRecs ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-full" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendations.map((uni) => (
                  <Link key={uni.id} href={`/universities/${uni.id}`}>
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {uni.logoUrl ? (
                            <img
                              src={uni.logoUrl}
                              alt={uni.name}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <span className="text-sm font-bold text-gray-400">{uni.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-[#111827] line-clamp-1 hover:text-[#2563EB] transition-colors">
                            {uni.name}
                          </h3>
                          <p className="text-xs text-[#6B7280]">
                            {getCountryFlag(uni.country)} {uni.city}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-[#111827]">
                        {formatUSD(uni.tuitionFee)}/yr
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[#6B7280]">
            {isLoading ? "Searching..." : `${totalCount} universities found`}
          </p>
        </div>

        {/* University Grid */}
        {isLoading && universities.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/5 mb-4" />
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        ) : universities.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#111827] mb-2">
              No universities found
            </h3>
            <p className="text-[#6B7280] mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {universities.map((university) => (
                <UniversityCard
                  key={university.id}
                  university={university}
                  profile={profile}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  isLoading={isLoading}
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
      <CompareBar />
      <WhatsAppButton
        userData={{
          country: filters.country || undefined,
          budgetMin: filters.budgetMin || undefined,
          budgetMax: filters.budgetMax || undefined,
          targetField: profile?.targetField || undefined,
        }}
      />
    </div>
  );
}

// University Card Component
function UniversityCard({
  university,
}: {
  university: University;
  profile?: StudentProfile | null;
}) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const descriptionThreshold = 120; // characters before truncating
  const shouldTruncate = university.description && university.description.length > descriptionThreshold;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-300 animate-fadeIn flex flex-col">
      {/* Header with Logo */}
      <div className="flex items-start gap-4 mb-4">
        {/* Logo */}
        <div className="w-14 h-14 shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          {university.logoUrl ? (
            <img
              src={university.logoUrl}
              alt={`${university.name} logo`}
              className="w-full h-full object-contain p-2"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <span className={`text-2xl font-bold text-gray-400 ${university.logoUrl ? 'hidden' : ''}`}>
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

      {/* Badge */}
      {university.publicPrivate && (
        <div className="mb-3">
          <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${university.publicPrivate === 'Public' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
            {university.publicPrivate}
          </span>
        </div>
      )}

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

      {/* Description */}
      {university.description && (
        <div className="mb-4 flex-1">
          <p className="text-sm text-[#6B7280]">
            {showFullDescription || !shouldTruncate
              ? university.description
              : `${university.description.slice(0, descriptionThreshold)}...`}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-sm text-[#2563EB] hover:text-[#1D4ED8] font-medium mt-1"
            >
              {showFullDescription ? "See less" : "See more"}
            </button>
          )}
        </div>
      )}

      {/* Quick Actions Bar - Clear labeled buttons */}
      <div className="flex items-center gap-2 mb-4 py-3 border-y border-gray-100">
        <SaveButton universityId={university.id} variant="labeled" />
        <div className="w-px h-6 bg-gray-200" />
        <CompareButton universityId={university.id} variant="labeled" />
        <div className="w-px h-6 bg-gray-200" />
        <TrackButton universityId={university.id} universityName={university.name} variant="labeled" />
      </div>

      {/* Main Action Buttons */}
      <div className="flex gap-2 mt-auto">
        {/* Visit Website Button */}
        {university.websiteUrl ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              window.open(university.websiteUrl!, "_blank", "noopener,noreferrer");
            }}
          >
            Visit Website
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled
          >
            No Website
          </Button>
        )}
        
        {/* WhatsApp Button */}
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          onClick={() => {
            const message = `Hi, I'm interested in ${university.name} in ${university.country}. Can you tell me more about admission requirements and application process?`;
            const whatsappUrl = `https://wa.me/918658805653?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, "_blank", "noopener,noreferrer");
          }}
        >
          WhatsApp Us
        </Button>
      </div>
    </Card>
  );
}
