import { Router } from 'express';
import { matchIntent } from '../voice/intents.js';
import { getAction } from '../actions/registry.js';
import { createJob } from '../engine/jobQueue.js';
import { log } from '../log.js';

const router = Router();

// Einfaches In-Memory-Rate-Limit für /intent (lokal — kein Redis nötig).
// Maximal MAX_REQ Anfragen pro WINDOW_MS pro IP.
// Da das Cockpit ausschliesslich auf 127.0.0.1 bindet, ist das eine Schutzschicht
// gegen unbeabsichtigte Schleifen (z.B. Voice-Client-Bug) und Prompt-Injection-Flooding.
const RATE_WINDOW_MS = 10_000;   // 10 Sekunden
const RATE_MAX_REQ   = 10;       // max. 10 Requests in 10 s
const rateCounts = new Map();    // ip -> { count, resetAt }

function rateLimitIntent(req, res, next) {
  const ip = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateCounts.get(ip);
  if (!entry || now >= entry.resetAt) {
    rateCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return next();
  }
  entry.count++;
  if (entry.count > RATE_MAX_REQ) {
    log.warn({ ip, count: entry.count }, '[voice] Rate-Limit erreicht für /intent');
    return res.status(429).json({ error: 'Zu viele Anfragen. Kurz warten.' });
  }
  next();
}

// Text (vom STT oder Tippen) → Intent → optional Job starten
router.post('/intent', rateLimitIntent, (req, res) => {
  const rawText = req.body?.text;
  // Input-Validierung: text muss ein String sein, max. 500 Zeichen
  if (typeof rawText !== 'string') {
    return res.status(400).json({ error: 'Feld "text" muss ein String sein.' });
  }
  const text = rawText.slice(0, 500);
  const intent = matchIntent(text);
  if (!intent) return res.json({ matched: false, text });

  // Quick-/Generator-Intents direkt starten; Live-Intents nur vorschlagen (Approval folgt im Job)
  let jobId;
  const def = getAction(intent.actionId);
  if (def && !intent.needsConfirmation) {
    const job = createJob(def, intent.args);
    jobId = job.id;
  }
  res.json({ matched: true, ...intent, jobId });
});

export default router;
