import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Marketing · Barrierefrei-Prüfen Admin",
};

const notionSync = {
  lastSyncAt: "2026-06-16T06:00:00Z",
  status: "ok" as const,
  pagesSynced: 18,
  workspaceId: "bfsg-check-marketing",
};

const campaigns = [
  {
    name: "LinkedIn-Outreach KMU",
    channel: "LinkedIn Ads",
    spendCents: 24500,
    leads: 42,
    status: "läuft",
  },
  {
    name: "Google-Ads Branchen-Suche",
    channel: "Google Ads",
    spendCents: 89000,
    leads: 156,
    status: "läuft",
  },
  {
    name: "Newsletter Welle 4 (Brevo)",
    channel: "E-Mail",
    spendCents: 0,
    leads: 11,
    status: "abgeschlossen",
  },
];

const eur = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

export default function MarketingPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Marketing</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Notion-Sync, laufende Kampagnen und Lead-Generierung. Werte werden in
          Welle 5 aus Notion + Stripe verknüpft.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Notion-Sync</CardDescription>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Badge className="bg-emerald-600 hover:bg-emerald-600">OK</Badge>
              <span className="text-sm font-normal text-zinc-500">
                {notionSync.pagesSynced} Seiten
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">
            Workspace <code>{notionSync.workspaceId}</code>
            <br />
            Letzte Synchronisation:{" "}
            {new Date(notionSync.lastSyncAt).toLocaleString("de-DE")}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Lead-Quellen (heute)</CardDescription>
            <CardTitle className="text-2xl">— wird geladen —</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Conversion-Rate</CardDescription>
            <CardTitle className="text-2xl">— wird geladen —</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Laufende Kampagnen</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {campaigns.map((c) => (
            <Card key={c.name}>
              <CardHeader>
                <CardTitle className="text-base">{c.name}</CardTitle>
                <CardDescription>{c.channel}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Ausgaben</span>
                  <span className="tabular-nums">
                    {eur.format(c.spendCents / 100)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Leads</span>
                  <span className="tabular-nums">{c.leads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status</span>
                  <span>{c.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
