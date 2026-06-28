# AGB-Haftungs-Cap-Klausel

> **Quelle:** Kanzlei Kramarz, IT-Recht-Kanzlei, BGH-konform.
> **B2B + B2C tauglich** (für reine B2B sind §§ 308/309 BGB nicht direkt anwendbar, Cap-Klauseln großzügiger zulässig).

---

## Klausel zum Einfügen in AGB

### § X Haftung

```
§ X Haftung

(1) Barrierefrei-Prüfen haftet unbeschränkt
  a) bei Vorsatz und grober Fahrlässigkeit,
  b) bei Verletzung von Leben, Körper oder Gesundheit,
  c) im Rahmen einer übernommenen Garantie und
  d) nach den Bestimmungen des Produkthaftungsgesetzes.

(2) Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten 
    (Kardinalpflichten) ist die Haftung von Barrierefrei-Prüfen der Höhe nach 
    auf den vertragstypisch vorhersehbaren Schaden begrenzt, 
    höchstens jedoch auf den im jeweiligen Einzelauftrag durch den 
    Auftraggeber gezahlten Betrag (Vergütung).

(3) Im Übrigen ist die Haftung für leichte Fahrlässigkeit ausgeschlossen.

(4) Diese Haftungsbegrenzung gilt auch zugunsten der gesetzlichen 
    Vertreter und Erfüllungsgehilfen von Barrierefrei-Prüfen.

(5) Für Schäden aufgrund unrichtiger oder unvollständiger Angaben 
    durch den Auftraggeber haftet Barrierefrei-Prüfen nicht.

(6) Barrierefrei-Prüfen übernimmt keine Haftung für 
    Hard- oder Softwarefehler von Drittanbietern (insbesondere 
    Browser-Hersteller, Hosting-Provider, CDN, Zahlungsdienstleister).
```

---

## § Y Leistungsbeschreibung & Beschaffenheit

```
§ Y Leistungsbeschreibung

(1) Barrierefrei-Prüfen liefert eine automatisierte technische Analyse der 
    untersuchten Website auf Basis aktueller WCAG-2.1-AA-Kriterien 
    und BFSG-spezifischer Prüfregeln.

(2) Die Analyse erfolgt mittels etablierter Open-Source-Engines 
    (insbesondere axe-core und Pa11y) und eigener Regelwerke.

(3) Barrierefrei-Prüfen garantiert ausdrücklich NICHT:
  a) die rechtliche BFSG-Konformität der geprüften Website,
  b) das Auffinden sämtlicher Barrierefreiheits-Probleme,
  c) die Aktualität der Prüfregeln über den Zeitpunkt der 
     Berichts-Erstellung hinaus.

(4) Eine vollständige Compliance-Prüfung erfordert zusätzlich:
  a) manuelle Tests durch Barrierefreiheits-Experten,
  b) Nutzer-Tests mit Menschen mit Behinderungen,
  c) anwaltliche Endabnahme der Barrierefreiheitserklärung.

(5) Die durch Barrierefrei-Prüfen gelieferten Empfehlungen sind Hilfestellungen 
    für Entwickler und Website-Betreiber. Sie ersetzen keine 
    Rechtsberatung.
```

---

## § Z Zugang & Verfügbarkeit (für SaaS-Re-Check-Abo)

```
§ Z Zugang und Verfügbarkeit

(1) Barrierefrei-Prüfen ist bemüht, eine ständige Verfügbarkeit des Online-
    Dienstes zu gewährleisten. Eine 100%-ige Verfügbarkeit wird 
    nicht garantiert.

(2) Geplante Wartungsarbeiten werden, soweit möglich, 24 Stunden 
    vorher angekündigt.

(3) Bei Ausfällen von mehr als 24 Stunden im Monat erhält der 
    Auftraggeber eine anteilige Rückerstattung der monatlichen 
    Vergütung pro Rata.

(4) Force-Majeure-Ereignisse (höhere Gewalt, DDoS-Angriffe, 
    Ausfälle von Drittanbietern) entbinden Barrierefrei-Prüfen von der 
    Verfügbarkeits-Pflicht.
```

---

## Wo einbauen

| Wo | Wie |
|---|---|
| AGB-Seite `landingpage-next/app/agb/page.tsx` | Klauseln in `<section>` einfügen, mit Headings `<h2>§ X Haftung</h2>` |
| Footer der AGB | „Stand: {DATE}" + Hinweis „Diese Bedingungen werden regelmäßig aktualisiert" |
| Checkout-Modal | „Mit Ihrer Bestellung akzeptieren Sie unsere AGB (Link)" + Verzicht-Checkbox |

---

## Warum diese Klauseln wirken

### § X (1) — Unbeschränkte Haftung in 4 Fällen

**Pflicht.** Wer das ausschließt, hat eine **unwirksame AGB**. § 309 Nr. 7 BGB (für B2C) + BGH-Rechtsprechung (für B2B).

### § X (2) — Cap auf Auftragswert

**Der wichtigste Schutz.** Bei einem Basis-Kauf (199 €) ist die maximale Haftung 199 €. Bei Profi (499 €) max 499 €.

→ **Realistisches Worst-Case-Risiko:** -499 € pro unzufriedenen Kunden statt unbegrenzt.

### § X (3) — Leichte Fahrlässigkeit ausgeschlossen

Wirksam in B2B (BGH-Rechtsprechung). In B2C nur eingeschränkt — aber die anderen Klauseln (Cap + Best-Effort) fangen das auf.

### § Y (3) — Explizit KEINE Garantie

Schließt UWG §5-Vorwürfe der Irreführung aus. Wenn ein Kunde später sagt „Aber ihr habt versprochen…", verweisen die AGB auf § Y (3).

---

## Test (vor Aktivierung)

- [ ] AGB einmal selbst lesen — verständlich?
- [ ] Cap-Klausel hervorgehoben (fett oder eigenes `<strong>`)
- [ ] Stand-Datum gesetzt
- [ ] Link in Checkout-Modal funktioniert
- [ ] Verzicht-Checkbox „Ich habe die AGB gelesen und akzeptiert" PFLICHT
