// Action-Library: 18 steuerbare Aktionen in 3 Sicherheitsstufen.
// category: 'quick' (read-only) | 'generator' (Draft+Freigabe) | 'live' (Geld/extern, Pflicht-Approval)
// Quelle: docs/ai-os-research/06-agenten-skills-katalog.md
//
// buildPrompt(args) liefert einen self-contained deutschen Auftrag. agent = Hinweis auf Subagent.
//
// R-01: Alle in Prompts interpolierten Args werden vor Verwendung durch sanitizeArg()
// bereinigt (Steuerzeichen, Backticks, Länge). Verhindert Prompt-Injection über
// nutzerkontrollierte Felder wie topic/goal/audience/orderId.
import { sanitizeArg } from './sanitize.js';

const DELEGATE = (name) => `Nutze bei Bedarf den spezialisierten Subagenten "${name}" (über das Task-Tool). `;

export const ACTIONS = {
  A01: {
    id: 'A01', label: 'Tagescheck', category: 'quick', requiresApproval: false,
    agent: 'general-purpose', allowedTools: ['Bash', 'WebFetch', 'Read'], permissionMode: 'plan',
    description: 'Server-Health + Sales 24h + Fehler/Bounces auf einen Blick.',
    buildPrompt: () =>
      'Erstelle einen kompakten Tagescheck für BFSG-Check. Prüfe https://bfsg-fix.de/health (HTTP GET) ' +
      'und fasse Status (ok/stripe/live/mailer) zusammen. Liste, falls erreichbar, Sales der letzten 24h. ' +
      'Gib am Ende eine Ampel (🟢/🟡/🔴) + 1-Satz-Empfehlung. Antworte auf Deutsch, knapp, als Markdown.',
  },
  A02: {
    id: 'A02', label: 'Wochenreport / KPIs', category: 'quick', requiresApproval: false,
    agent: 'Analytics Reporter', allowedTools: ['Read', 'Bash', 'WebFetch'], permissionMode: 'plan',
    description: 'MRR, Sales, Conversion, Ads-CPA, Refunds — Wochen-Überblick.',
    buildPrompt: (a = {}) =>
      `${DELEGATE('Analytics Reporter')}Erstelle den Wochen-KPI-Report für BFSG-Check (Zeitraum: ${sanitizeArg(a.period, 40) || 'letzte 7 Tage'}). ` +
      'Umsatz, Sales-Count, Paket-Split, Conversion-Rate Scan→Sale, Ads-Spend/CAC, Refunds. ' +
      'Nur read-only. Markdown-Tabelle + 3 Handlungsempfehlungen. Deutsch.',
  },
  A03: {
    id: 'A03', label: 'Smoke-Check Funnel', category: 'quick', requiresApproval: false,
    agent: 'Reality Checker', allowedTools: ['Bash', 'WebFetch'], permissionMode: 'plan',
    description: 'Funnel E2E prüfen: Scanformular → Teaser → Checkout erreichbar?',
    buildPrompt: () =>
      'Prüfe den BFSG-Check-Funnel oberflächlich: Sind https://bfsg-fix.de , die Scan-Route und die Legal-Seiten ' +
      '(/impressum /datenschutz /agb /widerruf) per HTTP 200 erreichbar? Gib Grün/Gelb/Rot je Punkt. Deutsch.',
  },
  A04: {
    id: 'A04', label: 'Neue Ad-Varianten', category: 'generator', requiresApproval: false,
    agent: 'Ad Creative Strategist', allowedTools: ['Read', 'Write', 'WebSearch'],
    description: 'RSA-Headlines/Descriptions für ein Thema, compliance-gecheckt.',
    buildPrompt: (a = {}) =>
      `${DELEGATE('Ad Creative Strategist')}Erzeuge 3–5 RSA-Headline-Sets (Headlines ≤30 Zeichen, Descriptions ≤90 Zeichen) ` +
      `für das Thema/Keyword: "${sanitizeArg(a.topic, 80) || 'BFSG-Basis-Paket'}". Lies marketing/google-ads-rsa-headlines.md als Stil-Vorlage. ` +
      'VERBOTEN: „garantiert", „BFSG-konform", „rechtssicher", TÜV. Gib eine Markdown-Tabelle aus. Deutsch.',
  },
  A05: {
    id: 'A05', label: 'Neue Werbekampagne erstellen', category: 'generator', requiresApproval: false,
    agent: 'PPC Campaign Strategist', allowedTools: ['Read', 'Write', 'WebSearch'],
    description: 'Kompletter Kampagnen-Bauplan (Struktur, Headlines, Keywords, Budget) als Draft.',
    buildPrompt: (a = {}) =>
      `${DELEGATE('PPC Campaign Strategist')}Baue einen vollständigen Google-Ads-Kampagnen-Draft für BFSG-Check.\n` +
      `Ziel/Produkt: ${sanitizeArg(a.goal, 100) || 'BFSG-Basis-Paket'}\nZielgruppe: ${sanitizeArg(a.audience, 100) || 'Webagenturen/SMB DACH'}\n` +
      `Tagesbudget: ${Number(a.dailyBudget) || 10} € (HARTES Limit 100 €)\n` +
      'Lies marketing/google-ads-rsa-headlines.md, marketing/google-ads-keywords.csv, marketing/google-ads-negatives.csv. ' +
      'Liefere: Kampagnen-Struktur (1 Campaign → Ad Groups), 15 RSA-Headlines (≤30Z), 4 Descriptions (≤90Z), ' +
      '10–20 Keywords mit Match-Type, Negativ-Empfehlungen, Budget/ROAS-Projektion. ' +
      'Compliance: keine verbotenen Wörter. Status-Hinweis: Kampagne startet IMMER PAUSED, Aktivierung manuell. ' +
      'Speichere den Draft nach marketing/campaigns/ und gib eine Zusammenfassung. Deutsch.',
  },
  A06: {
    id: 'A06', label: 'Search-Term-Auswertung', category: 'generator', requiresApproval: false,
    agent: 'Search Query Analyst', allowedTools: ['Read', 'Write', 'Bash'],
    description: 'Wasted Spend finden, Negativ-Keyword-Liste erweitern.',
    buildPrompt: (a = {}) =>
      `${DELEGATE('Search Query Analyst')}Analysiere die Search-Terms` +
      (a.csv ? ` aus ${sanitizeArg(a.csv, 120)}` : '') + '. ' +
      'Identifiziere Wasted Spend, schlage Negativ-Keywords (priorisiert) und Exact-Match-Kandidaten vor. ' +
      'Aktualisiere marketing/google-ads-negatives.csv als Vorschlag (Diff zeigen). Deutsch.',
  },
  A07: {
    id: 'A07', label: 'SEO-Artikel schreiben', category: 'generator', requiresApproval: false,
    agent: 'SEO Specialist', allowedTools: ['Read', 'Write', 'WebSearch'],
    description: 'Blog-Artikel zu Keyword aus dem Content-Plan + Newsletter-Draft.',
    buildPrompt: (a = {}) =>
      `${DELEGATE('SEO Specialist')}Schreibe einen SEO-Blogartikel (1200–2000 Wörter) zum Thema "${sanitizeArg(a.topic, 120) || 'BFSG-Pflicht für Online-Shops'}". ` +
      'Orientiere dich an marketing/seo-content-plan.md. Struktur mit H2/H3, FAQ, interne Links. ' +
      'Compliance: „automatisierte technische Analyse"/„WCAG-2.1-AA", NIE „BFSG-konform/rechtssicher/garantiert". ' +
      'Speichere als Markdown und liefere zusätzlich einen 5-Zeilen-Newsletter-Teaser. Deutsch.',
  },
  A08: {
    id: 'A08', label: 'Wochen-Content erstellen', category: 'generator', requiresApproval: false,
    agent: 'Content Creator', allowedTools: ['Read', 'Write'],
    description: 'Alle Content-Deliverables der Woche gebündelt.',
    buildPrompt: (a = {}) =>
      `${DELEGATE('Content Creator')}Erzeuge den Wochen-Content laut marketing/seo-content-plan.md (Slot: ${sanitizeArg(a.slot, 40) || 'aktuelle Woche'}). ` +
      'Pro Deliverable ein fertiger Draft. Compliance-konform. Deutsch.',
  },
  A09: {
    id: 'A09', label: 'Pressemitteilung / Listing', category: 'generator', requiresApproval: false,
    agent: 'PR & Communications Manager', allowedTools: ['Read', 'Write'],
    description: 'PM verfassen oder Listing-Text für openPR/inar/firmenpresse.',
    buildPrompt: (a = {}) =>
      `${DELEGATE('PR & Communications Manager')}Verfasse ${sanitizeArg(a.kind, 60) || 'eine Pressemitteilung'} zum Anlass: "${sanitizeArg(a.occasion, 120) || 'Produkt-Update'}". ` +
      'Nutze marketing/press-release-launch.md + marketing/listings-submission-templates.md als Vorlage. ' +
      'Sachlich, keine Werbe-Übertreibung, compliance-konform. Deutsch.',
  },
  A10: {
    id: 'A10', label: 'Refund bearbeiten', category: 'live', requiresApproval: true,
    agent: 'Customer Service', allowedTools: ['Bash', 'Read'],
    description: 'Stripe-Order prüfen und Refund ausführen (Pflicht-Bestätigung).',
    buildPrompt: (a = {}) =>
      `LIVE-AKTION nach Freigabe: Erstatte für Stripe-Session/Order "${sanitizeArg(a.orderId, 60) || '???'}" den Betrag ${Number(a.amount) || '?'} €. ` +
      'Prüfe zuerst die Order, zeige Details, führe Refund NUR nach erfolgter Freigabe aus und protokolliere. Deutsch.',
  },
  A11: {
    id: 'A11', label: 'Up-Sell-Sequenz triggern', category: 'generator', requiresApproval: false,
    agent: 'Email Marketing Strategist', allowedTools: ['Read', 'Write'],
    description: '14-Tage-Up-Sell (Basis→Profi / Cookie-Cross-Sell) als Brevo-Draft.',
    buildPrompt: (a = {}) =>
      `${DELEGATE('Email Marketing Strategist')}Erstelle eine Up-Sell-E-Mail-Sequenz (Draft, NICHT senden) für Kunden mit Paket ` +
      `"${sanitizeArg(a.pkg, 40) || 'basis'}" 14 Tage nach Kauf. Ziel: Upgrade auf Profi bzw. Cookie-Audit. Double-Opt-In beachten. Deutsch.`,
  },
  A12: {
    id: 'A12', label: 'A/B-Test auswerten', category: 'quick', requiresApproval: false,
    agent: 'Paid Media Auditor', allowedTools: ['Read', 'Bash'], permissionMode: 'plan',
    description: 'Pricing-/Headline-Test statistisch bewerten.',
    buildPrompt: (a = {}) =>
      `${DELEGATE('Paid Media Auditor')}Werte den A/B-Test "${sanitizeArg(a.test, 60) || 'pricing'}" aus (Zeitraum ${sanitizeArg(a.period, 40) || 'bisher'}). ` +
      'Gib: Gewinner / kein signifikanter Effekt / mehr Daten nötig (p<0,05). Deutsch.',
  },
  A13: {
    id: 'A13', label: 'Incident Response', category: 'live', requiresApproval: true,
    agent: 'Incident Response Commander', allowedTools: ['Bash', 'Read', 'WebFetch'],
    description: 'Site down/Bug: Diagnose → Mitigation → Rollback-Vorschlag.',
    buildPrompt: (a = {}) =>
      `${DELEGATE('Incident Response Commander')}Incident: "${sanitizeArg(a.symptom, 150) || 'Site nicht erreichbar'}". ` +
      'Diagnostiziere (Health-Check, Logs soweit erreichbar), erstelle Mitigationsplan + Rollback-Befehl. ' +
      'Führe Rollback NUR nach Freigabe aus. Deutsch.',
  },
  A14: {
    id: 'A14', label: 'Code-Review (Security)', category: 'generator', requiresApproval: false,
    agent: 'Code Reviewer', allowedTools: ['Read', 'Bash', 'Grep'], permissionMode: 'plan',
    description: 'PR/Diff sicherheitsorientiert reviewen vor Merge.',
    buildPrompt: (a = {}) =>
      `${DELEGATE('Code Reviewer')}Reviewe ${sanitizeArg(a.target, 120) || 'den aktuellen git-Diff'} mit Fokus auf Korrektheit + Security. ` +
      'Findings nach Severity, mit Fix-Vorschlägen. Kein Merge. Deutsch.',
  },
  A15: {
    id: 'A15', label: 'A11y-Selbst-Audit', category: 'quick', requiresApproval: false,
    agent: 'Accessibility Auditor', allowedTools: ['Bash', 'WebFetch', 'Read'], permissionMode: 'plan',
    description: 'Eigene Seite gegen WCAG 2.1 AA prüfen (Dogfooding).',
    buildPrompt: (a = {}) =>
      `${DELEGATE('Accessibility Auditor')}Führe ein WCAG-2.1-AA-Audit für ${sanitizeArg(a.url, 100) || 'https://bfsg-fix.de'} durch ` +
      '(soweit ohne Browser möglich: HTML/Contrast/Struktur-Heuristik). Liste Top-Findings + Score. Deutsch.',
  },
  A16: {
    id: 'A16', label: 'Legal-Copy-Check', category: 'generator', requiresApproval: false,
    agent: 'Legal Compliance Checker', allowedTools: ['Read', 'Grep', 'Bash'], permissionMode: 'plan',
    description: 'Marketing-/Landing-Texte auf UWG §5/§7 prüfen.',
    buildPrompt: (a = {}) =>
      `${DELEGATE('Legal Compliance Checker')}Prüfe ${sanitizeArg(a.target, 120) || 'marketing/*.md und landingpage-next/'} auf verbotene Formulierungen ` +
      '(„BFSG-konform", „rechtssicher", „garantiert", TÜV/DEKRA). Gib Datei:Zeile + sichere Alternative. Deutsch.',
  },
  A17: {
    id: 'A17', label: 'Finance-Snapshot', category: 'quick', requiresApproval: false,
    agent: 'Finance Tracker', allowedTools: ['Read', 'Bash'], permissionMode: 'plan',
    description: 'Umsatz vs. Werbekosten vs. Budget-Stufe, CAC-Prüfung.',
    buildPrompt: (a = {}) =>
      `${DELEGATE('Finance Tracker')}Erstelle einen Finanz-Snapshot (${sanitizeArg(a.period, 40) || 'aktueller Monat vs. Vormonat'}): ` +
      'Brutto/Netto-Umsatz, Ads-Spend, CAC vs. 177€-Ceiling, Kleinunternehmer-Grenze im Blick. Deutsch.',
  },
  A18: {
    id: 'A18', label: 'Backup-Verify', category: 'live', requiresApproval: true,
    agent: 'SRE (Site Reliability Engineer)', allowedTools: ['Bash', 'Read'],
    description: 'Backup-Status prüfen + Restore-Trockenübung.',
    buildPrompt: (a = {}) =>
      `${DELEGATE('SRE (Site Reliability Engineer)')}Prüfe den Backup-Status (Snapshot-Alter, Pfad). ` +
      'Gib eine Restore-Checkliste. Restore-Befehl NUR nach Freigabe ausführen. Deutsch.',
  },
};

export function listActions() {
  return Object.values(ACTIONS).map(({ buildPrompt, ...meta }) => meta);
}

export function getAction(id) {
  return ACTIONS[id] || null;
}
