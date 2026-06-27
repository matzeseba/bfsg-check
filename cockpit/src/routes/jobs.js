import { Router } from 'express';
import { getAction, listActions } from '../actions/registry.js';
import { createJob, getJob, listJobs, subscribe, approveJob, cancelJob } from '../engine/jobQueue.js';
import { log } from '../log.js';

const router = Router();

// Rate-Limit für /launch: max. 5 Job-Starts pro 30 s (verhindert unbeabsichtigte Job-Floods)
const LAUNCH_WINDOW_MS = 30_000;
const LAUNCH_MAX_REQ   = 5;
const launchCounts = new Map();

function rateLimitLaunch(req, res, next) {
  const ip = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = launchCounts.get(ip);
  if (!entry || now >= entry.resetAt) {
    launchCounts.set(ip, { count: 1, resetAt: now + LAUNCH_WINDOW_MS });
    return next();
  }
  entry.count++;
  if (entry.count > LAUNCH_MAX_REQ) {
    log.warn({ ip }, '[jobs] Rate-Limit für /launch erreicht');
    return res.status(429).json({ error: 'Zu viele Job-Starts. Kurz warten.' });
  }
  next();
}

// Aktionen auflisten (ohne buildPrompt)
router.get('/actions', (_req, res) => res.json(listActions()));

// Aktion starten -> Job
router.post('/actions/:actionId/launch', rateLimitLaunch, (req, res) => {
  const def = getAction(req.params.actionId);
  if (!def) return res.status(404).json({ error: 'unbekannte Aktion' });
  try {
    const job = createJob(def, req.body?.args || {});
    res.json({ jobId: job.id, status: job.status, requiresApproval: job.requiresApproval });
  } catch (e) {
    // createJob wirft bei voller Queue — 503 statt 500
    res.status(503).json({ error: e.message });
  }
});

router.get('/jobs', (_req, res) => res.json(listJobs()));
router.get('/jobs/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'not found' });
  const { _actionDef, ...safe } = job;
  res.json(safe);
});

// SSE-Live-Stream eines Jobs
router.get('/jobs/:id/stream', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).end();
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  const send = (event) => res.write(`data: ${JSON.stringify(event)}\n\n`);
  // bisherige Logs nachliefern
  send({ type: 'status', data: { status: job.status } });
  for (const l of job.logs) send({ type: 'log', data: l });
  if (job.status === 'completed') send({ type: 'result', data: { result: job.result, costUsd: job.costUsd } });

  const unsub = subscribe(req.params.id, send);
  const ping = setInterval(() => res.write(': ping\n\n'), 15000);
  req.on('close', () => { clearInterval(ping); unsub(); });
});

router.post('/jobs/:id/approve', (req, res) => {
  res.json({ ok: approveJob(req.params.id) });
});
router.post('/jobs/:id/cancel', (req, res) => {
  res.json({ ok: cancelJob(req.params.id) });
});

export default router;
