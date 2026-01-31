"use client";

import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { WHATSAPP_CONFIG } from "@/data/constants";
import { buildWhatsAppUrl } from "@/lib/utils";
import clsx from "clsx";

interface WhatsAppButtonProps {
  /** Custom message to prefill */
  message?: string;
  /** Additional data to include in the message */
  userData?: {
    name?: string;
    country?: string;
    budgetMin?: number;
    budgetMax?: number;
    targetField?: string;
  };
  /** Show as compact icon only on mobile */
  compactOnMobile?: boolean;
  /** Custom class name */
  className?: string;
}

export function WhatsAppButton({
  message,
  userData,
  compactOnMobile = true,
  className,
}: WhatsAppButtonProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  // Build the WhatsApp message
  const buildMessage = () => {
    if (message) return message;

    const parts: string[] = [];
    
    if (userData?.name) {
      parts.push(`Hi, I am ${userData.name}`);
    } else {
      parts.push("Hi");
    }

    if (userData?.country) {
      parts.push(`I want to study in ${userData.country}`);
    }

    if (userData?.budgetMin || userData?.budgetMax) {
      if (userData.budgetMin && userData.budgetMax) {
        parts.push(`within a budget of ₹${userData.budgetMin.toLocaleString("en-IN")} - ₹${userData.budgetMax.toLocaleString("en-IN")}`);
      } else if (userData.budgetMax) {
        parts.push(`within a budget of up to ₹${userData.budgetMax.toLocaleString("en-IN")}`);
      }
    }

    if (userData?.targetField) {
      parts.push(`I'm interested in ${userData.targetField}`);
    }

    if (parts.length === 1) {
      return WHATSAPP_CONFIG.defaultMessage;
    }

    return parts.join(". ") + ". Please help me find the right university.";
  };

  const handleClick = () => {
    if (!isSignedIn) return; // SignInButton will handle this
    
    const finalMessage = buildMessage();
    const whatsappUrl = buildWhatsAppUrl(WHATSAPP_CONFIG.phoneNumber, finalMessage);
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  // Don't show if auth isn't loaded
  if (!isLoaded) return null;

  const buttonContent = (
    <>
      {/* WhatsApp Icon */}
      <svg
        className="w-6 h-6 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      
      {/* Text - hidden on mobile if compact */}
      <span
        className={clsx(
          "font-medium whitespace-nowrap",
          compactOnMobile && "hidden sm:inline"
        )}
      >
        Talk to an Expert
      </span>
    </>
  );

  // If not signed in, wrap with SignInButton
  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button
          className={clsx(
            "fixed bottom-6 right-6 z-50",
            "flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5",
            "bg-[#25D366] text-white rounded-full shadow-lg",
            "hover:bg-[#20BD5A] hover:shadow-xl hover:scale-105",
            "transition-all duration-300 ease-out",
            "animate-pulse-subtle",
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {buttonContent}
        </button>
      </SignInButton>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={clsx(
        "fixed bottom-6 right-6 z-50",
        "flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5",
        "bg-[#25D366] text-white rounded-full shadow-lg",
        "hover:bg-[#20BD5A] hover:shadow-xl hover:scale-105",
        "transition-all duration-300 ease-out",
        isHovered ? "animate-none" : "animate-pulse-subtle",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {buttonContent}
    </button>
  );
}
