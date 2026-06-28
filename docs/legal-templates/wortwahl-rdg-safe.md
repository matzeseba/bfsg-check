# Wortwahl-Regeln (RDG + UWG-Schutz)

> **Zeit:** 30 Min Such+Ersetze in allen Marketing-Texten.
> **Zweck:** Vermeidung von Rechtsdienstleistungs-Vorwürfen + UWG-§5-Irreführung.

---

## ✅ Sichere Wortwahl

| Verwende | Statt |
|---|---|
| automatisierte technische Analyse | rechtliche Prüfung |
| WCAG-2.1-AA-Audit | Konformitäts-Prüfung |
| Barrierefrei-Prüfen | BFSG-Konformität |
| technische Findings | rechtliche Verstöße |
| Empfehlungen zur Behebung | Anweisungen |
| Best-Effort-Scan | garantierter Scan |
| Hilfestellung | Beratung |
| Compliance-Hilfe | Compliance-Garantie |
| Audit-Bericht | Konformitäts-Zertifikat |
| Score-Berechnung | Konformitäts-Score |
| Barrierefrei-Prüfen unterstützt bei | Barrierefrei-Prüfen macht konform |
| unsere Werkzeuge prüfen | unsere Anwälte prüfen |
| nach WCAG 2.1 AA | nach geltendem Recht |
| Findings nach BFSG-Methodik | rechtsverbindliche Findings |
| Anti-Overlay-Scanner | rechtssicherer Scanner |

---

## ❌ Verbotene Phrasen (NIE verwenden)

| Phrase | Warum verboten | Risiko |
|---|---|---|
| „BFSG-konform garantiert" | UWG §5 Irreführung | Abmahnung 600-2.700€ |
| „100% Compliance" | nicht haltbar | UWG §5 |
| „Abmahn-sicher" | falsches Versprechen | UWG §5 |
| „Rechtssicher" | nur Anwälte dürfen das | RDG-Verstoß-Risiko |
| „Behördlich zertifiziert" | suggeriert Behörden-Endorsement | UWG §5 Abs. 1 Nr. 3 |
| „TÜV/DEKRA-geprüft" | ohne echtes Zertifikat | sofort-Abmahnung |
| „Anwalts-empfohlen" | ohne echte Empfehlung | UWG §5 |
| „Akkreditiert" | DAkkS-Pflicht | UWG §5 Abs. 1 Nr. 3 |
| „Garantierte BFSG-Konformität" | unmöglich für Tool | UWG §5 |
| „Wir machen Sie BFSG-konform" | RDG-Risiko | RDG-Verstoß |
| „Anwaltsersatz" | RDG-Risiko | RDG-Verstoß |
| „Rechtsberatung enthalten" | RDG-Verstoß | RDG-Strafe |
| „Steuerberater-empfohlen" | ohne echte Empfehlung | UWG §5 |
| „Geprüft nach Gesetz X" | suggeriert Behörden-Prüfung | UWG §5 |

---

## Files zum Durchsuchen (Suche + Ersetze)

Im Repo `/home/user/bfsg-check`:

```bash
# Alle Texte mit „BFSG-konform" finden:
grep -r "BFSG-konform" --include="*.tsx" --include="*.md" --include="*.html" .

# Alle Texte mit „garantiert" finden:
grep -r "garantiert" --include="*.tsx" --include="*.md" --include="*.html" .

# Alle Texte mit „rechtssicher" finden:
grep -r "rechtssicher" --include="*.tsx" --include="*.md" --include="*.html" .

# Alle Texte mit „Anwalt" und Garantie-Begriffen:
grep -r "Anwalt.*geprüft\|geprüft.*Anwalt" --include="*.*" .
```

