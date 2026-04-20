"use client";

import { useCompare } from "@/lib/compare-context";
import { Button } from "@/components/ui";

interface CompareButtonProps {
  universityId: string;
  variant?: "default" | "icon" | "labeled";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CompareButton({
  universityId,
  variant = "default",
  size = "sm",
  className = "",
}: CompareButtonProps) {
  const { isInCompare, addToCompare, removeFromCompare, canAddMore } = useCompare();
  const isSelected = isInCompare(universityId);

  const handleClick = () => {
    if (isSelected) {
      removeFromCompare(universityId);
    } else if (canAddMore) {
      addToCompare(universityId);
    }
  };

  // Labeled variant - compact button with text
  if (variant === "labeled") {
    return (
      <button
        onClick={handleClick}
        disabled={!isSelected && !canAddMore}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          isSelected 
            ? "text-[#0F172A] bg-[#F8FAFC] hover:bg-[#E2E8F0]" 
            : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
        } ${className}`}
        title={isSelected ? "Remove from compare" : canAddMore ? "Add to compare" : "Compare limit reached (3 max)"}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span className="text-xs font-medium">{isSelected ? "Comparing" : "Compare"}</span>
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={!isSelected && !canAddMore}
        className={`p-2 rounded-lg transition-all ${
          isSelected
            ? "bg-[#0F172A] text-white hover:bg-[#1E293B]"
            : canAddMore
            ? "bg-white/90 hover:bg-white text-[#64748B] hover:text-[#0F172A]"
            : "bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed"
        } ${className}`}
        title={isSelected ? "Remove from compare" : canAddMore ? "Add to compare" : "Compare limit reached"}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </button>
    );
  }

  return (
    <Button
      variant={isSelected ? "primary" : "outline"}
      size={size}
      onClick={handleClick}
      disabled={!isSelected && !canAddMore}
      className={className}
    >
      {isSelected ? "✓ Comparing" : "Compare"}
    </Button>
  );
}
