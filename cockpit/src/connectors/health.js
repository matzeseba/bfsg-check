// Health-Connector: pollt den öffentlichen /health-Endpoint der Prod-App.
import { config } from '../config.js';

export async function fetchHealth() {
  try {
    const res = await fetch(`${config.prodBaseUrl}/health`, { signal: AbortSignal.timeout(8000) });
    const j = await res.json().catch(() => ({}));
    return {
      ok: !!j.ok, stripe: !!j.stripe, live: !!j.live,
      mailer: typeof j.mailer === 'string' ? j.mailer !== '' : !!j.mailer,
      aboEnabled: !!j.aboEnabled,
      checkedAt: new Date().toISOString(),
      reachable: res.ok,
    };
  } catch {
    return { ok: false, stripe: false, live: false, mailer: false, aboEnabled: false, checkedAt: new Date().toISOString(), reachable: false };
  }
}
