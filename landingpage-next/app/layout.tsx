import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const siteUrl = "https://bfsg-fix.de";
const siteTitle = "BFSG-Check — Barrierefreiheit für Ihre Website prüfen";
const siteDescription =
  "BFSG-Check scannt Ihre Website auf Barrierefreiheits-Anforderungen nach dem Barrierefreiheitsstärkungsgesetz. Sofort-Report, Fix-Plan und laufendes Monitoring.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | BFSG-Check",
  },
  description: siteDescription,
  applicationName: "BFSG-Check",
  authors: [{ name: "BFSG-Check" }],
  creator: "BFSG-Check",
  publisher: "BFSG-Check",
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
    url: siteUrl,
    siteName: "BFSG-Check",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
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
    <html lang="de" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <JsonLd />
      </body>
    </html>
  );
}
