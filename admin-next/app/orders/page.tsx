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
import type { Order } from "@/lib/api";
import { mockOrders } from "@/lib/mock-data";
import { formatCents, formatDateTime } from "@/lib/format";

export const metadata = {
  title: "Bestellungen · BFSG-Check Admin",
};

function statusBadge(status: Order["status"]) {
  switch (status) {
    case "paid":
      return (
        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">
          bezahlt
        </Badge>
      );
    case "pending":
      return <Badge variant="secondary">offen</Badge>;
    case "failed":
      return <Badge variant="destructive">fehlgeschlagen</Badge>;
    case "refunded":
      return <Badge variant="outline">erstattet</Badge>;
  }
}

export default function OrdersPage() {
  const orders = mockOrders;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Bestellungen</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Einmal-Käufe (Fix-Plan, Komplett-Paket) der letzten Tage. Quelle:
          Stripe Checkout-Sessions.
        </p>
      </header>

      <div className="rounded-lg border bg-white dark:bg-zinc-900">
        <Table>
          <TableCaption>
            Mock-Daten · {orders.length} Bestellung(en) angezeigt.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Session-ID</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead className="text-right">Betrag</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Zeitpunkt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.sessionId}>
                <TableCell className="font-mono text-xs">
                  {order.sessionId}
                </TableCell>
                <TableCell>{order.email}</TableCell>
                <TableCell>{order.pkg}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCents(order.amount, order.currency)}
                </TableCell>
                <TableCell>{statusBadge(order.status)}</TableCell>
                <TableCell className="whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                  {formatDateTime(order.ts)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
