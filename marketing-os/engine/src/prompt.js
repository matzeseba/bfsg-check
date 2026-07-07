// Baut den Claude-Prompt = Persona (agents/<agent>.md) + Policy-Kurzfassung + Aufgabe.
// Platzhalter {date} {product} {domain} {channel} {title} werden ersetzt.
import path from 'node:path';
import { readFileSafe, ymdDash } from './util.js';

function substitute(text, ctx) {
  return String(text || '').replace(/\{(date|product|domain|channel|title)\}/g, (_, key) => ctx[key] ?? `{${key}}`);
}

/** Kompakte, maschinennahe Zusammenfassung der Policy für den Agenten-Prompt. */
export function policyShort(policy) {
  const forbidden = (policy.forbiddenPatterns || [])
    .map((p) => `- ${p.pattern} (${p.severity})`)
    .join('\n');
  const channels = (policy.allowedChannels || []).join(', ');
  const disclaimer = policy.language?.disclaimerHint || '';
  const reqChannels = (policy.language?.disclaimerRequiredForChannels || []).join(', ');
  return [
    'PFLICHTSPRACHE: "automatisierte technische Analyse", "WCAG 2.1 AA".',
    'VERBOTEN (niemals verwenden): "BFSG-konform", "rechtssicher", "garantiert", TÜV/DEKRA-Bezug.',
    `Verbotene Muster (Regex):\n${forbidden}`,
    `Erlaubte Kanäle: ${channels}`,
    `Pflicht-Disclaimer (wörtlich einbauen bei Kanälen ${reqChannels}): "${disclaimer}"`,
    'Kein SSH/Prod/Stripe/Brevo. Keine Datei-Schreibzugriffe. Ausgabe = reines Markdown auf stdout.',
  ].join('\n');
}

export async function buildPrompt(cfg, job, policy) {
  const personaPath = path.join(cfg.agentsDir, `${job.agent}.md`);
  const persona = await readFileSafe(
    personaPath,
    `(Keine Persona-Datei für Agent "${job.agent}" gefunden — arbeite als sachlicher BFSG-/WCAG-Fachautor.)`,
  );

  const ctx = {
    date: ymdDash(new Date()),
    product: cfg.product,
    domain: cfg.domain,
    channel: job.channel,
    title: job.title,
  };
  const task = substitute(job.promptTemplate, ctx);

  return [
    `# Persona\n${persona}`,
    `# Compliance-Kurzfassung (bindend)\n${policyShort(policy)}`,
    `# Aufgabe\nTitel: ${job.title}\nKanal: ${job.channel}\nDatum: ${ctx.date}\n\n${task}`,
    '# Ausgabe\nGib ausschließlich das fertige Markdown-Artefakt auf stdout aus — keine Vorrede, keine Dateizugriffe.',
  ].join('\n\n');
}
