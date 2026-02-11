// ===========================================
// Constants & Configuration Data
// ===========================================

// Countries for the logo strip and onboarding
export const COUNTRIES = [
  { value: "United States", label: "United States", flag: "🇺🇸" },
  { value: "United Kingdom", label: "United Kingdom", flag: "🇬🇧" },
  { value: "Canada", label: "Canada", flag: "🇨🇦" },
  { value: "Australia", label: "Australia", flag: "🇦🇺" },
  { value: "Germany", label: "Germany", flag: "🇩🇪" },
  { value: "Ireland", label: "Ireland", flag: "🇮🇪" },
  { value: "Netherlands", label: "Netherlands", flag: "🇳🇱" },
  { value: "Italy", label: "Italy", flag: "🇮🇹" },
  { value: "France", label: "France", flag: "🇫🇷" },
  { value: "Spain", label: "Spain", flag: "🇪🇸" },
  { value: "United Arab Emirates", label: "UAE", flag: "🇦🇪" },
  { value: "Saudi Arabia", label: "Saudi Arabia", flag: "🇸🇦" },
  { value: "New Zealand", label: "New Zealand", flag: "🇳🇿" },
  { value: "Singapore", label: "Singapore", flag: "🇸🇬" },
  { value: "Hong Kong", label: "Hong Kong", flag: "🇭🇰" },
  { value: "South Korea", label: "South Korea", flag: "🇰🇷" },
] as const;

// Field of study options for onboarding dropdown
export const FIELDS_OF_STUDY = [
  { value: "mba", label: "MBA" },
  { value: "ms-cs", label: "MS Computer Science" },
  { value: "ms-ds", label: "MS Data Science" },
  { value: "ms-ba", label: "MS Business Analytics" },
  { value: "ms-eng", label: "MS Engineering" },
  { value: "other", label: "Other (specify below)" },
] as const;

// Intake options
export const INTAKE_OPTIONS = [
  { value: "fall-2026", label: "Fall 2026" },
  { value: "spring-2026", label: "Spring 2026" },
  { value: "fall-2027", label: "Fall 2027" },
  { value: "spring-2027", label: "Spring 2027" },
  { value: "undecided", label: "Not decided yet" },
] as const;

// Budget ranges (in INR Lakhs)
export const BUDGET_RANGES = [
  { min: 0, max: 2000000, label: "Under ₹20 Lakhs" },
  { min: 2000000, max: 4000000, label: "₹20-40 Lakhs" },
  { min: 4000000, max: 6000000, label: "₹40-60 Lakhs" },
  { min: 6000000, max: 10000000, label: "₹60 Lakhs - 1 Cr" },
  { min: 10000000, max: 999999999, label: "Above ₹1 Cr" },
] as const;

// Test options
export const TEST_OPTIONS = [
  { value: "GRE", label: "GRE" },
  { value: "GMAT", label: "GMAT" },
  { value: "IELTS", label: "IELTS" },
  { value: "TOEFL", label: "TOEFL" },
] as const;

// WhatsApp configuration
export const WHATSAPP_CONFIG = {
  phoneNumber: process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER || "918658805653",
  defaultMessage: "Hi, I'm interested in studying abroad and would like to speak with a counselor.",
} as const;

// Landing page stats
export const LANDING_STATS = {
  universitiesCount: 500,
  countriesCount: 16,
  studentsHelped: 10000,
  successRate: 98,
} as const;
