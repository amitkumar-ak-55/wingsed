"use client";

import { ReactNode } from "react";
import { CompareProvider } from "@/lib/compare-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CompareProvider>
      {children}
    </CompareProvider>
  );
}
