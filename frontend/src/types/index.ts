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
  customDestination: string | null;
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
  tuitionFee: number; // USD annual tuition
  publicPrivate: "Public" | "Private" | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  // New fields from Phase 1
  imageUrl: string | null;
  address: string | null;
  qsRanking: number | null;
  timesRanking: number | null;
  usNewsRanking: number | null;
  acceptanceRate: number | null;
  applicationFee: number | null;
  campusType: "URBAN" | "SUBURBAN" | "RURAL" | null;
  totalStudents: number | null;
  internationalStudentPercent: number | null;
  foodHousingCost: number | null;
  avgScholarshipAmount: number | null;
  employmentRate: number | null;
  // Relations
  programs?: Program[];
  createdAt: string;
  updatedAt: string;
}

export interface Program {
  id: string;
  universityId: string;
  name: string;
  degreeType: "BACHELORS" | "MASTERS" | "PHD" | "DIPLOMA" | "CERTIFICATE";
  department: string | null;
  duration: string | null;
  tuitionFee: number | null;
  description: string | null;
  applicationDeadline: string | null;
  intakes: string[];
  greRequired: boolean;
  greMinScore: number | null;
  gmatRequired: boolean;
  gmatMinScore: number | null;
  ieltsMinScore: number | null;
  toeflMinScore: number | null;
  gpaMinScore: number | null;
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
