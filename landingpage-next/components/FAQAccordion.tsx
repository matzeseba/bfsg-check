"use client";

import * as React from "react";
import { PlusIcon, SearchIcon, XIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { FAQ_ITEMS, SITE } from "@/lib/config";

export function FAQAccordion() {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      (item) =>
        item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative overflow-hidden bg-background"
    >
      <div className="mx-auto max-w-2xl px-5 py-20 sm:px-6 sm:py-24">
        <div className="flex flex-col items-center text-center">
          {/* Grosse Fuchs-FAQ-Wortmarke (Design: 60px Schibsted-Display). */}
          <h2
            id="faq-heading"
            className="font-display text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl"
          >
            FAQ
          </h2>
          <p className="mt-4 font-display text-xl font-semibold tracking-tight text-balance text-foreground sm:text-[1.4rem]">
            Häufige Fragen — <span className="italic gradient-text">ehrlich</span>{" "}
            beantwortet.
          </p>
          <p className="mt-3 text-base text-muted-foreground text-pretty">
            Noch Fragen? Dann schreiben Sie uns gerne an:{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="font-medium text-brand-orange underline-offset-4 hover:underline"
            >
              {SITE.email}
            </a>
          </p>
        </div>

        <div className="mt-10 mb-3">
          <div className="relative">
            <SearchIcon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Frage suchen — z. B. Widerruf, USt, Daten…"
              aria-label="FAQs durchsuchen"
              className="h-12 rounded-xl bg-card/85 pl-10 text-sm shadow-card-soft backdrop-blur"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Suche zurücksetzen"
                className="absolute top-1/2 right-3 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>
          {query && (
            <p className="mt-2 px-1 text-xs text-muted-foreground">
              {filtered.length} von {FAQ_ITEMS.length} Treffern
            </p>
          )}
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center text-sm text-muted-foreground">
            Keine Treffer — schreiben Sie uns Ihre Frage einfach per E-Mail.
          </p>
        ) : (
          // Fuchs-Design: einzelne abgesetzte Karten (kein durchgehender Block),
          // ruhiger Abstand statt Divider.
          <Accordion className="grid gap-2.5">
            {filtered.map((item, idx) => (
              <AccordionItem
                key={item.q}
                value={`faq-${idx}`}
                // Karte #171009 (bg-card); offener Item bekommt orange Rahmen
                // (Design: q.borderColor → rgba(237,106,51,.3)). Geschlossen warme
                // Creme-Kante. base-ui setzt data-open am Item-Element.
                className="rounded-xl border border-border bg-card px-5 transition-colors duration-200 data-open:border-brand-orange/40 sm:px-6"
              >
                {/* Built-in Chevron der Trigger-Primitive ausblenden — wir nutzen
                    stattdessen das Design-"+"-Icon (rotiert zu ×). */}
                <AccordionTrigger className="gap-4 py-5 font-display text-base font-semibold text-foreground hover:no-underline [&_[data-slot=accordion-trigger-icon]]:hidden">
                  {item.q}
                  {/* Orange "+" das beim Öffnen zu × rotiert (45deg). */}
                  <PlusIcon
                    aria-hidden
                    className="ml-auto size-5 shrink-0 text-brand-orange transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-aria-expanded/accordion-trigger:rotate-45"
                  />
                </AccordionTrigger>
                <AccordionContent className="max-w-[40rem] pb-5 text-sm leading-relaxed text-muted-foreground">
                  <p>{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </section>
  );
}
