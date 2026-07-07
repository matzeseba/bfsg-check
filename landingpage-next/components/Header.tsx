"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, MenuIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NAV_LINKS, SITE } from "@/lib/config";
import { cn } from "@/lib/utils";

// Section-IDs fuer den Scroll-Spy (aus NAV_LINKS /#id abgeleitet).
const SPY_IDS = NAV_LINKS.map((l) => l.href.replace("/#", ""));

export function Header() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<string | null>(null);

  React.useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-Spy: markiert den aktuell sichtbaren Abschnitt in der Nav.
  React.useEffect(() => {
    const targets = SPY_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (targets.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  // Schliessen bei Routenwechsel via Hash
  React.useEffect(() => {
    function onHash() {
      setOpen(false);
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <header
      className={cn(
        // Dauerhaft leichter Blur + saturate (kein Live-Toggle des Blur-Filters
        // beim Scroll → vermeidet INP/Jank-Spike). Nur bg-/border-Opacity wechseln.
        // Dark-Glow: near-black Glas-Leiste, gescrollt mit feiner Orange-Unterkante.
        "sticky top-0 z-40 w-full backdrop-blur-sm backdrop-saturate-150 transition-colors duration-300 md:backdrop-blur-md",
        scrolled
          ? "bg-background/80 supports-[backdrop-filter]:bg-background/70"
          : "bg-transparent",
      )}
    >
      {/* Feine Glow-Unterkante (Vorlagen-Signatur): Orange-Hairline, die beim
          Scrollen einblendet. Rein dekorativ. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-orange/45 to-transparent transition-opacity duration-300",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-5 sm:px-6">
        <Link
          href="/"
          className="group/logo -my-2 flex min-h-11 items-center gap-2.5 py-2 font-display text-xl font-bold tracking-tight"
          aria-label={`${SITE.name} Startseite`}
        >
          {/* Offizielles Fuchs-Wappen (aus docs/brand/bfsg-fuchs-logo-final.png
              zugeschnitten, Glow eingebrannt + transparenter Rand), dekorativ →
              leeres alt, da die nebenstehende Wortmarke den Namen traegt. Klein
              (~36px); der eingebrannte Glow reicht, kein CSS-Drop-Shadow. */}
          <Image
            src="/logo-fuchs-wappen.png"
            alt=""
            width={217}
            height={256}
            // priority: Markenzeichen im allerersten Paint (Header ist immer
            // above-the-fold); next/image liefert ohnehin nur die ~36px-Variante.
            priority
            className="h-9 w-auto shrink-0 rounded-md"
          />
          <span className="flex items-baseline gap-0.5">
            <span>BFSG</span>
            <span className="text-brand-orange">·</span>
            <span>Fuchs</span>
            <span className="text-[0.78em] font-semibold text-muted-foreground">
              .de
            </span>
          </span>
        </Link>

        <nav
          aria-label="Hauptnavigation"
          className="ml-2 hidden flex-1 items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => {
            const id = link.href.replace("/#", "");
            const isActive = active === id;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "group/nav relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
                {/* Animierter Orange-Underline: waechst bei Hover UND im
                    aktiven Zustand von links ein (Vorlagen-Nav-Signatur). */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3 -bottom-px h-px origin-left bg-gradient-to-r from-brand-orange to-brand-orange-soft shadow-[0_0_8px_var(--brand-orange)] transition-transform duration-300",
                    isActive
                      ? "scale-x-100"
                      : "scale-x-0 group-hover/nav:scale-x-100",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="lg" render={<a href="/kuendigen" />}>
            Konto verwalten
          </Button>
          <Link href="/#scan" className="btn-cta h-11 px-4 text-sm">
            Kostenlos prüfen
            <ArrowRightIcon className="ml-0.5 size-4" />
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={open}
            className="inline-flex size-11 items-center justify-center rounded-lg border border-brand-orange/20 bg-card/60 text-foreground backdrop-blur"
          >
            {open ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-brand-orange/15 bg-background/95 backdrop-blur-xl md:hidden">
          <nav
            aria-label="Mobile Navigation"
            className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3">
              <Button
                variant="outline"
                size="lg"
                render={<a href="/kuendigen" onClick={() => setOpen(false)} />}
              >
                Konto verwalten
              </Button>
              <Link
                href="/#scan"
                onClick={() => setOpen(false)}
                className="btn-cta h-11 px-4 text-base"
              >
                Kostenlos prüfen
                <ArrowRightIcon className="ml-0.5 size-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
