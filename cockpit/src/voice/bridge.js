/**
 * Voice-Bridge: verbindet den WebSocket-Server mit STT, Intent-Matcher, Job-Queue und TTS.
 *
 * WS-Protokoll (client → server):
 *   { type: 'audio',  pcm: '<base64>', final: bool }   — PCM/WAV-Audio-Frame
 *   { type: 'text',   text: '<string>' }                — Text-Intent (Bypass STT)
 *   { type: 'confirm', jobId: '<id>', confirmed: bool } — Bestätigung für needsConfirmation-Intents
 *   { type: 'config', mode: 'push_to_talk'|'wakeword' } — Modus-Wahl des Clients
 *   { type: 'ping' }                                    — Keep-Alive
 *
 * WS-Protokoll (server → client):
 *   { type: 'ready',      message: string }             — Verbindung bereit
 *   { type: 'transcript', text: string }                — STT-Ergebnis
 *   { type: 'status',     state: 'listening'|'processing'|'speaking'|'idle' }
 *   { type: 'intent',     actionId, label, args, needsConfirmation } — erkannter Intent
 *   { type: 'result',     jobId: string }               — Job gestartet
 *   { type: 'tts_audio',  wav: '<base64>' }             — TTS-Audio (WAV, base64)
 *   { type: 'error',      message: string, code?: string }
 *   { type: 'pong' }                                    — Keep-Alive-Antwort
 *
 * Ablauf:
 *   1. Client sendet Audio-Frames (PCM, base64) bis final=true
 *   2. Server sammelt alle Frames, beim final-Flag: STT-Transkription
 *   3. matchIntent() → Intent-Objekt oder null
 *   4a. Kein Intent → Fehlermeldung "Nicht verstanden" via TTS zurück
 *   4b. Intent mit needsConfirmation → Intent senden, auf {type:'confirm'} warten
 *   4c. Intent direkt → createJob() → jobId zurück → Antwort via TTS
 *   5. TTS-Antwort als {type:'tts_audio', wav:base64} senden
 *
 * Alternativ (Text-Shortcut):
 *   Client sendet {type:'text', text:'...'} → Schritt 2–5 ohne STT
 */

import { config } from '../config.js';
import { log } from '../log.js';
import { transcribe } from './stt.js';
import { synthesize } from './tts.js';
import { matchIntent } from './intents.js';
import { createJob } from '../engine/jobQueue.js';
import { getAction } from '../actions/registry.js';
import { initWakeWord, wakeWordDetector } from './wakeword.js';

// Maximale akkumulierte PCM-Datenmenge pro Verbindung (~4 MB ≈ ~125 s bei 16kHz/16bit/mono)
const MAX_AUDIO_BYTES = 4 * 1024 * 1024;

/**
 * Hängt die Voice-Bridge an einen bestehenden WebSocketServer.
 * Wird von server.js aufgerufen anstelle des Placeholder-Handlers.
 *
 * @param {import('ws').WebSocketServer} wss
 */
export function attachVoiceBridge(wss) {
  // Wake-Word-Daemon verbinden (no-op wenn deaktiviert)
  initWakeWord();

  // Wenn Wake-Word erkannt: alle aktiven Clients in wakeword-Modus benachrichtigen
  wakeWordDetector.on('wakeword', ({ word, score }) => {
    for (const client of wss.clients) {
      if (client.readyState === 1 /* OPEN */ && client._voiceMode === 'wakeword') {
        _send(client, { type: 'status', state: 'listening', trigger: 'wakeword', word, score });
      }
    }
  });

  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress || 'unknown';
    log.info({ ip }, 'VoiceBridge: Client verbunden');

    // Session-State per Verbindung
    ws._audioChunks = [];           // Buffer[] — akkumulierte Audio-Frames
    ws._audioBytes = 0;             // Byte-Zähler für MAX_AUDIO_BYTES-Schutz
    ws._pendingIntent = null;       // { intent, jobResolve } — wartet auf Bestätigung
    ws._voiceMode = 'push_to_talk'; // 'push_to_talk' | 'wakeword'
    ws._processing = false;

    _send(ws, {
      type: 'ready',
      message: 'Voice-Bridge bereit. Drücke Leertaste für Push-to-Talk oder konfiguriere Wake-Word.',
      sttAvailable: config.voiceEnabled,
    });

    ws.on('message', async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        _sendError(ws, 'Ungültige JSON-Nachricht', 'PARSE_ERROR');
        return;
      }

      try {
        await _handleMessage(ws, msg);
      } catch (err) {
        log.error({ err: err.message }, 'VoiceBridge: Unbehandelter Fehler');
        _sendError(ws, `Interner Fehler: ${err.message}`, 'INTERNAL_ERROR');
        ws._processing = false;
      }
    });

    ws.on('close', () => {
      log.info({ ip }, 'VoiceBridge: Client getrennt');
      _cleanupSession(ws);
    });

    ws.on('error', (err) => {
      log.warn({ err: err.message, ip }, 'VoiceBridge: WS-Fehler');
    });
  });

  log.info('VoiceBridge: WebSocket-Handler registriert (Pfad /ws/voice)');
}

