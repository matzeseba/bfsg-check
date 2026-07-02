"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Theme-Provider. attribute="class" → Tailwind v4 .dark-Variante.
// defaultTheme="light" + enableSystem={false}: das helle Papier-Creme-Design
// („Das Gutachten") ist die GARANTIERTE Standard-Optik beim Seitenaufruf —
// unabhaengig von der OS-Praeferenz. Der ThemeToggle bleibt voll funktional und
// persistiert die Wahl in localStorage; ein Nutzer, der bewusst auf Dunkel
// schaltet, behaelt das. disableTransitionOnChange verhindert ein Aufblitzen.
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
