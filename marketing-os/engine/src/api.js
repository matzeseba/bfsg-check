// Express-API nach ARCHITECTURE.md §6. Bind 127.0.0.1:4870, CORS nur localhost:5183.
// Fehlerformat immer { error: "<meldung>" } mit passendem 4xx/5xx-Status.
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { ymdDash, withinDays } from './util.js';

const ALLOWED_ORIGINS = new Set(['http://localhost:5183', 'http://127.0.0.1:5183']);

// kleiner async-Wrapper: fängt Fehler ab und liefert 500 { error }
const wrap = (fn) => (req, res) => {
  Promise.resolve(fn(req, res)).catch((err) => {
    if (!res.headersSent) res.status(500).json({ error: err?.message || String(err) });
  });
};

function sortNewestFirst(jobs) {
  return [...jobs].sort((a, b) => {
    const t = Date.parse(b.createdAt) - Date.parse(a.createdAt);
    if (t !== 0 && !Number.isNaN(t)) return t;
    return String(b.id).localeCompare(String(a.id));
  });
}

function mergePlaybook(pb, state, scheduler, now = new Date()) {
  const st = state.playbooks?.[pb.id] || {};
  const enabled = st.enabled !== false && pb.enabled !== false;
  const lastRun = st.lastRun || null;
  return {
    ...pb,
    enabled,
    lastRun,
    nextRun: enabled ? scheduler.nextRun(pb, lastRun, now) : null,
  };
}