// ---------------------------------------------------------------------------
// Nachrichten-Dispatcher
// ---------------------------------------------------------------------------

async function _handleMessage(ws, msg) {
  switch (msg.type) {

    case 'ping':
      _send(ws, { type: 'pong' });
      break;

    case 'config':
      if (msg.mode === 'wakeword' || msg.mode === 'push_to_talk') {
        ws._voiceMode = msg.mode;
        log.info({ mode: msg.mode }, 'VoiceBridge: Modus gesetzt');
      }
      break;

    case 'audio':
      await _handleAudio(ws, msg);
      break;

    case 'text':
      await _handleText(ws, msg.text);
      break;

    case 'confirm':
      await _handleConfirm(ws, msg);
      break;

    default:
      _sendError(ws, `Unbekannter Nachrichtentyp: ${msg.type}`, 'UNKNOWN_TYPE');
  }
}

// ---------------------------------------------------------------------------
// Audio-Frame-Handling
// ---------------------------------------------------------------------------

async function _handleAudio(ws, msg) {
  if (!config.voiceEnabled) {
    _sendError(ws, 'STT nicht aktiviert (VOICE_ENABLED=false)', 'STT_DISABLED');
    return;
  }

  if (typeof msg.pcm !== 'string') {
    _sendError(ws, 'audio-Nachricht muss pcm (base64) enthalten', 'INVALID_AUDIO');
    return;
  }

  // Audio-Frame akkumulieren
  const chunk = Buffer.from(msg.pcm, 'base64');
  ws._audioBytes += chunk.byteLength;

  if (ws._audioBytes > MAX_AUDIO_BYTES) {
    _sendError(ws, 'Audio zu lang (max ~125 s). Bitte kürzer sprechen.', 'AUDIO_TOO_LONG');
    _cleanupSession(ws);
    return;
  }

  ws._audioChunks.push(chunk);

  // Bei final=true: Transkription starten
  if (msg.final === true) {
    if (ws._processing) {
      _sendError(ws, 'Noch in Verarbeitung — bitte warten.', 'BUSY');
      return;
    }
    await _processAudioBuffer(ws);
  }
}

async function _processAudioBuffer(ws) {
  const chunks = ws._audioChunks;
  const totalBytes = ws._audioBytes;
  _cleanupAudio(ws);   // Reset vor async-Operationen

  if (chunks.length === 0 || totalBytes === 0) {
    _sendError(ws, 'Kein Audio empfangen', 'EMPTY_AUDIO');
    return;
  }

  ws._processing = true;
  _send(ws, { type: 'status', state: 'processing' });

  // Audio zusammenfügen
  const audioBuffer = Buffer.concat(chunks);

  // STT
  let transcript;
  try {
    transcript = await transcribe(audioBuffer, { language: 'de' });
  } catch (err) {
    log.warn({ err: err.message }, 'VoiceBridge: STT-Fehler');
    _sendError(ws, `Spracherkennung fehlgeschlagen: ${err.message}`, 'STT_ERROR');
    ws._processing = false;
    _send(ws, { type: 'status', state: 'idle' });
    return;
  }

  ws._processing = false;

  if (!transcript || !transcript.trim()) {
    _send(ws, { type: 'transcript', text: '' });
    await _speakAndSend(ws, 'Ich habe nichts verstanden. Bitte wiederhole deinen Befehl.');
    _send(ws, { type: 'status', state: 'idle' });
    return;
  }

  _send(ws, { type: 'transcript', text: transcript });
  await _processIntent(ws, transcript);
}

// ---------------------------------------------------------------------------
// Text-Intent (Bypass STT — für Tests und REST-Fallback)
// ---------------------------------------------------------------------------

async function _handleText(ws, text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    _sendError(ws, 'Leerer Text', 'EMPTY_TEXT');
    return;
  }
  // Transcript zurückspiegeln für UI-Konsistenz
  _send(ws, { type: 'transcript', text: text.trim() });
  _send(ws, { type: 'status', state: 'processing' });
  await _processIntent(ws, text.trim());
}

// ---------------------------------------------------------------------------
// Intent-Matching + Job-Start
// ---------------------------------------------------------------------------

