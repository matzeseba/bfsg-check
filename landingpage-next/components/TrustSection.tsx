import {
  GlobeIcon,
  LockKeyholeIcon,
  ScaleIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { GlowCard } from "./fx/GlowCard";
import { Reveal } from "./fx/Reveal";

const ITEMS = [
  {
    icon: LockKeyholeIcon,
    title: "SSL-verschlüsselt",
    desc: "Alle Daten werden TLS-1.3-verschlüsselt übertragen.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Datenschutz nach DSGVO",
    desc: "Hosting in Deutschland, keine Drittland-Übermittlung.",
  },
  {
    icon: ScaleIcon,
    title: "BFSG / WCAG 2.1",
    desc: "Prüfung nach EN 301 549, Bezahlreports mit menschlicher Sichtung.",
  },
  {
    icon: GlobeIcon,
    title: "Made in Germany",
    desc: "Entwickelt und betrieben in Deutschland.",
  },
] as const;

// Durchgehendes Vertrauens-Band. Reduziert Kauf-Angst direkt vor/nach den Preisen.
// Dark-Glow-Redesign: vier kleine Glas-Karten (.glow-card) mit Orange-Icon-Tiles
// statt der bisherigen Mint-Farbwelt; gestaffelter Reveal, Karten-Lift beim Hover.
export function TrustSection() {
  return (
    <section
      aria-label="Vertrauen und Sicherheit"
      className="relative w-full overflow-hidden border-y border-border/60 bg-background"
    >
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {ITEMS.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} index={i} className="flex">
              <GlowCard className="group/trust card-lift flex w-full items-start gap-3 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-orange/25 bg-brand-orange/12 text-brand-orange transition-transform duration-300 group-hover/trust:scale-110">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                    {desc}
                  </p>
                </div>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
