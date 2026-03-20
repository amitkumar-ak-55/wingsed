// ===========================================
// Constants & Configuration Data
// ===========================================

// Countries for the logo strip and onboarding
export const COUNTRIES = [
  { value: "United States", label: "United States", flag: "🇺🇸", code: "US", jobOutcomes: "High", admitDifficulty: "High", cost: "High" },
  { value: "United Kingdom", label: "United Kingdom", flag: "🇬🇧", code: "GB", jobOutcomes: "High", admitDifficulty: "Medium", cost: "High" },
  { value: "Germany", label: "Germany", flag: "🇩🇪", code: "DE", jobOutcomes: "High", admitDifficulty: "Medium", cost: "Low" },
  { value: "Canada", label: "Canada", flag: "🇨🇦", code: "CA", jobOutcomes: "High", admitDifficulty: "High", cost: "Medium" },
  { value: "Australia", label: "Australia", flag: "🇦🇺", code: "AU", jobOutcomes: "High", admitDifficulty: "Medium", cost: "High" },
  { value: "Ireland", label: "Ireland", flag: "🇮🇪", code: "IE", jobOutcomes: "High", admitDifficulty: "Medium", cost: "Medium" },
  { value: "Netherlands", label: "Netherlands", flag: "🇳🇱", code: "NL", jobOutcomes: "High", admitDifficulty: "Medium", cost: "Medium" },
  { value: "Italy", label: "Italy", flag: "🇮🇹", code: "IT", jobOutcomes: "Medium", admitDifficulty: "Low", cost: "Low" },
  { value: "France", label: "France", flag: "🇫🇷", code: "FR", jobOutcomes: "Medium", admitDifficulty: "Medium", cost: "Low" },
  { value: "Spain", label: "Spain", flag: "🇪🇸", code: "ES", jobOutcomes: "Medium", admitDifficulty: "Low", cost: "Low" },
  { value: "United Arab Emirates", label: "AE", flag: "🇦🇪", code: "AE", jobOutcomes: "High", admitDifficulty: "High", cost: "High" },
  { value: "Saudi Arabia", label: "Saudi Arabia", flag: "🇸🇦", code: "SA", jobOutcomes: "High", admitDifficulty: "High", cost: "Medium" },
  { value: "New Zealand", label: "New Zealand", flag: "🇳🇿", code: "NZ", jobOutcomes: "Medium", admitDifficulty: "Low", cost: "High" },
  { value: "Singapore", label: "Singapore", flag: "🇸🇬", code: "SG", jobOutcomes: "High", admitDifficulty: "High", cost: "High" },
  { value: "Hong Kong", label: "Hong Kong", flag: "🇭🇰", code: "HK", jobOutcomes: "High", admitDifficulty: "Medium", cost: "High" },
  { value: "South Korea", label: "South Korea", flag: "🇰🇷", code: "KR", jobOutcomes: "High", admitDifficulty: "High", cost: "Medium" },
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
