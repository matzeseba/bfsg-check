/**
 * Mock-Daten für die Scaffold-Phase. Werden in Welle 5 durch echte
 * API-Calls via `lib/api.ts` ersetzt.
 */

import type {
  HealthStatus,
  Order,
  Subscription,
  WorkflowRun,
} from "@/lib/api";

export const mockKpis = {
  revenueTodayCents: 89700, // 897,00 EUR
  mrrCents: 348000, // 3.480,00 EUR
  totalOrders: 142,
  failedFulfillments: 3,
};

export const mockOrders: Order[] = [
  {
    sessionId: "cs_test_a1b2c3",
    email: "müller@beispiel.de",
    pkg: "Komplett-Paket",
    amount: 29900,
    currency: "EUR",
    status: "paid",
    ts: "2026-06-16T09:14:00Z",
  },
  {
    sessionId: "cs_test_d4e5f6",
    email: "test@größe.io",
    pkg: "Fix-Plan",
    amount: 9900,
    currency: "EUR",
    status: "paid",
    ts: "2026-06-16T08:42:00Z",
  },
  {
    sessionId: "cs_test_g7h8i9",
    email: "büro@österreich.at",
    pkg: "Komplett-Paket",
    amount: 29900,
    currency: "EUR",
    status: "failed",
    ts: "2026-06-15T22:11:00Z",
  },
];

export const mockSubscriptions: Subscription[] = [
  {
    subId: "sub_1OabCdEfGhIj",
    email: "service@händler.de",
    pkg: "Monitoring-Abo",
    status: "active",
    createdAt: "2026-04-02T10:00:00Z",
    lastScanAt: "2026-06-15T03:00:00Z",
  },
  {
    subId: "sub_1OkLmNoPqRsT",
    email: "kontakt@größerlieferant.de",
    pkg: "Monitoring-Abo",
    status: "past_due",
    createdAt: "2026-03-18T10:00:00Z",
    lastScanAt: "2026-06-10T03:00:00Z",
  },
  {
    subId: "sub_1OuVwXyZ1234",
    email: "info@spaßfabrik.de",
    pkg: "Monitoring-Abo",
    status: "canceled",
    createdAt: "2026-02-11T10:00:00Z",
    lastScanAt: "2026-05-30T03:00:00Z",
  },
];

export const mockHealth: HealthStatus = {
  status: "ok",
  uptimeSeconds: 482_400,
  version: "0.4.2",
  checks: {
    db: "ok",
    smtp: "ok",
    stripe: "ok",
  },
};

export const mockWorkflowRuns: WorkflowRun[] = [
  {
    id: 9001,
    name: "Deploy Scanner",
    status: "completed",
    conclusion: "success",
    htmlUrl: "https://github.com/matzeseba/bfsg-check/actions/runs/9001",
    updatedAt: "2026-06-16T07:55:00Z",
  },
  {
    id: 9000,
    name: "CI Tests",
    status: "completed",
    conclusion: "success",
    htmlUrl: "https://github.com/matzeseba/bfsg-check/actions/runs/9000",
    updatedAt: "2026-06-16T07:48:00Z",
  },
];
