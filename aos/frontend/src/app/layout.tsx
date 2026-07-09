import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Jarvis } from "@/jarvis";

export const metadata: Metadata = {
  title: "AOS — BFSG-Fuchs Betriebssystem",
  description: "Autonomes Business-Dashboard des BFSG-Fuchs",
  icons: {
    icon: "/brand/bfsg-fuchs-favicon-mono.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        {children}
        {/*
          JARVIS_MOUNT
          Jarvis-Overlay (Team Gamma, src/jarvis/): Provider + Floating-Overlay
          (Fuchs-Avatar, Strg+K, Web-Speech) als eigene Client-Boundary.
        */}
        <Jarvis />
      </body>
    </html>
  );
}
