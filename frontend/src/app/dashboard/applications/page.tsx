"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components";
import { Card, Skeleton, Button, EmptyState, ImageFallback } from "@/components/ui";
import { api, Application, ApplicationStatus } from "@/lib/api";
import { formatUSD, getCountryFlag } from "@/lib/utils";

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; borderColor: string; icon: string }> = {
  RESEARCHING: { label: "Researching", color: "text-blue-600", borderColor: "border-l-blue-400", icon: "🔍" },
  PREPARING: { label: "Preparing", color: "text-yellow-600", borderColor: "border-l-yellow-400", icon: "📝" },
  APPLIED: { label: "Applied", color: "text-purple-600", borderColor: "border-l-purple-400", icon: "📨" },
  ACCEPTED: { label: "Accepted", color: "text-green-600", borderColor: "border-l-green-500", icon: "🎉" },
  REJECTED: { label: "Rejected", color: "text-red-600", borderColor: "border-l-red-400", icon: "❌" },
};

const STATUS_ORDER: ApplicationStatus[] = ["RESEARCHING", "PREPARING", "APPLIED", "ACCEPTED", "REJECTED"];

export default function ApplicationsPage() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<Record<ApplicationStatus, Application[]>>({
    RESEARCHING: [],
    PREPARING: [],
    APPLIED: [],
    ACCEPTED: [],
    REJECTED: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    const fetchApplications = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = await getToken();
        if (!token) {
          router.push("/sign-in");
          return;
        }

        const grouped = await api.getApplicationsByStatus(token);
        setApplications(grouped as Record<ApplicationStatus, Application[]>);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [isSignedIn, isLoaded, getToken, router]);

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      const token = await getToken();
      if (!token) return;

      await api.updateApplication(token, applicationId, { status: newStatus });
      
      // Refresh applications
      const grouped = await api.getApplicationsByStatus(token);
      setApplications(grouped as Record<ApplicationStatus, Application[]>);
    } catch (err) {
      console.error("Error updating application:", err);
    }
  };

  const handleDelete = async (applicationId: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    try {
      const token = await getToken();
      if (!token) return;
      await api.deleteApplication(token, applicationId);
      // Refresh applications
      const grouped = await api.getApplicationsByStatus(token);
      setApplications(grouped as Record<ApplicationStatus, Application[]>);
    } catch (err) {
      console.error("Error deleting application:", err);
    }
  };

  const totalApps = STATUS_ORDER.reduce((sum, status) => sum + (applications[status]?.length || 0), 0);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <span className="w-8 h-8 rounded-full border-2 border-[#E2E8F0] border-t-[#F59E0B] animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[#F59E0B] font-bold tracking-[0.2em] uppercase text-xs">
              Application Tracker
            </span>
            <h1 className="font-display text-3xl font-extrabold text-[#0F172A] mt-1 mb-1">
              Track Your Journey
            </h1>
            <p className="text-[#64748B]">
              Track your university applications in one place
            </p>
          </div>
          <Link href="/universities">
            <Button className="bg-[#0F172A] text-white rounded-xl px-5 py-2.5 font-bold hover:bg-[#1E293B] transition-all duration-300 shadow-sm hover:shadow-md">
              + Add Application
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {STATUS_ORDER.map((status) => (
            <div
              key={status}
              className={`bg-white border border-[#E2E8F0] rounded-xl p-4 border-l-4 ${STATUS_CONFIG[status].borderColor}`}
            >
              <div className="text-2xl mb-1">{STATUS_CONFIG[status].icon}</div>
              <div className={`text-2xl font-bold ${STATUS_CONFIG[status].color}`}>
                {(applications[status]?.length || 0)}
              </div>
              <div className="text-sm text-[#64748B]">{STATUS_CONFIG[status].label}</div>
            </div>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
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
        {!isLoading && !error && totalApps === 0 && (
          <EmptyState
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
            title="No applications yet"
            body="Start tracking your university applications. Add universities from your saved list or browse to find new ones."
            primaryCta={{ label: "Browse Universities", href: "/universities" }}
            secondaryCta={{ label: "View Saved", href: "/dashboard/saved" }}
          />
        )}

        {/* Kanban Board */}
        {!isLoading && !error && totalApps > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="min-w-[280px]">
                {/* Column Header */}
                <div className="p-3 rounded-t-lg bg-white border border-[#E2E8F0] border-b-2">
                  <div className="flex items-center gap-2">
                    <span>{STATUS_CONFIG[status].icon}</span>
                    <span className={`font-semibold ${STATUS_CONFIG[status].color}`}>
                      {STATUS_CONFIG[status].label}
                    </span>
                    <span className="ml-auto bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded-full text-xs font-medium">
                      {applications[status].length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-3 mt-3">
                  {applications[status].map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      isEditing={editingId === app.id}
                      onEditToggle={() => setEditingId(editingId === app.id ? null : app.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Application Card Component
function ApplicationCard({
  application,
  onStatusChange,
  onDelete,
  isEditing,
  onEditToggle,
}: {
  application: Application;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  onEditToggle: () => void;
}) {
  const uni = application.university;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      {/* University Info */}
      <div className="flex items-start gap-3 mb-3">
        <ImageFallback
          src={uni.logoUrl}
          alt={uni.name}
          initial={uni.name.charAt(0)}
          className="w-10 h-10 shrink-0 rounded-lg"
        />
        <div className="flex-1 min-w-0">
          <Link href={`/universities/${uni.id}`}>
            <h3 className="text-sm font-semibold text-[#0F172A] line-clamp-1 hover:text-[#F59E0B] transition-colors">
              {uni.name}
            </h3>
          </Link>
          <p className="text-xs text-[#64748B]">
            {getCountryFlag(uni.country)} {uni.city}
          </p>
        </div>
      </div>

      {/* Program & Intake */}
      {(application.program || application.intake) && (
        <div className="text-xs text-[#64748B] mb-2">
          {application.program && <div>📚 {application.program}</div>}
          {application.intake && <div>📅 {application.intake}</div>}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0]">
        {/* Status Dropdown */}
        <select
          value={application.status}
          onChange={(e) => onStatusChange(application.id, e.target.value as ApplicationStatus)}
          className="flex-1 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#F59E0B]"
        >
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_CONFIG[status].icon} {STATUS_CONFIG[status].label}
            </option>
          ))}
        </select>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(application.id)}
          className="p-1 text-[#94A3B8] hover:text-red-500 transition-colors"
          title="Delete application"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </Card>
  );
}
