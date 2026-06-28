"use client";

import * as React from "react";
import { HelpCircleIcon, SearchIcon, XIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { FAQ_ITEMS } from "@/lib/config";

import { SectionKicker } from "./SectionKicker";

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
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6 sm:py-24">
        <div className="flex flex-col items-center text-center">
          <SectionKicker icon={HelpCircleIcon} label="FAQ" />
          <h2
            id="faq-heading"
            className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance sm:text-[2.75rem] sm:leading-[1.05]"
          >
            Häufige Fragen — <span className="italic gradient-text">ehrlich</span>{" "}
            beantwortet.
          </h2>
          <p className="mt-4 text-base text-muted-foreground text-pretty">
            Nichts dabei? Schreiben Sie uns: info@barrierefrei-pruefen.de
          </p>
        </div>

        <div className="mt-10 mb-2">
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
          <Accordion className="mt-2 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-card-soft backdrop-blur">
            {filtered.map((item, idx) => (
              <AccordionItem
                key={item.q}
                value={`faq-${idx}`}
                className="px-5 sm:px-6"
              >
                <AccordionTrigger className="py-5 text-base font-medium">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
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
