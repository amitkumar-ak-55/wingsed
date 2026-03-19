import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "wingsed - Shortlist Universities That Fit You",
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
  authors: [{ name: "WingsEd" }],
  openGraph: {
    title: "wingsed - Shortlist Universities That Fit You",
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
          className={`${inter.variable} ${jakarta.variable} font-sans min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased`}
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
