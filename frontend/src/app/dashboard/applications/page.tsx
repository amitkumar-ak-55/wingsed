"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Header, Footer, SaveButton } from "@/components";
import { Card, Skeleton, Button, Input } from "@/components/ui";
import { api, Application, ApplicationStatus } from "@/lib/api";
import { formatUSD, getCountryFlag } from "@/lib/utils";

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  RESEARCHING: { label: "Researching", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200", icon: "🔍" },
  PREPARING: { label: "Preparing", color: "text-yellow-700", bgColor: "bg-yellow-50 border-yellow-200", icon: "📝" },
  APPLIED: { label: "Applied", color: "text-purple-700", bgColor: "bg-purple-50 border-purple-200", icon: "📨" },
  ACCEPTED: { label: "Accepted", color: "text-green-700", bgColor: "bg-green-50 border-green-200", icon: "🎉" },
  REJECTED: { label: "Rejected", color: "text-red-700", bgColor: "bg-red-50 border-red-200", icon: "❌" },
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

  const totalApps = STATUS_ORDER.reduce((sum, status) => sum + applications[status].length, 0);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Skeleton className="h-8 w-48" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#111827] mb-2">
              Application Tracker
            </h1>
            <p className="text-[#6B7280]">
              Track your university applications in one place
            </p>
          </div>
          <Link href="/universities">
            <Button variant="primary">
              + Add Application
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {STATUS_ORDER.map((status) => (
            <div
              key={status}
              className={`p-4 rounded-lg border ${STATUS_CONFIG[status].bgColor}`}
            >
              <div className="text-2xl mb-1">{STATUS_CONFIG[status].icon}</div>
              <div className={`text-2xl font-bold ${STATUS_CONFIG[status].color}`}>
                {applications[status].length}
              </div>
              <div className="text-sm text-[#6B7280]">{STATUS_CONFIG[status].label}</div>
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
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && totalApps === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📋</span>
            </div>
            <h2 className="text-xl font-semibold text-[#111827] mb-2">
              No applications yet
            </h2>
            <p className="text-[#6B7280] mb-6 max-w-md mx-auto">
              Start tracking your university applications. Add universities from your saved list or browse to find new ones.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard/saved">
                <Button variant="outline">View Saved</Button>
              </Link>
              <Link href="/universities">
                <Button variant="primary">Browse Universities</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        {!isLoading && !error && totalApps > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="min-w-[280px]">
                {/* Column Header */}
                <div className={`p-3 rounded-t-lg border-b-2 ${STATUS_CONFIG[status].bgColor} border-current`}>
                  <div className="flex items-center gap-2">
                    <span>{STATUS_CONFIG[status].icon}</span>
                    <span className={`font-semibold ${STATUS_CONFIG[status].color}`}>
                      {STATUS_CONFIG[status].label}
                    </span>
                    <span className="ml-auto bg-white/80 px-2 py-0.5 rounded-full text-xs font-medium">
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
        <div className="w-10 h-10 shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          {uni.logoUrl ? (
            <img src={uni.logoUrl} alt={uni.name} className="w-full h-full object-contain p-1" />
          ) : (
            <span className="text-sm font-bold text-gray-400">{uni.name.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/universities/${uni.id}`}>
            <h3 className="text-sm font-semibold text-[#111827] line-clamp-1 hover:text-[#2563EB] transition-colors">
              {uni.name}
            </h3>
          </Link>
          <p className="text-xs text-[#6B7280]">
            {getCountryFlag(uni.country)} {uni.city}
          </p>
        </div>
      </div>

      {/* Program & Intake */}
      {(application.program || application.intake) && (
        <div className="text-xs text-[#6B7280] mb-2">
          {application.program && <div>📚 {application.program}</div>}
          {application.intake && <div>📅 {application.intake}</div>}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        {/* Status Dropdown */}
        <select
          value={application.status}
          onChange={(e) => onStatusChange(application.id, e.target.value as ApplicationStatus)}
          className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
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
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
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
