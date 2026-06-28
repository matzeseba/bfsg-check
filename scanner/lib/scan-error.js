// Grobe Fehler-Klassifizierung für den Gratis-Teaser-Scan.
// Reine Funktion (kein Browser/IO) → ohne Playwright testbar.
//
// Zweck: aus einer technischen err.message eine grobe Kategorie + eine
// deutsche Klartextmeldung + einen HTTP-Status ableiten, OHNE sensible Interna
// (Stacktraces, interne Hostnamen/IPs) an den Client zu leaken. Das echte
// err.message wird server-seitig weiterhin geloggt — nur die Kategorie geht raus.

// Kategorien: timeout | blocked | tls | dns | unknown
export function classifyScanError(message = '') {
  const m = String(message).toLowerCase();

  // Timeout: Navigation/Settle hat das Budget überschritten.
  if (m.includes('timeout') || m.includes('timed out') || m.includes('exceeded')) {
    return {
      reason: 'timeout',
      status: 504,
      message:
        'Die Seite hat zu lange zum Laden gebraucht. Bitte später erneut versuchen.'
    };
  }

  // HTTP-Fehlerstatus der Zielseite (von gotoResilient als 'http-status-<code>'
  // geworfen). Ohne diesen Zweig würde eine 403/404/5xx-Fehlerseite als echtes
  // Scan-Ergebnis durchrutschen (falscher Score).
  const httpStatus = m.match(/http-status-(\d{3})/);
  if (httpStatus) {
    const code = Number(httpStatus[1]);
    if (code === 404 || code === 410) {
      return {
        reason: 'dns',
        status: 502,
        message: 'Die Seite wurde unter dieser Adresse nicht gefunden. Bitte Adresse prüfen.'
      };
    }
    if (code === 401 || code === 403 || code === 429) {
      return {
        reason: 'blocked',
        status: 502,
        message:
          'Die Seite hat die automatisierte Prüfung blockiert. Eine manuelle Analyse ist möglich.'
      };
    }
    // 5xx + sonstige 4xx: Gegenseite hat einen Fehler gemeldet.
    return {
      reason: 'unknown',
      status: 502,
      message: 'Die Seite hat mit einem Fehler geantwortet. Bitte später erneut versuchen.'
    };
  }

  // TLS-/Zertifikatsfehler.
  if (
    m.includes('err_cert') ||
    m.includes('ssl') ||
    m.includes('tls') ||
    m.includes('certificate') ||
    m.includes('err_ssl')
  ) {
    return {
      reason: 'tls',
      status: 502,
      message:
        'Das Sicherheitszertifikat der Seite konnte nicht überprüft werden.'
    };
  }

  // DNS-/Erreichbarkeitsfehler (Host nicht auflösbar / kein Connect).
  if (
    m.includes('dns') ||
    m.includes('name_not_resolved') ||
    m.includes('enotfound') ||
    m.includes('econnrefused') ||
    m.includes('connection refused') ||
    m.includes('connection closed') ||
    m.includes('err_connection') ||
    m.includes('err_address') ||
    m.includes('econnreset') ||
    m.includes('unreachable')
  ) {
    return {
      reason: 'dns',
      status: 502,
      message: 'Die Seite war nicht erreichbar. Bitte Adresse prüfen.'
    };
  }

  // Vom (SSRF-/Bot-)Guard oder von der Gegenseite blockierte Navigation.
  if (
    m.includes('blockedbyclient') ||
    m.includes('blocked') ||
    m.includes('err_blocked') ||
    m.includes('403') ||
    m.includes('forbidden') ||
    m.includes('aborted')
  ) {
    return {
      reason: 'blocked',
      status: 502,
      message:
        'Die Seite hat die automatisierte Prüfung blockiert. Eine manuelle Analyse ist möglich.'
    };
  }

  // Default: unbekannte Ursache.
  return {
    reason: 'unknown',
    status: 502,
    message: 'Der Live-Scan ist fehlgeschlagen. Bitte später erneut versuchen.'
  };
}
