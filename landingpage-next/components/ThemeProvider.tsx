"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Dark-only-Provider (Owner-Entscheid 04.07.2026, Dark-Glow-Redesign):
// forcedTheme="dark" erzwingt den Dark-Look fuer ALLE Besucher — der fruehere
// Light-Toggle ist entfernt (eine Light-Variante der Glow-Optik existiert nicht).
// Der Provider bleibt bestehen, damit useTheme-Konsumenten (sonner-Toaster)
// weiter einen konsistenten Wert bekommen. Zusaetzlich traegt <html> die
// .dark-Klasse serverseitig (layout.tsx) → kein Theme-Flash vor Hydration.
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
