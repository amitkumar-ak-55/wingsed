"use client";

import { useCompare } from "@/lib/compare-context";
import { Button } from "@/components/ui";

export function CompareBar() {
  const { compareIds, clearCompare, goToCompare } = useCompare();

  if (compareIds.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 animate-slideUp">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#2563EB] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[#111827]">
                  {compareIds.length} {compareIds.length === 1 ? "university" : "universities"} selected
                </p>
                <p className="text-sm text-[#6B7280]">
                  {compareIds.length >= 2 ? "Ready to compare!" : `Add ${2 - compareIds.length} more to compare`}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={clearCompare}
            >
              Clear
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={goToCompare}
              disabled={compareIds.length < 1}
            >
              Compare Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