async function _processIntent(ws, text) {
  const intent = matchIntent(text);

  if (!intent) {
    log.info({ text: text.slice(0, 80) }, 'VoiceBridge: Kein Intent erkannt');
    _send(ws, { type: 'status', state: 'idle' });
    await _speakAndSend(ws,
      'Befehl nicht erkannt. Versuche: "Tagescheck", "Wochenreport", "Smoke-Check Funnel".'
    );
    return;
  }

  log.info({ actionId: intent.actionId, label: intent.label }, 'VoiceBridge: Intent erkannt');
  _send(ws, {
    type: 'intent',
    actionId: intent.actionId,
    label: intent.label,
    args: intent.args,
    needsConfirmation: intent.needsConfirmation,
  });

  if (intent.needsConfirmation) {
    // Auf Bestätigungs-Nachricht warten
    ws._pendingIntent = intent;
    await _speakAndSend(ws,
      `Aktion "${intent.label}" benötigt Bestätigung. Bitte bestätige im Dashboard.`
    );
    _send(ws, { type: 'status', state: 'idle' });
  } else {
    await _launchJob(ws, intent);
  }
}

async function _handleConfirm(ws, msg) {
  const pending = ws._pendingIntent;
  if (!pending) {
    _sendError(ws, 'Keine ausstehende Bestätigung', 'NO_PENDING_INTENT');
    return;
  }
  ws._pendingIntent = null;

  if (msg.confirmed === false) {
    await _speakAndSend(ws, 'Aktion abgebrochen.');
    _send(ws, { type: 'status', state: 'idle' });
    return;
  }

  await _launchJob(ws, pending);
}

async function _launchJob(ws, intent) {
  const actionDef = getAction(intent.actionId);
  if (!actionDef) {
    _sendError(ws, `Unbekannte Aktion: ${intent.actionId}`, 'UNKNOWN_ACTION');
    _send(ws, { type: 'status', state: 'idle' });
    return;
  }

  let job;
  try {
    job = createJob(actionDef, intent.args);
  } catch (err) {
    log.error({ err: err.message }, 'VoiceBridge: Job-Start fehlgeschlagen');
    _sendError(ws, `Job konnte nicht gestartet werden: ${err.message}`, 'JOB_CREATE_ERROR');
    _send(ws, { type: 'status', state: 'idle' });
    return;
  }

  log.info({ jobId: job.id, actionId: intent.actionId }, 'VoiceBridge: Job gestartet');
  _send(ws, { type: 'result', jobId: job.id });
  _send(ws, { type: 'status', state: 'idle' });
  await _speakAndSend(ws, `Verstanden. Ich starte "${actionDef.label}". Job-ID: ${job.id.slice(0, 8)}.`);
}

// ---------------------------------------------------------------------------
// TTS-Hilfsfunktionen
// ---------------------------------------------------------------------------

/**
 * Synthetisiert Text, sendet WAV als base64 zurück, setzt Status auf 'speaking' und danach 'idle'.
 * Fehler werden geloggt aber nicht an den Client weitergegeben (TTS ist optional).
 */
async function _speakAndSend(ws, text) {
  if (!text || ws.readyState !== 1 /* OPEN */) return;

  _send(ws, { type: 'status', state: 'speaking' });
  try {
    const wavBuffer = await synthesize(text);
    _send(ws, { type: 'tts_audio', wav: wavBuffer.toString('base64') });
  } catch (err) {
    log.warn({ err: err.message }, 'VoiceBridge: TTS fehlgeschlagen (nicht kritisch)');
    // Kein _sendError — TTS-Ausfall ist soft degradation
  } finally {
    _send(ws, { type: 'status', state: 'idle' });
  }
}

// ---------------------------------------------------------------------------
// WebSocket-Hilfsfunktionen
// ---------------------------------------------------------------------------

function _send(ws, payload) {
  if (ws.readyState !== 1 /* OPEN */) return;
  try {
    ws.send(JSON.stringify(payload));
  } catch (e) {
    log.warn({ err: e.message }, 'VoiceBridge: Sende-Fehler');
  }
}

function _sendError(ws, message, code) {
  log.warn({ code, message }, 'VoiceBridge: Fehler gesendet');
  _send(ws, { type: 'error', message, code });
}

// ---------------------------------------------------------------------------
// Session-Cleanup
// ---------------------------------------------------------------------------

function _cleanupAudio(ws) {
  ws._audioChunks = [];
  ws._audioBytes = 0;
}

function _cleanupSession(ws) {
  _cleanupAudio(ws);
  ws._pendingIntent = null;
  ws._processing = false;
}
