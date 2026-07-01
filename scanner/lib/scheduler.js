// Release-Scheduler (PR5): gibt eingequeute Reports frei — automatisch bei Ablauf
// des 90-Min-Fensters (Owner hat nichts getan) oder sofort, wenn der Owner den
// 1-Klick-Link in der Freigabe-Mail klickt (beide Wege laufen durch releaseJob →
// atomarer claimForRelease → genau EIN Versand).
//
// Alle Abhängigkeiten werden injiziert (deps), damit die App-Verdrahtung testbar
// bleibt (kein Import von app.js, keine echten Mails im Test).

const DEFAULT_INTERVAL_MS = Math.max(10_000, Number(process.env.SCHEDULER_INTERVAL_MS) || 60_000);

/**
 * Einen konkreten Job freigeben. Idempotent über reportQueue.claimForRelease:
 * ein bereits versendeter/beanspruchter Job liefert `{ released:false, reason }`.
 * @param {string} sessionId
 * @param {object} deps { reportQueue, sendReportFor, markStatus, sendAlert, logger, via }
 */
export async function releaseJob(sessionId, deps) {
  const { reportQueue, sendReportFor, markStatus, sendAlert, logger, via = 'auto' } = deps;
  const job = reportQueue.claimForRelease(sessionId); // synchroner atomarer Claim
  if (!job) return { released: false, reason: 'not-claimable' };

  try {
    await sendReportFor({
      to: job.to,
      company: job.company || '',
      pdfPath: job.pdfPath,
      stmtPath: job.stmtPath || null,
      emailKind: job.emailKind || 'bfsg',
      diffText: job.diffText || '',
      invoicePdfPath: job.invoicePdfPath || null,
      invoiceNumber: job.invoiceNumber || null,
      customerType: job.customerType || '',
      consentTs: job.consentTs || ''
    });
    await reportQueue.markJobStatus(sessionId, 'RELEASED', { releasedBy: via });
    await markStatus(sessionId, 'MAILED', {
      pdfPath: job.pdfPath,
      invoiceNumber: job.invoiceNumber || null,
      releasedBy: via
    });
    logger?.info?.({ sessionId, via }, 'Report freigegeben + ausgeliefert');
    return { released: true, via };
  } catch (err) {
    // Transient (SMTP-Störung) → Job zurück in die Queue, nächster Tick versucht erneut.
    // Permanent (ungültige Adresse o. ä.) → terminal RELEASE_FAILED + Owner-Alarm; die
    // Artefakte liegen vor, Recovery über /api/resend (mit ggf. korrigierter Adresse).
    const attempts = (job.attempts || 0) + 1;
    const transient = deps.isTransientMailError ? deps.isTransientMailError(err) : true;
    const maxAttempts = Number(process.env.RELEASE_MAX_ATTEMPTS) || 5;
    if (transient && attempts < maxAttempts) {
      await reportQueue.requeue(sessionId, { error: err.message });
      logger?.warn?.({ sessionId, attempts, err: err.message }, 'Report-Freigabe transient fehlgeschlagen — Requeue');
      return { released: false, reason: 'transient', attempts };
    }
    await reportQueue.markJobStatus(sessionId, 'RELEASE_FAILED', { error: err.message, attempts });
    await markStatus(sessionId, 'READY_NOT_MAILED', {
      error: err.message,
      pdfPath: job.pdfPath,
      stmtPath: job.stmtPath || null,
      emailKind: job.emailKind || 'bfsg',
      invoiceNumber: job.invoiceNumber || null,
      invoicePdfPath: job.invoicePdfPath || null
    });
    await sendAlert(
      `Report-Freigabe fehlgeschlagen: ${job.to}`,
      `Session: ${sessionId}\nFehler: ${err.message}\nVersuche: ${attempts}\n\n` +
      `Report + Rechnung liegen vor. NUR Mail erneut senden (kein Neuscan):\n` +
      `curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" ${process.env.PUBLIC_URL || ''}/api/resend/${sessionId}`
    );
    logger?.error?.({ sessionId, attempts, err: err.message }, 'REPORT-FREIGABE ENDGÜLTIG FEHLGESCHLAGEN');
    return { released: false, reason: 'permanent', attempts };
  }
}

/** Alle fälligen Jobs freigeben (ein Tick). */
export async function releaseDue(deps, now = Date.now()) {
  const { reportQueue } = deps;
  const due = await reportQueue.listDue(now);
  let released = 0;
  for (const job of due) {
    const res = await releaseJob(job.sessionId, { ...deps, via: 'auto' });
    if (res.released) released += 1;
  }
  return { due: due.length, released };
}

/**
 * Scheduler starten: sofortiger Tick (fängt beim Redeploy überfällige Jobs → crash-safe)
 * + Intervall. Gibt eine stop()-Funktion zurück (Tests/Shutdown).
 */
export function startScheduler(deps, { intervalMs = DEFAULT_INTERVAL_MS } = {}) {
  const tick = async () => {
    try {
      await releaseDue(deps);
    } catch (err) {
      deps.logger?.error?.({ err: err.message }, 'Scheduler-Tick fehlgeschlagen (läuft weiter)');
    }
  };
  tick(); // sofort beim Start
  const handle = setInterval(tick, intervalMs);
  if (handle.unref) handle.unref(); // blockiert den Prozess-Exit nicht
  return () => clearInterval(handle);
}
