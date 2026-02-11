// ===========================================
// API Client with Security Best Practices
// ===========================================

import type { User, University, Program } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  token?: string;
  cache?: RequestCache;
  revalidate?: number;
}

/**
 * Secure API client for server-side API calls
 * - Automatically handles JSON serialization
 * - Adds authorization headers when token provided
 * - Returns typed responses
 * - Never exposes sensitive data
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, token, cache, revalidate } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add auth token if provided (server-side only)
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: cache || (revalidate !== undefined ? undefined : "no-store"),
      next: revalidate !== undefined ? { revalidate } : undefined,
    });

    let data: any = null;
    // Only attempt to parse JSON if there is content
    if (response.status !== 204) {
      const text = await response.text();
      if (text) {
        data = JSON.parse(text);
      }
    }

    if (!response.ok) {
      return {
        data: null,
        error: (data && data.message) || "An error occurred",
        status: response.status,
      };
    }

    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      data: null,
      error: "Network error. Please try again.",
      status: 0,
    };
  }
}

// ===========================================
// Public API calls (no auth required)
// ===========================================

export async function getUniversities(params?: {
  country?: string;
  budgetMin?: number;
  budgetMax?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.country) searchParams.set("country", params.country);
  if (params?.budgetMin) searchParams.set("budgetMin", params.budgetMin.toString());
  if (params?.budgetMax) searchParams.set("budgetMax", params.budgetMax.toString());
  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString());

  const query = searchParams.toString();
  return apiClient(`/universities${query ? `?${query}` : ""}`, {
    revalidate: 300, // Cache for 5 minutes
  });
}

export async function getCountries() {
  return apiClient<{ countries: string[] }>("/universities/countries", {
    revalidate: 3600, // Cache for 1 hour
  });
}

export async function getUniversityCount() {
  return apiClient<{ count: number }>("/universities/count", {
    revalidate: 3600,
  });
}

export async function getUniversityById(id: string) {
  return apiClient<{ university: University }>(`/universities/${id}`, {
    revalidate: 300, // Cache for 5 minutes
  });
}

export async function getRecommendations(params?: {
  country?: string;
  budgetMin?: number;
  budgetMax?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.country) searchParams.set("country", params.country);
  if (params?.budgetMin) searchParams.set("budgetMin", params.budgetMin.toString());
  if (params?.budgetMax) searchParams.set("budgetMax", params.budgetMax.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  
  const query = searchParams.toString();
  return apiClient<{ recommendations: University[] }>(
    `/universities/recommendations${query ? `?${query}` : ""}`,
    { revalidate: 300 }
  );
}

// ===========================================
// Authenticated API calls (server-side only)
// ===========================================

export async function getCurrentUser(token: string) {
  return apiClient<User>("/users/me", { token });
}

export async function updateOnboardingStep(token: string, step: number) {
  return apiClient("/users/onboarding-step", {
    method: "PATCH",
    body: { step },
    token,
  });
}

export async function getProfile(token: string) {
  return apiClient("/profile", { token });
}

export async function updateProfile(
  token: string,
  data: {
    country?: string;
    budgetMin?: number;
    budgetMax?: number;
    targetField?: string;
    intake?: string;
    testTaken?: string;
  }
) {
  return apiClient("/profile", {
    method: "PATCH",
    body: data,
    token,
  });
}

export async function createWhatsAppLead(
  token: string,
  data: {
    name?: string;
    country?: string;
    budgetMin?: number;
    budgetMax?: number;
    targetField?: string;
  }
) {
  return apiClient<{ leadId: string; redirectUrl: string }>(
    "/leads/whatsapp-redirect",
    {
      method: "POST",
      body: data,
      token,
    }
  );
}

export async function updateWhatsAppFeedback(
  token: string,
  leadId: string,
  feedback: "connected" | "no_response"
) {
  return apiClient(`/leads/${leadId}/feedback`, {
    method: "PATCH",
    body: { feedback },
    token,
  });
}

// ===========================================
// Saved Universities API
// ===========================================

export async function getSavedUniversities(token: string) {
  return apiClient<{ savedUniversities: Array<{ id: string; universityId: string; university: University }> }>(
    "/saved-universities",
    { token }
  );
}

export async function getSavedUniversityIds(token: string) {
  return apiClient<{ ids: string[] }>("/saved-universities/ids", { token });
}

export async function saveUniversity(token: string, universityId: string) {
  return apiClient<{ saved: { id: string; universityId: string } }>(
    `/saved-universities/${universityId}`,
    { method: "POST", token }
  );
}

export async function unsaveUniversity(token: string, universityId: string) {
  return apiClient(`/saved-universities/${universityId}`, {
    method: "DELETE",
    token,
  });
}

// ===========================================
// Applications API
// ===========================================

export type ApplicationStatus = "RESEARCHING" | "PREPARING" | "APPLIED" | "ACCEPTED" | "REJECTED";

export interface Application {
  id: string;
  universityId: string;
  university: University;
  status: ApplicationStatus;
  program?: string;
  intake?: string;
  notes?: string;
  deadline?: string;
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getApplications(token: string) {
  return apiClient<{ applications: Application[] }>("/applications", { token });
}

export async function getApplicationsByStatus(token: string) {
  return apiClient<{ grouped: Record<ApplicationStatus, Application[]> }>("/applications/by-status", { token });
}

export async function getApplicationStats(token: string) {
  return apiClient<{ stats: { total: number; byStatus: Record<ApplicationStatus, number> } }>("/applications/stats", { token });
}

export async function createApplication(token: string, data: {
  universityId: string;
  status?: ApplicationStatus;
  program?: string;
  intake?: string;
  notes?: string;
  deadline?: string;
}) {
  return apiClient<{ application: Application }>("/applications", {
    method: "POST",
    body: data,
    token,
  });
}

export async function updateApplication(token: string, id: string, data: {
  status?: ApplicationStatus;
  program?: string;
  intake?: string;
  notes?: string;
  deadline?: string;
}) {
  return apiClient<{ application: Application }>(`/applications/${id}`, {
    method: "PATCH",
    body: data,
    token,
  });
}

export async function deleteApplication(token: string, id: string) {
  return apiClient(`/applications/${id}`, {
    method: "DELETE",
    token,
  });
}

// ===========================================
// Convenience API object for easier usage
// ===========================================

export const api = {
  // Public endpoints
  getUniversities,
  getCountries,
  getUniversityCount,

  // Authenticated endpoints
  getCurrentUser: async (token: string) => {
    const result = await getCurrentUser(token);
    return result.data;
  },
  
  updateOnboardingStep: async (token: string, step: number) => {
    const result = await updateOnboardingStep(token, step);
    return result.data;
  },
  
  getProfile: async (token: string) => {
    const result = await getProfile(token);
    return result.data;
  },

  createProfile: async (token: string, data: {
    preferredCountries: string[];
    budgetMin: number;
    budgetMax: number;
    targetField: string;
    targetIntake?: string;
    testsTaken?: string[];
    greScore?: number;
    gmatScore?: number;
    ieltsScore?: number;
    toeflScore?: number;
  }) => {
    return apiClient("/profile", {
      method: "POST",
      body: data,
      token,
    });
  },
  
  updateProfile: async (token: string, data: {
    country?: string;
    budgetMin?: number;
    budgetMax?: number;
    targetField?: string;
    intake?: string;
    testTaken?: string;
  }) => {
    const result = await updateProfile(token, data);
    return result.data;
  },
  
  createWhatsAppLead: async (token: string, data: {
    name?: string;
    country?: string;
    budgetMin?: number;
    budgetMax?: number;
    targetField?: string;
  }) => {
    const result = await createWhatsAppLead(token, data);
    return result.data;
  },
  
  updateWhatsAppFeedback: async (token: string, leadId: string, feedback: "connected" | "no_response") => {
    const result = await updateWhatsAppFeedback(token, leadId, feedback);
    return result.data;
  },

  // Saved Universities
  getSavedUniversities: async (token: string) => {
    const result = await getSavedUniversities(token);
    return result.data?.savedUniversities ?? [];
  },

  getSavedUniversityIds: async (token: string) => {
    const result = await getSavedUniversityIds(token);
    return result.data?.ids ?? [];
  },

  saveUniversity: async (token: string, universityId: string) => {
    const result = await saveUniversity(token, universityId);
    return result.data;
  },

  unsaveUniversity: async (token: string, universityId: string) => {
    await unsaveUniversity(token, universityId);
  },

  searchUniversities: async (token: string | null, params: {
    q?: string;
    country?: string;
    budgetMin?: number;
    budgetMax?: number;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    // Map 'q' to 'search' for backend compatibility
    if (params.q) searchParams.set("search", params.q);
    if (params.country) searchParams.set("country", params.country);
    if (params.budgetMin) searchParams.set("budgetMin", params.budgetMin.toString());
    if (params.budgetMax) searchParams.set("budgetMax", params.budgetMax.toString());
    if (params.page) searchParams.set("page", params.page.toString());
    // Map 'limit' to 'pageSize' for backend compatibility
    if (params.limit) searchParams.set("pageSize", params.limit.toString());

    const query = searchParams.toString();
    const result = await apiClient<{
      data: University[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/universities${query ? `?${query}` : ""}`, {
      token: token || undefined,
    });

    // Map 'data' to 'universities' for frontend compatibility
    return result.data 
      ? { universities: result.data.data, total: result.data.total, page: result.data.page, totalPages: result.data.totalPages }
      : { universities: [], total: 0, page: 1, totalPages: 1 };
  },

  // Applications
  getApplications: async (token: string) => {
    const result = await getApplications(token);
    return result.data?.applications ?? [];
  },

  getApplicationsByStatus: async (token: string) => {
    const result = await getApplicationsByStatus(token);
    return result.data?.grouped ?? {};
  },

  getApplicationStats: async (token: string) => {
    const result = await getApplicationStats(token);
    return result.data?.stats ?? { total: 0, byStatus: {} };
  },

  createApplication: async (token: string, data: Parameters<typeof createApplication>[1]) => {
    const result = await createApplication(token, data);
    return result.data?.application;
  },

  updateApplication: async (token: string, id: string, data: Parameters<typeof updateApplication>[2]) => {
    const result = await updateApplication(token, id, data);
    return result.data?.application;
  },

  deleteApplication: async (token: string, id: string) => {
    await deleteApplication(token, id);
  },
};

// ===========================================
// Admin API Functions
// ===========================================

export interface DashboardStats {
  totalLeads: number;
  leadsToday: number;
  leadsThisWeek: number;
  totalUsers: number;
  usersToday: number;
  totalUniversities: number;
  leadsByCountry: { country: string; count: number }[];
  recentLeads: Lead[];
}

export interface Lead {
  id: string;
  clerkId: string;
  email: string;
  name?: string;
  country?: string;
  budgetMin?: number;
  budgetMax?: number;
  targetField?: string;
  messageText: string;
  feedback?: string;
  feedbackAt?: string;
  redirectedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  clerkId: string;
  role: 'STUDENT' | 'ADMIN' | 'COUNSELOR';
  onboardingStep: number;
  createdAt: string;
  updatedAt: string;
  studentProfile?: {
    country: string;
    targetField: string;
    budgetMin?: number;
    budgetMax?: number;
  };
}

// Admin Dashboard Stats
export async function getAdminStats(token: string) {
  return apiClient<{ stats: DashboardStats }>('/admin/stats', { token });
}

// Admin Leads
export async function getAdminLeads(token: string, params?: {
  page?: number;
  limit?: number;
  country?: string;
  feedback?: string;
  search?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.country) searchParams.set('country', params.country);
  if (params?.feedback) searchParams.set('feedback', params.feedback);
  if (params?.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  return apiClient<{ leads: Lead[]; total: number; page: number; totalPages: number }>(
    `/admin/leads${query ? `?${query}` : ''}`,
    { token }
  );
}

export async function deleteAdminLead(token: string, id: string) {
  return apiClient(`/admin/leads/${id}`, { method: 'DELETE', token });
}

// Admin Universities
export async function getAdminUniversities(token: string, params?: {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.search) searchParams.set('search', params.search);
  if (params?.country) searchParams.set('country', params.country);

  const query = searchParams.toString();
  return apiClient<{ universities: University[]; total: number; page: number; totalPages: number }>(
    `/admin/universities${query ? `?${query}` : ''}`,
    { token }
  );
}

export async function createAdminUniversity(token: string, data: {
  name: string;
  country: string;
  city: string;
  tuitionFee: number;
  publicPrivate: string;
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
  imageUrl?: string;
  address?: string;
  qsRanking?: number;
  timesRanking?: number;
  usNewsRanking?: number;
  acceptanceRate?: number;
  applicationFee?: number;
  campusType?: string;
  totalStudents?: number;
  internationalStudentPercent?: number;
  foodHousingCost?: number;
  avgScholarshipAmount?: number;
  employmentRate?: number;
}) {
  return apiClient<{ university: University }>('/admin/universities', {
    method: 'POST',
    body: data,
    token,
  });
}

export async function updateAdminUniversity(token: string, id: string, data: Record<string, unknown>) {
  return apiClient<{ university: University }>(`/admin/universities/${id}`, {
    method: 'PATCH',
    body: data,
    token,
  });
}

export async function deleteAdminUniversity(token: string, id: string) {
  return apiClient(`/admin/universities/${id}`, { method: 'DELETE', token });
}

export async function getAdminUniversityById(token: string, id: string) {
  return apiClient<{ university: University }>(`/admin/universities/${id}`, { token });
}

// Admin Programs
export async function createAdminProgram(token: string, universityId: string, data: Record<string, unknown>) {
  return apiClient<{ program: Program }>(`/admin/universities/${universityId}/programs`, {
    method: 'POST',
    body: data,
    token,
  });
}

export async function updateAdminProgram(token: string, programId: string, data: Record<string, unknown>) {
  return apiClient<{ program: Program }>(`/admin/programs/${programId}`, {
    method: 'PATCH',
    body: data,
    token,
  });
}

export async function deleteAdminProgram(token: string, programId: string) {
  return apiClient(`/admin/programs/${programId}`, { method: 'DELETE', token });
}

// Admin Users
export async function getAdminUsers(token: string, params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.search) searchParams.set('search', params.search);
  if (params?.role) searchParams.set('role', params.role);

  const query = searchParams.toString();
  return apiClient<{ users: AdminUser[]; total: number; page: number; totalPages: number }>(
    `/admin/users${query ? `?${query}` : ''}`,
    { token }
  );
}

export async function updateAdminUserRole(token: string, userId: string, role: 'STUDENT' | 'ADMIN' | 'COUNSELOR') {
  return apiClient<{ user: AdminUser }>(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: { role },
    token,
  });
}
