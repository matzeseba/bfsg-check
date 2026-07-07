// Typisierter Fetch-Client für ALLE Endpunkte aus ARCHITECTURE.md §6.
// Fehlerformat der Engine ist immer { "error": "<meldung>" } mit 4xx/5xx.

import type {
  ComplianceResponse,
  Funnel,
  HealthResponse,
  Job,
  JobStatus,
  Kpi,
  Lead,
  NewLead,
  PlaybookWithState,
} from '../types';

const BASE = '/api';
const OFFLINE_MSG =
  'Engine nicht erreichbar — läuft „npm start" in marketing-os/engine?';

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function extractError(data: unknown, status: number): string {
  if (data && typeof data === 'object' && 'error' in data) {
    const value = (data as { error: unknown }).error;
    if (typeof value === 'string' && value.trim() !== '') return value;
  }
  return `HTTP ${status}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    // Netzwerk-/Verbindungsfehler → Engine vermutlich offline
    throw new ApiError(OFFLINE_MSG, 0);
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    // 5xx ohne verwertbaren JSON-Fehlerkörper = i. d. R. Proxy/Engine nicht erreichbar.
    const hasErrorBody = !!data && typeof data === 'object' && 'error' in data;
    if (res.status >= 500 && !hasErrorBody) {
      throw new ApiError(OFFLINE_MSG, res.status);
    }
    throw new ApiError(extractError(data, res.status), res.status);
  }
  return data as T;
}

function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export const api = {
  // System
  health: (): Promise<HealthResponse> => request<HealthResponse>('/health'),

  // Jobs
  getJobs: (status?: JobStatus): Promise<Job[]> => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return request<{ jobs: Job[] }>(`/jobs${query}`).then((r) => r.jobs);
  },
  createJob: (input: {
    agent: string;
    title: string;
    channel: string;
    prompt: string;
  }): Promise<Job> => post<{ job: Job }>('/jobs', input).then((r) => r.job),
  approveJob: (id: string): Promise<Job> =>
    post<{ job: Job }>(`/jobs/${encodeURIComponent(id)}/approve`).then((r) => r.job),
  rejectJob: (id: string): Promise<Job> =>
    post<{ job: Job }>(`/jobs/${encodeURIComponent(id)}/reject`).then((r) => r.job),
  publishJob: (id: string): Promise<Job> =>
    post<{ job: Job }>(`/jobs/${encodeURIComponent(id)}/published`).then((r) => r.job),
  getJobOutput: (id: string): Promise<string> =>
    request<{ content: string }>(`/jobs/${encodeURIComponent(id)}/output`).then(
      (r) => r.content,
    ),

  // Playbooks
  getPlaybooks: (): Promise<PlaybookWithState[]> =>
    request<{ playbooks: PlaybookWithState[] }>('/playbooks').then((r) => r.playbooks),
  togglePlaybook: (id: string): Promise<PlaybookWithState> =>
    post<{ playbook: PlaybookWithState }>(
      `/playbooks/${encodeURIComponent(id)}/toggle`,
    ).then((r) => r.playbook),
  runPlaybookNow: (id: string): Promise<Job> =>
    post<{ job: Job }>(`/playbooks/${encodeURIComponent(id)}/run-now`).then((r) => r.job),

  // Leads
  getLeads: (): Promise<Lead[]> =>
    request<{ leads: Lead[] }>('/leads').then((r) => r.leads),
  createLead: (input: NewLead): Promise<Lead> =>
    post<{ lead: Lead }>('/leads', input).then((r) => r.lead),

  // KPIs
  getKpis: (from: string, to: string): Promise<Kpi[]> =>
    request<{ kpis: Kpi[] }>(
      `/kpis?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    ).then((r) => r.kpis),
  importKpis: (kpis: Kpi[]): Promise<number> =>
    post<{ imported: number }>('/kpis/import', { kpis }).then((r) => r.imported),

  // Funnel + Compliance
  getFunnel: (): Promise<Funnel> => request<Funnel>('/funnel'),
  getCompliance: (): Promise<ComplianceResponse> =>
    request<ComplianceResponse>('/compliance'),
};
