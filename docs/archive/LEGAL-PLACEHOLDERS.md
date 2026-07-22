# Legal-Platzhalter — Inventur (ERLEDIGT)

> Stand: 2026-06-18 · **Alle Platzhalter ersetzt** durch Stammdaten Matthias Seba.

## Eingesetzte Stammdaten

| Feld | Wert |
|---|---|
| Vollständiger Name | Matthias Seba |
| Anschrift | Lange Straße 20, 27449 Kutenholz, Deutschland |
| E-Mail | info@matthias-seba.de |
| USt-IdNr. | keine — Kleinunternehmer-Regelung § 19 UStG |
| Telefon | nicht angegeben (in DE für Impressum nicht zwingend) |

## Geänderte Files (Stand 2026-06-18)

| Datei | Vorher | Jetzt |
|---|---|---|
| `landingpage-next/app/impressum/page.tsx` | 4 Platzhalter | ✅ ersetzt |
| `landingpage-next/app/widerrufsbelehrung/page.tsx` | 2 Anschriften (Belehrungstext + Muster-Widerruf) | ✅ ersetzt |
| `landingpage-next/app/agb/page.tsx` | Platzhalter-Banner | ✅ entfernt (Stand-Datum statt Warnung) |
| `landingpage-next/app/datenschutz/page.tsx` | Platzhalter-Banner | ✅ entfernt |
| `landingpage/impressum.html` (alte HTML, Volume-Mount-Fallback) | 7 Platzhalter | ✅ ersetzt |
| `landingpage/datenschutz.html` | 6 Platzhalter | ✅ ersetzt |
| `landingpage/agb.html` | 3 Platzhalter | ✅ ersetzt |
| `landingpage/widerrufsbelehrung.html` | 4 Platzhalter | ✅ ersetzt |

## Was noch offen ist (Anwalt-Pflicht, NICHT Code-Pflicht)

1. **Anwaltliche Endabnahme** der Texte vor Live-Verkauf — siehe `docs/LEGAL-REVIEW-CHECKLIST.md` (12 Fragen).
2. **USt-IdNr.** ergänzen, falls Übergang zu Regelbesteuerung (über 22.000 €/Jahr): dann gleichzeitig `VAT_MODE=regelbesteuerung` in Server-`.env`.
3. **Auftragsverarbeitungs-Vertrag** mit Brevo (laden + archivieren).
4. **Stripe-DPA** bestätigen + archivieren.
5. **Sentry-DPA** (falls aktiviert).
6. **Vermögensschaden-Haftpflicht-Versicherung** abschließen (Hiscox/Exali, ca. 30–60 €/Mo).
