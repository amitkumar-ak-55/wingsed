import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <SignIn
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
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/onboarding"
      />
    </div>
  );
}
