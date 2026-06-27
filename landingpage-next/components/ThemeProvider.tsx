"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Dark-Mode-Provider. attribute="class" → Tailwind v4 .dark-Variante.
// defaultTheme="dark" + enableSystem={false}: der Dark-Look ist die GARANTIERTE
// Standard-Optik beim Seitenaufruf (Owner-Wunsch) — unabhaengig von der OS-
// Praeferenz. Der ThemeToggle bleibt voll funktional und persistiert die Wahl
// in localStorage; ein Nutzer, der bewusst auf Hell schaltet, behaelt das.
// disableTransitionOnChange verhindert ein Aufblitzen beim Umschalten.
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
