# Disclaimer — BFSG-Check (Single Source of Truth)

> **Single-Source-Wortlaut.** Dieser Block wird auf Landingpage, in Reports, AGB § 2,
> Footer und E-Mail-Signaturen wörtlich verwendet. Änderungen nur hier — danach
> überall ausrollen.

## Wörtlicher Disclaimer (DE)

> **BFSG-Check liefert eine automatisierte technische Erstprüfung. Wir geben keine
> Konformitätsgarantie und ersetzen keine Rechtsberatung. Bei rechtlichen Fragen
> konsultieren Sie einen Fachanwalt für IT-/Wettbewerbsrecht.**

### Kurzform (≤ 200 Zeichen, für Ads-/Footer-Slots)

> Automatisierte technische Erstprüfung. Keine Konformitätsgarantie, keine Rechtsberatung. Bei rechtlichen Fragen Fachanwalt für IT-/Wettbewerbsrecht.

### Einsatzorte (Pflicht)

| Ort | Variante | Status |
|---|---|---|
| `landingpage/index.html` Footer | Wörtlicher Disclaimer | TODO Eigentümer |
| `landingpage/agb.html` § 2 | Wörtlicher Disclaimer (bereits sinngemäß enthalten) | OK |
| Report-PDF (`scanner/lib/report.js`) Cover + Footer | Wörtlicher Disclaimer | Prüfen |
| Ads-Landingpage above-the-fold | Kurzform | TODO Eigentümer |
| E-Mail-Versand Bestell-/Report-Mail | Kurzform unter Signatur | TODO Eigentümer |

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
