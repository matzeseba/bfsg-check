// In-Process Job-Queue mit Concurrency-Cap, Approval-Gate, SSE-Subscriber-Events.
// Gleiche Außen-API wie ein späteres BullMQ-Upgrade (createJob/getJob/subscribe/approve/cancel).
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import { config } from '../config.js';
import { log } from '../log.js';
import { runAgent } from './claude.js';
import { checkAction, formulationGuard } from '../actions/guardrails.js';
import { appendAudit } from '../actions/auditLog.js';

const jobs = new Map();                 // id -> Job
const subscribers = new Map();          // id -> Set<fn(event)>
const approvalResolvers = new Map();    // id -> fn
const controllers = new Map();          // id -> AbortController
const waiting = [];                     // queued job ids
let running = 0;

// DoS-Schutz: maximale Anzahl Jobs in der In-Memory-Map
const MAX_JOBS_IN_MEMORY = 200;
// DoS-Schutz: maximale Warteschlangenlänge
const MAX_QUEUE_LENGTH = 20;

function emit(id, event) {
  const job = jobs.get(id);
  if (job && event.type === 'log') job.logs.push(event.data);
  if (job && event.type === 'status') job.status = event.data.status;
  for (const fn of subscribers.get(id) || []) {
    try { fn(event); } catch { /* ignore broken subscriber */ }
  }
}

export function subscribe(id, fn) {
  if (!subscribers.has(id)) subscribers.set(id, new Set());
  subscribers.get(id).add(fn);
  return () => subscribers.get(id)?.delete(fn);
}

