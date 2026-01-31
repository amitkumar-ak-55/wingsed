// ===========================================
// API Client with Security Best Practices
// ===========================================

import type { User, University, StudentProfile } from "@/types";

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

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: data.message || "An error occurred",
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

  searchUniversities: async (token: string | null, params: {
    q?: string;
    country?: string;
    budgetMin?: number;
    budgetMax?: number;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set("q", params.q);
    if (params.country) searchParams.set("country", params.country);
    if (params.budgetMin) searchParams.set("budgetMin", params.budgetMin.toString());
    if (params.budgetMax) searchParams.set("budgetMax", params.budgetMax.toString());
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString();
    const result = await apiClient<{
      universities: any[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/universities/search${query ? `?${query}` : ""}`, {
      token: token || undefined,
    });

    return result.data || { universities: [], total: 0, page: 1, totalPages: 1 };
  },
};
