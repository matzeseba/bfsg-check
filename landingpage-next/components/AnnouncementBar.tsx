import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { ANNOUNCEMENT } from "@/lib/config";

// Oberster Hinweisstreifen (Dark-Glow-Redesign): schmales Near-Black-Band mit
// feiner Orange-Glow-Unterkante. Faktischer, bereits in HERO.pill rechtlich
// gepruefter Wortlaut — keine Garantie-/Spitzenstellungs-Aussage.
export function AnnouncementBar() {
  return (
    <div className="relative z-[3] border-b border-brand-orange/20 bg-[var(--brand-deepest)]">
      <Link
        href={ANNOUNCEMENT.href}
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-4 py-2 text-center font-mono text-[12px] font-medium text-foreground/90 transition-colors hover:text-foreground"
      >
        {/* Mini-Fuchs-Wappen (Design-Signatur des Streifens). Rein dekorativ →
            leeres alt, da der nebenstehende Text die Botschaft traegt. */}
        <Image
          src="/logo-fox.png"
          alt=""
          width={15}
          height={22}
          className="hidden h-[22px] w-auto shrink-0 sm:block"
        />
        <span
          aria-hidden
          className="inline-flex size-1.5 shrink-0 rounded-full bg-brand-orange shadow-[0_0_8px_var(--brand-orange)] animate-pulse-soft"
        />
        <span>{ANNOUNCEMENT.text}</span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <span aria-hidden>—</span> {ANNOUNCEMENT.cta}
          <ArrowRightIcon aria-hidden className="size-3" />
        </span>
      </Link>
      {/* Orange-Glow-Unterkante (Vorlagen-Signatur): feine Verlaufs-Hairline mit
          weichem Schein, sitzt auf der border-b. Rein dekorativ. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklch,var(--brand-orange),transparent_35%),transparent)] shadow-[0_1px_10px_color-mix(in_oklch,var(--brand-orange),transparent_50%)]"
      />
    </div>
  );
}
