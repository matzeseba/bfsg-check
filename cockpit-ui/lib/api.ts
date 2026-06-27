import type { CockpitSummary, ActionDef, BrainSearchResponse, BrainRecentResponse, BrainNoteResponse } from './types';

const BASE = process.env.NEXT_PUBLIC_COCKPIT_API ?? 'http://127.0.0.1:4317';

export async function fetchSummary(): Promise<CockpitSummary> {
  const res = await fetch(`${BASE}/api/cockpit/summary`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchSummary failed: ${res.status}`);
  return res.json();
}

export async function fetchActions(): Promise<ActionDef[]> {
  const res = await fetch(`${BASE}/api/actions`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchActions failed: ${res.status}`);
  return res.json();
}

export async function launchAction(
  actionId: string,
  args: Record<string, unknown>
): Promise<{ jobId: string }> {
  const res = await fetch(`${BASE}/api/actions/${actionId}/launch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ args }),
  });
  if (!res.ok) throw new Error(`launchAction failed: ${res.status}`);
  return res.json();
}

export async function approveJob(jobId: string): Promise<void> {
  const res = await fetch(`${BASE}/api/jobs/${jobId}/approve`, { method: 'POST' });
  if (!res.ok) throw new Error(`approveJob failed: ${res.status}`);
}

export async function cancelJob(jobId: string): Promise<void> {
  const res = await fetch(`${BASE}/api/jobs/${jobId}/cancel`, { method: 'POST' });
  if (!res.ok) throw new Error(`cancelJob failed: ${res.status}`);
}

export async function sendVoiceIntent(text: string): Promise<{
  actionId?: string;
  args?: Record<string, unknown>;
  needsConfirmation?: boolean;
  jobId?: string;
}> {
  const res = await fetch(`${BASE}/api/voice/intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`sendVoiceIntent failed: ${res.status}`);
  return res.json();
}

export function getStreamUrl(jobId: string): string {
  return `${BASE}/api/jobs/${jobId}/stream`;
}

export function getWsUrl(): string {
  return BASE.replace(/^http/, 'ws') + '/ws/voice';
}

// ---------------------------------------------------------------------------
// Second Brain
// ---------------------------------------------------------------------------

export async function searchBrain(q: string): Promise<BrainSearchResponse> {
  const res = await fetch(`${BASE}/api/brain/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`searchBrain failed: ${res.status}`);
  return res.json();
}

export async function recentBrain(): Promise<BrainRecentResponse> {
  const res = await fetch(`${BASE}/api/brain/recent`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`recentBrain failed: ${res.status}`);
  return res.json();
}

export async function fetchBrainNote(path: string): Promise<BrainNoteResponse> {
  const res = await fetch(`${BASE}/api/brain/note?path=${encodeURIComponent(path)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`fetchBrainNote failed: ${res.status}`);
  return res.json();
}