export function createApi(cfg, deps) {
  const { store, gate, playbooks, scheduler, log } = deps;
  const startTime = Date.now();
  const app = express();

  // --- CORS (nur Dashboard-Origin) ---
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && ALLOWED_ORIGINS.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.use(express.json({ limit: '4mb' }));

  // ---------------- Health ----------------
  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      version: cfg.version,
      dryRun: !!cfg.dryRun,
      uptimeSec: Math.round((Date.now() - startTime) / 1000),
    });
  });

  // ---------------- Jobs ----------------
  app.get('/api/jobs', wrap(async (req, res) => {
    const all = await store.readJobs();
    const status = req.query.status;
    const filtered = status ? all.filter((j) => j.status === status) : all;
    res.json({ jobs: sortNewestFirst(filtered) });
  }));

  app.post('/api/jobs', wrap(async (req, res) => {
    const { agent, title, channel, prompt } = req.body || {};
    if (!agent || !title || !channel) {
      res.status(400).json({ error: 'agent, title und channel sind erforderlich' });
      return;
    }
    const job = await store.createJob({
      playbookId: null,
      agent,
      title,
      channel,
      promptTemplate: typeof prompt === 'string' ? prompt : '',
    });
    if (log) await log.event(`API: Job ${job.id} manuell erstellt`, { channel });
    res.status(201).json({ job });
  }));

  app.get('/api/jobs/:id/output', wrap(async (req, res) => {
    try {
      const content = await store.readArtifact(req.params.id);
      res.json({ content });
    } catch {
      res.status(404).json({ error: `Kein Artefakt für Job ${req.params.id}` });
    }
  }));

  const transition = (from, to) => wrap(async (req, res) => {
    const job = await store.getJob(req.params.id);
    if (!job) {
      res.status(404).json({ error: `Job ${req.params.id} nicht gefunden` });
      return;
    }
    if (job.status !== from) {
      res.status(409).json({ error: `Übergang nur aus Status "${from}" möglich (aktuell: "${job.status}")` });
      return;
    }
    const updated = await store.updateJob(job.id, { status: to });
    if (log) await log.event(`API: Job ${job.id} ${from} -> ${to}`);
    res.json({ job: updated });
  });

  app.post('/api/jobs/:id/approve', transition('review', 'approved'));
  app.post('/api/jobs/:id/reject', transition('review', 'skipped'));
  app.post('/api/jobs/:id/published', transition('approved', 'published'));

  // ---------------- Playbooks ----------------
  app.get('/api/playbooks', wrap(async (req, res) => {
    const [list, state] = await Promise.all([playbooks.all(), store.readState()]);
    const now = new Date();
    res.json({ playbooks: list.map((pb) => mergePlaybook(pb, state, scheduler, now)) });
  }));

  app.post('/api/playbooks/:id/toggle', wrap(async (req, res) => {
    const pb = await playbooks.byId(req.params.id);
    if (!pb) {
      res.status(404).json({ error: `Playbook ${req.params.id} nicht gefunden` });
      return;
    }
    const state = await store.readState();
    if (!state.playbooks) state.playbooks = {};
    const cur = state.playbooks[pb.id] || { lastRun: null, enabled: pb.enabled !== false };
    cur.enabled = !(cur.enabled !== false);
    state.playbooks[pb.id] = cur;
    await store.writeState(state);
    if (log) await log.event(`API: Playbook ${pb.id} toggle -> enabled=${cur.enabled}`);
    res.json({ playbook: mergePlaybook(pb, state, scheduler) });
  }));

  app.post('/api/playbooks/:id/run-now', wrap(async (req, res) => {
    const pb = await playbooks.byId(req.params.id);
    if (!pb) {
      res.status(404).json({ error: `Playbook ${req.params.id} nicht gefunden` });
      return;
    }
    const job = await store.createJob({
      playbookId: pb.id,
      agent: pb.agent,
      title: `${pb.name || pb.id} — ${ymdDash(new Date())}`,
      channel: pb.channel,
      promptTemplate: pb.promptTemplate || '',
    });
    if (log) await log.event(`API: Playbook ${pb.id} run-now -> Job ${job.id}`);
    res.status(201).json({ job });
  }));

  // ---------------- Leads ----------------
  app.get('/api/leads', wrap(async (req, res) => {
    res.json({ leads: await store.readLeads() });
  }));

  app.post('/api/leads', wrap(async (req, res) => {
    const body = req.body || {};
    if (!body.source || !body.kind) {
      res.status(400).json({ error: 'source und kind sind erforderlich' });
      return;
    }
    const leads = await store.readLeads();
    const lead = {
      id: `lead_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      date: body.date || ymdDash(new Date()),
      source: body.source,
      kind: body.kind,
      value: typeof body.value === 'number' ? body.value : null,
      note: typeof body.note === 'string' ? body.note : '',
    };
    leads.push(lead);
    await store.writeLeads(leads);
    res.status(201).json({ lead });
  }));

  // ---------------- KPIs ----------------
  app.get('/api/kpis', wrap(async (req, res) => {
    const all = await store.readKpis();
    const { from, to } = req.query;
    const filtered = all.filter((k) => {
      if (from && k.date < from) return false;
      if (to && k.date > to) return false;
      return true;
    });
    res.json({ kpis: filtered });
  }));

  app.post('/api/kpis/import', wrap(async (req, res) => {
    const incoming = req.body?.kpis;
    if (!Array.isArray(incoming)) {
      res.status(400).json({ error: 'Body { kpis: Kpi[] } erforderlich' });
      return;
    }
    const valid = incoming.filter(
      (k) => k && typeof k.date === 'string' && typeof k.channel === 'string' && typeof k.metric === 'string' && typeof k.value === 'number',
    );
    const all = await store.readKpis();
    all.push(...valid);
    await store.writeKpis(all);
    if (log) await log.event(`API: KPI-Import (${valid.length} Einträge)`);
    res.json({ imported: valid.length });
  }));

  // ---------------- Funnel ----------------
  app.get('/api/funnel', wrap(async (req, res) => {
    const [jobs, leads] = await Promise.all([store.readJobs(), store.readLeads()]);
    const now = Date.now();

    const leads7d = leads.filter((l) => withinDays(l.date, 7, now)).length;
    const leads30d = leads.filter((l) => withinDays(l.date, 30, now)).length;
    const jobsInReview = jobs.filter((j) => j.status === 'review').length;
    const published30d = jobs.filter((j) => j.status === 'published' && withinDays(j.updatedAt, 30, now)).length;
    const salesValue30d = leads
      .filter((l) => l.kind === 'sale' && withinDays(l.date, 30, now) && typeof l.value === 'number')
      .reduce((sum, l) => sum + l.value, 0);

    const channels = new Set();
    jobs.forEach((j) => j.channel && channels.add(j.channel));
    leads.forEach((l) => l.source && channels.add(l.source));
    const byChannel = [...channels].map((ch) => ({
      channel: ch,
      leads: leads.filter((l) => l.source === ch).length,
      published: jobs.filter((j) => j.status === 'published' && j.channel === ch).length,
    }));

    res.json({
      totals: { leads7d, leads30d, jobsInReview, published30d, salesValue30d },
      byChannel,
    });
  }));

  // ---------------- Compliance ----------------
  app.get('/api/compliance', wrap(async (req, res) => {
    const [policy, jobs] = await Promise.all([gate.loadPolicy(), store.readJobs()]);
    const recentFindings = jobs
      .filter((j) => j.gate && Array.isArray(j.gate.findings) && j.gate.findings.length > 0)
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      .slice(0, 25)
      .map((j) => ({ jobId: j.id, title: j.title, findings: j.gate.findings, at: j.updatedAt }));
    res.json({ policy, recentFindings });
  }));

  // ---------------- Statisches Dashboard (falls gebaut) ----------------
  if (fs.existsSync(cfg.dashboardDist)) {
    app.use(express.static(cfg.dashboardDist));
    // SPA-Fallback für nicht-/api Routen
    app.get(/^(?!\/api\/).*/, (req, res, next) => {
      const indexHtml = path.join(cfg.dashboardDist, 'index.html');
      if (fs.existsSync(indexHtml)) res.sendFile(indexHtml);
      else next();
    });
  }

  // ---------------- 404 + Fehler-Handler ----------------
  app.use((req, res) => {
    res.status(404).json({ error: `Nicht gefunden: ${req.method} ${req.path}` });
  });
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (!res.headersSent) res.status(500).json({ error: err?.message || String(err) });
  });

  return app;
}
