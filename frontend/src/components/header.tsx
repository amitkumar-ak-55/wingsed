import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b-2 border-[#111827]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="WingsEd"
              width={140}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/universities"
              className="text-[#374151] hover:text-[#111827] transition-colors text-sm font-medium"
            >
              Universities
            </Link>
            <Link
              href="/#how-it-works"
              className="text-[#374151] hover:text-[#111827] transition-colors text-sm font-medium"
            >
              Services
            </Link>
            <Link
              href="/#testimonials"
              className="text-[#374151] hover:text-[#111827] transition-colors text-sm font-medium"
            >
              Case Studies
            </Link>
            <Link
              href="/sign-in"
              className="text-[#374151] hover:text-[#111827] transition-colors text-sm font-medium"
            >
              Sign In
            </Link>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <Link
              href="/onboarding"
              className="hidden sm:inline-flex px-5 py-2.5 bg-[#111827] text-white text-sm font-medium rounded-full hover:bg-[#374151] transition-colors border-2 border-[#111827]"
            >
              Request a quote
            </Link>
            
            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-[#6B7280] hover:text-[#111827]">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
