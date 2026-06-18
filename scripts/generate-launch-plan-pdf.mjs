#!/usr/bin/env node
// Generiert docs/LAUNCH-PLAN.pdf — visueller Plan mit Brand-Design,
// Cover-Seite, blockbasierter Struktur, Glossar.
// Renderer: Playwright Chromium → page.pdf({ format: 'A4', printBackground: true })

import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PDF = path.join(__dirname, '..', 'docs', 'LAUNCH-PLAN.pdf');
const OUT_HTML = path.join(__dirname, '..', 'docs', 'LAUNCH-PLAN.html');

const NAVY = '#2E2A6B';
const NAVY_DARK = '#1f1c4d';
const MINT = '#1FBF8E';
const MINT_DARK = '#10996f';
const CORAL = '#FF6B6B';
const AMBER = '#F59E0B';
const PAPER = '#FAFAF7';
const INK = '#0F172A';
const MUTED = '#64748B';
const BORDER = '#E2E8F0';

const blocks = [
  {
    num: '1',
    color: MINT,
    icon: '🟢',
    title: 'HEUTE ABEND',
    sub: 'Vorbereitung (1 Stunde)',
    desc: '5 Sachen, die du sofort allein erledigst. Nur dein Mac/PC nötig.',
    tasks: [
      {
        id: '1.1',
        title: 'Admin-Passwort erstellen',
        time: '2 Min',
        why: 'Damit nur DU an die Bestellungs-Liste rankommst.',
        steps: [
          'Terminal öffnen (Mac: Cmd+Leertaste → „Terminal")',
          'Eintippen + Enter: <code>openssl rand -hex 32</code>',
          'Die 64-Zeichen-Zeile kopieren (Cmd+C)',
          'In Passwort-Manager speichern als „BFSG ADMIN_TOKEN"'
        ],
        done: 'Token im Passwort-Manager.'
      },
      {
        id: '1.2',
        title: 'Sentry-Account anlegen',
        time: '10 Min',
        why: 'Wenn der Server crasht, kriegst du eine Mail.',
        steps: [
          'Browser: <code>https://sentry.io/signup/</code>',
          '„Sign up with Email" → <code>matze.seba@outlook.de</code>',
          'Organisation: „BFSG-Check"',
          'Plattform: <strong>Node.js</strong>',
          'Den DSN-String (beginnt mit https://) kopieren',
          'In Passwort-Manager speichern als „BFSG SENTRY_DSN"',
          'Plan: „Developer (Free)" — kostenlos'
        ],
        done: 'SENTRY_DSN im Passwort-Manager.'
      },
      {
        id: '1.3',
        title: 'Backup-Schlüssel erstellen',
        time: '15 Min',
        why: 'Damit deine Backups verschlüsselt sind.',
        steps: [
          'Terminal: <code>gpg --version</code> (falls fehlt: <code>brew install gnupg</code>)',
          'Schlüssel erzeugen (alles auf einmal einfügen + Enter):',
          '<pre>gpg --batch --gen-key &lt;&lt;EOF\nKey-Type: RSA\nKey-Length: 4096\nName-Real: BFSG-Check Backup\nName-Email: backup@bfsg-fix.de\nExpire-Date: 5y\n%no-protection\n%commit\nEOF</pre>',
          'Private-Key exportieren: <code>gpg --armor --export-secret-keys backup@bfsg-fix.de > ~/Desktop/backup-privkey.asc</code>',
          'Public-Key exportieren: <code>gpg --armor --export backup@bfsg-fix.de > ~/Desktop/backup-pubkey.asc</code>',
          'Private-Key-Inhalt in Passwort-Manager kopieren als „BFSG GPG Private Key"',
          'Private-Key vom Desktop löschen: <code>rm -P ~/Desktop/backup-privkey.asc</code>',
          'Public-Key auf Desktop LASSEN (brauchst du in 3.3)'
        ],
        done: 'Privater Schlüssel im Manager. Public-Key noch auf Desktop.'
      },
      {
        id: '1.4',
        title: 'Speicher-Box bei Hetzner bestellen',
        time: '10 Min',
        why: 'Cloud-Speicher für verschlüsselte Backups (3,20 €/Monat).',
        steps: [
          'Browser: <code>https://accounts.hetzner.com/login</code>',
          '„Storage Boxes" → „Storage Box bestellen"',
          'Produkt: <strong>BX11</strong> (100 GB)',
          'Standort: <strong>Nürnberg</strong>',
          'Bestellung absenden',
          'Mail kommt mit Username, Passwort, Hostname',
          'Alle 3 Daten in Passwort-Manager als „Hetzner Storage-Box"'
        ],
        done: 'Storage-Box-Daten im Passwort-Manager.'
      },
      {
        id: '1.5',
        title: 'Notion-Token holen',
        time: '15 Min',
        why: 'Damit du live siehst, wer was bestellt hat.',
        steps: [
          'Browser: <code>https://notion.so</code> → einloggen',
          'Zahnrad → Settings → Connections → „Develop or manage integrations"',
          '„+ New integration" → Name: <strong>BFSG-Check Dashboard</strong>, Type: Internal',
          'Capabilities ankreuzen: Read, Update, Insert content',
          '„Submit" → Integration Secret → „Show & copy"',
          'In Passwort-Manager als „Notion BFSG-Token"',
          'Notion-Page anlegen: „+ Add a page" → Titel „BFSG-Check Dashboard"',
          'Oben rechts „…" → „Connect to" → „BFSG-Check Dashboard"',
          'Page-URL kopieren, in Passwort-Manager als „Notion Page URL"'
        ],
        done: 'Notion-Token + Page-URL im Passwort-Manager.'
      }
    ]
  },
  {
    num: '2',
    color: AMBER,
    icon: '🟡',
    title: 'MORGEN FRÜH',
    sub: 'Anwalt + Versicherung (50 Min)',
    desc: 'Beides parallel starten — danach 1–7 Tage Wartezeit.',
    tasks: [
      {
        id: '2.1',
        title: 'Anwalt anschreiben',
        time: '5 Min',
        why: 'Anwalt muss Rechtstexte freigeben, sonst Abmahn-Risiko.',
        steps: [
          'Anwalt suchen: <code>anwalt.de</code> oder <code>advocado.de</code>',
          'Suche: „Fachanwalt IT-Recht E-Commerce"',
          'An 2–3 Anwälte gleiche E-Mail schicken (Vorlage siehe MD-Datei)',
          'Wartezeit: 1–7 Tage bis Termin'
        ],
        done: 'E-Mail an 2–3 Anwälte raus.',
        cost: 'Erstgespräch 150–300 € · Review 200–500 €'
      },
      {
        id: '2.2',
        title: 'Versicherung beantragen',
        time: '30 Min',
        why: 'Schützt dich bei Abmahnung oder Kunden-Schaden.',
        steps: [
          'Browser: <code>https://www.hiscox.de/it-haftpflichtversicherung</code>',
          'Online-Antrag starten',
          'Tätigkeit: „IT-Dienstleistung, SaaS-Plattform für Website-Compliance-Prüfung"',
          'Jahresumsatz: 5.000 € (Schätzung)',
          'Versicherungssumme: 250.000 €',
          'Selbstbeteiligung: 1.000 €',
          'Mitarbeiter: 1',
          'Police-PDF abspeichern wenn sie kommt (1–7 Tage)'
        ],
        done: 'Police-PDF gespeichert.',
        cost: '30–60 €/Monat',
        warning: 'OHNE Police KEINE Live-Schaltung!'
      }
    ]
  },
  {
    num: '3',
    color: '#3B82F6',
    icon: '🔵',
    title: 'SERVER EINRICHTEN',
    sub: '30 Minuten (nach Block 1)',
    desc: 'Tokens und Schlüssel auf den Server einspielen.',
    tasks: [
      {
        id: '3.1',
        title: 'Server-Zugang testen',
        time: '2 Min',
        why: 'Stelle sicher dass du per SSH reinkommst.',
        steps: [
          'Terminal: <code>ssh root@bfsg-fix.de</code>',
          'Bei „Are you sure": <code>yes</code> + Enter',
          'Passwort eintippen (nichts zu sehen!) + Enter',
          'Wenn <code>root@bfsg-fix:~#</code> erscheint: <strong>OK</strong>',
          'Mit <code>exit</code> beenden'
        ],
        done: 'SSH-Zugang funktioniert.'
      },
      {
        id: '3.2',
        title: 'Server-Konfiguration ergänzen',
        time: '10 Min',
        why: 'Server muss neue Tokens kennen.',
        steps: [
          'SSH einloggen, dann: <code>nano /opt/bfsg-check/deployment/.env</code>',
          'Ans Ende der Datei diese Zeilen einfügen (mit deinen Werten):',
          '<pre>ADMIN_TOKEN=DEIN_TOKEN_AUS_1.1\nSENTRY_DSN=https://...\nVAT_MODE=kleinunternehmer\nINVOICE_FROM_NAME=Matthias Seba\nINVOICE_FROM_ADDRESS=Lange Straße 20, 27449 Kutenholz\nBACKUP_GPG_RECIPIENT=backup@bfsg-fix.de\nBACKUP_TARGET=hetzner-storage:bfsg-backups</pre>',
          'Speichern: Ctrl+O → Enter → Ctrl+X',
          'Neustart: <code>cd /opt/bfsg-check/deployment && docker compose restart app</code>',
          'Test: <code>curl -fSs https://bfsg-fix.de/health</code>',
          'Erwartung: <code>{"ok":true,"stripe":true,"live":true,...}</code>'
        ],
        done: '/health zeigt <strong>live:true</strong>.'
      },
      {
        id: '3.3',
        title: 'GPG-Schlüssel auf Server',
        time: '5 Min',
        why: 'Server muss Backups verschlüsseln können.',
        steps: [
          'Auf deinem Mac/PC: <code>scp ~/Desktop/backup-pubkey.asc root@bfsg-fix.de:/tmp/</code>',
          'SSH zum Server, dann:',
          '<pre>gpg --import /tmp/backup-pubkey.asc\necho "$(gpg --list-keys --with-colons backup@bfsg-fix.de | awk -F: \'/fpr/{print $10;exit}\'):6:" | gpg --import-ownertrust\nrm /tmp/backup-pubkey.asc</pre>',
          'Lokal aufräumen: <code>rm -P ~/Desktop/backup-pubkey.asc</code>'
        ],
        done: 'Server kann Backups verschlüsseln.'
      },
      {
        id: '3.4',
        title: 'Speicher-Box verbinden',
        time: '5 Min',
        why: 'Damit Backups in die Cloud hochgeladen werden.',
        steps: [
          'SSH auf Server: <code>rclone config</code>',
          '<code>n</code> + Enter → Name: <code>hetzner-storage</code>',
          'Storage-Typ: <code>5</code> (sftp)',
          'Host: dein Hostname aus 1.4',
          'User: deine Storage-Box-Username · Port: <code>23</code>',
          'Passwort: <code>y</code> + Storage-Box-Passwort zweimal eintippen',
          'Restliche Fragen: Enter (Defaults)',
          'Test: <code>rclone mkdir hetzner-storage:bfsg-backups && rclone lsd hetzner-storage:</code>',
          'Erstes Backup: <code>/opt/bfsg-check/deployment/backup.sh</code>'
        ],
        done: 'Erstes Backup liegt verschlüsselt in der Storage-Box.'
      }
    ]
  },
  {
    num: '4',
    color: '#A855F7',
    icon: '🟣',
    title: 'GITHUB-SECRETS',
    sub: '10 Minuten',
    desc: 'Damit Automatik-Workflows (Uptime, Backup-Test, Notion-Sync) laufen.',
    tasks: [
      {
        id: '4.1',
        title: 'Secrets eintragen',
        time: '10 Min',
        why: 'Workflows brauchen die Tokens.',
        steps: [
          'Browser: <code>https://github.com/matzeseba/bfsg-check/settings/secrets/actions</code>',
          'Pro Secret: „New repository secret" → Name + Wert → „Add secret"',
          'Diese 5 Secrets anlegen:',
          '<ul><li><code>SMTP_USER</code> = matthiasseba92@gmail.com</li><li><code>SMTP_PASS</code> = Brevo SMTP-Key</li><li><code>ADMIN_TOKEN</code> = Token aus 1.1</li><li><code>SENTRY_DSN</code> = DSN aus 1.2</li><li><code>NOTION_TOKEN</code> = Token aus 1.5</li></ul>'
        ],
        done: 'Alle 5 Secrets in GitHub sichtbar.'
      }
    ]
  },
  {
    num: '5',
    color: '#F97316',
    icon: '🟠',
    title: 'DNS-RECORDS',
    sub: '5 Minuten',
    desc: 'Subdomains für Preview-Landing + Admin-Dashboard.',
    tasks: [
      {
        id: '5.1',
        title: 'DNS-Einträge bei INWX anlegen',
        time: '5 Min',
        why: 'Damit preview.bfsg-fix.de + admin.bfsg-fix.de funktionieren.',
        steps: [
          'Browser: <code>https://www.inwx.de/de/customer/login</code>',
          'Nameserver → DNS → auf <code>bfsg-fix.de</code> klicken',
          'Diese 4 Einträge anlegen:',
          '<table class="dns-table"><thead><tr><th>Typ</th><th>Host</th><th>Wert</th><th>TTL</th></tr></thead><tbody><tr><td>A</td><td>preview</td><td>178.105.83.0</td><td>3600</td></tr><tr><td>A</td><td>admin</td><td>178.105.83.0</td><td>3600</td></tr><tr><td>AAAA</td><td>preview</td><td>2a01:4f8:1c18:d890::1</td><td>3600</td></tr><tr><td>AAAA</td><td>admin</td><td>2a01:4f8:1c18:d890::1</td><td>3600</td></tr></tbody></table>',
          'Speichern. Propagation: 5–60 Min.'
        ],
        done: '4 DNS-Records angelegt.'
      }
    ]
  },
  {
    num: '6',
    color: NAVY,
    icon: '🚦',
    title: 'LIVE-SCHALTUNG',
    sub: '30 Minuten (nach Block 1–5 + Anwalt + Police)',
    desc: 'Der finale Schritt. Code geht live, erste Test-Bestellung.',
    tasks: [
      {
        id: '6.1',
        title: 'Live-Schaltung triggern',
        time: '2 Min',
        why: 'Merge auf main triggert Auto-Deploy.',
        steps: [
          'Mir Bescheid sagen: „Mach Block 6.1"',
          'Ich merge auf main → Auto-Deploy läuft',
          'Beobachte: <code>https://github.com/matzeseba/bfsg-check/actions</code>',
          'Nach ~5 Min ist Deploy grün'
        ],
        done: 'Deploy-Action grün.'
      },
      {
        id: '6.2',
        title: 'Health-Check',
        time: '1 Min',
        why: 'Bestätigen dass Server läuft.',
        steps: [
          'Terminal: <code>curl -fSs https://bfsg-fix.de/health</code>',
          'Erwartung: <code>{"ok":true,"stripe":true,"live":true,...}</code>'
        ],
        done: 'live:true bestätigt.'
      },
      {
        id: '6.3',
        title: 'Test-Bestellung mit eigener Karte',
        time: '20 Min',
        why: 'End-to-End-Test: Scan → Checkout → Stripe → Mail → PDF.',
        steps: [
          'Browser: <code>https://bfsg-fix.de</code>',
          'Gratis-Scan für <code>example.com</code>',
          '„Vollreport sichern" → Basis (199 €)',
          'Im Checkout-Modal: Verbraucher · Widerruf-Verzicht · eigene E-Mail',
          'Mit echter Karte zahlen',
          'Mail-Eingang in 2 Min checken (auch Spam!)',
          'PDF prüfen: Score, Findings, Disclaimer',
          'Stripe-Dashboard → Zahlungen → „Erstatten" → vollen Betrag (Geld zurück in 5–10 Tagen)'
        ],
        done: 'Mail kam, PDF gut, Refund läuft.'
      },
      {
        id: '6.4',
        title: 'Mail-Qualität prüfen',
        time: '5 Min',
        why: 'Damit Mails nicht im Spam landen.',
        steps: [
          'Browser: <code>https://www.mail-tester.com</code>',
          'Test-Adresse kopieren (test-xxx@mail-tester.com)',
          'Test-Bestellung mit dieser Adresse auf bfsg-fix.de',
          '„Then check your score" klicken',
          'Ziel: <strong>≥ 9/10</strong>'
        ],
        done: 'Score ≥ 9/10.'
      }
    ]
  },
  {
    num: '7',
    color: MINT_DARK,
    icon: '💰',
    title: 'MARKETING',
    sub: '1 Stunde (nach Block 6)',
    desc: 'Erste Sichtbarkeit aufbauen: Ads, LinkedIn, Partner.',
    tasks: [
      {
        id: '7.1',
        title: 'Google Ads aktivieren',
        time: '30 Min',
        why: 'Schnellster Traffic-Kanal.',
        steps: [
          'Browser: <code>https://ads.google.com/intl/de_de/start</code>',
          'Konto anlegen, neue Kampagne',
          'Keywords aus Repo: <code>marketing/google-ads-keywords.csv</code>',
          'Negative Keywords aus: <code>marketing/google-ads-negatives.csv</code>',
          'Budget: <strong>10 €/Tag</strong>',
          'Conversion-Tracking-Tag aktivieren',
          'Kampagne <strong>pausiert</strong> speichern → mir Bescheid für Review'
        ],
        done: 'Kampagne pausiert in Google Ads.'
      },
      {
        id: '7.2',
        title: 'LinkedIn-Post',
        time: '10 Min',
        why: 'Organische Reichweite + Trust.',
        steps: [
          'Headline ändern: „BFSG-Check Gründer — Compliance-Scans für deutsche Websites"',
          'Post-Text aus Markdown-Datei (LAUNCH-PLAN.md) übernehmen',
          'Veröffentlichen → Kommentare beantworten'
        ],
        done: 'Erster Post live.'
      },
      {
        id: '7.3',
        title: 'Partner-Outreach',
        time: '20 Min/Tag',
        why: 'B2B-Multiplier: Agenturen + Kanzleien empfehlen dich.',
        steps: [
          'Liste: <code>marketing/partner-targets.md</code>',
          '30 Web-Agenturen + 30 IT-Kanzleien',
          '<strong>5 LinkedIn-DMs/Tag</strong> (KEIN Cold-Mail — UWG-Risiko!)',
          'Nachrichten-Vorlage im File'
        ],
        done: '5 DMs/Tag, 30 Tage durchhalten.'
      }
    ]
  },
  {
    num: '8',
    color: CORAL,
    icon: '🔐',
    title: 'SICHERHEITS-HYGIENE',
    sub: '10 Minuten (jederzeit)',
    desc: 'Alle Secrets rotieren, die durch unseren Chat liefen.',
    tasks: [
      {
        id: '8.1',
        title: 'Stripe-Key rotieren',
        time: '3 Min',
        why: 'Alter Key war im Chat sichtbar.',
        steps: [
          'Stripe Dashboard → Developers → API Keys',
          'Genutzten Restricted-Key → „…" → „Roll key"',
          'Neuen Key in Server-.env + GitHub-Secret aktualisieren',
          'Server: <code>docker compose restart app</code>'
        ],
        done: 'Neuer Key live, alter revoked.'
      },
      {
        id: '8.2',
        title: 'Brevo SMTP-Key rotieren',
        time: '3 Min',
        why: 'Alter Key war im Chat sichtbar.',
        steps: [
          '<code>app.brevo.com</code> → SMTP & API → SMTP',
          'Genutzten Key „Revoke" + neuen generieren',
          'Server-.env + GitHub-Secret <code>SMTP_PASS</code> aktualisieren',
          'Server: <code>docker compose restart app</code>'
        ],
        done: 'Neuer SMTP-Key live.'
      },
      {
        id: '8.3',
        title: 'Hetzner-Token löschen',
        time: '1 Min',
        why: 'Bootstrap-Token wird nicht mehr gebraucht.',
        steps: [
          '<code>console.hetzner.cloud</code> → Security → API Tokens',
          'Token <code>claude-bootstrap</code> → „Delete"'
        ],
        done: 'Token gelöscht.'
      },
      {
        id: '8.4',
        title: 'SSH-Key rotieren',
        time: '3 Min',
        why: 'Optional, aber sauber.',
        steps: [
          'Mir Bescheid sagen → ich generiere neuen Key',
          'Du tauschst alten gegen neuen in <code>~/.ssh/authorized_keys</code> auf Server',
          'Alten Key aus GitHub-Secret <code>HETZNER_SSH_KEY</code> ersetzen'
        ],
        done: 'Neuer SSH-Key aktiv.'
      }
    ]
  }
];

