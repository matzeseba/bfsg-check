/**
 * Typisierter fetch-Wrapper fuer die AOS-Backend-API.
 * - same-origin: alle Pfade unter /api (Caddy proxyt an aos-backend)
 * - credentials: 'include' (Session-Cookie mitsenden)
 * - 401 -> Redirect auf /login (nur im Browser)
 *
 * Shapes exakt nach ARCHITECTURE.md §4.
 */

export type Source = "stripe" | "brevo" | "demo" | "live";

export interface SparklinePoint {
  date: string;
  eur: number;
}

export interface DashboardSummary {
  revenue_30d_eur: number;
  revenue_source: Source;
  open_inbox: number;
  leads_today: number;
  services_ok: number;
  services_total: number;
  agent_runs_today: number;
  notifications_unread: number;
  sparkline_30d: SparklinePoint[];
}

export type InboxStatus = "open" | "drafted" | "replied" | "closed";
export type InboxChannel = "email" | "form" | "support";

export interface InboxItem {
  id: number;
  subject: string;
  sender: string;
  channel: InboxChannel;
  preview: string;
  priority: number; // 1-5
  priority_reason: string;
  status: InboxStatus;
  created_at: string;
  source: Source;
}

export interface InboxItemDetail extends InboxItem {
  body: string;
  draft: string | null;
}

export interface InboxList {
  items: InboxItem[];
}

export interface DraftResponse {
  draft: string;
  model: string;
}

export type LibraryCategory =
  | "linkedin"
  | "case-study"
  | "audit-template"
  | "sonstiges";

export interface LibraryItem {
  id: number;
  title: string;
  category: LibraryCategory;
  tags: string[];
  preview: string;
  updated_at: string;
}

export interface LibraryItemDetail extends LibraryItem {
  body_md: string;
}

export interface LibraryList {
  items: LibraryItem[];
}

export interface LibraryInput {
  title: string;
  category: LibraryCategory;
  tags: string[];
  body_md: string;
}

export interface HealthService {
  key: string;
  name: string;
  url: string;
  ok: boolean;
  latency_ms: number;
  checked_at: string;
  detail: string;
}

export interface HealthServices {
  services: HealthService[];
}

export interface HostContainer {
  name: string;
  status: string;
  mem_mb: number;
}

export interface HealthHost {
  cpu_pct: number;
  mem_used_mb: number;
  mem_total_mb: number;
  disk_used_pct: number;
  containers: HostContainer[] | null;
}

export interface HealthHistoryPoint {
  ts: string;
  ok: boolean;
  latency_ms: number;
}

export interface HealthHistory {
  points: HealthHistoryPoint[];
}

export interface PackageSplit {
  name: string;
  count: number;
  eur: number;
}

export interface FinanceSummary {
  gross_30d: number;
  net_30d: number;
  fees_30d: number;
  mrr: number;
  active_subs: number;
  refund_rate_pct: number;
  by_package: PackageSplit[];
  source: "stripe" | "demo";
}

export interface Invoice {
  id: string;
  date: string;
  amount_eur: number;
  package: string;
  status: string;
  customer_masked: string;
}

export interface InvoiceList {
  invoices: Invoice[];
}

export interface Thresholds {
  kleinunternehmer: {
    limit_prev_year: number;
    limit_current_year: number;
    ytd_revenue: number;
    pct_used: number;
    projected_year_end: number;
    warn: boolean;
  };
}

export interface AgentLastRun {
  ts: string;
  ok: boolean;
  summary: string;
}

export interface Agent {
  key: string;
  name: string;
  description: string;
  schedule_human: string;
  last_run: AgentLastRun | null;
  enabled: boolean;
}

export interface AgentList {
  agents: Agent[];
}

export interface AgentRun {
  id: number;
  started_at: string;
  finished_at: string | null;
  ok: boolean;
  summary: string;
  output_md: string;
}

export interface AgentRunList {
  runs: AgentRun[];
}

export interface AgentRunStarted {
  run_id: number;
}

export type NotificationLevel = "info" | "warn" | "lead";

export interface AppNotification {
  id: number;
  ts: string;
  level: NotificationLevel;
  title: string;
  body: string;
  read: boolean;
}

export interface NotificationList {
  items: AppNotification[];
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 401) {
    redirectToLogin();
    throw new ApiError(401, "Nicht angemeldet");
  }

  if (!res.ok) {
    let detail = `Fehler ${res.status}`;
    try {
      const data = (await res.json()) as { detail?: string };
      if (data?.detail) detail = data.detail;
    } catch {
      /* Body war kein JSON */
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
};

// ---- Konkrete, typisierte Endpunkte (Spec §4) ----
export interface LoginResult {
  ok: boolean;
  must_set_password: boolean;
}

export const auth = {
  login: (token: string) => api.post<LoginResult>("/auth/login", { token }),
  setPassword: (newPassword: string) =>
    api.post<{ ok: boolean }>("/auth/set-password", { new_password: newPassword }),
  logout: () => api.post<{ ok: boolean }>("/auth/logout"),
  me: () =>
    api.get<{ authenticated: boolean; must_set_password: boolean }>("/auth/me"),
};

export const dashboardApi = {
  summary: () => api.get<DashboardSummary>("/dashboard/summary"),
};

export const inboxApi = {
  list: (params?: { status?: string; priority?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.priority) q.set("priority", params.priority);
    const qs = q.toString();
    return api.get<InboxList>(`/inbox${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => api.get<InboxItemDetail>(`/inbox/${id}`),
  draft: (id: number) => api.post<DraftResponse>(`/inbox/${id}/draft`),
  setStatus: (id: number, status: InboxStatus) =>
    api.patch<InboxItem>(`/inbox/${id}`, { status }),
};

export const libraryApi = {
  list: (params?: { q?: string; category?: string }) => {
    const query = new URLSearchParams();
    if (params?.q) query.set("q", params.q);
    if (params?.category) query.set("category", params.category);
    const qs = query.toString();
    return api.get<LibraryList>(`/library${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => api.get<LibraryItemDetail>(`/library/${id}`),
  create: (input: LibraryInput) => api.post<LibraryItemDetail>("/library", input),
  update: (id: number, input: LibraryInput) =>
    api.put<LibraryItemDetail>(`/library/${id}`, input),
};

export const healthApi = {
  services: () => api.get<HealthServices>("/health/services"),
  host: () => api.get<HealthHost>("/health/host"),
  history: (service: string, hours = 24) =>
    api.get<HealthHistory>(
      `/health/history?service=${encodeURIComponent(service)}&hours=${hours}`,
    ),
};

export const financeApi = {
  summary: () => api.get<FinanceSummary>("/finance/summary"),
  invoices: (limit = 50) => api.get<InvoiceList>(`/finance/invoices?limit=${limit}`),
  thresholds: () => api.get<Thresholds>("/finance/thresholds"),
};

export const agentsApi = {
  list: () => api.get<AgentList>("/agents"),
  run: (key: string) => api.post<AgentRunStarted>(`/agents/${key}/run`),
  results: (key: string, limit = 20) =>
    api.get<AgentRunList>(`/agents/${key}/results?limit=${limit}`),
};

export const notificationsApi = {
  list: (unreadOnly = false) =>
    api.get<NotificationList>(`/notifications${unreadOnly ? "?unread=true" : ""}`),
  markRead: (ids: number[]) =>
    api.post<{ ok: boolean }>("/notifications/read", { ids }),
};
