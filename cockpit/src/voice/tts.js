/**
 * TTS-Modul: HTTP-Client gegen einen lokalen Piper-TTS-Server.
 *
 * Ziel: Text → WAV-Buffer (PCM, typischerweise 22050 Hz Mono).
 *
 * Serverseite (Piper HTTP-Wrapper, z.B. piper-tts-web oder ein einfaches Flask-Skript):
 *   POST /synthesize  oder  POST /tts
 *   Content-Type: application/json   Body: { "text": "..." }
 *   Response:  audio/wav  (Binär-WAV)
 *
 * config.ttsUrl steuert den Endpunkt (Default: http://127.0.0.1:5302).
 *
 * TTS-Pre-Processing (Piper-Schwäche: schlechte Zahlenaussprache):
 *   Zahlen, Abkürzungen, URLs und Sonderzeichen werden vor dem Senden normalisiert.
 */

import { config } from '../config.js';
import { log } from '../log.js';

const REQUEST_TIMEOUT_MS = 15_000;  // Piper ist sehr schnell (RTF 0.008), 15 s ist großzügig
const MAX_RETRIES = 1;
const MAX_TEXT_CHARS = 2000;        // Piper kann lange Texte intern aufteilen; sicher bleiben

/**
 * Normalisiert Text für Piper-TTS (Zahlen, Abkürzungen, Sonderzeichen).
 *
 * @param {string} text  Rohtext
 * @returns {string}     TTS-optimierter Text
 */
