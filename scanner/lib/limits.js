// Selbstgebaute, abhängigkeitsfreie Schutzmechanismen:
// 1) Fixed-Window-Rate-Limit pro IP (gegen DoS/Kosten-Missbrauch).
// 2) Concurrency-Gate (begrenzt gleichzeitige Headless-Browser → kein OOM).

// --- Rate-Limit-Middleware-Factory ---
export function rateLimit({ windowMs = 60_000, max = 5 } = {}) {
  const hits = new Map(); // ip -> { count, reset }
  // periodisches Aufräumen, damit die Map nicht wächst
  setInterval(() => {
    const now = Date.now();
    for (const [ip, v] of hits) if (v.reset < now) hits.delete(ip);
  }, windowMs).unref?.();

  return (req, res, next) => {
    // req.ip respektiert `app.set('trust proxy', 1)` und nimmt die vom VERTRAUTEN
    // Proxy (Caddy) gesetzte Client-IP. Den rohen X-Forwarded-For-Header NICHT
    // selbst parsen — er ist client-kontrolliert und ein Angreifer könnte das
    // Rate-Limit durch IP-Rotation pro Request komplett aushebeln (Kosten-DoS).
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    let e = hits.get(ip);
    if (!e || e.reset < now) {
      e = { count: 0, reset: now + windowMs };
      hits.set(ip, e);
    }
    e.count++;
    if (e.count > max) {
      const retryAfter = Math.ceil((e.reset - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      // `reason` + `retryAfter` MITSENDEN: ohne sie zeigt das Frontend bei 429 die
      // generische "Live-Scan nicht erreichbar"-Meldung, obwohl der Server gesund ist
      // und der Nutzer nur zu schnell hintereinander geprueft hat. retryAfter steht
      // ohnehin im Header (kein Info-Leak).
      return res
        .status(429)
        .json({ error: 'Zu viele Anfragen. Bitte kurz warten.', reason: 'rate_limit', retryAfter });
    }
    next();
  };
}

// --- Concurrency-Gate (p-limit-Ersatz) ---
// maxQueued (Default unbegrenzt = bisheriges Verhalten): begrenzt die Warteschlange.
// Ist sie voll, lehnt das Gate SOFORT mit einem QUEUE_FULL-Fehler ab (Fast-Fail),
// statt die Verbindung unbegrenzt offen zu halten. So entartet ein Traffic-Spike
// nicht zu einer immer laenger werdenden Queue + haengenden Requests; der Aufrufer
// kann ehrlich mit 503 + Retry-After antworten.
export function concurrencyGate(maxConcurrent = 2, { maxQueued = Infinity } = {}) {
  let active = 0;
  const queue = [];
  const runNext = () => {
    if (active >= maxConcurrent || queue.length === 0) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    Promise.resolve()
      .then(fn)
      .then(resolve, reject)
      .finally(() => {
        active--;
        runNext();
      });
  };
  return function gate(fn) {
    return new Promise((resolve, reject) => {
      if (queue.length >= maxQueued) {
        const err = new Error('scan-queue-full');
        err.code = 'QUEUE_FULL';
        reject(err);
        return;
      }
      queue.push({ fn, resolve, reject });
      runNext();
    });
  };
}