const glossary = [
  ['SSH', 'Verschlüsselte Verbindung zum Server (Remote-Desktop für Text)'],
  ['DNS', 'Telefon-Buch des Internets: macht aus bfsg-fix.de eine IP-Adresse'],
  ['GPG', 'Verschlüsselung mit Schlüsselpaar (öffentlich + privat)'],
  ['rclone', 'Tool zum Hochladen von Backups in die Cloud'],
  ['Stripe', 'Bezahl-Dienstleister — wickelt Karten-Zahlung ab'],
  ['Brevo', 'Mail-Versand-Dienstleister (früher Sendinblue)'],
  ['Sentry', 'Fehler-Tracking: wenn was crasht, kriegst du eine Mail'],
  ['Notion', 'Notiz-/Datenbank-Tool für dein Dashboard'],
  ['Hetzner', 'Server-Anbieter (deutsche Firma, DSGVO-konform)'],
  ['Webhook', 'Stripe meldet sich automatisch wenn jemand bezahlt'],
  ['Health-Check', 'Prüft ob Server läuft (/health Endpunkt)'],
  ['UWG', 'Gesetz gegen unlauteren Wettbewerb (Spam, irreführende Werbung)'],
  ['DSGVO', 'Datenschutz-Grundverordnung der EU'],
  ['BFSG', 'Barrierefreiheits-Stärkungs-Gesetz'],
  ['TDDDG', 'Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (Cookie-Regeln)'],
  ['RDG', 'Rechtsdienstleistungs-Gesetz (was darf Nicht-Anwalt sagen?)']
];

