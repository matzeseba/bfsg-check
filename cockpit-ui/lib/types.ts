export type JobCategory = 'quick' | 'generator' | 'live';
export type JobStatus = 'queued' | 'running' | 'awaiting_approval' | 'completed' | 'failed' | 'cancelled';

export interface LogEntry {
  ts: string;
  level: 'info' | 'tool' | 'warn' | 'error';
  message: string;
}

export interface Job {
  id: string;
  actionId: string;
  label: string;
  category: JobCategory;
  status: JobStatus;
  args: Record<string, unknown>;
  logs: LogEntry[];
  result?: unknown;
  error?: string;
  costUsd?: number;
  sessionId?: string;
  requiresApproval: boolean;
  approved?: boolean;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CockpitSummary {
  generatedAt: string;
  kpis: {
    revenueToday: number;
    revenueMonth: number;
    revenuePrevMonth: number;
    salesToday: number;
    salesMonth: number;
    mrr: number;
    aboEnabled: boolean;
    aov: number;
    cac: number | null;
    cacCeiling: 177;
    roas: number | null;
    convRate: number | null;
  };
  health: {
    ok: boolean;
    stripe: boolean;
    live: boolean;
    mailer: boolean;
    checkedAt: string;
  };
  packageSplit: { pkg: string; count: number; revenue: number }[];
  recentOrders: { domain: string; pkg: string; amount: number; status: string; ts: string }[];
  ads: {
    source: 'google' | 'bing';
    spendToday: number;
    spendMonth: number;
    clicks: number;
    impressions: number;
    conversions: number;
    roas: number | null;
    campaigns: { name: string; status: string; budget: number; spend: number }[];
  }[];
  funnel: { stage: string; count: number }[];
  uptime: { pct7d: number | null; pct30d: number | null };
  deploy: { status: string; sha?: string; at?: string };
  budget: { adsSpentMonth: number; adsBudgetMonth: number };
}

export interface ActionDef {
  id: string;
  label: string;
  category: JobCategory;
  description: string;
  requiresApproval: boolean;
}

export interface SSELogEvent {
  type: 'log';
  data: LogEntry;
}

export interface SSEStatusEvent {
  type: 'status';
  data: { status: JobStatus };
}

export interface SSEResultEvent {
  type: 'result';
  data: { result: unknown; costUsd?: number };
}

export interface SSEApprovalEvent {
  type: 'approval_required';
  data: { summary: string; sideEffects: string[] };
}

export type SSEEvent = SSELogEvent | SSEStatusEvent | SSEResultEvent | SSEApprovalEvent;

// ---------------------------------------------------------------------------
// Second Brain
// ---------------------------------------------------------------------------

export interface BrainSearchResult {
  path: string;
  title: string;
  snippet: string;
  score?: number;
}

export interface BrainSearchResponse {
  configured: boolean;
  results: BrainSearchResult[];
}

export interface BrainRecentResponse {
  configured: boolean;
  notes: BrainSearchResult[];
}

export interface BrainNoteResponse {
  configured: boolean;
  path: string;
  title: string;
  content: string;
}
