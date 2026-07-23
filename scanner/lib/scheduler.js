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
  // Claim durabel machen, BEVOR gemailt wird: ein Crash zwischen Versand und RELEASED-
  // Write hinterlässt dann RELEASING (in-doubt) statt SCHEDULED → kein Auto-Zweitversand.
  await reportQueue.persistClaim(sessionId);

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
    // Onboarding Track A (agent-09): Anker „Tag 1 nach Lieferung" — der Hook
    // wird NACH erfolgreicher Auslieferung aufgerufen (best-effort, darf die
    // Freigabe nie kippen). Verdrahtung + Flag-Gate in app.js (releaseDeps).
    if (deps.onDelivered) {
      try {
        await deps.onDelivered({ sessionId, to: job.to, company: job.company || '', pkg: job.pkg, emailKind: job.emailKind || 'bfsg' });
      } catch (hookErr) {
        logger?.warn?.({ sessionId, err: hookErr.message }, 'onDelivered-Hook fehlgeschlagen (Auslieferung war erfolgreich)');
      }
    }
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

/**
 * Beim Start Jobs melden, die beim letzten Absturz mitten im Versand standen (RELEASING).
 * Ob deren Mail rausging, ist ungewiss → Owner-Alarm (kein Auto-Zweitversand). Danach
 * terminal RELEASE_IN_DOUBT markieren, damit nicht bei jedem Neustart erneut alarmiert wird.
 */
export async function recoverInDoubt(deps) {
  const { reportQueue, sendAlert, logger } = deps;
  const inDoubt = await reportQueue.listInDoubt();
  for (const job of inDoubt) {
    await sendAlert(
      `Report-Freigabe unklar nach Neustart: ${job.to}`,
      `Session: ${job.sessionId}\nDer Prozess wurde während des Versands beendet — ob die Mail zugestellt wurde, ist ungewiss.\n` +
      `Bitte den Posteingang des Kunden prüfen. Falls NICHT angekommen, nur Mail erneut senden (kein Neuscan):\n` +
      `curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" ${process.env.PUBLIC_URL || ''}/api/resend/${job.sessionId}`
    );
    await reportQueue.markJobStatus(job.sessionId, 'RELEASE_IN_DOUBT', {});
    logger?.warn?.({ sessionId: job.sessionId }, 'Report-Freigabe in-doubt nach Neustart gemeldet');
  }
  return inDoubt.length;
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