const hardGates = [
  { done: true, text: 'Code ist fertig (alle 32 PRs gemerged)' },
  { done: true, text: 'Server läuft (CPX22 bei Hetzner, HTTPS, HSTS)' },
  { done: true, text: 'Stripe Live-Mode (Webhook geht durch)' },
  { done: true, text: 'Brevo SMTP funktioniert' },
  { done: true, text: 'Cookie-Banner deployed' },
  { done: true, text: 'Legal-Texte mit Stammdaten gefüllt' },
  { done: false, text: 'Anwalts-OK' },
  { done: false, text: 'Versicherungs-Police' },
  { done: false, text: 'Backup läuft 1× erfolgreich' },
  { done: false, text: 'Live-Test-Kauf erfolgreich + Refund' },
  { done: false, text: 'Mail-Tester ≥ 9/10' }
];

function renderTask(t) {
  return `
    <div class="task">
      <div class="task-head">
        <div class="task-id">${t.id}</div>
        <div class="task-title-wrap">
          <div class="task-title">${t.title}</div>
          <div class="task-meta">
            <span class="time-chip">⏱ ${t.time}</span>
            ${t.cost ? `<span class="cost-chip">💶 ${t.cost}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="task-why"><strong>Warum:</strong> ${t.why}</div>
      <ol class="task-steps">
        ${t.steps.map((s) => `<li>${s}</li>`).join('')}
      </ol>
      <div class="task-done">✓ <strong>Fertig wenn:</strong> ${t.done}</div>
      ${t.warning ? `<div class="task-warning">⚠ ${t.warning}</div>` : ''}
    </div>
  `;
}

function renderBlock(b) {
  return `
    <section class="block" style="--block-color: ${b.color};">
      <header class="block-head">
        <div class="block-num">Block ${b.num}</div>
        <div class="block-titles">
          <h2 class="block-title">${b.icon} ${b.title}</h2>
          <div class="block-sub">${b.sub}</div>
        </div>
      </header>
      <p class="block-desc">${b.desc}</p>
      <div class="tasks">
        ${b.tasks.map(renderTask).join('')}
      </div>
    </section>
  `;
}

function renderHtml() {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<title>BFSG-Check — Launch-Plan</title>
<style>
  @page { size: A4; margin: 14mm 14mm 14mm 14mm; }
  @page :first { margin: 0; }

  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: ${INK}; background: ${PAPER}; font-size: 11pt; line-height: 1.5; }

  /* COVER */
  .cover {
    height: 297mm;
    width: 210mm;
    background: linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 55%, ${MINT_DARK} 130%);
    color: white;
    padding: 36mm 24mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    break-after: page;
    page-break-after: always;
  }
  .cover-brand { font-size: 14pt; letter-spacing: 2px; opacity: 0.85; font-weight: 600; text-transform: uppercase; }
  .cover-title { font-size: 42pt; font-weight: 800; line-height: 1.1; margin-top: 18mm; }
  .cover-title em { color: ${MINT}; font-style: normal; }
  .cover-subtitle { font-size: 16pt; opacity: 0.9; margin-top: 6mm; font-weight: 400; line-height: 1.4; }
  .cover-pills { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14mm; }
  .pill { background: rgba(255,255,255,0.15); padding: 6px 14px; border-radius: 999px; font-size: 10pt; backdrop-filter: blur(4px); }
  .pill strong { color: ${MINT}; }
  .cover-foot { font-size: 9pt; opacity: 0.7; display: flex; justify-content: space-between; align-items: end; }
  .cover-foot-right { text-align: right; }
  .cover-foot strong { color: ${MINT}; }

  /* INTRO + TOC */
  .intro-page { break-after: page; page-break-after: always; padding-top: 4mm; }
  .intro-page h1 { font-size: 22pt; color: ${NAVY}; margin: 0 0 4mm; }
  .intro-lead { font-size: 12pt; color: ${MUTED}; line-height: 1.6; margin-bottom: 8mm; }
  .status-card { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin-bottom: 8mm; }
  .status-box { background: white; border: 1px solid ${BORDER}; border-left: 4px solid ${MINT}; border-radius: 6px; padding: 4mm 5mm; }
  .status-box.warn { border-left-color: ${AMBER}; }
  .status-box h3 { font-size: 10pt; text-transform: uppercase; color: ${MUTED}; letter-spacing: 1px; margin: 0 0 2mm; }
  .status-box p { margin: 0; font-size: 11pt; }
  .toc { background: white; border: 1px solid ${BORDER}; border-radius: 8px; padding: 6mm; }
  .toc h2 { margin: 0 0 4mm; color: ${NAVY}; font-size: 14pt; }
  .toc-list { list-style: none; padding: 0; margin: 0; counter-reset: toc; }
  .toc-list li { display: flex; align-items: center; gap: 3mm; padding: 2mm 0; border-bottom: 1px dashed ${BORDER}; }
  .toc-list li:last-child { border-bottom: none; }
  .toc-num { background: ${NAVY}; color: white; width: 8mm; height: 8mm; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; border-radius: 4px; font-size: 10pt; }
  .toc-name { flex: 1; font-weight: 600; }
  .toc-meta { color: ${MUTED}; font-size: 9pt; }

  .timeline { margin: 6mm 0; }
  .timeline h2 { margin: 0 0 3mm; color: ${NAVY}; font-size: 14pt; }
  .timeline-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 3mm; }
  .timeline-step { background: white; border: 1px solid ${BORDER}; padding: 4mm; border-radius: 6px; }
  .timeline-step .step-day { font-size: 9pt; color: ${MINT_DARK}; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .timeline-step .step-text { font-size: 10pt; margin-top: 2mm; }

  /* BLOCKS */
  .block { break-before: page; page-break-before: always; padding-top: 2mm; }
  .block-head { display: flex; gap: 5mm; align-items: flex-start; border-bottom: 3px solid var(--block-color); padding-bottom: 4mm; margin-bottom: 5mm; }
  .block-num { background: var(--block-color); color: white; padding: 3mm 5mm; border-radius: 6px; font-weight: 800; font-size: 11pt; letter-spacing: 1px; text-transform: uppercase; flex-shrink: 0; }
  .block-titles { flex: 1; }
  .block-title { margin: 0; font-size: 22pt; color: ${NAVY}; line-height: 1.15; }
  .block-sub { color: ${MUTED}; font-size: 11pt; margin-top: 1mm; }
  .block-desc { background: white; border-left: 4px solid var(--block-color); padding: 3mm 5mm; margin-bottom: 6mm; border-radius: 4px; font-style: italic; color: ${INK}; }

  /* TASKS */
  .task { background: white; border: 1px solid ${BORDER}; border-radius: 8px; padding: 5mm; margin-bottom: 4mm; break-inside: avoid; page-break-inside: avoid; }
  .task-head { display: flex; gap: 4mm; align-items: flex-start; margin-bottom: 3mm; }
  .task-id { background: var(--block-color); color: white; font-weight: 800; font-size: 12pt; min-width: 14mm; height: 12mm; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; }
  .task-title-wrap { flex: 1; }
  .task-title { font-size: 14pt; font-weight: 700; color: ${NAVY}; line-height: 1.2; }
  .task-meta { display: flex; gap: 2mm; margin-top: 2mm; flex-wrap: wrap; }
  .time-chip, .cost-chip { display: inline-block; background: ${PAPER}; border: 1px solid ${BORDER}; padding: 1mm 3mm; border-radius: 999px; font-size: 9pt; color: ${MUTED}; font-weight: 600; }
  .cost-chip { background: #FFF7ED; border-color: #FED7AA; color: #C2410C; }
  .task-why { background: #F8FAFC; border-left: 3px solid ${NAVY}; padding: 2mm 4mm; margin-bottom: 3mm; font-size: 10pt; border-radius: 0 4px 4px 0; }
  .task-steps { padding-left: 6mm; margin: 0 0 3mm; font-size: 10.5pt; }
  .task-steps li { margin-bottom: 2mm; line-height: 1.5; }
  .task-steps code { background: #F1F5F9; padding: 1px 5px; border-radius: 3px; font-size: 9.5pt; color: #BE185D; font-family: "SF Mono", Menlo, Consolas, monospace; word-break: break-all; }
  .task-steps pre { background: ${NAVY_DARK}; color: #E2E8F0; padding: 3mm; border-radius: 4px; font-size: 9pt; line-height: 1.4; overflow-x: auto; font-family: "SF Mono", Menlo, Consolas, monospace; margin: 2mm 0; white-space: pre-wrap; }
  .task-steps ul { margin: 1mm 0; padding-left: 5mm; }
  .task-done { background: #ECFDF5; border-left: 3px solid ${MINT}; padding: 2mm 4mm; font-size: 10pt; border-radius: 0 4px 4px 0; color: ${MINT_DARK}; }
  .task-warning { background: #FEF2F2; border-left: 3px solid ${CORAL}; padding: 2mm 4mm; font-size: 10pt; border-radius: 0 4px 4px 0; color: #B91C1C; margin-top: 2mm; font-weight: 600; }

  /* DNS TABLE in task */
  .dns-table { width: 100%; border-collapse: collapse; margin: 2mm 0; font-size: 9.5pt; }
  .dns-table th { background: ${NAVY}; color: white; padding: 2mm 3mm; text-align: left; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.5px; }
  .dns-table td { border-bottom: 1px solid ${BORDER}; padding: 2mm 3mm; font-family: "SF Mono", Menlo, Consolas, monospace; }

  /* APPENDIX PAGES */
  .appendix { break-before: page; page-break-before: always; padding-top: 2mm; }
  .appendix h1 { color: ${NAVY}; font-size: 22pt; margin: 0 0 4mm; border-bottom: 3px solid ${MINT}; padding-bottom: 3mm; }
  .gates-list { list-style: none; padding: 0; margin: 6mm 0; }
  .gates-list li { display: flex; align-items: center; gap: 4mm; padding: 3mm 5mm; background: white; border: 1px solid ${BORDER}; border-radius: 6px; margin-bottom: 2mm; font-size: 11pt; }
  .gates-list li.done { background: #ECFDF5; border-color: #A7F3D0; }
  .gate-mark { width: 8mm; height: 8mm; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; font-weight: 800; font-size: 12pt; flex-shrink: 0; }
  .gate-mark.done { background: ${MINT}; color: white; }
  .gate-mark.pending { background: #F1F5F9; color: ${MUTED}; border: 2px solid ${BORDER}; }

  .glossary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; margin-top: 6mm; }
  .glossary-item { background: white; border: 1px solid ${BORDER}; padding: 3mm 4mm; border-radius: 6px; page-break-inside: avoid; }
  .glossary-term { font-weight: 700; color: ${NAVY}; font-size: 11pt; }
  .glossary-def { font-size: 9.5pt; color: ${MUTED}; margin-top: 1mm; line-height: 1.4; }

  .help-box { background: linear-gradient(135deg, ${NAVY} 0%, ${NAVY_DARK} 100%); color: white; padding: 8mm; border-radius: 10px; margin: 8mm 0; }
  .help-box h2 { margin: 0 0 3mm; color: ${MINT}; font-size: 18pt; }
  .help-box p { margin: 0 0 2mm; }
  .help-box ul { padding-left: 5mm; margin: 2mm 0; }
  .help-box code { background: rgba(255,255,255,0.15); padding: 1px 5px; border-radius: 3px; font-family: "SF Mono", Menlo, monospace; }

  /* Robust page break — Chromium honors this even when CSS page-break-before ignored */
  .pb { display: block; height: 0; page-break-after: always; break-after: page; }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover">
  <div>
    <div class="cover-brand">BFSG-Check · Launch-Plan</div>
    <div class="cover-title">Dein Weg<br>zum <em>Live-Start.</em></div>
    <div class="cover-subtitle">8 Blöcke. So einfach, dass jeder es schafft.<br>Du musst nur abhaken.</div>
    <div class="cover-pills">
      <span class="pill"><strong>~3,5h</strong> deine Zeit</span>
      <span class="pill"><strong>~1 Woche</strong> bis live</span>
      <span class="pill"><strong>0 €</strong> bis live (nur Versicherung)</span>
    </div>
  </div>
  <div class="cover-foot">
    <div>
      <strong>Für:</strong> Matthias Seba<br>
      Lange Straße 20, 27449 Kutenholz
    </div>
    <div class="cover-foot-right">
      <strong>Stand:</strong> 18.06.2026<br>
      Version 1.0
    </div>
  </div>
</div>

<!-- INTRO + TOC -->
<div class="intro-page">
  <h1>So funktioniert dieser Plan</h1>
  <p class="intro-lead">
    Du arbeitest die <strong>8 Blöcke</strong> der Reihe nach durch.
    Jede Aufgabe hat: <strong>was</strong> du machst · <strong>warum</strong> · <strong>wie</strong> (Schritt für Schritt) · und ein klares <strong>„Fertig wenn"</strong>.
    Hak ab, was du erledigt hast. Wenn was nicht klappt: Mir Bescheid sagen — wir sind ein Team.
  </p>

  <div class="status-card">
    <div class="status-box">
      <h3>✅ Was schon fertig ist</h3>
      <p>Code, Server, Stripe Live, Mail-Versand, Cookie-Banner, Rechtstexte mit deinen Stammdaten.</p>
    </div>
    <div class="status-box warn">
      <h3>⏳ Was noch fehlt</h3>
      <p>6 Schritte: Vorbereitung, Anwalt, Versicherung, Server-Tokens, DNS, Live-Test.</p>
    </div>
  </div>

  <div class="timeline">
    <h2>📅 Zeitplan auf einen Blick</h2>
    <div class="timeline-grid">
      <div class="timeline-step"><div class="step-day">Heute Abend</div><div class="step-text">Block 1: Tokens und Schlüssel erstellen (1 h)</div></div>
      <div class="timeline-step"><div class="step-day">Morgen früh</div><div class="step-text">Block 2: Anwalt + Versicherung anfragen (50 Min)</div></div>
      <div class="timeline-step"><div class="step-day">Sobald A fertig</div><div class="step-text">Block 3–5: Server, Secrets, DNS (45 Min)</div></div>
      <div class="timeline-step"><div class="step-day">1–7 Tage Pause</div><div class="step-text">Anwalt-Termin · Versicherung kommt</div></div>
      <div class="timeline-step"><div class="step-day">Wenn alles ✅</div><div class="step-text">Block 6: Live-Schaltung + Test (30 Min)</div></div>
      <div class="timeline-step"><div class="step-day">Direkt danach</div><div class="step-text">Block 7: Marketing scharf schalten (1 h)</div></div>
    </div>
  </div>

  <div class="toc">
    <h2>📋 Inhaltsverzeichnis</h2>
    <ol class="toc-list">
      ${blocks.map((b) => `
        <li>
          <span class="toc-num">${b.num}</span>
          <span class="toc-name">${b.icon} ${b.title}</span>
          <span class="toc-meta">${b.sub}</span>
        </li>
      `).join('')}
    </ol>
  </div>
</div>

<!-- BLOCKS -->
${blocks.map((b) => `<div class="pb"></div>${renderBlock(b)}`).join('')}

<div class="pb"></div>

<!-- APPENDIX: HARD GATES -->
<div class="appendix">
  <h1>🚦 Hard-Gates: Was MUSS sein vor Live?</h1>
  <p class="intro-lead">Diese Punkte sind <strong>nicht verhandelbar</strong>. Erst wenn alle ✅ sind, gehst du live.</p>
  <ul class="gates-list">
    ${hardGates.map((g) => `
      <li class="${g.done ? 'done' : ''}">
        <span class="gate-mark ${g.done ? 'done' : 'pending'}">${g.done ? '✓' : '○'}</span>
        <span>${g.text}</span>
      </li>
    `).join('')}
  </ul>
</div>

<div class="pb"></div>
<!-- APPENDIX: GLOSSARY -->
<div class="appendix">
  <h1>📚 Glossar</h1>
  <p class="intro-lead">Begriffe, die im Plan vorkommen — kurz erklärt.</p>
  <div class="glossary-grid">
    ${glossary.map(([term, def]) => `
      <div class="glossary-item">
        <div class="glossary-term">${term}</div>
        <div class="glossary-def">${def}</div>
      </div>
    `).join('')}
  </div>
</div>

<div class="pb"></div>
<!-- APPENDIX: NOTFALL -->
<div class="appendix">
  <h1>🆘 Wenn was schiefgeht</h1>
  <div class="help-box">
    <h2>So meldest du ein Problem</h2>
    <p>Sag mir Bescheid mit diesen 3 Infos:</p>
    <ul>
      <li><strong>Welche Aufgabe:</strong> z. B. <code>3.2 hat nicht geklappt</code></li>
      <li><strong>Was passiert ist:</strong> Screenshot vom Fehler</li>
      <li><strong>Was du erwartet hattest:</strong> Beschreibung in 1 Satz</li>
    </ul>
    <p style="margin-top: 4mm;">Ich debugge dann. Wir sind ein Team. Kein Problem ist zu klein — lieber zweimal fragen als einmal raten.</p>
  </div>

  <h2 style="color: ${NAVY}; margin-top: 8mm;">🎯 Was passiert wenn alles fertig ist?</h2>
  <p>Dann bist du live. Geld kann fließen. Der Plan endet hier — danach ist <strong>Marketing-Routine + Kunden-Support</strong>:</p>
  <ul>
    <li>5 LinkedIn-DMs pro Tag (30 Tage durchhalten)</li>
    <li>Google-Ads-Budget langsam hochziehen (10 → 30 → 50 €/Tag)</li>
    <li>1× pro Woche neuer SEO-Artikel (Plan im Repo: <code>marketing/seo-content-plan.md</code>)</li>
    <li>Kunden-Mails binnen 24 h beantworten</li>
    <li>1× pro Woche Notion-Dashboard durchsehen</li>
    <li>1× pro Monat Backup-Restore-Test (kommt automatisch per GitHub-Action)</li>
  </ul>

  <h2 style="color: ${NAVY}; margin-top: 8mm;">📈 Realistisches Erfolgs-Ziel (14 Tage nach Live)</h2>
  <ul>
    <li><strong>50+ Gratis-Scans/Tag</strong> (über Google-Ads-Funnel)</li>
    <li><strong>1+ Verkauf/Tag</strong> im Schnitt nach Tag 7</li>
    <li><strong>0</strong> „bezahlt aber nicht geliefert"-Fälle</li>
    <li><strong>0</strong> Sentry-Errors im Webhook</li>
    <li><strong>1+ Abo-Abschluss</strong> in den ersten 14 Tagen</li>
  </ul>

  <p style="margin-top: 10mm; text-align: center; font-size: 12pt; color: ${MINT_DARK}; font-weight: 600;">
    Du schaffst das. 💪
  </p>
</div>

</body>
</html>`;
}

async function main() {
  const html = renderHtml();
  await mkdir(path.dirname(OUT_PDF), { recursive: true });
  await writeFile(OUT_HTML, html, 'utf8');
  console.log(`[generate-launch-plan-pdf] HTML written: ${OUT_HTML}`);

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.emulateMedia({ media: 'print' });
    await page.pdf({
      path: OUT_PDF,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true
    });
  } finally {
    await browser.close();
  }

  console.log(`[generate-launch-plan-pdf] PDF written: ${OUT_PDF}`);
}

main().catch((err) => {
  console.error('[generate-launch-plan-pdf] FAILED:', err);
  process.exit(1);
});
