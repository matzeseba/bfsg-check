"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// Persistenter Kostenlos-Scan-CTA auf Mobile (der Desktop-Header-CTA hat dort kein
// Pendant — auf Mobile sitzt die CTA sonst nur im eingeklappten Menü). Blendet
// nach dem Hero ein. Reine fixed-Leiste, kein Dauer-Blur-Layer, kein Pulsieren.
//
// Erscheint ERST, wenn der Cookie-Banner weg ist (Consent gesetzt): solange der
// Banner (fixed bottom-4 z-50) sichtbar ist, würde die Bar darunter hervorpeeken.
// Der Banner dispatcht beim Setzen/Zurücksetzen die Events unten — wir folgen.
const CONSENT_KEY = "bfsg-consent-v1";

function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { ts?: string };
    return Boolean(parsed?.ts);
  } catch {
    return false;
  }
}

export function MobileStickyCta() {
  const [scrolled, setScrolled] = React.useState(false);
  const [consented, setConsented] = React.useState(false);

  React.useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 680);
    }
    function syncConsent() {
      setConsented(hasConsent());
    }
    onScroll();
    syncConsent();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("bfsg:consent-change", syncConsent);
    window.addEventListener("bfsg:consent-reset", syncConsent);
    window.addEventListener("storage", syncConsent);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("bfsg:consent-change", syncConsent);
      window.removeEventListener("bfsg:consent-reset", syncConsent);
      window.removeEventListener("storage", syncConsent);
    };
  }, []);

  const show = scrolled && consented;

  return (
    <div
      aria-hidden={!show}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 px-4 pt-3 backdrop-blur-md transition-all duration-300 md:hidden",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0",
      )}
    >
      <Link
        href="/#scan"
        tabIndex={show ? undefined : -1}
        className="flex min-h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-brand-mint text-base font-semibold text-brand-deep shadow-glow-mint transition-transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Kostenlos prüfen
        <ArrowRightIcon className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
