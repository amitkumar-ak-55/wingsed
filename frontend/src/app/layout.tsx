import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WingsEdu - Shortlist Universities That Fit You",
  description:
    "Find the perfect university for your postgraduate studies abroad. Get personalized guidance from expert counselors.",
  keywords: [
    "study abroad",
    "universities",
    "postgraduate",
    "masters",
    "MBA",
    "education consultant",
    "Indian students",
  ],
  authors: [{ name: "WingsEdu" }],
  openGraph: {
    title: "WingsEdu - Shortlist Universities That Fit You",
    description:
      "Find the perfect university for your postgraduate studies abroad.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.variable} font-sans min-h-screen bg-[#F9FAFB] text-[#111827] antialiased`}
          suppressHydrationWarning
        >
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
