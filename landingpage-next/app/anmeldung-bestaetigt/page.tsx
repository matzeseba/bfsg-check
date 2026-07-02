import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  ListChecks,
  RefreshCw,
} from "lucide-react";

import { SectionKicker } from "@/components/SectionKicker";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "E-Mail bestätigt",
  description:
    "Deine E-Mail-Adresse ist bestätigt — dein automatisierter Gratis-Report ist unterwegs.",
  alternates: { canonical: "/anmeldung-bestaetigt" },
  // Bestätigungsseite gehört nicht in den Index (nicht in sitemap.ts gelistet).
  robots: { index: false, follow: true },
};

type Status = "bestaetigt" | "verzoegert" | "abgelaufen";

type StatusContent = {
  kicker: string;
  icon: LucideIcon;
  tone: "mint" | "amber";
  headline: string;
  lead: string;
};

const STATUS_CONTENT: Record<Status, StatusContent> = {
  bestaetigt: {
    kicker: "Anmeldung bestätigt",
    icon: CheckCircle2,
    tone: "mint",
    headline: "E-Mail bestätigt",
    lead: "Alles erledigt — dein automatisierter Gratis-Report ist unterwegs. Die Zustellung dauert in der Regel nur wenige Minuten.",
  },
  verzoegert: {
    kicker: "Anmeldung bestätigt",
    icon: Clock,
    tone: "mint",
    headline: "Bestätigt — der Report ist unterwegs",
    lead: "Der Versand braucht gerade etwas länger als sonst. Du musst nichts weiter tun: Dein Gratis-Report kommt automatisch per E-Mail, sobald die Prüfung abgeschlossen ist.",
  },
  abgelaufen: {
    kicker: "Link abgelaufen",
    icon: RefreshCw,
    tone: "amber",
    headline: "Der Bestätigungslink ist abgelaufen",
    lead: "Kein Problem — Bestätigungslinks sind aus Sicherheitsgründen nur begrenzt gültig. Starte einfach einen neuen Gratis-Check, dann bekommst du eine frische Bestätigungs-E-Mail.",
  },
};

const GRATIS_REPORT = [
  "Automatisierter WCAG-2.1-AA-Score deiner Startseite",
  "Anzahl und Kategorien der gefundenen Barrieren",
  "Erste Einschätzung, wo es am dringendsten hakt",
];

const VOLLREPORT_EXTRA = [
  "Genaue Fundstellen jeder Barriere — Element und Seite",
  "Konkrete Code-Fixes zum Kopieren",
  "Priorisierter Umsetzungsplan nach Aufwand und Wirkung",
  "Report als PDF plus Entwurf der Barrierefreiheitserklärung",
];

function normalizeStatus(status?: string): Status {
  if (status === "abgelaufen") return "abgelaufen";
  if (status === "verzoegert") return "verzoegert";
  return "bestaetigt";
}

export default async function AnmeldungBestaetigtPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const variant = normalizeStatus(status);
  const content = STATUS_CONTENT[variant];
  const Icon = content.icon;
  const isExpired = variant === "abgelaufen";

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
      <div className="animate-fade-up">
        <SectionKicker
          icon={content.icon}
          label={content.kicker}
          tone={content.tone === "amber" ? "warn" : "default"}
        />

        <div className="mt-6 flex items-start gap-4">
          <span
            className={cn(
              "inline-flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-card-soft",
              content.tone === "mint"
                ? "bg-brand-mint/12 text-brand-mint"
                : "bg-brand-amber/12 text-brand-amber",
            )}
          >
            <Icon className="size-6" aria-hidden />
          </span>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {content.headline}
          </h1>
        </div>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty">
          {content.lead}
        </p>

        {isExpired ? (
          <div className="mt-8">
            <Link
              href="/#scan"
              className="btn-cta inline-flex h-12 items-center gap-2 rounded-xl px-6 text-base font-semibold"
            >
              Neuen Gratis-Check starten
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border/70 bg-card/70 p-4 text-sm text-muted-foreground shadow-card-soft backdrop-blur">
            <Inbox className="mt-0.5 size-5 shrink-0 text-brand-mint" aria-hidden />
            <p className="text-pretty">
              Schau kurz in deinen Posteingang. Landet nach ein paar Minuten
              nichts dort, wirf einen Blick in den Spam- oder Werbung-Ordner —
              die erste E-Mail von uns rutscht dort gelegentlich hinein.
            </p>
          </div>
        )}
      </div>

      <div className="mt-14 animate-fade-up sm:mt-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Vom Gratis-Report zum vollständigen Audit
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">
          Der Gratis-Report zeigt dir, wo deine Website steht. Der Vollreport
          liefert die konkrete Umsetzung — mit allem, was deine Entwickler zum
          Beheben brauchen.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-card/60 p-6 shadow-card-soft backdrop-blur">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <ListChecks className="size-5 text-brand-mint" aria-hidden />
              Das steckt im Gratis-Report
            </h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {GRATIS_REPORT.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-brand-mint"
                    aria-hidden
                  />
                  <span className="text-pretty">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-brand-orange/30 bg-brand-orange/5 p-6 shadow-card-soft backdrop-blur">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <FileText className="size-5 text-brand-orange" aria-hidden />
              Das liefert der Vollreport zusätzlich
            </h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {VOLLREPORT_EXTRA.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-brand-orange"
                    aria-hidden
                  />
                  <span className="text-pretty">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/#pakete"
            className="btn-cta inline-flex h-12 items-center gap-2 rounded-xl px-6 text-base font-semibold"
          >
            Zu den Paketen
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            Automatisierte technische Analyse nach WCAG 2.1 AA mit menschlicher
            Sichtung — keine Rechtsberatung, keine Konformitätsgarantie.
          </p>
        </div>
      </div>
    </section>
  );
}
