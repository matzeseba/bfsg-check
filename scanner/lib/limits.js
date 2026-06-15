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
    const ip =
      (req.headers['x-forwarded-for']?.split(',')[0].trim()) ||
      req.socket?.remoteAddress ||
      'unknown';
    const now = Date.now();
    let e = hits.get(ip);
    if (!e || e.reset < now) {
      e = { count: 0, reset: now + windowMs };
      hits.set(ip, e);
    }
    e.count++;
    if (e.count > max) {
      res.set('Retry-After', String(Math.ceil((e.reset - now) / 1000)));
      return res.status(429).json({ error: 'Zu viele Anfragen. Bitte kurz warten.' });
    }
    next();
  };
}

// --- Concurrency-Gate (p-limit-Ersatz) ---
export function concurrencyGate(maxConcurrent = 2) {
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
      queue.push({ fn, resolve, reject });
      runNext();
    });
  };
}
