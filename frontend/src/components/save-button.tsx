"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface SaveButtonProps {
  universityId: string;
  initialSaved?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "labeled";
  className?: string;
  onSaveChange?: (saved: boolean) => void;
}

const GUEST_SAVED_KEY = "wingsed_saved_universities";

// Get saved universities from localStorage for guests
function getGuestSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(GUEST_SAVED_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Set saved universities in localStorage for guests
function setGuestSaved(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_SAVED_KEY, JSON.stringify(ids));
}

export function SaveButton({
  universityId,
  initialSaved = false,
  size = "md",
  variant = "icon",
  className = "",
  onSaveChange,
}: SaveButtonProps) {
  const { isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle hydration - check localStorage on mount for guests
  useEffect(() => {
    setMounted(true);
    if (!isSignedIn) {
      const guestSaved = getGuestSaved();
      setIsSaved(guestSaved.includes(universityId));
    }
  }, [isSignedIn, universityId]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;
    setIsLoading(true);

    try {
      if (isSignedIn) {
        // Logged-in user: use API
        const token = await getToken();
        if (!token) {
          router.push("/sign-in");
          return;
        }

        if (isSaved) {
          await api.unsaveUniversity(token, universityId);
          setIsSaved(false);
          onSaveChange?.(false);
        } else {
          await api.saveUniversity(token, universityId);
          setIsSaved(true);
          onSaveChange?.(true);
        }
      } else {
        // Guest user: use localStorage
        const guestSaved = getGuestSaved();
        if (isSaved) {
          const updated = guestSaved.filter((id) => id !== universityId);
          setGuestSaved(updated);
          setIsSaved(false);
          onSaveChange?.(false);
        } else {
          guestSaved.push(universityId);
          setGuestSaved(guestSaved);
          setIsSaved(true);
          onSaveChange?.(true);
        }
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    if (variant === "labeled") {
      return (
        <button className="flex items-center gap-1.5 px-2 py-1 text-gray-300" disabled>
          <HeartIcon className="w-4 h-4" filled={false} />
          <span className="text-xs font-medium">Save</span>
        </button>
      );
    }
    return (
      <button
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 ${className}`}
        disabled
      >
        <HeartIcon className={`${iconSizes[size]} text-gray-300`} filled={false} />
      </button>
    );
  }

  // Labeled variant - compact button with text
  if (variant === "labeled") {
    return (
      <button
        onClick={handleToggleSave}
        disabled={isLoading}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all duration-200 disabled:opacity-50 ${
          isSaved 
            ? "text-red-500 bg-red-50 hover:bg-red-100" 
            : "text-[#6B7280] hover:text-red-500 hover:bg-red-50"
        } ${className}`}
        title={isSaved ? "Remove from saved" : "Save university"}
      >
        {isLoading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <HeartIcon className="w-4 h-4" filled={isSaved} />
        )}
        <span className="text-xs font-medium">{isSaved ? "Saved" : "Save"}</span>
      </button>
    );
  }

  // Icon variant - original round button
  return (
    <button
      onClick={handleToggleSave}
      disabled={isLoading}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 disabled:opacity-50 ${className}`}
      title={isSaved ? "Remove from saved" : "Save university"}
      aria-label={isSaved ? "Remove from saved" : "Save university"}
    >
      {isLoading ? (
        <svg
          className={`${iconSizes[size]} animate-spin text-gray-400`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <HeartIcon
          className={`${iconSizes[size]} transition-colors duration-200 ${
            isSaved ? "text-red-500" : "text-gray-400 hover:text-red-400"
          }`}
          filled={isSaved}
        />
      )}
    </button>
  );
}

function HeartIcon({ className, filled }: { className?: string; filled: boolean }) {
  if (filled) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

export default SaveButton;
