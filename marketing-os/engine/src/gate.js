// Compliance-Gate: prüft ein Artefakt gegen policy/compliance.json.
// - Verbotene Muster (Regex, case-insensitive, Unicode) -> Finding je Treffer
// - Kanal-Whitelist (allowedChannels) -> block bei unbekanntem Kanal
// - Disclaimer-Pflicht je disclaimerRequiredForChannels -> block wenn fehlt
// Findings landen in job.gate. block => passed:false. Niemals stilles Auto-Fixen.
import fs from 'node:fs/promises';

const DISCLAIMER_PHRASES = [/automatisierte technische Analyse/iu, /ersetzt keine Rechtsberatung/iu];

export function createGate(cfg) {
  async function loadPolicy() {
    const raw = await fs.readFile(cfg.policyPath, 'utf8');
    return JSON.parse(raw);
  }

  /**
   * @param {string} content Markdown-Artefakt
   * @param {object} job     Job (für channel-Kontext); optional
   * @param {object} policy  optional vorgeladene Policy (spart Datei-IO)
   */
  async function check(content, job = {}, policy = null) {
    const pol = policy || (await loadPolicy());
    const text = String(content || '');
    const findings = [];

    for (const p of pol.forbiddenPatterns || []) {
      let re;
      try {
        re = new RegExp(p.pattern, 'iu');
      } catch {
        continue; // defektes Muster ignorieren statt crashen
      }
      const m = text.match(re);
      if (m) {
        findings.push({
          severity: p.severity || 'warn',
          pattern: p.pattern,
          match: m[0],
          hint: p.hint || '',
        });
      }
    }

    const allowed = pol.allowedChannels || [];
    if (job.channel && allowed.length > 0 && !allowed.includes(job.channel)) {
      findings.push({
        severity: 'block',
        pattern: 'channel-not-allowed',
        match: job.channel,
        hint: `Kanal "${job.channel}" ist nicht in allowedChannels erlaubt.`,
      });
    }

    const reqChannels = pol.language?.disclaimerRequiredForChannels || [];
    if (job.channel && reqChannels.includes(job.channel)) {
      const hasDisclaimer = DISCLAIMER_PHRASES.every((rx) => rx.test(text));
      if (!hasDisclaimer) {
        findings.push({
          severity: 'block',
          pattern: 'disclaimer-missing',
          match: '',
          hint: `Pflicht-Disclaimer fehlt: ${pol.language?.disclaimerHint || 'Disclaimer erforderlich.'}`,
        });
      }
    }

    const passed = !findings.some((f) => f.severity === 'block');
    return { checked: true, passed, findings };
  }

  return { check, loadPolicy };
}
