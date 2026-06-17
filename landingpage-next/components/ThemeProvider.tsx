"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Dark-Mode-Provider. attribute="class" → Tailwind v4 .dark-Variante;
// defaultTheme="light" haelt die bestehende Marken-Optik als Standard,
// enableSystem erlaubt Betriebssystem-Praeferenz, disableTransitionOnChange
// verhindert ein Aufblitzen beim Umschalten.
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
