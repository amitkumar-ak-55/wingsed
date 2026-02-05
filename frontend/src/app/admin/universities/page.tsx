"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  getAdminUniversities,
  createAdminUniversity,
  updateAdminUniversity,
  deleteAdminUniversity,
} from "@/lib/api";
import type { University } from "@/types";
import { Card, Skeleton, Button, Input } from "@/components/ui";
import { formatUSD, getCountryFlag } from "@/lib/utils";
import { COUNTRIES } from "@/data/constants";

export default function AdminUniversitiesPage() {
  const { getToken } = useAuth();
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    city: "",
    tuitionFee: "",
    publicPrivate: "Public",
    logoUrl: "",
    websiteUrl: "",
    description: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchUniversities = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const result = await getAdminUniversities(token, {
        page,
        limit: 20,
        search: search || undefined,
        country: countryFilter || undefined,
      });

      if (result.data) {
        setUniversities(result.data.universities);
        setTotalPages(result.data.totalPages);
        setTotal(result.data.total);
      } else {
        setError(result.error || "Failed to load universities");
      }
    } catch (err) {
      setError("Failed to load universities");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, [getToken, page, countryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUniversities();
  };

  const openCreateModal = () => {
    setEditingUniversity(null);
    setFormData({
      name: "",
      country: "",
      city: "",
      tuitionFee: "",
      publicPrivate: "Public",
      logoUrl: "",
      websiteUrl: "",
      description: "",
    });
    setShowModal(true);
  };

  const openEditModal = (uni: University) => {
    setEditingUniversity(uni);
    setFormData({
      name: uni.name,
      country: uni.country,
      city: uni.city,
      tuitionFee: uni.tuitionFee.toString(),
      publicPrivate: uni.publicPrivate || "Public",
      logoUrl: uni.logoUrl || "",
      websiteUrl: uni.websiteUrl || "",
      description: uni.description || "",
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = await getToken();
      if (!token) return;

      const data = {
        name: formData.name,
        country: formData.country,
        city: formData.city,
        tuitionFee: parseInt(formData.tuitionFee, 10),
        publicPrivate: formData.publicPrivate,
        logoUrl: formData.logoUrl || undefined,
        websiteUrl: formData.websiteUrl || undefined,
        description: formData.description || undefined,
      };

      if (editingUniversity) {
        await updateAdminUniversity(token, editingUniversity.id, data);
      } else {
        await createAdminUniversity(token, data);
      }

      setShowModal(false);
      fetchUniversities();
    } catch (err) {
      alert("Failed to save university");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also remove it from all users' saved lists and applications.`)) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      await deleteAdminUniversity(token, id);
      fetchUniversities();
    } catch (err) {
      alert("Failed to delete university");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Universities</h1>
          <p className="text-[#6B7280]">{total} universities in database</p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          + Add University
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>

          <select
            value={countryFilter}
            onChange={(e) => {
              setCountryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="">All Countries</option>
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchUniversities()}>Try Again</Button>
        </div>
      )}

      {/* Universities Grid */}
      {!isLoading && !error && universities.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {universities.map((uni) => (
              <Card key={uni.id} className="p-4">
                <div className="flex gap-4">
                  {/* Logo */}
                  <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {uni.logoUrl ? (
                      <img
                        src={uni.logoUrl}
                        alt={uni.name}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-400">
                        {uni.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#111827] truncate">
                      {uni.name}
                    </h3>
                    <p className="text-sm text-[#6B7280]">
                      {getCountryFlag(uni.country)} {uni.city}, {uni.country}
                    </p>
                    <p className="text-sm font-medium text-[#2563EB]">
                      {formatUSD(uni.tuitionFee)}/year
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => openEditModal(uni)}
                      className="text-sm text-[#2563EB] hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(uni.id, uni.name)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
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
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#111827] mb-4">
              {editingUniversity ? "Edit University" : "Add University"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">
                  Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1">
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <option value="">Select...</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1">
                    City *
                  </label>
                  <Input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1">
                    Tuition Fee (USD/year) *
                  </label>
                  <Input
                    type="number"
                    value={formData.tuitionFee}
                    onChange={(e) =>
                      setFormData({ ...formData, tuitionFee: e.target.value })
                    }
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.publicPrivate}
                    onChange={(e) =>
                      setFormData({ ...formData, publicPrivate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">
                  Logo URL
                </label>
                <Input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, logoUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">
                  Website URL
                </label>
                <Input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, websiteUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? "Saving..." : editingUniversity ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
