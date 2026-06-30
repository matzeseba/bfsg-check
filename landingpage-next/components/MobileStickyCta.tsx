"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// Persistenter Kostenlos-Scan-CTA auf Mobile (der Desktop-Header-CTA hat dort kein
// Pendant — auf Mobile sitzt die CTA sonst nur im eingeklappten Menü). Blendet
// nach dem Hero ein. Reine fixed-Leiste, kein Dauer-Blur-Layer, kein Pulsieren.
//
// Sichtbarkeit ist von Consent ENTKOPPELT (Conversion-Leck behoben): die Bar
// erscheint sobald gescrollt wird — auch ohne Consent, damit Paid-Mobile-Nutzer
// die Haupt-CTA immer sehen. Damit sie den Cookie-Banner (fixed bottom-4 z-50)
// nicht überlappt, sitzt die Bar bei fehlendem Consent über dem Banner (größerer
// Bottom-Offset); ist Consent gesetzt (Banner weg), normaler Offset am Rand. Der
// Banner dispatcht beim Setzen/Zurücksetzen die Events unten — wir folgen.
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

  const show = scrolled;

  return (
    <div
      aria-hidden={!show}
      className={cn(
        "fixed inset-x-0 z-40 border-t border-border/60 bg-background/90 px-4 pt-3 backdrop-blur-md transition-all duration-300 md:hidden",
        // Ohne Consent steht der Cookie-Banner (fixed bottom-4) noch da → Bar mit
        // großem Bottom-Offset darüber platzieren (kein Overlap). Mit Consent
        // (Banner weg) sitzt die Bar normal am unteren Rand mit Safe-Area-Padding.
        consented
          ? "bottom-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          : "bottom-[calc(7.5rem+env(safe-area-inset-bottom))] pb-3",
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0",
      )}
    >
      <Link
        href="/#scan"
        tabIndex={show ? undefined : -1}
        className="btn-cta min-h-12 w-full rounded-xl text-base"
      >
        Kostenlos prüfen
        <ArrowRightIcon className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
