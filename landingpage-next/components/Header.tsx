"use client";

import * as React from "react";
import Link from "next/link";
import { AccessibilityIcon, ArrowRightIcon, MenuIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NAV_LINKS, SITE } from "@/lib/config";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/70 bg-background/75 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/65"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-5 sm:px-6">
        <Link
          href="/"
          className="group/logo flex items-center gap-2.5 font-display text-base font-bold tracking-tight"
          aria-label={`${SITE.name} Startseite`}
        >
          <span
            aria-hidden
            className="relative inline-flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-indigo to-brand-deep text-primary-foreground shadow-glow-mint"
          >
            <AccessibilityIcon className="size-4.5" />
            <span className="pointer-events-none absolute -right-1 -bottom-1 size-2.5 rounded-full bg-brand-mint ring-2 ring-background" />
          </span>
          <span className="flex items-baseline gap-1">
            <span>BFSG</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-brand-mint">Check</span>
          </span>
        </Link>

        <nav
          aria-label="Hauptnavigation"
          className="ml-2 hidden flex-1 items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="lg" render={<a href="/kuendigen" />}>
            Konto
          </Button>
          <Button
            size="lg"
            className="bg-brand-mint text-brand-deep hover:bg-brand-mint/85"
            render={<Link href="/#scan" />}
          >
            Gratis prüfen
            <ArrowRightIcon className="ml-0.5 size-4" />
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={open}
          className="ml-auto inline-flex size-10 items-center justify-center rounded-lg border border-border/60 bg-background/60 text-foreground backdrop-blur md:hidden"
        >
          {open ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
        </button>
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
                render={
                  <a href="/kuendigen" onClick={() => setOpen(false)} />
                }
              >
                Konto verwalten
              </Button>
              <Button
                size="lg"
                className="bg-brand-mint text-brand-deep hover:bg-brand-mint/85"
                render={<Link href="/#scan" onClick={() => setOpen(false)} />}
              >
                Gratis prüfen
                <ArrowRightIcon className="ml-0.5 size-4" />
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
