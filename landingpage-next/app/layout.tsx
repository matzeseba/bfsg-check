import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";

import { CheckoutModal } from "@/components/CheckoutModal";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { Toaster } from "@/components/ui/sonner";
import { CheckoutProvider } from "@/lib/checkout-context";
import { SITE } from "@/lib/config";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${interTight.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <CheckoutProvider>
          <Header />
          <main className="flex flex-1 flex-col bg-background text-foreground">
            {children}
          </main>
          <Footer />
          <CheckoutModal />
          <CookieBanner />
          <Toaster />
        </CheckoutProvider>
        <JsonLd />
      </body>
    </html>
  );
}
