"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { getAdminStats, DashboardStats, Lead } from "@/lib/api";
import { Card, Skeleton } from "@/components/ui";
import { formatINR } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const result = await getAdminStats(token);
        if (result.data) {
          setStats(result.data.stats);
        } else {
          setError(result.error || "Failed to load stats");
        }
      } catch (err) {
        setError("Failed to load dashboard stats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [getToken]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#2563EB] text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Dashboard</h1>
        <p className="text-[#6B7280]">Overview of your WingsEd platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total Leads"
          value={stats?.totalLeads || 0}
          icon="👥"
          color="blue"
        />
        <StatCard
          label="Leads Today"
          value={stats?.leadsToday || 0}
          icon="📈"
          color="green"
        />
        <StatCard
          label="This Week"
          value={stats?.leadsThisWeek || 0}
          icon="📊"
          color="purple"
        />
        <StatCard
          label="Total Users"
          value={stats?.totalUsers || 0}
          icon="👤"
          color="yellow"
        />
        <StatCard
          label="Users Today"
          value={stats?.usersToday || 0}
          icon="✨"
          color="pink"
        />
        <StatCard
          label="Universities"
          value={stats?.totalUniversities || 0}
          icon="🏛️"
          color="indigo"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#111827]">Recent Leads</h2>
            <Link
              href="/admin/leads"
              className="text-sm text-[#2563EB] hover:underline"
            >
              View all →
            </Link>
          </div>
          {stats?.recentLeads && stats.recentLeads.length > 0 ? (
            <div className="space-y-3">
              {stats.recentLeads.slice(0, 5).map((lead) => (
                <LeadRow key={lead.id} lead={lead} />
              ))}
            </div>
          ) : (
            <p className="text-[#6B7280] text-center py-8">No leads yet</p>
          )}
        </Card>

        {/* Leads by Country */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">
            Leads by Country
          </h2>
          {stats?.leadsByCountry && stats.leadsByCountry.length > 0 ? (
            <div className="space-y-3">
              {stats.leadsByCountry.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[#374151]">{item.country}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2563EB] rounded-full"
                        style={{
                          width: `${(item.count / (stats.totalLeads || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-[#111827] w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#6B7280] text-center py-8">No data yet</p>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/universities"
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
          >
            <span className="text-2xl mb-2 block">➕</span>
            <span className="text-sm font-medium text-[#374151]">Add University</span>
          </Link>
          <Link
            href="/admin/leads"
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
          >
            <span className="text-2xl mb-2 block">📋</span>
            <span className="text-sm font-medium text-[#374151]">View All Leads</span>
          </Link>
          <Link
            href="/admin/users"
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
          >
            <span className="text-2xl mb-2 block">👥</span>
            <span className="text-sm font-medium text-[#374151]">Manage Users</span>
          </Link>
          <Link
            href="/universities"
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
          >
            <span className="text-2xl mb-2 block">🌐</span>
            <span className="text-sm font-medium text-[#374151]">View Website</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
    yellow: "bg-yellow-50 border-yellow-200",
    pink: "bg-pink-50 border-pink-200",
    indigo: "bg-indigo-50 border-indigo-200",
  };

  return (
    <Card className={`p-4 border ${colorClasses[color] || "bg-gray-50"}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-2xl font-bold text-[#111827]">{value}</div>
          <div className="text-xs text-[#6B7280]">{label}</div>
        </div>
      </div>
    </Card>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  const timeAgo = getTimeAgo(new Date(lead.redirectedAt));

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div>
        <div className="font-medium text-[#111827]">
          {lead.name || lead.email}
        </div>
        <div className="text-sm text-[#6B7280]">
          {lead.country} • {lead.targetField || "Not specified"}
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-[#6B7280]">{timeAgo}</div>
        {lead.feedback ? (
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            lead.feedback === 'connected' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {lead.feedback}
          </span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
            pending
          </span>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
