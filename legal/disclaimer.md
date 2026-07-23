# Disclaimer — BFSG-Fuchs (Single Source of Truth)

> **Single-Source-Wortlaut.** Dieser Block wird auf Landingpage, in Reports, AGB § 2,
> Footer und E-Mail-Signaturen sinngemäß/wörtlich verwendet. Änderungen nur hier — danach
> überall ausrollen.

## Wörtlicher Disclaimer (DE)

> **BFSG-Fuchs liefert eine automatisierte technische Erstprüfung. Wir geben keine
> Konformitätsgarantie und ersetzen keine Rechtsberatung. Bei rechtlichen Fragen
> konsultieren Sie einen Fachanwalt für IT-/Wettbewerbsrecht.**

### Kurzform (≤ 200 Zeichen, für Ads-/Footer-Slots)

> Automatisierte technische Erstprüfung. Keine Konformitätsgarantie, keine Rechtsberatung. Bei rechtlichen Fragen Fachanwalt für IT-/Wettbewerbsrecht.

### Einsatzorte (Pflicht) — verifiziert 23.07.2026

| Ort | Variante | Status |
|---|---|---|
| Landingpage Footer/Checkout (`landingpage-next/lib/config.ts:532`, LEGAL_NOTE) | Kurzform+ (inkl. „menschliche Sichtung") | ✅ ausgerollt |
| AGB § 2 (`landingpage-next/app/agb/page.tsx`) | Wörtlich/sinngemäß | ✅ ausgerollt |
| Report-PDF Cover (`scanner/lib/report.js:628`) + Fix-Plan-Hinweis (`report.js:344`, inkl. 30–50 %-Abdeckung) | Wörtlich/sinngemäß | ✅ verifiziert |
| Bestell-/Report-/Lead-Mails (`scanner/lib/mailer.js:47,161,454,518`) | Kurzform | ✅ verifiziert |
| Rechnungs-Footer (`scanner/lib/invoice.js:219`) | Kurzform | ✅ verifiziert |
| Cookie-Report (`scanner/lib/fulfill.js:84-86`) | Kurzform (TDDDG-Variante) | ✅ verifiziert |
| ~~Ads-Landingpage above-the-fold~~ | — | entfällt (No-Ads-Strategie seit 08.07.2026) |
| ~~`landingpage/*.html` (Legacy)~~ | — | archiviert (`landingpage/_archive/`, nicht mehr geroutet) |

## Hintergrund (kein Veröffentlichungstext)

- Automatisierte Tests (axe-core / Playwright) erfassen erfahrungsgemäß **30–50 %**
  der WCAG-Verstöße — komplexe Kriterien (z. B. Fokus-Reihenfolge, sinnvolle
  Alt-Texte, Tastaturbedienbarkeit, Screenreader-Semantik) erfordern manuelle
  Prüfung.
- „Konformitätsgarantie" wäre **§ 5 UWG**-relevant (irreführende Werbung mit
  Spitzenstellung) und würde die eigene Haftung deutlich vergrößern.
- „Rechtsberatung" wäre **RDG-Verstoß** (Rechtsdienstleistungsgesetz) — ohne
  Anwaltszulassung unzulässig.
- Verweis auf **Fachanwalt für IT-Recht** ist die rechtssichere Entlastung —
  schiebt rechtliche Restfragen ausdrücklich an die zuständige Profession ab.

## Änderungsprotokoll

| Datum | Änderung | Auslöser |
|---|---|---|
| 2026-06-16 | Initialer Single-Source-Disclaimer eingeführt | Pre-Launch-Sprint, UWG-Sanitize |
| 2026-07-23 | Marke BFSG-Check → BFSG-Fuchs; Einsatzorte-Tabelle verifiziert (Ausroll bestätigt: LP, Report-PDF, Mails, Rechnung, AGB); Legacy-/Ads-Zeilen entfernt | Instandsetzungs-Welle 1, Disclaimer-Rollout-Verifikation |
