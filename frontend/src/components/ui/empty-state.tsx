import Link from "next/link";
import type { ReactNode } from "react";

interface EmptyStateCta {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  body: string;
  primaryCta?: EmptyStateCta;
  secondaryCta?: EmptyStateCta;
}

/**
 * Branded empty-state block.
 * Gold-tinted icon area, navy title, brand-aligned CTAs.
 */
export function EmptyState({
  icon,
  title,
  body,
  primaryCta,
  secondaryCta,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 animate-fade-in">
      {/* Icon */}
      <div className="w-20 h-20 bg-[#F59E0B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <div className="text-[#F59E0B]">{icon}</div>
      </div>

      {/* Text */}
      <h2 className="font-display text-2xl font-bold text-[#0F172A] mb-2">
        {title}
      </h2>
      <p className="text-[#64748B] mb-8 max-w-md mx-auto">{body}</p>

      {/* CTAs */}
      {(primaryCta || secondaryCta) && (
        <div className="flex items-center justify-center gap-3">
          {secondaryCta && (
            <CtaButton variant="secondary" cta={secondaryCta} />
          )}
          {primaryCta && <CtaButton variant="primary" cta={primaryCta} />}
        </div>
      )}
    </div>
  );
}

function CtaButton({
  variant,
  cta,
}: {
  variant: "primary" | "secondary";
  cta: EmptyStateCta;
}) {
  const baseClass =
    variant === "primary"
      ? "px-6 py-3 bg-[#0F172A] text-white rounded-xl font-bold hover:bg-[#1E293B] transition-all duration-300 shadow-sm hover:shadow-md"
      : "px-6 py-3 border border-[#E2E8F0] text-[#0F172A] rounded-xl font-bold hover:bg-[#F8FAFC] transition-all duration-300";

  if (cta.href) {
    return (
      <Link href={cta.href} className={baseClass}>
        {cta.label}
      </Link>
    );
  }

  return (
    <button onClick={cta.onClick} className={baseClass}>
      {cta.label}
    </button>
  );
}
