// BFSG-OS Cockpit — Orchestrator-Backend. NUR LOKAL (127.0.0.1). Nicht deployen.
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { config } from './config.js';
import { log } from './log.js';
import healthRoute from './routes/health.js';
import cockpitRoute from './routes/cockpit.js';
import jobsRoute from './routes/jobs.js';
import voiceRoute from './routes/voice.js';
import brainRoute from './routes/brain.js';
import { refreshSummary } from './connectors/index.js';
import { attachVoiceBridge } from './voice/bridge.js';
import { startScheduler } from './scheduler.js';
import { listJobs, cancelJob } from './engine/jobQueue.js';

const app = express();

// CORS strikt: nur lokales Frontend
app.use(cors({ origin: [/^http:\/\/(127\.0\.0\.1|localhost):\d+$/], credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.use('/api/health', healthRoute);
app.use('/api/cockpit', cockpitRoute);
app.use('/api', jobsRoute);          // /api/actions, /api/jobs...
app.use('/api/voice', voiceRoute);
app.use('/api/brain', brainRoute);   // Second-Brain-Suche (read-only, Obsidian-Vault)

app.get('/', (_req, res) => res.json({ service: 'bfsg-os-cockpit', ok: true }));

const server = http.createServer(app);

// Voice-Bridge: PCM-Audio → STT → Intent → Job → TTS (voice/bridge.js)
const wss = new WebSocketServer({ server, path: '/ws/voice' });
attachVoiceBridge(wss);

// KPI-Cache periodisch auffrischen (lokal, nur wenn PC läuft)
async function startPoller() {
  try { await refreshSummary(); } catch (e) { log.warn(e, 'initial summary failed'); }
  setInterval(() => refreshSummary().catch((e) => log.warn(e, 'summary refresh failed')), 60_000);
}

server.listen(config.port, config.host, () => {
  log.info(`🛰️  BFSG-OS Cockpit läuft auf http://${config.host}:${config.port} (nur lokal)`);
  startPoller();
  startScheduler();   // lokaler Scheduler (Tagescheck + Wochenreport, catch-up wenn PC aus war)
});

// R-05: Graceful Shutdown bei SIGTERM / SIGINT.
// Ablauf:
//   1. Laufende + wartende Jobs abbrechen (vorhandene cancelJob/AbortController nutzen).
//   2. HTTP-Server schließen (keine neuen Verbindungen annehmen).
//   3. WebSocket-Server schließen.
//   4. Prozess mit Exit-Code 0 beenden.
// Timeout: Falls nach 8 Sekunden noch nicht fertig, hart beenden (Exit-Code 1).
function gracefulShutdown(signal) {
  log.info({ signal }, 'Cockpit: Graceful Shutdown eingeleitet...');

  // Alle nicht-abgeschlossenen Jobs abbrechen
  try {
    const activeJobs = listJobs(200).filter(
      (j) => j.status === 'queued' || j.status === 'running' || j.status === 'awaiting_approval',
    );
    for (const job of activeJobs) {
      try { cancelJob(job.id); } catch { /* ignorieren */ }
    }
    log.info({ cancelled: activeJobs.length }, 'Cockpit: Jobs abgebrochen');
  } catch (e) {
    log.warn(e, 'Cockpit: Fehler beim Abbrechen der Jobs');
  }

  // HTTP-Server schließen (laufende Requests noch bedienen, keine neuen)
  server.close(() => {
    log.info('Cockpit: HTTP-Server geschlossen');
    wss.close(() => {
      log.info('Cockpit: WebSocket-Server geschlossen. Auf Wiedersehen.');
      process.exit(0);
    });
  });

  // Sicherheits-Timeout: Falls nach 8 s noch nicht fertig → hart beenden
  setTimeout(() => {
    log.error('Cockpit: Shutdown-Timeout überschritten — erzwungener Exit');
    process.exit(1);
  }, 8_000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
