"use client";

import * as React from "react";
import Link from "next/link";
import {
  AccessibilityIcon,
  ArrowRightIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { NAV_LINKS, SITE } from "@/lib/config";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "./ThemeToggle";

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
        "sticky top-0 z-40 w-full backdrop-blur-sm backdrop-saturate-150 transition-colors duration-300 md:backdrop-blur-md",
        scrolled
          ? "border-b border-border/70 bg-background/75 supports-[backdrop-filter]:bg-background/65"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-5 sm:px-6">
        <Link
          href="/"
          className="group/logo -my-2 flex min-h-11 items-center gap-2.5 py-2 font-display text-lg font-semibold tracking-tight"
          aria-label={`${SITE.name} Startseite`}
        >
          <span
            aria-hidden
            className="relative inline-flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-indigo to-brand-deep text-on-deep shadow-glow-mint"
          >
            <AccessibilityIcon className="size-4.5" />
            <span className="pointer-events-none absolute -right-1 -bottom-1 size-2.5 rounded-full bg-brand-mint ring-2 ring-background" />
          </span>
          <span className="flex items-baseline gap-1">
            <span>BFSG</span>
            <span className="text-muted-foreground">·</span>
            <span className="italic text-brand-indigo dark:text-brand-mint">
              Check
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
                  "relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3 -bottom-px h-px origin-left bg-brand-mint transition-transform duration-300",
                    isActive ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button variant="ghost" size="lg" render={<a href="/kuendigen" />}>
            Konto verwalten
          </Button>
          <Button
            size="lg"
            className="bg-brand-mint text-brand-deep hover:bg-brand-mint/85 focus-visible:ring-brand-deep/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            render={<Link href="/#scan" />}
          >
            Kostenlos prüfen
            <ArrowRightIcon className="ml-0.5 size-4" />
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={open}
            className="inline-flex size-11 items-center justify-center rounded-lg border border-border/60 bg-background/60 text-foreground backdrop-blur"
          >
            {open ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background/90 backdrop-blur-xl md:hidden">
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
              <Button
                size="lg"
                className="bg-brand-mint text-brand-deep hover:bg-brand-mint/85 focus-visible:ring-brand-deep/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                render={<Link href="/#scan" onClick={() => setOpen(false)} />}
              >
                Kostenlos prüfen
                <ArrowRightIcon className="ml-0.5 size-4" />
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
