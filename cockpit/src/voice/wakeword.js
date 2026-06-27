/**
 * Wake-Word-Modul: Anbindung an einen openWakeWord-Daemon via WebSocket oder HTTP.
 *
 * KONZEPT
 * -------
 * openWakeWord läuft als separater Python-Prozess (scripts/voice/wakeword-daemon/wakeword_server.py)
 * und meldet erkannte Wake-Words via WebSocket auf Port 5303.
 *
 * Diese Datei enthält:
 *   (a) WakeWordDetector — verbindet sich mit dem Daemon und feuert callbacks
 *   (b) Wenn der Daemon nicht läuft, no-op-Stub (graceful degradation)
 *
 * TRAINING "Hey Jarvis"
 * ---------------------
 * Benötigt 20–50 Aufnahmen der eigenen Stimme + synthetische Daten.
 * Siehe scripts/voice/wakeword-daemon/README.md für den Trainings-Workflow.
 *
 * PUSH-TO-TALK EMPFEHLUNG
 * -----------------------
 * Für das Cockpit-Dashboard ist Push-to-Talk (Leertaste halten im Browser) empfohlen.
 * Der Wake-Word-Daemon ist eine optionale Phase-2-Ergänzung.
 * bridge.js unterstützt beide Modi (der Client gibt den Modus via {type:'config'} vor).
 *
 * PORTS
 * -----
 * Wake-Word-Daemon WS: ws://127.0.0.1:5303
 */

import { log } from '../log.js';

const WAKEWORD_WS_URL = process.env.WAKEWORD_URL || 'ws://127.0.0.1:5303';
const RECONNECT_DELAY_MS = 5000;

/**
 * WakeWordDetector — verbindet sich mit dem openWakeWord-Daemon.
 *
 * Nutzung:
 *   const detector = new WakeWordDetector();
 *   detector.on('wakeword', ({ word, score }) => { ... starte Aufnahme ... });
 *   detector.on('available', (bool) => { ... UI-Indikator ... });
 *   detector.start();
 *   // später:
 *   detector.stop();
 */
export class WakeWordDetector {
  /** @type {Map<string, Set<Function>>} */
  #listeners = new Map();
  /** @type {WebSocket|null} */
  #ws = null;
  #active = false;
  #reconnectTimer = null;