export function normalizeForTts(text) {
  let t = text;

  // URLs entfernen (TTS liest sie sinnlos vor)
  t = t.replace(/https?:\/\/\S+/g, 'Link');

  // Zahlen ausschreiben (Deutsch)
  // Geldbeträge: 199 € → hunderneunundneunzig Euro
  t = t.replace(/(\d+(?:[.,]\d+)?)\s*€/g, (_m, n) => `${_numberDe(n)} Euro`);
  t = t.replace(/(\d+(?:[.,]\d+)?)\s*%/g, (_m, n) => `${_numberDe(n)} Prozent`);
  t = t.replace(/(\d+(?:[.,]\d+)?)\s*\$/g, (_m, n) => `${_numberDe(n)} Dollar`);

  // Bekannte Abkürzungen
  const abbr = {
    'BFSG': 'B F S G',
    'WCAG': 'W Kag',
    'KPI': 'K P I',
    'SEO': 'S E O',
    'RSS': 'R S S',
    'TTS': 'T T S',
    'STT': 'S T T',
    'API': 'A P I',
    'WS':  'W S',
    'MRR': 'M R R',
    'CAC': 'C A C',
    'CPA': 'C P A',
    'RSA': 'R S A',
    'A/B': 'A B',
    'UX':  'U X',
    'UI':  'U I',
    'CI':  'C I',
    'CD':  'C D',
    'OK':  'Okay',
    'ok':  'okay',
    'ggf.':  'gegebenenfalls',
    'bzw.':  'beziehungsweise',
    'z.B.':  'zum Beispiel',
    'z. B.': 'zum Beispiel',
    'd.h.':  'das heißt',
    'd. h.': 'das heißt',
    'usw.':  'und so weiter',
    'etc.':  'et cetera',
    'Nr.':   'Nummer',
    'ca.':   'circa',
    'mind.': 'mindestens',
    'max.':  'maximal',
    'min.':  'minimal',
    'inkl.': 'inklusive',
    'exkl.': 'exklusive',
    'vs.':   'versus',
  };
  for (const [k, v] of Object.entries(abbr)) {
    // Wort-Grenzen beachten (kein partiales Ersetzen)
    t = t.replace(new RegExp(`(?<![A-Za-z])${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z])`, 'g'), v);
  }

  // Reine Zahlen-Strings (keine Abkürzungen mehr nötig)
  t = t.replace(/\b(\d{1,4})\b/g, (_m, n) => _numberDe(n));

  // Markdown-Elemente entfernen
  t = t.replace(/#{1,6}\s*/g, '');   // Headings
  t = t.replace(/\*\*([^*]+)\*\*/g, '$1');  // Bold
  t = t.replace(/\*([^*]+)\*/g, '$1');      // Italic
  t = t.replace(/`[^`]+`/g, '');    // Code
  t = t.replace(/[-*•]\s+/g, '');   // Listen-Punkte
  t = t.replace(/\n{2,}/g, '. ');   // Absätze → Pause-Punkt
  t = t.replace(/\n/g, ' ');

  // Mehrfache Leerzeichen
  t = t.replace(/\s{2,}/g, ' ').trim();

  return t.slice(0, MAX_TEXT_CHARS);
}

/**
 * Sendet normalisierten Text an den Piper-TTS-Server.
 *
 * @param {string} text  Rohtext (wird intern normalisiert).
 * @returns {Promise<Buffer>}  WAV-Buffer (binary).
 * @throws {Error}  Bei HTTP-Fehler, Timeout oder leerem Text.
 */
export async function synthesize(text) {
  if (!text || typeof text !== 'string') throw new Error('TTS: text darf nicht leer sein');

  const normalized = normalizeForTts(text);
  if (!normalized.trim()) throw new Error('TTS: Text nach Normalisierung leer');

  const baseUrl = (config.ttsUrl || 'http://127.0.0.1:5302').replace(/\/$/, '');

  // Endpunkt-Erkennung: /synthesize oder /tts
  const endpoint = `${baseUrl}/synthesize`;

  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const buf = await _postText(endpoint, normalized);
      if (attempt > 0) log.info('TTS: Synthese nach Retry erfolgreich');
      return buf;
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_RETRIES) {
        log.warn({ err: err.message, attempt }, 'TTS: Fehler, Retry...');
        await _sleep(500);
      }
    }
  }
  throw new Error(`TTS-Fehler nach ${MAX_RETRIES + 1} Versuchen: ${lastErr?.message}`);
}

/**
 * Prüft ob der TTS-Server erreichbar ist.
 * @returns {Promise<boolean>}
 */
export async function isAvailable() {
  const baseUrl = (config.ttsUrl || 'http://127.0.0.1:5302').replace(/\/$/, '');
  try {
    const res = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
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

async function _postText(endpoint, text) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`TTS HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const arrayBuf = await res.arrayBuffer();
  if (!arrayBuf || arrayBuf.byteLength === 0) {
    throw new Error('TTS: Leere Antwort vom Server');
  }

  log.info({ bytes: arrayBuf.byteLength, chars: text.length }, 'TTS: Audio empfangen');
  return Buffer.from(arrayBuf);
}

function _sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Einfache Deutsche Zahl-zu-Text-Konvertierung (nur 0–9999, ausreichend für Cockpit)
// ---------------------------------------------------------------------------

const EINZEL = ['null','eins','zwei','drei','vier','fünf','sechs','sieben','acht','neun',
  'zehn','elf','zwölf','dreizehn','vierzehn','fünfzehn','sechzehn','siebzehn','achtzehn','neunzehn'];
const ZEHNER = ['','','zwanzig','dreißig','vierzig','fünfzig','sechzig','siebzig','achtzig','neunzig'];

function _numberDe(numStr) {
  // Komma/Punkt → gleich behandeln; Dezimalstellen als Einzelziffern vorlesen
  const [intPart, decPart] = numStr.replace(',', '.').split('.');
  const n = parseInt(intPart, 10);
  if (Number.isNaN(n)) return numStr;

  let result = _intDe(n);
  if (decPart !== undefined) {
    result += ' Komma ' + [...decPart].map((d) => EINZEL[parseInt(d, 10)] ?? d).join(' ');
  }
  return result;
}

function _intDe(n) {
  if (n < 0)   return 'minus ' + _intDe(-n);
  if (n < 20)  return EINZEL[n];
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return ones ? `${EINZEL[ones]}und${ZEHNER[tens]}` : ZEHNER[tens];
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    return `${EINZEL[h]}hundert` + (rest ? _intDe(rest) : '');
  }
  if (n < 10000) {
    const t = Math.floor(n / 1000);
    const rest = n % 1000;
    return `${_intDe(t)}tausend` + (rest ? _intDe(rest) : '');
  }
  return String(n);   // Größere Zahlen unverändert (Piper schafft es oft trotzdem)
}
