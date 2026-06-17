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
    title: "DSGVO-konform",
    desc: "Hosting in Deutschland, keine Drittland-Übermittlung.",
  },
  {
    icon: ScaleIcon,
    title: "BFSG / WCAG 2.1",
    desc: "Prüfung nach EN 301 549 mit menschlicher Sichtung.",
  },
  {
    icon: GlobeIcon,
    title: "Made in Germany",
    desc: "Entwickelt und betrieben in Deutschland.",
  },
] as const;

export function TrustSection() {
  return (
    <section className="w-full bg-muted/30">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {ITEMS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
