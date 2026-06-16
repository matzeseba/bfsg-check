import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockKpis } from "@/lib/mock-data";
import { formatCents } from "@/lib/format";

export const metadata = {
  title: "Übersicht · BFSG-Check Admin",
};

type KpiCard = {
  label: string;
  value: string;
  description: string;
  tone?: "default" | "warn" | "success";
};

function buildCards(): KpiCard[] {
  return [
    {
      label: "Umsätze heute",
      value: formatCents(mockKpis.revenueTodayCents),
      description: "Gebuchte Zahlungen seit 00:00 Uhr (de-Zeitzone).",
      tone: "success",
    },
    {
      label: "MRR (Monatsumsatz Abos)",
      value: formatCents(mockKpis.mrrCents),
      description: "Summe aller aktiven Monitoring-Abos in € pro Monat.",
    },
    {
      label: "Verkäufe gesamt",
      value: mockKpis.totalOrders.toLocaleString("de-DE"),
      description: "Alle abgeschlossenen Bestellungen seit Launch.",
    },
    {
      label: "Fehlerhafte Auslieferungen",
      value: mockKpis.failedFulfillments.toLocaleString("de-DE"),
      description: "Scans oder Fix-Pläne, die noch nicht zugestellt wurden.",
      tone: mockKpis.failedFulfillments > 0 ? "warn" : "default",
    },
  ];
}

function toneClass(tone: KpiCard["tone"]): string {
  switch (tone) {
    case "warn":
      return "border-amber-300 dark:border-amber-700";
    case "success":
      return "border-emerald-300 dark:border-emerald-700";
    default:
      return "";
  }
}

export default function DashboardPage() {
  const cards = buildCards();
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Übersicht</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Live-Kennzahlen zu Umsätzen, Verkäufen und aktiven Abos. Daten werden
          beim Aufruf neu geladen (kein Caching).
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className={toneClass(card.tone)}>
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {card.value}
              </CardTitle>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                {card.description}
              </p>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="rounded-lg border bg-white p-6 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
        <p>
          Hinweis: Die Werte stammen aktuell aus Mock-Daten. In Welle 5 werden
          sie über <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">lib/api.ts</code>{" "}
          aus dem Backend (<code>bfsg-fix.de/admin/*</code>) gezogen.
        </p>
      </section>
    </div>
  );
}
