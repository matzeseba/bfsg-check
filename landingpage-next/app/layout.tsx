import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { MotionConfig } from "motion/react";

import { CheckoutModal } from "@/components/CheckoutModal";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { CheckoutProvider } from "@/lib/checkout-context";
import { SITE } from "@/lib/config";

import "./globals.css";

// Body/UI: Geist (technisch-neutrale Grotesk, Vercel-Stack).
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Zahlen/Technik: Geist Mono fuer Scores, Preise, Report-IDs, Snippets.
const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Display/Headlines: Fraunces — optischer Serif fuer editoriale Premium-Wirkung.
// Variable Font (weight-Range + opsz/SOFT-Achsen) → next/font erlaubt `axes`
// nur ohne explizite `weight`-Liste.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: "%s | BFSG-Check",
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "Compliance",
  keywords: [
    "BFSG",
    "Barrierefreiheit",
    "Barrierefreiheitsstärkungsgesetz",
    "WCAG",
    "Accessibility",
    "Website-Audit",
    "Compliance",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    creator: "@bfsgcheck",
    site: "@bfsgcheck",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

// Next 16: themeColor/colorScheme gehoeren in den viewport-Export.
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0e1a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      // data-scroll-behavior="smooth": Next 16 ueberschreibt scroll-behavior
      // sonst nicht mehr bei Navigation (s. Upgrade-Guide v16).
      data-scroll-behavior="smooth"
      // next-themes setzt .dark vor Hydration via Inline-Script.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>
          {/* reducedMotion="user" laesst ALLE motion-Komponenten prefers-reduced-motion
              respektieren (WCAG 2.3.3/2.2.2) — die CSS-@media-Regel deckt nur CSS-Keyframes,
              nicht die JS-Animationen. Ein Provider statt 35 Einzel-Guards. */}
          <MotionConfig reducedMotion="user">
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-deep focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-deep focus:shadow-card-hover"
            >
              Zum Hauptinhalt springen
            </a>
            <CheckoutProvider>
              <Header />
              <main
                id="main"
                className="relative z-[2] flex flex-1 flex-col bg-background text-foreground"
              >
                {children}
              </main>
              <Footer />
              <CheckoutModal />
              <CookieBanner />
              <Toaster />
            </CheckoutProvider>
          </MotionConfig>
        </ThemeProvider>
        <JsonLd />
      </body>
    </html>
  );
}