export function getJob(id) { return jobs.get(id) || null; }
export function listJobs(limit = 50) {
  return [...jobs.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

function persist(job) {
  try {
    fs.appendFileSync(config.paths.jobsLog,
      JSON.stringify({ id: job.id, actionId: job.actionId, status: job.status, costUsd: job.costUsd, ts: job.completedAt || job.createdAt }) + '\n');
  } catch (e) { log.warn(e, 'job persist failed'); }
}

export function createJob(actionDef, args = {}) {
  // DoS-Schutz: Warteschlange begrenzen
  if (waiting.length >= MAX_QUEUE_LENGTH) {
    throw new Error(`Warteschlange voll (max. ${MAX_QUEUE_LENGTH} Jobs). Bitte warten.`);
  }
  // DoS-Schutz: In-Memory-Map begrenzen — älteste abgeschlossene Jobs entfernen
  if (jobs.size >= MAX_JOBS_IN_MEMORY) {
    const completed = [...jobs.entries()]
      .filter(([, j]) => j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled')
      .sort((a, b) => a[1].createdAt.localeCompare(b[1].createdAt));
    const toDelete = completed.slice(0, Math.max(1, Math.floor(MAX_JOBS_IN_MEMORY * 0.2)));
    for (const [delId] of toDelete) {
      jobs.delete(delId);
      subscribers.delete(delId);
    }
    // Falls immer noch voll (alle Jobs laufen) → ablehnen
    if (jobs.size >= MAX_JOBS_IN_MEMORY) {
      throw new Error(`Job-Speicher voll (${jobs.size} Jobs). Bitte warten.`);
    }
  }

  const id = randomUUID();
  const job = {
    id,
    actionId: actionDef.id,
    label: actionDef.label,
    category: actionDef.category,
    status: 'queued',
    args,
    logs: [],
    requiresApproval: !!actionDef.requiresApproval,
    approved: false,
    createdAt: new Date().toISOString(),
  };
  jobs.set(id, job);
  job._actionDef = actionDef;
  waiting.push(id);
  pump();
  return job;
}

function pump() {
  while (running < config.jobConcurrency && waiting.length) {
    const id = waiting.shift();
    const job = jobs.get(id);
    if (!job || job.status === 'cancelled') continue;
    running++;
    run(job).catch((e) => log.error(e, 'job runner crashed')).finally(() => { running--; pump(); });
  }
}

async function run(job) {
  const actionDef = job._actionDef;
  job.startedAt = new Date().toISOString();
  emit(job.id, { type: 'status', data: { status: 'running' } });

  // Ebene 1: Blacklist / Caps / Channel
  const gate = checkAction(actionDef, job.args);
  if (!gate.ok) {
    job.status = 'failed'; job.error = `BLOCKIERT: ${gate.reason}`; job.completedAt = new Date().toISOString();
    emit(job.id, { type: 'log', data: { ts: job.completedAt, level: 'error', message: job.error } });
    emit(job.id, { type: 'status', data: { status: 'failed' } });
    appendAudit({ action_id: job.actionId, category: job.category, result: 'blocked', reason: gate.reason });
    persist(job);
    return;
  }

  // Ebene 3: Approval-Gate für Live-Aktionen
  if (job.requiresApproval && !job.approved) {
    job.status = 'awaiting_approval';
    emit(job.id, { type: 'approval_required', data: { summary: actionDef.label, args: job.args } });
    emit(job.id, { type: 'status', data: { status: 'awaiting_approval' } });
    const ok = await new Promise((res) => approvalResolvers.set(job.id, res));
    approvalResolvers.delete(job.id);
    if (!ok) {
      job.status = 'cancelled'; job.completedAt = new Date().toISOString();
      emit(job.id, { type: 'status', data: { status: 'cancelled' } });
      appendAudit({ action_id: job.actionId, category: job.category, result: 'user_cancelled' });
      persist(job);
      return;
    }
    job.status = 'running';
    emit(job.id, { type: 'status', data: { status: 'running' } });
  }

  const controller = new AbortController();
  controllers.set(job.id, controller);

  try {
    const prompt = actionDef.buildPrompt ? actionDef.buildPrompt(job.args) : (job.args.prompt || actionDef.label);
    const { result, costUsd, sessionId } = await runAgent({
      prompt,
      agent: actionDef.agent,
      allowedTools: actionDef.allowedTools,
      permissionMode: actionDef.permissionMode || (actionDef.category === 'quick' ? 'plan' : 'acceptEdits'),
      signal: controller.signal,
      onEvent: (e) => emit(job.id, e),
    });

    // Ebene 2: Formulation-Guard bei Generatoren
    let guardNote;
    if (actionDef.category === 'generator') {
      const g = formulationGuard(result);
      if (g.verdict === 'FAIL') {
        guardNote = g;
        emit(job.id, { type: 'log', data: { ts: new Date().toISOString(), level: 'warn',
          message: `⚠️ COMPLIANCE-FAIL: ${g.hits.map((h) => h.reason).join('; ')}` } });
      }
    }

    job.result = result; job.costUsd = costUsd; job.sessionId = sessionId;
    job.status = 'completed'; job.completedAt = new Date().toISOString();
    emit(job.id, { type: 'result', data: { result, costUsd, guard: guardNote } });
    emit(job.id, { type: 'status', data: { status: 'completed' } });
    appendAudit({ action_id: job.actionId, category: job.category, result: 'success', cost_usd: costUsd, compliance: guardNote ? 'FAIL' : 'PASS' });
  } catch (err) {
    job.status = 'failed'; job.error = String(err.message || err); job.completedAt = new Date().toISOString();
    emit(job.id, { type: 'log', data: { ts: job.completedAt, level: 'error', message: job.error } });
    emit(job.id, { type: 'status', data: { status: 'failed' } });
    appendAudit({ action_id: job.actionId, category: job.category, result: 'error', error: job.error });
  } finally {
    controllers.delete(job.id);
    persist(job);
  }
}

export function approveJob(id) {
  const r = approvalResolvers.get(id);
  if (!r) return false;
  jobs.get(id).approved = true;
  r(true);
  return true;
}

export function cancelJob(id) {
  const job = jobs.get(id);
  if (!job) return false;
  const r = approvalResolvers.get(id);
  if (r) { r(false); return true; }
  const c = controllers.get(id);
  if (c) { c.abort(); return true; }
  if (job.status === 'queued') { job.status = 'cancelled'; emit(id, { type: 'status', data: { status: 'cancelled' } }); return true; }
  return false;
}
