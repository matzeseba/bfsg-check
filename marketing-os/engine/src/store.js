// Dateibasierter Datenlayer: atomare JSON-Reads/Writes (write-temp + rename),
// Bootstrap aus data/seed/, plus typisierte Helfer für Jobs/Leads/KPIs/State.
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathExists } from './util.js';
import { makeJob } from './jobs.js';

// Kanonische Laufzeitdateien + ihre Leer-Defaults (falls kein Seed vorhanden).
// ads/ads-metrics haben bewusst KEIN Seed-Pendant (data/seed/) — ehrlich leer starten.
const FILES = {
  jobs: [],
  leads: [],
  kpis: [],
  state: { playbooks: {} },
  ads: [],
  'ads-metrics': [],
};

async function writeJsonAtomic(filePath, data) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  const rnd = Math.random().toString(16).slice(2);
  const tmp = path.join(dir, `.${path.basename(filePath)}.${process.pid}.${Date.now()}.${rnd}.tmp`);
  await fs.writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  // fs.rename ersetzt auf Windows (MoveFileEx) wie auf POSIX ein evtl. bestehendes Ziel.
  await fs.rename(tmp, filePath);
}

async function readJsonOr(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return structuredClone(fallback);
  }
}

export function createStore(cfg) {
  const fileFor = (name) => path.join(cfg.dataDir, `${name}.json`);

  /**
   * Legt Verzeichnisse an und kopiert fehlende data/*.json aus data/seed/.
   * Existiert kein Seed, wird ein valider Leer-Default geschrieben.
   */
  async function bootstrap() {
    await fs.mkdir(cfg.dataDir, { recursive: true });
    await fs.mkdir(cfg.outboxDir, { recursive: true });
    await fs.mkdir(cfg.logsDir, { recursive: true });

    for (const [name, fallback] of Object.entries(FILES)) {
      const target = fileFor(name);
      if (await pathExists(target)) continue;

      const seed = path.join(cfg.seedDir, `${name}.json`);
      if (await pathExists(seed)) {
        try {
          const parsed = JSON.parse(await fs.readFile(seed, 'utf8'));
          await writeJsonAtomic(target, parsed);
          continue;
        } catch {
          // kaputter Seed darf den Start nicht verhindern -> Default
        }
      }
      await writeJsonAtomic(target, fallback);
    }
  }

  const readJobs = () => readJsonOr(fileFor('jobs'), FILES.jobs);
  const writeJobs = (v) => writeJsonAtomic(fileFor('jobs'), v);
  const readLeads = () => readJsonOr(fileFor('leads'), FILES.leads);
  const writeLeads = (v) => writeJsonAtomic(fileFor('leads'), v);
  const readKpis = () => readJsonOr(fileFor('kpis'), FILES.kpis);
  const writeKpis = (v) => writeJsonAtomic(fileFor('kpis'), v);
  const readState = () => readJsonOr(fileFor('state'), FILES.state);
  const writeState = (v) => writeJsonAtomic(fileFor('state'), v);
  const readAds = () => readJsonOr(fileFor('ads'), FILES.ads);
  const writeAds = (v) => writeJsonAtomic(fileFor('ads'), v);
  const readAdsMetrics = () => readJsonOr(fileFor('ads-metrics'), FILES['ads-metrics']);
  const writeAdsMetrics = (v) => writeJsonAtomic(fileFor('ads-metrics'), v);

  /** Erzeugt Job mit fortlaufender ID (read+write in einem Schritt). */
  async function createJob(fields) {
    const jobs = await readJobs();
    const job = makeJob({ existingJobs: jobs, ...fields });
    jobs.push(job);
    await writeJobs(jobs);
    return job;
  }

  /** Patcht einen Job per ID atomar; setzt updatedAt. Gibt null bei unbekannter ID. */
  async function updateJob(id, patch) {
    const jobs = await readJobs();
    const idx = jobs.findIndex((j) => j.id === id);
    if (idx === -1) return null;
    jobs[idx] = { ...jobs[idx], ...patch, updatedAt: new Date().toISOString() };
    await writeJobs(jobs);
    return jobs[idx];
  }

  async function getJob(id) {
    const jobs = await readJobs();
    return jobs.find((j) => j.id === id) || null;
  }

  /** Schreibt das Artefakt-Markdown atomar nach data/outbox/<id>.md. */
  async function writeArtifact(id, content) {
    const p = path.join(cfg.outboxDir, `${id}.md`);
    const dir = path.dirname(p);
    await fs.mkdir(dir, { recursive: true });
    const tmp = path.join(dir, `.${id}.${Date.now()}.tmp`);
    await fs.writeFile(tmp, content, 'utf8');
    await fs.rename(tmp, p);
    return p;
  }

  async function readArtifact(id) {
    const p = path.join(cfg.outboxDir, `${id}.md`);
    return fs.readFile(p, 'utf8'); // wirft, wenn nicht vorhanden -> API 404
  }

  return {
    cfg,
    bootstrap,
    writeJsonAtomic,
    readJobs, writeJobs,
    readLeads, writeLeads,
    readKpis, writeKpis,
    readState, writeState,
    readAds, writeAds,
    readAdsMetrics, writeAdsMetrics,
    createJob, updateJob, getJob,
    writeArtifact, readArtifact,
  };
}
