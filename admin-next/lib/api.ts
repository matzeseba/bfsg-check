/**
 * Admin-API-Client für das Barrierefrei-Prüfen Backend.
 *
 * Liest Bearer-Token aus `ADMIN_TOKEN` (Server-Side env, niemals
 * an Client ausliefern). Basis-URL aus `ADMIN_API_BASE_URL`,
 * Default: https://barrierefrei-pruefen.de
 *
 * Alle Funktionen sind Server-Only — niemals aus Client-Components
 * importieren.
 */

import "server-only";

const DEFAULT_BASE_URL = "https://barrierefrei-pruefen.de";

export type Order = {
  sessionId: string;
  email: string;
  pkg: string;
  amount: number; // in Cent
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded";
  ts: string; // ISO-Datum
};

export type Subscription = {
  subId: string;
  email: string;
  pkg: string;
  status: "active" | "past_due" | "canceled" | "trialing";
  createdAt: string;
  lastScanAt: string | null;
};

export type HealthStatus = {
  status: "ok" | "degraded" | "down";
  uptimeSeconds: number;
  version: string;
  checks: {
    db: "ok" | "down";
    smtp: "ok" | "down";
    stripe: "ok" | "down";
  };
};

function baseUrl(): string {
  return process.env.ADMIN_API_BASE_URL ?? DEFAULT_BASE_URL;
}

function authHeaders(): HeadersInit {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    // In Scaffold-Phase nicht hart fehlschlagen — Routes liefern Mocks.
    return { "content-type": "application/json" };
  }
  return {
    "content-type": "application/json",
    authorization: `Bearer ${token}`,
  };
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = new URL(path, baseUrl()).toString();
  const res = await fetch(url, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers ?? {}) },
    // Admin-Daten niemals cachen
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Admin-API-Fehler ${res.status} für ${path}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchOrders(limit = 50): Promise<Order[]> {
  return request<Order[]>(`/admin/orders?limit=${encodeURIComponent(limit)}`);
}

export async function fetchSubscriptions(): Promise<Subscription[]> {
  return request<Subscription[]>("/admin/subscriptions");
}

export async function fetchHealth(): Promise<HealthStatus> {
  return request<HealthStatus>("/health");
}

/**
 * GitHub-Workflow-Status (Mocked für Scaffold).
 * Welle 5: echter Call gegen `/repos/:owner/:repo/actions/runs`.
 */
export type WorkflowRun = {
  id: number;
  name: string;
  status: "queued" | "in_progress" | "completed";
  conclusion: "success" | "failure" | "cancelled" | null;
  htmlUrl: string;
  updatedAt: string;
};

export async function fetchWorkflowRuns(): Promise<WorkflowRun[]> {
  // TODO Welle 5: gh API einbinden (`GITHUB_TOKEN`-env nötig).
  return [];
}
