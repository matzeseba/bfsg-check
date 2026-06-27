/**
 * STT-Modul: HTTP-Client gegen einen lokalen faster-whisper-Server.
 *
 * Unterstützt zwei Server-Varianten:
 *   (A) faster-whisper-server (fedirz/faster-whisper-server) — OpenAI-kompatibler Endpunkt
 *       POST /v1/audio/transcriptions  multipart/form-data, Feld "file" + optional "language"
 *   (B) Simpler Whisper-HTTP-Server — POST /transcribe  multipart/form-data
 *
 * config.sttUrl steuert den Basisendpunkt (Default: http://127.0.0.1:5301).
 * Die Methode wird automatisch erkannt: URL endet auf /v1/audio/transcriptions →
 * OpenAI-Modus; sonst simpler /transcribe-Modus.
 * Wenn STT_MODE=openai gesetzt ist, wird immer der OpenAI-kompatible Endpunkt verwendet.
 *
 * Audio-Anforderungen an den Aufrufer:
 *   - PCM oder WAV-Buffer, 16 kHz, Mono, 16-bit PCM
 *   - Maximal ~30 MB pro Anfrage (serverseitig limitiert)
 */

import { config } from '../config.js';
import { log } from '../log.js';

const DEFAULT_LANGUAGE = 'de';
const REQUEST_TIMEOUT_MS = 30_000;   // 30 s — CPU-Inferenz braucht Zeit
const MAX_RETRIES = 1;               // 1 Wiederholversuch bei Netzfehler

/**
 * Sendet einen Audio-Buffer (WAV/PCM) an den STT-Server.
 *
 * @param {Buffer} audioBuffer  WAV- oder PCM-Buffer, 16 kHz Mono empfohlen.
 * @param {object} [opts]
 * @param {string} [opts.language='de']   BCP-47-Sprach-Code.
 * @param {string} [opts.filename='audio.wav']  Dateiname für multipart (Erkennung durch Server).
 * @returns {Promise<string>}  Transkript-Text (kann leer sein wenn kein Sprache erkannt).
 * @throws {Error}  Bei HTTP-Fehler oder Timeout (nach Retries).
 */
export async function transcribe(audioBuffer, { language = DEFAULT_LANGUAGE, filename = 'audio.wav' } = {}) {
  if (!Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) {
    throw new Error('STT: audioBuffer muss ein nicht-leerer Buffer sein');
  }

  const baseUrl = (config.sttUrl || 'http://127.0.0.1:5301').replace(/\/$/, '');
  const useOpenAI = process.env.STT_MODE === 'openai' || baseUrl.endsWith('/v1/audio/transcriptions');
  const endpoint = useOpenAI
    ? (baseUrl.endsWith('/v1/audio/transcriptions') ? baseUrl : `${baseUrl}/v1/audio/transcriptions`)
    : `${baseUrl}/transcribe`;

  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const text = await _postAudio(endpoint, audioBuffer, filename, language, useOpenAI);
      if (attempt > 0) log.info('STT: Transkription nach Retry erfolgreich');
      return text;
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_RETRIES) {
        log.warn({ err: err.message, attempt }, 'STT: Fehler, Retry...');
        await _sleep(500);
      }
    }
  }
  throw new Error(`STT-Fehler nach ${MAX_RETRIES + 1} Versuchen: ${lastErr?.message}`);
}

/**
 * Prüft ob der STT-Server erreichbar ist (Health-Check ohne Audio).
 * @returns {Promise<boolean>}
 */
export async function isAvailable() {
  const baseUrl = (config.sttUrl || 'http://127.0.0.1:5301').replace(/\/$/, '');
  const healthUrl = `${baseUrl}/health`;
  try {
    const res = await fetch(healthUrl, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    // Manche Server haben keinen /health-Endpunkt — dann Root probieren
    try {
      await fetch(baseUrl, { signal: AbortSignal.timeout(3000) });
      return true;
    } catch {
      return false;
    }
  }
}

// ---------------------------------------------------------------------------
// Interne Hilfsfunktionen
// ---------------------------------------------------------------------------

async function _postAudio(endpoint, audioBuffer, filename, language, isOpenAIMode) {
  const body = new FormData();
  const blob = new Blob([audioBuffer], { type: 'audio/wav' });
  body.append('file', blob, filename);
  body.append('language', language);

  // OpenAI-Modus benötigt zusätzlich model=whisper-1 (ignoriert vom lokalen Server, aber Pflichtfeld)
  if (isOpenAIMode) {
    body.append('model', 'whisper-1');
    body.append('response_format', 'json');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      body,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`STT HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();

  // OpenAI-Format: { text: "..." }
  // Simpler Server: { text: "..." } oder { transcription: "..." }
  const text = (data.text ?? data.transcription ?? '').trim();
  log.info({ chars: text.length, language }, 'STT: Transkription empfangen');
  return text;
}

function _sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