  /**
   * Registriert einen Event-Listener.
   * Events: 'wakeword' | 'available' | 'error'
   */
  on(event, fn) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());
    this.#listeners.get(event).add(fn);
    return this;
  }

  off(event, fn) {
    this.#listeners.get(event)?.delete(fn);
    return this;
  }

  #emit(event, data) {
    for (const fn of this.#listeners.get(event) ?? []) {
      try { fn(data); } catch (e) { log.warn(e, `WakeWord-Listener-Fehler (${event})`); }
    }
  }

  /** Verbindet mit dem Daemon und hält die Verbindung offen. */
  start() {
    if (this.#active) return;
    this.#active = true;
    // M10-Fix: #connect() ist jetzt async — Fehler werden intern behandelt,
    // kein Aufrufer muss das zurückgegebene Promise awaiten.
    this.#connect().catch((e) => log.warn(e, 'WakeWord: Verbindungsfehler beim Start'));
  }

  /** Beendet die Verbindung und verhindert Reconnects. */
  stop() {
    this.#active = false;
    clearTimeout(this.#reconnectTimer);
    if (this.#ws) {
      try { this.#ws.close(); } catch { /* ignore */ }
      this.#ws = null;
    }
    this.#emit('available', false);
    log.info('WakeWord: Daemon-Verbindung getrennt');
  }

  /** @returns {boolean} ob der Daemon gerade verbunden ist */
  get connected() {
    return this.#ws !== null && this.#ws.readyState === 1 /* OPEN */;
  }

  // M10-Fix: #connect() ist jetzt async, damit await_import_ws() (das ein Promise zurückgibt)
  // korrekt geawaitd werden kann. Vorher wurde das Promise direkt an `new WS()` übergeben
  // → TypeError "The 'address' argument must be of type string" / ungültige URL.
  async #connect() {
    if (!this.#active) return;

    // Node.js hat kein eingebautes WebSocket vor v22; wir versuchen den Import
    let WS;
    try {
      // await_import_ws() gibt ein Promise zurück — muss geawaitd werden (M10-Fix)
      WS = await await_import_ws();
    } catch {
      log.warn('WakeWord: "ws"-Paket nicht gefunden — Daemon-Verbindung nicht möglich. ' +
               'Push-to-Talk bleibt verfügbar. Installiere mit: npm install ws');
      this.#emit('available', false);
      return;
    }

    log.info({ url: WAKEWORD_WS_URL }, 'WakeWord: Verbinde mit Daemon...');

    let ws;
    try {
      ws = new WS(WAKEWORD_WS_URL);
    } catch (err) {
      log.warn({ err: err.message }, 'WakeWord: WebSocket-Instanz-Fehler');
      this.#scheduleReconnect();
      return;
    }

    this.#ws = ws;

    ws.on('open', () => {
      log.info('WakeWord: Daemon verbunden');
      this.#emit('available', true);
    });

    ws.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString());
        // Erwartetes Daemon-Format: { word: "hey_jarvis", score: 0.94 }
        if (data.word && typeof data.score === 'number') {
          log.info({ word: data.word, score: data.score }, 'WakeWord: Erkannt!');
          this.#emit('wakeword', { word: data.word, score: data.score });
        }
      } catch (e) {
        log.warn({ err: e.message }, 'WakeWord: Ungültige Daemon-Nachricht');
      }
    });

    ws.on('error', (err) => {
      log.warn({ err: err.message }, 'WakeWord: Daemon-Verbindungsfehler');
      this.#emit('error', err);
    });

    ws.on('close', () => {
      this.#ws = null;
      this.#emit('available', false);
      if (this.#active) {
        log.info(`WakeWord: Verbindung getrennt, Reconnect in ${RECONNECT_DELAY_MS / 1000} s`);
        this.#scheduleReconnect();
      }
    });
  }

  #scheduleReconnect() {
    clearTimeout(this.#reconnectTimer);
    // M10-Fix: #connect() ist async — Promise-Fehler explizit fangen, damit keine
    // unhandled rejection entsteht.
    this.#reconnectTimer = setTimeout(
      () => this.#connect().catch((e) => log.warn(e, 'WakeWord: Reconnect-Fehler')),
      RECONNECT_DELAY_MS,
    );
  }
}

// ---------------------------------------------------------------------------
// Helfer: Dynamischer Import des 'ws'-Pakets (optional, kein Hard-Dependency)
// ---------------------------------------------------------------------------

let _wsCached = null;

function await_import_ws() {
  if (_wsCached) return _wsCached;
  // Synchron nicht möglich — diese Funktion ist bewusst synchron um den
  // hot-path nicht zu blockieren; Fehler wird durch die throw-Kette oben gehandelt.
  // Im echten Einsatz wird ws per dynamic import geladen:
  try {
    // eslint-disable-next-line no-new-func
    _wsCached = Function('return import("ws")')().then((m) => {
      _wsCached = m.default ?? m.WebSocket ?? m;
      return _wsCached;
    });
    return _wsCached; // Promise — caller muss awaiten
  } catch {
    throw new Error('ws nicht installiert');
  }
}

// ---------------------------------------------------------------------------
// Singleton-Instanz (optional — bridge.js nutzt ihn direkt)
// ---------------------------------------------------------------------------

/** Vorkonfigurierter Singleton — wird beim Start der Bridge verwendet. */
export const wakeWordDetector = new WakeWordDetector();

/**
 * Initialisiert den Detector (no-op falls Daemon nicht läuft).
 * Wird von bridge.js beim Serverstart aufgerufen.
 */
export function initWakeWord() {
  if (!process.env.WAKEWORD_ENABLED || process.env.WAKEWORD_ENABLED === 'false') {
    log.info('WakeWord: Daemon deaktiviert (WAKEWORD_ENABLED!=true). Push-to-Talk aktiv.');
    return;
  }
  wakeWordDetector.start();
  log.info('WakeWord: Daemon-Verbindung gestartet');
}
