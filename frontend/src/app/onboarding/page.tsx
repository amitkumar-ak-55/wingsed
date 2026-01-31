"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Header, Footer } from "@/components";
import { Button, Input, Select, Progress, Card } from "@/components/ui";
import { COUNTRIES, FIELDS_OF_STUDY, BUDGET_RANGES, TEST_OPTIONS } from "@/data/constants";
import { onboardingSchema, type OnboardingFormData } from "@/lib/validations";
import { api } from "@/lib/api";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data
  const [formData, setFormData] = useState<Partial<OnboardingFormData>>({
    preferredCountries: [],
    budgetMin: undefined,
    budgetMax: undefined,
    targetField: "",
    targetIntake: "",
    testsTaken: [],
    gre: undefined,
    gmat: undefined,
    ielts: undefined,
    toefl: undefined,
  });

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isSignedIn) return;
      
      try {
        const token = await getToken();
        if (!token) return;

        const currentUser = await api.getCurrentUser(token);
        if (currentUser?.onboardingCompleted) {
          router.push("/universities");
        } else if (currentUser?.onboardingStep) {
          setCurrentStep(currentUser.onboardingStep as Step);
        }
      } catch (error) {
        // User doesn't exist yet, continue with onboarding
        console.log("Starting fresh onboarding");
      }
    };

    checkOnboardingStatus();
  }, [isSignedIn, getToken, router]);

  const updateField = <K extends keyof OnboardingFormData>(
    field: K,
    value: OnboardingFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleCountry = (country: string) => {
    const current = formData.preferredCountries || [];
    if (current.includes(country)) {
      updateField(
        "preferredCountries",
        current.filter((c) => c !== country)
      );
    } else {
      updateField("preferredCountries", [...current, country]);
    }
  };

  const toggleTest = (test: string) => {
    const current = formData.testsTaken || [];
    if (current.includes(test)) {
      updateField(
        "testsTaken",
        current.filter((t) => t !== test)
      );
    } else {
      updateField("testsTaken", [...current, test]);
    }
  };

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.preferredCountries?.length) {
        newErrors.preferredCountries = "Select at least one country";
      }
    }

    if (step === 2) {
      if (!formData.budgetMin || !formData.budgetMax) {
        newErrors.budget = "Select a budget range";
      }
      if (!formData.targetField) {
        newErrors.targetField = "Select a field of study";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    // Save progress
    try {
      const token = await getToken();
      if (token) {
        await api.updateOnboardingStep(token, currentStep + 1);
      }
    } catch (error) {
      console.error("Failed to save progress:", error);
    }

    setCurrentStep((prev) => (prev + 1) as Step);
  };

  const handleBack = () => {
    setCurrentStep((prev) => (prev - 1) as Step);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      // Validate full form
      const validatedData = onboardingSchema.parse(formData);

      // Create profile
      await api.createProfile(token, {
        preferredCountries: validatedData.preferredCountries,
        budgetMin: validatedData.budgetMin,
        budgetMax: validatedData.budgetMax,
        targetField: validatedData.targetField,
        targetIntake: validatedData.targetIntake || undefined,
        testsTaken: (validatedData.testsTaken || []) as any[],
        greScore: validatedData.gre || undefined,
        gmatScore: validatedData.gmat || undefined,
        ieltsScore: validatedData.ielts || undefined,
        toeflScore: validatedData.toefl || undefined,
      });

      router.push("/universities");
    } catch (error: any) {
      console.error("Failed to complete onboarding:", error);
      setErrors({ submit: error.message || "Something went wrong" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-[#6B7280] mb-2">
            <span>Step {currentStep} of 3</span>
            <span>{Math.round((currentStep / 3) * 100)}% complete</span>
          </div>
          <Progress currentStep={currentStep} totalSteps={3} />
        </div>

        {/* Welcome */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#111827] mb-2">
            Welcome{user?.firstName ? `, ${user.firstName}` : ""}! 👋
          </h1>
          <p className="text-[#6B7280]">
            Let&apos;s find your perfect university abroad
          </p>
        </div>

        <Card className="p-8 animate-fadeIn">
          {/* Step 1: Country Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[#111827] mb-2">
                  Where do you want to study?
                </h2>
                <p className="text-[#6B7280] text-sm">
                  Select one or more countries
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {COUNTRIES.map((country) => {
                  const isSelected = formData.preferredCountries?.includes(country.value);
                  return (
                    <button
                      key={country.value}
                      type="button"
                      onClick={() => toggleCountry(country.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-[#2563EB] bg-[#2563EB]/5"
                          : "border-[#E5E7EB] hover:border-[#2563EB]/50"
                      }`}
                    >
                      <span className="text-2xl block mb-1">{country.flag}</span>
                      <span className="text-sm font-medium text-[#374151]">
                        {country.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {errors.preferredCountries && (
                <p className="text-red-500 text-sm">{errors.preferredCountries}</p>
              )}
            </div>
          )}

          {/* Step 2: Budget & Field */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[#111827] mb-2">
                  Tell us about your plans
                </h2>
                <p className="text-[#6B7280] text-sm">
                  This helps us find the best matches for you
                </p>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-3">
                  What&apos;s your total budget for the program? (in INR)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BUDGET_RANGES.map((range) => {
                    const isSelected =
                      formData.budgetMin === range.min &&
                      formData.budgetMax === range.max;
                    return (
                      <button
                        key={range.label}
                        type="button"
                        onClick={() => {
                          updateField("budgetMin", range.min);
                          updateField("budgetMax", range.max);
                        }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? "border-[#2563EB] bg-[#2563EB]/5"
                            : "border-[#E5E7EB] hover:border-[#2563EB]/50"
                        }`}
                      >
                        <span className="font-medium text-[#111827]">
                          {range.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.budget && (
                  <p className="text-red-500 text-sm mt-2">{errors.budget}</p>
                )}
              </div>

              {/* Field of Study */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-3">
                  What do you want to study?
                </label>
                <Select
                  options={FIELDS_OF_STUDY.map((f) => ({ value: f.value, label: f.label }))}
                  value={formData.targetField || ""}
                  onChange={(e) => updateField("targetField", e.target.value)}
                  placeholder="Select a field"
                  error={errors.targetField}
                />
                {formData.targetField === "other" && (
                  <Input
                    placeholder="Enter your field of study"
                    className="mt-3"
                    onChange={(e) => updateField("targetField", e.target.value)}
                  />
                )}
              </div>

              {/* Target Intake */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-3">
                  Target intake (optional)
                </label>
                <Select
                  options={[
                    { value: "fall-2025", label: "Fall 2025" },
                    { value: "spring-2026", label: "Spring 2026" },
                    { value: "fall-2026", label: "Fall 2026" },
                    { value: "spring-2027", label: "Spring 2027" },
                  ]}
                  value={formData.targetIntake || ""}
                  onChange={(e) => updateField("targetIntake", e.target.value)}
                  placeholder="Select intake"
                />
              </div>
            </div>
          )}

          {/* Step 3: Test Scores */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[#111827] mb-2">
                  Test scores (optional)
                </h2>
                <p className="text-[#6B7280] text-sm">
                  Add your scores if you&apos;ve taken any of these tests
                </p>
              </div>

              {/* Test Selection */}
              <div className="flex flex-wrap gap-3">
                {TEST_OPTIONS.map((test) => {
                  const isSelected = formData.testsTaken?.includes(test.value);
                  return (
                    <button
                      key={test.value}
                      type="button"
                      onClick={() => toggleTest(test.value)}
                      className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                        isSelected
                          ? "border-[#2563EB] bg-[#2563EB] text-white"
                          : "border-[#E5E7EB] text-[#374151] hover:border-[#2563EB]/50"
                      }`}
                    >
                      {test.label}
                    </button>
                  );
                })}
              </div>

              {/* Score Inputs */}
              {formData.testsTaken?.includes("GRE") && (
                <Input
                  label="GRE Score"
                  type="number"
                  min={260}
                  max={340}
                  placeholder="260-340"
                  value={formData.gre || ""}
                  onChange={(e) => updateField("gre", parseInt(e.target.value) || undefined)}
                />
              )}

              {formData.testsTaken?.includes("GMAT") && (
                <Input
                  label="GMAT Score"
                  type="number"
                  min={200}
                  max={800}
                  placeholder="200-800"
                  value={formData.gmat || ""}
                  onChange={(e) => updateField("gmat", parseInt(e.target.value) || undefined)}
                />
              )}

              {formData.testsTaken?.includes("IELTS") && (
                <Input
                  label="IELTS Score"
                  type="number"
                  min={0}
                  max={9}
                  step={0.5}
                  placeholder="0-9"
                  value={formData.ielts || ""}
                  onChange={(e) => updateField("ielts", parseFloat(e.target.value) || undefined)}
                />
              )}

              {formData.testsTaken?.includes("TOEFL") && (
                <Input
                  label="TOEFL Score"
                  type="number"
                  min={0}
                  max={120}
                  placeholder="0-120"
                  value={formData.toefl || ""}
                  onChange={(e) => updateField("toefl", parseInt(e.target.value) || undefined)}
                />
              )}

              {formData.testsTaken?.length === 0 && (
                <p className="text-sm text-[#6B7280] italic">
                  No tests selected. You can skip this step.
                </p>
              )}

              {errors.submit && (
                <p className="text-red-500 text-sm">{errors.submit}</p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-[#E5E7EB]">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Continue
              </Button>
            ) : (
              <Button onClick={handleSubmit} isLoading={isSubmitting}>
                Find Universities
              </Button>
            )}
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
