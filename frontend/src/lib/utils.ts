// ===========================================
// Utility Functions
// ===========================================

import clsx, { ClassValue } from "clsx";

/**
 * Merge class names with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format currency in Indian Rupees
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency in USD
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format large numbers with K/M suffix
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toString();
}

/**
 * Delay function for animations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sanitize string for safe display (XSS prevention)
 */
export function sanitizeString(str: string): string {
  const div = typeof document !== "undefined" ? document.createElement("div") : null;
  if (div) {
    div.textContent = str;
    return div.innerHTML;
  }
  // Server-side fallback
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Build WhatsApp redirect URL
 */
export function buildWhatsAppUrl(
  phoneNumber: string,
  message: string
): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

/**
 * Get country flag emoji from country name
 */
export function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    "United States": "🇺🇸",
    "United Kingdom": "🇬🇧",
    "Germany": "🇩🇪",
    "Ireland": "🇮🇪",
    "Netherlands": "🇳🇱",
    "Italy": "🇮🇹",
    "France": "🇫🇷",
    "Spain": "🇪🇸",
    "United Arab Emirates": "🇦🇪",
    "Saudi Arabia": "🇸🇦",
    "Australia": "🇦🇺",
    "New Zealand": "🇳🇿",
    "Canada": "\uD83C\uDDE8\uD83C\uDDE6",
    "Singapore": "\uD83C\uDDF8\uD83C\uDDEC",
    "Hong Kong": "\uD83C\uDDED\uD83C\uDDF0",
    "South Korea": "\uD83C\uDDF0\uD83C\uDDF7",
    "Switzerland": "\uD83C\uDDE8\uD83C\uDDED",
  };
  return flags[country] || "🌍";
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
