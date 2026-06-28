import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { ANNOUNCEMENT } from "@/lib/config";

// Oberster Hinweisstreifen (Design-Signatur). Faktischer, bereits in HERO.pill
// rechtlich gepruefter Wortlaut — keine Garantie-/Spitzenstellungs-Aussage.
export function AnnouncementBar() {
  return (
    <div className="relative z-[3] border-b border-brand-amber/20 bg-gradient-to-r from-brand-amber/10 via-brand-rose/[0.06] to-brand-amber/10">
      <Link
        href={ANNOUNCEMENT.href}
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-4 py-2 text-center text-[13px] font-medium text-foreground/90 transition-colors hover:text-foreground"
      >
        <span
          aria-hidden
          className="inline-flex size-1.5 shrink-0 rounded-full bg-brand-amber shadow-[0_0_8px_var(--brand-amber)] animate-pulse-soft"
        />
        <span>{ANNOUNCEMENT.text}</span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <span aria-hidden>—</span> {ANNOUNCEMENT.cta}
          <ArrowRightIcon aria-hidden className="size-3" />
        </span>
      </Link>
    </div>
  );
}
