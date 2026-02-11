"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { getAdminLeads, deleteAdminLead, Lead } from "@/lib/api";
import { Card, Skeleton, Button, Input } from "@/components/ui";
import { formatINR } from "@/lib/utils";

export default function AdminLeadsPage() {
  const { getToken } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [feedbackFilter, setFeedbackFilter] = useState("");

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const result = await getAdminLeads(token, {
        page,
        limit: 20,
        search: search || undefined,
        country: countryFilter || undefined,
        feedback: feedbackFilter || undefined,
      });

      if (result.data) {
        setLeads(result.data.leads);
        setTotalPages(result.data.totalPages);
        setTotal(result.data.total);
        setError(null);
      } else {
        setError(result.error || "Failed to load leads");
      }
    } catch (err) {
      setError("Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [getToken, page, search, countryFilter, feedbackFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    // useEffect will trigger fetchLeads when page/search changes
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      const token = await getToken();
      if (!token) return;

      const result = await deleteAdminLead(token, id);
      if (result.error) {
        alert(result.error);
      } else {
        fetchLeads();
      }
    } catch (err) {
      alert("Failed to delete lead");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Leads</h1>
          <p className="text-[#6B7280]">
            {total} total leads from onboarding form
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>

          {/* Country Filter */}
          <label className="sr-only" htmlFor="country-filter">Filter by country</label>
          <select
            id="country-filter"
            value={countryFilter}
            onChange={(e) => {
              setCountryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="">All Countries</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
            <option value="Germany">Germany</option>
            <option value="Ireland">Ireland</option>
          </select>

          {/* Feedback Filter */}
          <label className="sr-only" htmlFor="feedback-filter">Filter by feedback status</label>
          <select
            id="feedback-filter"
            value={feedbackFilter}
            onChange={(e) => {
              setFeedbackFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="connected">Connected</option>
            <option value="no_response">No Response</option>
          </select>
        </div>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchLeads()}>Try Again</Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && leads.length === 0 && (
        <Card className="p-12 text-center">
          <span className="text-4xl mb-4 block">📭</span>
          <h2 className="text-xl font-semibold text-[#111827] mb-2">No leads found</h2>
          <p className="text-[#6B7280]">
            {search || countryFilter || feedbackFilter
              ? "Try adjusting your filters"
              : "Leads will appear here when users complete the onboarding form"}
          </p>
        </Card>
      )}

      {/* Leads Table */}
      {!isLoading && !error && leads.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Preferences
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-[#111827]">
                        {lead.name || "—"}
                      </div>
                      <div className="text-sm text-[#6B7280]">{lead.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-[#111827]">
                        {lead.country || "—"}
                      </div>
                      <div className="text-sm text-[#6B7280]">
                        {lead.targetField || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-[#111827]">
                        {lead.budgetMin && lead.budgetMax
                          ? `${formatINR(lead.budgetMin)} - ${formatINR(lead.budgetMax)}`
                          : lead.budgetMin
                          ? `From ${formatINR(lead.budgetMin)}`
                          : lead.budgetMax
                          ? `Up to ${formatINR(lead.budgetMax)}`
                          : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          lead.feedback === "connected"
                            ? "bg-green-100 text-green-700"
                            : lead.feedback === "no_response"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {lead.feedback || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#6B7280]">
                      {lead.redirectedAt ? formatDate(lead.redirectedAt) : "—"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-[#6B7280]">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
