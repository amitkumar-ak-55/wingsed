"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  getAdminUniversities,
  createAdminUniversity,
  updateAdminUniversity,
  deleteAdminUniversity,
  createAdminProgram,
  updateAdminProgram,
  deleteAdminProgram,
} from "@/lib/api";
import type { University, Program } from "@/types";
import { Card, Skeleton, Button, Input } from "@/components/ui";
import { formatUSD, getCountryFlag } from "@/lib/utils";
import { COUNTRIES } from "@/data/constants";

// ===========================================
// Types
// ===========================================

interface UniversityFormData {
  name: string;
  country: string;
  city: string;
  tuitionFee: string;
  publicPrivate: string;
  logoUrl: string;
  websiteUrl: string;
  description: string;
  imageUrl: string;
  address: string;
  qsRanking: string;
  timesRanking: string;
  usNewsRanking: string;
  acceptanceRate: string;
  applicationFee: string;
  campusType: string;
  totalStudents: string;
  internationalStudentPercent: string;
  foodHousingCost: string;
  avgScholarshipAmount: string;
  employmentRate: string;
}

interface ProgramFormData {
  name: string;
  degreeType: string;
  department: string;
  duration: string;
  tuitionFee: string;
  applicationDeadline: string;
  intakes: string;
  description: string;
  greRequired: boolean;
  gmatRequired: boolean;
  ieltsMinScore: string;
  toeflMinScore: string;
  gpaMinScore: string;
}

const emptyUniversityForm: UniversityFormData = {
  name: "", country: "", city: "", tuitionFee: "", publicPrivate: "Public",
  logoUrl: "", websiteUrl: "", description: "", imageUrl: "", address: "",
  qsRanking: "", timesRanking: "", usNewsRanking: "", acceptanceRate: "",
  applicationFee: "", campusType: "", totalStudents: "",
  internationalStudentPercent: "", foodHousingCost: "", avgScholarshipAmount: "",
  employmentRate: "",
};

const emptyProgramForm: ProgramFormData = {
  name: "", degreeType: "MASTERS", department: "", duration: "", tuitionFee: "",
  applicationDeadline: "", intakes: "", description: "",
  greRequired: false, gmatRequired: false,
  ieltsMinScore: "", toeflMinScore: "", gpaMinScore: "",
};

// ===========================================
// Helper: Label + Input
// ===========================================

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#111827] mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function inputClass() {
  return "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white";
}

