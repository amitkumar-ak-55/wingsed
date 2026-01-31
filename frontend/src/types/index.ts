// ===========================================
// TypeScript Types
// ===========================================

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  role: "STUDENT" | "ADMIN" | "COUNSELOR";
  onboardingStep: number;
  onboardingCompleted: boolean;
  profile: StudentProfile | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  preferredCountries: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  targetField: string;
  targetIntake: string | null;
  testsTaken: string[];
  greScore: number | null;
  gmatScore: number | null;
  ieltsScore: number | null;
  toeflScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  avgTuitionInr: number;
  avgTuitionUsd: number;
  qsRanking: number | null;
  programsOffered: string[];
  intakes: string[];
  ieltsReq: number | null;
  toeflReq: number | null;
  greReq: number | null;
  gmatReq: number | null;
  publicPrivate: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface WhatsAppLead {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  country: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  targetField: string | null;
  messageText: string;
  redirectedAt: string;
  feedbackAt: string | null;
  feedback: "connected" | "no_response" | null;
}

// Onboarding step definitions
export const ONBOARDING_STEPS = [
  { id: 1, label: "Country", key: "country" },
  { id: 2, label: "Budget", key: "budget" },
  { id: 3, label: "Field", key: "targetField" },
  { id: 4, label: "Test", key: "testTaken" },
  { id: 5, label: "Intake", key: "intake" },
] as const;

export type OnboardingStepKey = (typeof ONBOARDING_STEPS)[number]["key"];