**Konkrete Files die wahrscheinlich anzupassen sind:**
- `landingpage-next/app/page.tsx` (Hero, Features)
- `landingpage-next/components/*.tsx` (alle UI-Texte)
- `marketing/google-ads-rsa-headlines.md` (RSA-Headlines)
- `marketing/*.md` (alle Marketing-Vorlagen)
- `scanner/lib/mailer.js` (E-Mail-Templates)
- `scanner/lib/pdf-template.js` (Report-Texte)

---

## Korrekte Selbst-Beschreibungen für Marketing

### Tagline (positiv-faktisch)
```
✅ „Automatisierte WCAG-Audits für deutsche Websites"
✅ „Barrierefrei-Prüfen: Technische Analyse + PDF-Report"
✅ „Compliance-Scan mit Findings + Umsetzungsplan"

❌ „BFSG-Konformität in 60 Sekunden" (unmöglich!)
❌ „Garantierte Abmahn-Sicherheit"
❌ „Rechtssicherer Barrierefrei-Check"
```

### Pricing-Beschreibung
```
✅ „Vollreport mit allen technischen Findings nach WCAG 2.1 AA"
✅ „Profi-Paket inkl. Umsetzungsplan + 30 Tage E-Mail-Support"
✅ „Re-Check-Abo: monatliche Überprüfung mit Diff-Report"

❌ „Vollreport für 100% BFSG-Konformität"
❌ „Profi-Paket inkl. Anwalts-Prüfung"
❌ „Re-Check garantiert dauerhafte Konformität"
```

### Hero-Headlines
```
✅ „Prüf deinen BFSG-Score in 60 Sekunden"
✅ „Findings + Fix-Plan ab 199 €"
✅ „Made in Germany. Ohne Abo-Zwang. Mit Disclaimer."

❌ „BFSG-konform in 60 Sekunden"
❌ „Garantierter WCAG-Audit"
❌ „Anwalts-geprüfte Reports"
```

### Feature-Listen
```
✅ „Automatischer Scan nach WCAG 2.1 AA-Methodik"
✅ „BFSG-spezifische Prüfregeln (axe-core + eigene)"
✅ „Cookie-Banner-Check nach TDDDG-Anforderungen"

❌ „BFSG-Konformitäts-Zertifikat"
❌ „Anwalts-geprüfte Test-Methodik"
❌ „Garantierte TDDDG-Compliance"
```

---

## Bonus: Sichere Vergleichs-Sprache (§ 6 UWG)

Wenn du Vergleichs-Pages baust (`/vergleich/{domain1}-vs-{domain2}`):

✅ **Erlaubt:**
- „Site A erreicht WCAG-Score 75/100, Site B erreicht 42/100"
- „Beide Sites haben Findings im Bereich Kontrast"
- „Objektiv messbare Eigenschaft: Alt-Attribute fehlend"

❌ **VERBOTEN:**
- „Site A ist besser als Site B"
- „Site B ist nicht-konform" (das ist Bewertung, nicht Fakt!)
- „Site B sollte sich schämen"
- „Site B = schlechte Qualität"

**Regel:** Nur OBJEKTIV MESSBARE Score-Werte und Findings nennen. Keine Adjektive wie „besser", „schlechter", „peinlich", „schockierend".

---

## Check nach Anpassung

- [ ] grep nach „BFSG-konform" → keine Treffer mehr (außer in Disclaimern!)
- [ ] grep nach „garantiert" → kein Versprechen außer Geld-zurück-Garantie
- [ ] grep nach „rechtssicher" → keine Treffer
- [ ] grep nach „Anwalt" → nur in Disclaimern + Trigger-Liste
- [ ] grep nach „TÜV", „DEKRA", „akkreditiert" → keine Treffer
- [ ] Hero-Headlines reviewed
- [ ] Feature-Listen reviewed
- [ ] AGB-§Y Leistungsbeschreibung mit Best-Effort + ohne Garantie
- [ ] PDF-Report-Footer mit Disclaimer
- [ ] Marketing-Templates (Press Release, Show HN, etc.) reviewed
