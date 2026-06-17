import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BFSG-Check Admin",
  description: "Admin-Dashboard für BFSG-Check (Umsätze, Aufträge, Abos, Server-Status)",
};

const navItems = [
  { href: "/", label: "Übersicht" },
  { href: "/orders", label: "Bestellungen" },
  { href: "/subscriptions", label: "Abonnements" },
  { href: "/server", label: "Server-Status" },
  { href: "/marketing", label: "Marketing" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <header className="border-b bg-white dark:bg-zinc-900">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold tracking-tight">
                BFSG-Check Admin
              </span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                Pre-Launch
              </span>
            </div>
            <nav className="flex items-center gap-1 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
          {children}
        </main>
        <footer className="border-t bg-white py-4 text-center text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
          BFSG-Check · interne Übersicht · nur für Admin-Zugänge
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
