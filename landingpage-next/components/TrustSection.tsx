"use client";

import * as motion from "motion/react-client";
import {
  GlobeIcon,
  LockKeyholeIcon,
  ScaleIcon,
  ShieldCheckIcon,
} from "lucide-react";

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

// Durchgehendes Vertrauens-Band (vorher ungenutzt). Reduziert Kauf-Angst direkt
// vor/nach den Preisen.
export function TrustSection() {
  return (
    <section
      aria-label="Vertrauen und Sicherheit"
      className="relative w-full overflow-hidden border-y border-border/60 bg-background"
    >
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {ITEMS.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="group/trust card-lift flex items-start gap-3 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-card-soft backdrop-blur dark:ring-1 dark:ring-white/5"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-mint/12 text-brand-mint transition-transform duration-300 group-hover/trust:scale-110">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
