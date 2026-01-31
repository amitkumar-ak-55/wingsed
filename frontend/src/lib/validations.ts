// ===========================================
// Zod Validation Schemas
// ===========================================

import { z } from "zod";

// ===========================================
// Onboarding Form Schemas
// ===========================================

export const countrySchema = z.object({
  country: z.string().min(1, "Please select a country"),
});

export const budgetSchema = z.object({
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
});

export const fieldOfStudySchema = z.object({
  targetField: z.string().min(1, "Please select or enter your field of study"),
});

export const testTakenSchema = z.object({
  testTaken: z.enum(["IELTS", "GRE", "GMAT", "TOEFL", "NONE"]),
});

export const intakeSchema = z.object({
  intake: z.string().optional(),
});

// Combined onboarding schema
export const onboardingSchema = z.object({
  preferredCountries: z.array(z.string()).min(1, "Please select at least one country"),
  budgetMin: z.number().min(0),
  budgetMax: z.number().min(0),
  targetField: z.string().min(1, "Please select your field of study"),
  targetIntake: z.string().optional(),
  testsTaken: z.array(z.string()).optional(),
  gre: z.number().min(260).max(340).optional(),
  gmat: z.number().min(200).max(800).optional(),
  ielts: z.number().min(0).max(9).optional(),
  toefl: z.number().min(0).max(120).optional(),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

// ===========================================
// University Search Schema
// ===========================================

export const universitySearchSchema = z.object({
  search: z.string().optional(),
  country: z.string().optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(50).default(12),
});

export type UniversitySearchParams = z.infer<typeof universitySearchSchema>;

// ===========================================
// WhatsApp Lead Schema
// ===========================================

export const whatsAppLeadSchema = z.object({
  name: z.string().optional(),
  country: z.string().optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  targetField: z.string().optional(),
});

export type WhatsAppLeadData = z.infer<typeof whatsAppLeadSchema>;

// ===========================================
// Feedback Schema
// ===========================================

export const feedbackSchema = z.object({
  feedback: z.enum(["connected", "no_response"]),
});

export type FeedbackData = z.infer<typeof feedbackSchema>;
