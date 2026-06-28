# Disclaimer-Footer (PDF + Landing)

> **Wichtigste einzelne Maßnahme.** Reduziert BFSG-Erfolgshaftungs-Risiko massiv.

---

## A) PDF-Report Footer (jedes generierte PDF)

**Einbauen in:** `scanner/lib/pdf-template.js` oder gleichwertig

```
─────────────────────────────────────────────────────────────────
HAFTUNGSAUSSCHLUSS

Dieser Report ist eine automatisierte technische Analyse der 
untersuchten Website auf Basis der WCAG-2.1-Kriterien und 
ausgewählter Prüfregeln des Barrierefreiheitsstärkungsgesetzes 
(BFSG). 

Er stellt KEINE Rechtsberatung dar und ersetzt nicht die Prüfung 
durch einen qualifizierten Anwalt oder eine zertifizierte 
Konformitätsprüfung.

Eine Garantie für Vollständigkeit, Aktualität oder rechtliche 
BFSG-Konformität wird ausdrücklich NICHT übernommen.

Barrierefrei-Prüfen übernimmt keine Haftung für Folgeschäden, die durch 
Befolgung oder Nichtbefolgung der hier ausgesprochenen Empfehlungen 
entstehen.

Bei rechtlichen Fragen konsultieren Sie einen Fachanwalt für 
IT-Recht oder Wettbewerbsrecht.

Made in Germany · Stand: {DATE}
─────────────────────────────────────────────────────────────────
Barrierefrei-Prüfen · Matthias Seba · Lange Straße 20 · 27449 Kutenholz
info@barrierefrei-pruefen.de · barrierefrei-pruefen.de
```

---

## B) Landing-Page Footer (footer.tsx oder gleichwertig)

```html
<footer class="text-xs text-muted-foreground mt-8 border-t pt-4">
  <p>
    <strong>Wichtiger Hinweis:</strong> Barrierefrei-Prüfen liefert 
    automatisierte technische Analysen nach WCAG 2.1 AA. Wir geben 
    <strong>keine rechtsverbindliche Konformitäts-Garantie</strong> und 
    ersetzen keine anwaltliche Beratung. Empfehlungen sind als Hilfestellung 
    für Entwickler und Site-Betreiber gedacht.
  </p>
  <p class="mt-2">
    Für rechtliche Fragen rund um BFSG, DSGVO oder TDDDG konsultieren 
    Sie bitte einen Fachanwalt für IT-Recht.
  </p>
</footer>
```

---

## C) Checkout-Seite (vor Bezahl-Button)

```html
<div class="alert alert-info text-sm mb-4">
  <p>
    <strong>Vor dem Kauf wichtig zu wissen:</strong>
  </p>
  <ul>
    <li>Barrierefrei-Prüfen liefert eine automatisierte technische 
        Analyse, keine rechtsverbindliche Konformitäts-Prüfung.</li>
    <li>Auto-Scans entdecken ca. 30-40% der WCAG-Issues — manuelle Tests 
        sind zusätzlich empfohlen.</li>
    <li>Wir geben keine Garantie auf vollständige BFSG-Konformität.</li>
    <li>Bei rechtlichen Fragen: Konsultation eines Fachanwalts empfohlen.</li>
  </ul>
</div>
```

---

## D) E-Mail-Signatur (in jeder transaktionalen Mail)

```
---
Barrierefrei-Prüfen liefert technische Analysen, keine Rechtsberatung.
Empfehlungen ersetzen nicht die anwaltliche Prüfung.

Barrierefrei-Prüfen · Matthias Seba · barrierefrei-pruefen.de
info@barrierefrei-pruefen.de
```

---

## Warum dieser Wortlaut wichtig ist

| Phrase | Schutz-Funktion |
|---|---|
| „automatisierte technische Analyse" | RDG-Schutz (nicht juristische Bewertung) |
| „keine Rechtsberatung" | RDG-Schutz + Anwalts-Pflicht-Klarstellung |
| „keine rechtliche BFSG-Konformität-Garantie" | UWG-§5-Schutz (keine Irreführung) |
| „keine Haftung für Folgeschäden" | Verstärkt AGB-Haftungs-Cap |
| „Konsultieren Sie einen Fachanwalt" | Eigenverantwortung des Nutzers betonen |

---

## ❌ Was du NICHT schreibst

- ❌ „BFSG-konform garantiert"
- ❌ „100% Compliance"
- ❌ „Abmahn-sicher"
- ❌ „Rechtssicher" (suggeriert Anwalts-Prüfung)
- ❌ „Behördlich zertifiziert"
- ❌ „TÜV-/DEKRA-geprüft" (ohne Zertifikat)
