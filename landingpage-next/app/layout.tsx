import type { Metadata, Viewport } from "next";
import { Fraunces, Fredoka, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { MotionConfig } from "motion/react";

import { AnnouncementBar } from "@/components/AnnouncementBar";
import { CheckoutModal } from "@/components/CheckoutModal";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileStickyCta } from "@/components/MobileStickyCta";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SiteJsonLd } from "@/components/JsonLd";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { CheckoutProvider } from "@/lib/checkout-context";
import { SITE } from "@/lib/config";

import "./globals.css";

// Body/UI: Hanken Grotesk — humanistische Grotesk aus dem neuen Claude-Design
// (warm, gut lesbar). Variable Font → keine weight-Liste noetig.
const hankenSans = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Zahlen/Technik: JetBrains Mono fuer Scores, Preise, Report-IDs, Ticker, Snippets
// (Design-Signatur: technische Mono-Akzente).
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Display/Headlines H1–H3: Fraunces (Upright + Italic) — Serifen-Display der
// „Gutachten"-Design-Sprache (warm-editorial, Prüfbericht-Typo). EIN variabler
// Font mit beiden Stilen: die Italic-Akzentwoerter (`italic gradient-text`)
// loesen ueber font-style automatisch in den echten Kursiv-Schnitt auf —
// keine separate --font-display-italic-Variable mehr noetig. Nur wght-Achse
// (Default) → schlanker Payload, display:swap gegen FOIT.
const frauncesDisplay = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// Marken-Schrift: Fredoka — NUR noch fuer Marken-/Filo-Momente (Logo-Wortmarke,
// .btn-cta). Die Headline-Rolle hat Fraunces uebernommen.
const fredokaBrand = Fredoka({
  variable: "--font-brand",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s | ${SITE.name}`,
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
// Light (Papier-Creme) ist der Standard (siehe ThemeProvider) → colorScheme
// "light" zuerst und die warme Papier-Farbe als Browser-UI-Default. next-themes
// setzt color-scheme auf <html> beim Theme-Wechsel zusaetzlich dynamisch.
export const viewport: Viewport = {
  colorScheme: "light dark",
  // „Das Gutachten" Light-Default: Papier-Creme ≈ oklch(0.975 0.008 85).
  themeColor: "#faf6ed",
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
      className={`${hankenSans.variable} ${jetbrainsMono.variable} ${frauncesDisplay.variable} ${fredokaBrand.variable} h-full antialiased`}
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
              {/* Lese-Fortschrittsbalken (fixed, aria-hidden) + Ankuendigungs-Bar
                  ueber dem sticky Header — Design-Signaturen. */}
              <ScrollProgress />
              <AnnouncementBar />
              <Header />
              <main
                id="main"
                className="relative z-[2] flex flex-1 flex-col bg-background text-foreground"
              >
                {children}
              </main>
              <Footer />
              <MobileStickyCta />
              <CheckoutModal />
              <CookieBanner />
              <Toaster />
            </CheckoutProvider>
          </MotionConfig>
        </ThemeProvider>
        <SiteJsonLd />
      </body>
    </html>
  );
}
