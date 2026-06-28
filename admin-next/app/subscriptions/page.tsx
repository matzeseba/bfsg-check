import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Subscription } from "@/lib/api";
import { mockSubscriptions } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/format";

export const metadata = {
  title: "Abonnements · Barrierefrei-Prüfen Admin",
};

function statusBadge(status: Subscription["status"]) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-600">aktiv</Badge>
      );
    case "trialing":
      return <Badge variant="secondary">Testphase</Badge>;
    case "past_due":
      return <Badge variant="destructive">überfällig</Badge>;
    case "canceled":
      return <Badge variant="outline">gekündigt</Badge>;
  }
}

export default function SubscriptionsPage() {
  const subs = mockSubscriptions;
  const activeCount = subs.filter((s) => s.status === "active").length;
  const canceledCount = subs.filter((s) => s.status === "canceled").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Abonnements</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Monitoring-Abos (monatlich wiederkehrend). Stand:{" "}
          <strong>{activeCount}</strong> aktive,{" "}
          <strong>{canceledCount}</strong> Aktive Kündigungen im Zeitraum.
        </p>
      </header>

      <div className="rounded-lg border bg-white dark:bg-zinc-900">
        <Table>
          <TableCaption>
            Mock-Daten · {subs.length} Abo(s) angezeigt.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Abo-ID</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Erstellt</TableHead>
              <TableHead>Letzter Scan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subs.map((sub) => (
              <TableRow key={sub.subId}>
                <TableCell className="font-mono text-xs">
                  {sub.subId}
                </TableCell>
                <TableCell>{sub.email}</TableCell>
                <TableCell>{sub.pkg}</TableCell>
                <TableCell>{statusBadge(sub.status)}</TableCell>
                <TableCell className="whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                  {formatDateTime(sub.createdAt)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                  {formatDateTime(sub.lastScanAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
