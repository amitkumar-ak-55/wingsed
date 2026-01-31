import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg border border-[#E5E7EB]",
            headerTitle: "text-[#111827]",
            headerSubtitle: "text-[#6B7280]",
            formButtonPrimary: "bg-[#2563EB] hover:bg-[#1D4ED8]",
            footerActionLink: "text-[#2563EB] hover:text-[#1D4ED8]",
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/onboarding"
      />
    </div>
  );
}
