// Scheduler: Tick alle 60 s. Fällige Playbooks -> neue Jobs (queued).
// Kadenzen: daily | weekly | interval | once. Lokale Zeit (getHours/getDay).
import { ymdDash } from './util.js';

const TICK_MS = 60_000;

function dayKey(d) {
  return ymdDash(d);
}

/**
 * Ist ein Playbook zum Zeitpunkt `now` fällig (gegeben lastRun ISO|null)?
 * Reine Funktion -> deterministisch testbar.
 */
export function isDue(playbook, lastRun, now = new Date()) {
  const cad = playbook.cadence || {};
  const type = cad.type || 'daily';
  const last = lastRun ? new Date(lastRun) : null;

  switch (type) {
    case 'once':
      return last === null;

    case 'interval': {
      const everyHours = Number(cad.everyHours) > 0 ? Number(cad.everyHours) : 24;
      if (!last) return true;
      return now.getTime() - last.getTime() >= everyHours * 3_600_000;
    }

    case 'weekly': {
      const weekday = Number.isInteger(cad.weekday) ? cad.weekday : 1; // 0=So .. 6=Sa, Default Mo
      const hour = Number.isInteger(cad.hour) ? cad.hour : 6;
      if (now.getDay() !== weekday) return false;
      if (now.getHours() < hour) return false;
      // heute am richtigen Wochentag ab hour -> fällig, sofern nicht heute schon gelaufen
      return !last || dayKey(last) !== dayKey(now);
    }

    case 'daily':
    default: {
      const hour = Number.isInteger(cad.hour) ? cad.hour : 6;
      if (now.getHours() < hour) return false;
      return !last || dayKey(last) !== dayKey(now);
    }
  }
}

/** Grobe Schätzung des nächsten Laufs als ISO-String (für Dashboard-Anzeige). */
export function nextRun(playbook, lastRun, now = new Date()) {
  const cad = playbook.cadence || {};
  const type = cad.type || 'daily';
  const last = lastRun ? new Date(lastRun) : null;

  if (type === 'once') {
    return last ? null : now.toISOString();
  }
  if (type === 'interval') {
    const everyHours = Number(cad.everyHours) > 0 ? Number(cad.everyHours) : 24;
    const base = last ? last.getTime() : now.getTime();
    return new Date(base + everyHours * 3_600_000).toISOString();
  }

  const hour = Number.isInteger(cad.hour) ? cad.hour : 6;
  const candidate = new Date(now);
  candidate.setHours(hour, 0, 0, 0);
  if (candidate.getTime() <= now.getTime()) candidate.setDate(candidate.getDate() + 1);

  if (type === 'weekly') {
    const weekday = Number.isInteger(cad.weekday) ? cad.weekday : 1;
    // bis zu 7 Tage vorwärts bis Wochentag passt
    let guard = 0;
    while (candidate.getDay() !== weekday && guard < 8) {
      candidate.setDate(candidate.getDate() + 1);
      guard += 1;
    }
  }
  return candidate.toISOString();
}

export function createScheduler(cfg, store, deps) {
  let timer = null;

  /**
   * Ein Tick: alle enabled+fälligen Playbooks erzeugen queued-Jobs; state.lastRun wird gesetzt.
   * @returns {Promise<Array>} erzeugte Jobs
   */
  async function tick(now = new Date()) {
    const playbooks = await deps.playbooks.all();
    const state = await store.readState();
    if (!state.playbooks) state.playbooks = {};
    const created = [];

    for (const pb of playbooks) {
      const st = state.playbooks[pb.id] || { lastRun: null, enabled: pb.enabled !== false };
      const enabled = st.enabled !== false;
      if (!enabled) {
        state.playbooks[pb.id] = st;
        continue;
      }
      if (isDue(pb, st.lastRun, now)) {
        const job = await store.createJob({
          playbookId: pb.id,
          agent: pb.agent,
          title: `${pb.name || pb.id} — ${ymdDash(now)}`,
          channel: pb.channel,
          promptTemplate: pb.promptTemplate || '',
          now,
        });
        st.lastRun = now.toISOString();
        created.push(job);
        if (deps.log) await deps.log.event(`Scheduler: Job ${job.id} aus Playbook ${pb.id} erzeugt`, { channel: pb.channel });
      }
      state.playbooks[pb.id] = st;
    }

    await store.writeState(state);
    return created;
  }

  function start() {
    if (timer) return;
    timer = setInterval(() => {
      tick().catch((err) => {
        if (deps.log) deps.log.event(`Scheduler-Fehler: ${err.message || err}`);
      });
    }, TICK_MS);
    if (typeof timer.unref === 'function') timer.unref();
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  return { tick, start, stop, isDue, nextRun };
}
