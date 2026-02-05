"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header, Footer, WhatsAppButton, SaveButton, TrackButton } from "@/components";
import { Button, Card, Skeleton } from "@/components/ui";
import { getUniversityById } from "@/lib/api";
import { formatINR, formatUSD, getCountryFlag } from "@/lib/utils";
import type { University } from "@/types";

export default function UniversityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [university, setUniversity] = useState<University | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-6 w-40 mb-6" />
          <Card className="p-8">
            <div className="flex items-start gap-6 mb-6">
              <Skeleton className="w-24 h-24 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-24 w-full mb-6" />
            <Skeleton className="h-32 w-full" />
          </Card>
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
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
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

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/universities"
          className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#111827] mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Universities
        </Link>

        <Card className="p-8">
          {/* Header Section */}
          <div className="flex items-start gap-6 mb-6">
            {/* Logo */}
            <div className="w-24 h-24 shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
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

            {/* Title and Location */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-2">
                {university.name}
              </h1>
              <div className="flex items-center gap-2 text-[#6B7280]">
                <span className="text-xl">{getCountryFlag(university.country)}</span>
                <span>{university.city}, {university.country}</span>
              </div>
              {/* Badge */}
              {university.publicPrivate && (
                <div className="mt-3">
                  <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${
                    university.publicPrivate === "Public" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-purple-100 text-purple-700"
                  }`}>
                    {university.publicPrivate}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <SaveButton universityId={university.id} size="md" />
              <TrackButton 
                universityId={university.id} 
                universityName={university.name} 
                variant="button" 
              />
            </div>
          </div>

          {/* Tuition Section */}
          <div className="mb-6 p-4 bg-[#F9FAFB] rounded-lg">
            <div className="text-sm text-[#6B7280] mb-1">Annual Tuition</div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[#111827]">
                {formatUSD(university.tuitionFee)}
              </span>
              <span className="text-lg text-[#6B7280]">
                ({formatINR(university.tuitionFee * 83)})
              </span>
            </div>
          </div>

          {/* Description Section */}
          {university.description && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-[#111827] mb-3">
                About this University
              </h2>
              <p className="text-[#6B7280] leading-relaxed">
                {university.description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Visit Website Button */}
            {university.websiteUrl ? (
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => {
                  window.open(university.websiteUrl!, "_blank", "noopener,noreferrer");
                }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit Website
              </Button>
            ) : (
              <Button variant="outline" size="lg" className="flex-1" disabled>
                No Website Available
              </Button>
            )}

            {/* WhatsApp Button */}
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={() => {
                const message = `Hi, I'm interested in ${university.name} in ${university.country}. Can you tell me more about admission requirements and application process?`;
                const whatsappUrl = `https://wa.me/918658805653?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, "_blank", "noopener,noreferrer");
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Us
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
