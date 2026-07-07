// TypeScript-Interfaces exakt nach ARCHITECTURE.md §4 (Datenlayer) + §6 (API-Kontrakt).
// Einzige Datenquelle für das Dashboard — keine Annahmen über Engine-Interna.

export type JobStatus =
  | 'queued'
  | 'running'
  | 'review'
  | 'approved'
  | 'published'
  | 'failed'
  | 'skipped';

export type GateSeverity = 'block' | 'warn';

export interface GateFinding {
  severity: GateSeverity;
  pattern: string;
  match: string;
  hint: string;
}

export interface Gate {
  checked: boolean;
  passed: boolean;
  findings: GateFinding[];
}

export type PublishActionType = 'manual-browser' | 'repo-pr' | 'none';

export interface PublishAction {
  type: PublishActionType;
  instructions: string;
}

export interface Job {
  id: string;
  playbookId: string;
  agent: string;
  title: string;
  channel: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  outputFile: string;
  gate: Gate | null;
  publishAction: PublishAction | null;
  error: string | null;
}

export type LeadKind = 'scan' | 'newsletter' | 'contact' | 'sale';

export interface Lead {
  id: string;
  date: string; // YYYY-MM-DD
  source: string;
  kind: LeadKind;
  value: number | null;
  note: string;
}

export type NewLead = Omit<Lead, 'id'>;

export type KpiMetric = 'visits' | 'impressions' | 'clicks' | 'leads' | 'sales_eur';

export interface Kpi {
  date: string; // YYYY-MM-DD
  channel: string;
  metric: KpiMetric;
  value: number;
}

export type CadenceType = 'daily' | 'weekly' | 'interval' | 'once';

export interface Cadence {
  type: CadenceType;
  hour?: number;
  weekday?: number;
  everyHours?: number;
}

export interface Playbook {
  id: string;
  name: string;
  goal: string;
  channel: string;
  agent: string;
  cadence: Cadence;
  promptTemplate: string;
  outputType: string;
  autoPublish: boolean;
  enabled: boolean;
  legalNotes: string;
}

export interface PlaybookWithState extends Playbook {
  lastRun: string | null;
  nextRun: string | null;
}

export interface FunnelTotals {
  leads7d: number;
  leads30d: number;
  jobsInReview: number;
  published30d: number;
  salesValue30d: number;
}

export interface FunnelChannel {
  channel: string;
  leads: number;
  published: number;
}

export interface Funnel {
  totals: FunnelTotals;
  byChannel: FunnelChannel[];
}

export interface HealthResponse {
  ok: boolean;
  version: string;
  dryRun: boolean;
  uptimeSec: number;
}

// --- Compliance (policy/compliance.json) ---

export interface ForbiddenPattern {
  pattern: string;
  severity: GateSeverity;
  hint: string;
}

export interface ForbiddenChannel {
  channel: string;
  reason: string;
}

export interface CompliancePolicy {
  version: string;
  updatedAt: string;
  source: string;
  language: {
    required: string[];
    disclaimerHint: string;
    disclaimerRequiredForChannels: string[];
  };
  forbiddenPatterns: ForbiddenPattern[];
  allowedChannels: string[];
  forbiddenChannels: ForbiddenChannel[];
  publishing: {
    autoPublish: boolean;
    rule: string;
  };
  comparativeAdvertising: {
    rule: string;
  };
}

export interface RecentFinding {
  jobId: string;
  title: string;
  findings: GateFinding[];
  at: string;
}

export interface ComplianceResponse {
  policy: CompliancePolicy;
  recentFindings: RecentFinding[];
}
