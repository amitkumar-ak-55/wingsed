"use client";

import { useState } from "react";
import clsx from "clsx";

interface ImageFallbackProps {
  src?: string | null;
  alt: string;
  initial: string;
  className?: string;
  imgClassName?: string;
}

/**
 * Branded image component with fallback.
 * Shows the image if it loads successfully; shows a clean navy-initial
 * placeholder on error or when src is missing.
 */
export function ImageFallback({
  src,
  alt,
  initial,
  className,
  imgClassName,
}: ImageFallbackProps) {
  const [failed, setFailed] = useState(false);

  const showFallback = !src || failed;

  return (
    <div
      className={clsx(
        "flex items-center justify-center overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0]",
        className
      )}
    >
      {!showFallback ? (
        <img
          src={src!}
          alt={alt}
          className={clsx("w-full h-full object-contain p-1.5", imgClassName)}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="font-display font-bold text-[#0F172A] select-none">
          {initial}
        </span>
      )}
    </div>
  );
}