// ===========================================
// Main Page
// ===========================================

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
  const [formData, setFormData] = useState<UniversityFormData>(emptyUniversityForm);
  const [isSaving, setIsSaving] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<"basic" | "rankings" | "campus" | "financial" | "programs">("basic");

  // Program modal
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [programForm, setProgramForm] = useState<ProgramFormData>(emptyProgramForm);
  const [isSavingProgram, setIsSavingProgram] = useState(false);

  // Success message
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchUniversities = useCallback(async () => {
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
    } catch {
      setError("Failed to load universities");
    } finally {
      setIsLoading(false);
    }
  }, [getToken, page, search, countryFilter]);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUniversities();
  };

  // ===========================================
  // University CRUD
  // ===========================================

  const openCreateModal = () => {
    setEditingUniversity(null);
    setFormData(emptyUniversityForm);
    setActiveFormTab("basic");
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
      imageUrl: uni.imageUrl || "",
      address: uni.address || "",
      qsRanking: uni.qsRanking?.toString() || "",
      timesRanking: uni.timesRanking?.toString() || "",
      usNewsRanking: uni.usNewsRanking?.toString() || "",
      acceptanceRate: uni.acceptanceRate?.toString() || "",
      applicationFee: uni.applicationFee?.toString() || "",
      campusType: uni.campusType || "",
      totalStudents: uni.totalStudents?.toString() || "",
      internationalStudentPercent: uni.internationalStudentPercent?.toString() || "",
      foodHousingCost: uni.foodHousingCost?.toString() || "",
      avgScholarshipAmount: uni.avgScholarshipAmount?.toString() || "",
      employmentRate: uni.employmentRate?.toString() || "",
    });
    setActiveFormTab("basic");
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = await getToken();
      if (!token) return;

      const data: Record<string, unknown> = {
        name: formData.name,
        country: formData.country,
        city: formData.city,
        tuitionFee: parseInt(formData.tuitionFee, 10),
        publicPrivate: formData.publicPrivate,
        logoUrl: formData.logoUrl || undefined,
        websiteUrl: formData.websiteUrl || undefined,
        description: formData.description || undefined,
        imageUrl: formData.imageUrl || undefined,
        address: formData.address || undefined,
        qsRanking: formData.qsRanking ? parseInt(formData.qsRanking, 10) : null,
        timesRanking: formData.timesRanking ? parseInt(formData.timesRanking, 10) : null,
        usNewsRanking: formData.usNewsRanking ? parseInt(formData.usNewsRanking, 10) : null,
        acceptanceRate: formData.acceptanceRate ? parseFloat(formData.acceptanceRate) : null,
        applicationFee: formData.applicationFee ? parseInt(formData.applicationFee, 10) : null,
        campusType: formData.campusType || null,
        totalStudents: formData.totalStudents ? parseInt(formData.totalStudents, 10) : null,
        internationalStudentPercent: formData.internationalStudentPercent ? parseFloat(formData.internationalStudentPercent) : null,
        foodHousingCost: formData.foodHousingCost ? parseInt(formData.foodHousingCost, 10) : null,
        avgScholarshipAmount: formData.avgScholarshipAmount ? parseInt(formData.avgScholarshipAmount, 10) : null,
        employmentRate: formData.employmentRate ? parseFloat(formData.employmentRate) : null,
      };

      if (editingUniversity) {
        const result = await updateAdminUniversity(token, editingUniversity.id, data);
        if (result.data) {
          setEditingUniversity(result.data.university);
        }
        showSuccess("University updated successfully!");
      } else {
        await createAdminUniversity(token, data as never);
        showSuccess("University created successfully!");
        setShowModal(false);
      }

      fetchUniversities();
    } catch {
      alert("Failed to save university");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also remove all programs, saved entries, and applications.`)) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      await deleteAdminUniversity(token, id);
      showSuccess(`"${name}" deleted successfully.`);
      fetchUniversities();
    } catch {
      alert("Failed to delete university");
    }
  };

  // ===========================================
  // Program CRUD
  // ===========================================

  const openCreateProgramModal = () => {
    setEditingProgram(null);
    setProgramForm(emptyProgramForm);
    setShowProgramModal(true);
  };

  const openEditProgramModal = (program: Program) => {
    setEditingProgram(program);
    setProgramForm({
      name: program.name,
      degreeType: program.degreeType,
      department: program.department || "",
      duration: program.duration || "",
      tuitionFee: program.tuitionFee?.toString() || "",
      applicationDeadline: program.applicationDeadline ? program.applicationDeadline.split("T")[0] : "",
      intakes: program.intakes?.join(", ") || "",
      description: program.description || "",
      greRequired: program.greRequired,
      gmatRequired: program.gmatRequired,
      ieltsMinScore: program.ieltsMinScore?.toString() || "",
      toeflMinScore: program.toeflMinScore?.toString() || "",
      gpaMinScore: program.gpaMinScore?.toString() || "",
    });
    setShowProgramModal(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUniversity) return;
    setIsSavingProgram(true);

    try {
      const token = await getToken();
      if (!token) return;

      const data: Record<string, unknown> = {
        name: programForm.name,
        degreeType: programForm.degreeType,
        department: programForm.department || null,
        duration: programForm.duration || null,
        tuitionFee: programForm.tuitionFee ? parseInt(programForm.tuitionFee, 10) : null,
        applicationDeadline: programForm.applicationDeadline || null,
        intakes: programForm.intakes ? programForm.intakes.split(",").map(s => s.trim()).filter(Boolean) : [],
        description: programForm.description || null,
        greRequired: programForm.greRequired,
        gmatRequired: programForm.gmatRequired,
        ieltsMinScore: programForm.ieltsMinScore ? parseFloat(programForm.ieltsMinScore) : null,
        toeflMinScore: programForm.toeflMinScore ? parseInt(programForm.toeflMinScore, 10) : null,
        gpaMinScore: programForm.gpaMinScore ? parseFloat(programForm.gpaMinScore) : null,
      };

      if (editingProgram) {
        await updateAdminProgram(token, editingProgram.id, data);
        showSuccess("Program updated!");
      } else {
        await createAdminProgram(token, editingUniversity.id, data);
        showSuccess("Program added!");
      }

      // Refresh university data to get updated programs
      const refreshResult = await getAdminUniversities(token, { page, limit: 20, search: search || undefined, country: countryFilter || undefined });
      if (refreshResult.data) {
        const updated = refreshResult.data.universities.find(u => u.id === editingUniversity.id);
        if (updated) setEditingUniversity(updated);
        setUniversities(refreshResult.data.universities);
      }

      setShowProgramModal(false);
    } catch {
      alert("Failed to save program");
    } finally {
      setIsSavingProgram(false);
    }
  };

  const handleDeleteProgram = async (programId: string, programName: string) => {
    if (!confirm(`Delete program "${programName}"?`)) return;

    try {
      const token = await getToken();
      if (!token || !editingUniversity) return;

      await deleteAdminProgram(token, programId);
      showSuccess("Program deleted.");

      // Refresh
      const refreshResult = await getAdminUniversities(token, { page, limit: 20, search: search || undefined, country: countryFilter || undefined });
      if (refreshResult.data) {
        const updated = refreshResult.data.universities.find(u => u.id === editingUniversity.id);
        if (updated) setEditingUniversity(updated);
        setUniversities(refreshResult.data.universities);
      }
    } catch {
      alert("Failed to delete program");
    }
  };

  const updateForm = (field: keyof UniversityFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateProgramField = (field: keyof ProgramFormData, value: string | boolean) => {
    setProgramForm(prev => ({ ...prev, [field]: value }));
  };

  const programs = editingUniversity?.programs || [];

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-60 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right text-sm font-medium">
          {successMsg}
        </div>
      )}

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
            <Button type="submit" variant="outline">Search</Button>
          </form>
          <select
            value={countryFilter}
            onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}
            className={inputClass()}
          >
            <option value="">All Countries</option>
            {COUNTRIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32" />)}
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
              <Card key={uni.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {/* Logo */}
                  <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {uni.logoUrl ? (
                      <img src={uni.logoUrl} alt={uni.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-400">{uni.name.charAt(0)}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#111827] truncate">{uni.name}</h3>
                    <p className="text-sm text-[#6B7280]">
                      {getCountryFlag(uni.country)} {uni.city}, {uni.country}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-medium text-[#2563EB]">{formatUSD(uni.tuitionFee)}/yr</p>
                      {uni.programs && uni.programs.length > 0 && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                          {uni.programs.length} programs
                        </span>
                      )}
                      {uni.qsRanking && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          QS #{uni.qsRanking}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => openEditModal(uni)} className="text-sm text-[#2563EB] hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(uni.id, uni.name)} className="text-sm text-red-500 hover:underline">
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
              <div className="text-sm text-[#6B7280]">Page {page} of {totalPages}</div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================= */}
      {/* UNIVERSITY EDIT / CREATE MODAL */}
      {/* ============================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowModal(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-[#111827]">
                {editingUniversity ? `Edit: ${editingUniversity.name}` : "Add University"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                &times;
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-3 border-b border-gray-100 flex gap-1 shrink-0 overflow-x-auto">
              {([
                { key: "basic", label: "Basic Info" },
                { key: "rankings", label: "Rankings" },
                { key: "campus", label: "Campus" },
                { key: "financial", label: "Financial" },
                ...(editingUniversity ? [{ key: "programs", label: `Programs (${programs.length})` }] : []),
              ] as { key: typeof activeFormTab; label: string }[]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFormTab(tab.key)}
                  className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                    activeFormTab === tab.key
                      ? "bg-[#2563EB] text-white"
                      : "text-[#6B7280] hover:text-[#111827] hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <form id="university-form" onSubmit={handleSave}>
                {/* BASIC INFO TAB */}
                {activeFormTab === "basic" && (
                  <div className="space-y-4">
                    <Field label="University Name" required>
                      <Input type="text" value={formData.name} onChange={(e) => updateForm("name", e.target.value)} required />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Country" required>
                        <select value={formData.country} onChange={(e) => updateForm("country", e.target.value)} required className={inputClass()}>
                          <option value="">Select...</option>
                          {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </Field>
                      <Field label="City" required>
                        <Input type="text" value={formData.city} onChange={(e) => updateForm("city", e.target.value)} required />
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Tuition Fee (USD/year)" required>
                        <Input type="number" value={formData.tuitionFee} onChange={(e) => updateForm("tuitionFee", e.target.value)} required min="0" />
                      </Field>
                      <Field label="Type" required>
                        <select value={formData.publicPrivate} onChange={(e) => updateForm("publicPrivate", e.target.value)} className={inputClass()}>
                          <option value="Public">Public</option>
                          <option value="Private">Private</option>
                        </select>
                      </Field>
                    </div>

                    <Field label="Logo URL">
                      <Input type="url" value={formData.logoUrl} onChange={(e) => updateForm("logoUrl", e.target.value)} placeholder="https://..." />
                    </Field>

                    <Field label="Website URL">
                      <Input type="url" value={formData.websiteUrl} onChange={(e) => updateForm("websiteUrl", e.target.value)} placeholder="https://..." />
                    </Field>

                    <Field label="Image URL (banner/campus photo)">
                      <Input type="url" value={formData.imageUrl} onChange={(e) => updateForm("imageUrl", e.target.value)} placeholder="https://..." />
                    </Field>

                    <Field label="Description">
                      <textarea
                        value={formData.description}
                        onChange={(e) => updateForm("description", e.target.value)}
                        rows={3}
                        className={`${inputClass()} resize-none`}
                      />
                    </Field>
                  </div>
                )}

                {/* RANKINGS TAB */}
                {activeFormTab === "rankings" && (
                  <div className="space-y-4">
                    <p className="text-sm text-[#6B7280] bg-blue-50 p-3 rounded-lg">
                      Enter world ranking numbers. Leave blank if not ranked or unknown.
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <Field label="QS World Ranking">
                        <Input type="number" value={formData.qsRanking} onChange={(e) => updateForm("qsRanking", e.target.value)} min="1" placeholder="#" />
                      </Field>
                      <Field label="THE World Ranking">
                        <Input type="number" value={formData.timesRanking} onChange={(e) => updateForm("timesRanking", e.target.value)} min="1" placeholder="#" />
                      </Field>
                      <Field label="US News Ranking">
                        <Input type="number" value={formData.usNewsRanking} onChange={(e) => updateForm("usNewsRanking", e.target.value)} min="1" placeholder="#" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Acceptance Rate (%)">
                        <Input type="number" value={formData.acceptanceRate} onChange={(e) => updateForm("acceptanceRate", e.target.value)} min="0" max="100" step="0.1" placeholder="e.g. 5.2" />
                      </Field>
                      <Field label="Employment Rate (%)">
                        <Input type="number" value={formData.employmentRate} onChange={(e) => updateForm("employmentRate", e.target.value)} min="0" max="100" step="0.1" placeholder="e.g. 95.0" />
                      </Field>
                    </div>
                  </div>
                )}

                {/* CAMPUS TAB */}
                {activeFormTab === "campus" && (
                  <div className="space-y-4">
                    <Field label="Campus Type">
                      <select value={formData.campusType} onChange={(e) => updateForm("campusType", e.target.value)} className={inputClass()}>
                        <option value="">Not specified</option>
                        <option value="URBAN">Urban</option>
                        <option value="SUBURBAN">Suburban</option>
                        <option value="RURAL">Rural</option>
                      </select>
                    </Field>
                    <Field label="Full Address">
                      <Input type="text" value={formData.address} onChange={(e) => updateForm("address", e.target.value)} placeholder="Street, City, State, Country" />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Total Students">
                        <Input type="number" value={formData.totalStudents} onChange={(e) => updateForm("totalStudents", e.target.value)} min="0" placeholder="e.g. 25000" />
                      </Field>
                      <Field label="International Students (%)">
                        <Input type="number" value={formData.internationalStudentPercent} onChange={(e) => updateForm("internationalStudentPercent", e.target.value)} min="0" max="100" step="0.1" placeholder="e.g. 22.5" />
                      </Field>
                    </div>
                  </div>
                )}

                {/* FINANCIAL TAB */}
                {activeFormTab === "financial" && (
                  <div className="space-y-4">
                    <p className="text-sm text-[#6B7280] bg-green-50 p-3 rounded-lg">
                      All amounts in USD. These help students estimate total costs.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Application Fee (USD)">
                        <Input type="number" value={formData.applicationFee} onChange={(e) => updateForm("applicationFee", e.target.value)} min="0" placeholder="e.g. 75" />
                      </Field>
                      <Field label="Food & Housing (USD/year)">
                        <Input type="number" value={formData.foodHousingCost} onChange={(e) => updateForm("foodHousingCost", e.target.value)} min="0" placeholder="e.g. 15000" />
                      </Field>
                    </div>
                    <Field label="Avg Scholarship Amount (USD/year)">
                      <Input type="number" value={formData.avgScholarshipAmount} onChange={(e) => updateForm("avgScholarshipAmount", e.target.value)} min="0" placeholder="e.g. 10000" />
                    </Field>
                  </div>
                )}

                {/* PROGRAMS TAB */}
                {activeFormTab === "programs" && editingUniversity && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#6B7280]">
                        {programs.length} program{programs.length !== 1 ? "s" : ""} listed
                      </p>
                      <Button type="button" variant="primary" onClick={openCreateProgramModal}>
                        + Add Program
                      </Button>
                    </div>

                    {programs.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <p className="text-[#6B7280] mb-2">No programs added yet.</p>
                        <Button type="button" variant="outline" onClick={openCreateProgramModal}>
                          Add First Program
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {programs.map(program => (
                          <div key={program.id} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-[#111827] text-sm">{program.name}</h4>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    program.degreeType === "MASTERS" ? "bg-purple-100 text-purple-700" :
                                    program.degreeType === "BACHELORS" ? "bg-blue-100 text-blue-700" :
                                    program.degreeType === "PHD" ? "bg-red-100 text-red-700" :
                                    "bg-gray-100 text-gray-700"
                                  }`}>
                                    {program.degreeType}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6B7280]">
                                  {program.duration && <span>{program.duration}</span>}
                                  {program.tuitionFee && <span>{formatUSD(program.tuitionFee)}/yr</span>}
                                  {program.intakes?.length > 0 && <span>{program.intakes.join(", ")}</span>}
                                  {program.greRequired && <span className="text-blue-600">GRE</span>}
                                  {program.gmatRequired && <span className="text-purple-600">GMAT</span>}
                                  {program.ieltsMinScore && <span>IELTS {program.ieltsMinScore}+</span>}
                                  {program.toeflMinScore && <span>TOEFL {program.toeflMinScore}+</span>}
                                  {program.gpaMinScore && <span>GPA {program.gpaMinScore}+</span>}
                                </div>
                              </div>
                              <div className="flex gap-2 shrink-0 ml-3">
                                <button type="button" onClick={() => openEditProgramModal(program)} className="text-xs text-[#2563EB] hover:underline">
                                  Edit
                                </button>
                                <button type="button" onClick={() => handleDeleteProgram(program.id, program.name)} className="text-xs text-red-500 hover:underline">
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            {activeFormTab !== "programs" && (
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" form="university-form" variant="primary" disabled={isSaving} className="flex-1">
                  {isSaving ? "Saving..." : editingUniversity ? "Save Changes" : "Create University"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================= */}
      {/* PROGRAM EDIT / CREATE MODAL */}
      {/* ============================================= */}
      {showProgramModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowProgramModal(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-[#111827]">
                {editingProgram ? "Edit Program" : "Add Program"}
              </h3>
              <button onClick={() => setShowProgramModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <form id="program-form" onSubmit={handleSaveProgram} className="space-y-4">
                <Field label="Program Name" required>
                  <Input type="text" value={programForm.name} onChange={(e) => updateProgramField("name", e.target.value)} required placeholder="e.g. MS Computer Science" />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Degree Type" required>
                    <select value={programForm.degreeType} onChange={(e) => updateProgramField("degreeType", e.target.value)} className={inputClass()} required>
                      <option value="BACHELORS">Bachelor&apos;s</option>
                      <option value="MASTERS">Master&apos;s</option>
                      <option value="PHD">PhD</option>
                      <option value="DIPLOMA">Diploma</option>
                      <option value="CERTIFICATE">Certificate</option>
                    </select>
                  </Field>
                  <Field label="Duration">
                    <Input type="text" value={programForm.duration} onChange={(e) => updateProgramField("duration", e.target.value)} placeholder="e.g. 2 years" />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Program Tuition (USD/year)">
                    <Input type="number" value={programForm.tuitionFee} onChange={(e) => updateProgramField("tuitionFee", e.target.value)} min="0" />
                  </Field>
                  <Field label="Intakes">
                    <select value={programForm.intakes} onChange={(e) => updateProgramField("intakes", e.target.value)} className={inputClass()}>
                      <option value="">Not specified</option>
                      <option value="Fall">Fall</option>
                      <option value="Spring">Spring</option>
                      <option value="Fall, Spring">Fall, Spring</option>
                      <option value="Fall, Spring, Summer">All Intakes</option>
                    </select>
                  </Field>
                </div>

                <Field label="Department">
                  <Input type="text" value={programForm.department} onChange={(e) => updateProgramField("department", e.target.value)} placeholder="e.g. School of Engineering" />
                </Field>

                <Field label="Application Deadline">
                  <Input type="date" value={programForm.applicationDeadline} onChange={(e) => updateProgramField("applicationDeadline", e.target.value)} />
                </Field>

                <Field label="Description">
                  <textarea
                    value={programForm.description}
                    onChange={(e) => updateProgramField("description", e.target.value)}
                    rows={2}
                    className={`${inputClass()} resize-none`}
                    placeholder="Brief description of the program..."
                  />
                </Field>

                {/* Admission Requirements */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-[#111827]">Admission Requirements</h4>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={programForm.greRequired}
                        onChange={(e) => updateProgramField("greRequired", e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]"
                      />
                      <span className="text-sm text-[#111827]">Requires GRE</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={programForm.gmatRequired}
                        onChange={(e) => updateProgramField("gmatRequired", e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]"
                      />
                      <span className="text-sm text-[#111827]">Requires GMAT</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Min IELTS">
                      <Input type="number" value={programForm.ieltsMinScore} onChange={(e) => updateProgramField("ieltsMinScore", e.target.value)} min="0" max="9" step="0.5" placeholder="e.g. 7.0" />
                    </Field>
                    <Field label="Min TOEFL">
                      <Input type="number" value={programForm.toeflMinScore} onChange={(e) => updateProgramField("toeflMinScore", e.target.value)} min="0" max="120" placeholder="e.g. 100" />
                    </Field>
                    <Field label="Min GPA">
                      <Input type="number" value={programForm.gpaMinScore} onChange={(e) => updateProgramField("gpaMinScore", e.target.value)} min="0" max="4" step="0.1" placeholder="e.g. 3.5" />
                    </Field>
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
              <Button type="button" variant="outline" onClick={() => setShowProgramModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" form="program-form" variant="primary" disabled={isSavingProgram} className="flex-1">
                {isSavingProgram ? "Saving..." : editingProgram ? "Update Program" : "Add Program"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
