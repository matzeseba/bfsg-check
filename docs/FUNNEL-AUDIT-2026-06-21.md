# Funnel-Audit bfsg-fix.de — 21.06.2026

> Conversion-/Legal-/Trust-/SEO-/Offer-Review der Live-Site. Ziel: maximale **Conversion pro Besucher**, bevor bezahlter Traffic läuft — der einzige Wachstums-Hebel, der nicht an Karte/Konto/Ad-Freigabe hängt.
>
> **Methodik-Hinweis:** Ein geplanter mehrstufiger Multi-Agent-Audit (6 Dimensionen + adversariale Verifikation) wurde durch das Session-Token-Limit abgebrochen. Dieser Report ist die **fokussierte Einzel-Analyse** auf Basis der real geprüften Dateien + Live-Begehung (Computer Use) + Selbst-Scan. Die volle adversariale Runde kann nach Limit-Reset nachgeholt werden.

---

## Executive Summary

Der Funnel ist in **gutem Zustand**: Gratis-Scan → Teaser → Checkout → Stripe-Live funktioniert E2E (live verifiziert), Legal-Wortlaut ist überwiegend sauber, die §312j-Button-Lösung + §356a-Consent sind korrekt, und die eigene Startseite besteht den **eigenen Scanner mit 100/100 (Note A, 0 Mängel)** — ein starkes, ehrliches Trust-Asset.

Größte Hebel jetzt: (1) zwei unbelegte Trust-Claims wurden bereits entfernt (PR #40), (2) ein irreführender Preis-Toggle wird gefixt (dieser PR), (3) der Selbst-Scan-Score sollte als sichtbares Trust-Signal genutzt werden (kompensiert fehlende Testimonials).

---

## 🟢 Quick-Wins — sicher umgesetzt

| Finding | Datei | Fix | Status |
|---|---|---|---|
| Fake-Presse-Leiste „Bald berichtet in" (TechCrunch/heise/…) erweckt Eindruck echter Berichterstattung | `LogoCloud` / `app/page.tsx` | Sektion entfernt | ✅ PR #40 |
| Erfundene Stat „5.247 Websites geprüft" (hardcodierter Platzhalter) | `lib/config.ts` | → belegbares „80+ Prüfregeln (EN 301 549)" | ✅ PR #40 |
| **Preis-Toggle „Monatlich / Jährlich −2 Monate"** prominent über reinen Einmal-Paketen (199/499/49/79 €) — wirkt nur auf Abos, das einzige Abo ist deaktiviert → verwirrend + grenzwertig irreführend (UWG §5) | `components/PricingCards.tsx` | Toggle nur zeigen, wenn ein **kaufbares** Abo existiert (self-restoring, sobald Abo live) | ✅ dieser PR |

---

## 🟡 Matthias-Entscheidungen

1. **Seitentitel „Ist Ihre Website BFSG-konform?"** enthält das intern verbotene Wort „BFSG-konform". Als rhetorische *Frage* ist es rechtlich deutlich schwächer als eine Garantie — und es ist das stärkste SEO-Keyword (`bfsg konform`). **Empfehlung:** Vertretbar zu behalten; wer maximal vorsichtig sein will, testet eine Variante wie „BFSG-Check: Website auf Barrierefreiheit prüfen" oder „Ist Ihre Website barrierefrei nach BFSG?". Trade-off SEO-Stärke ↔ UWG-Vorsicht. (Betrifft `lib/config.ts` `SITE.title` + `HERO.headlineEmph`.)

2. **Selbst-Scan als Trust-Badge nutzen** (stärkste empfohlene Maßnahme). Unsere Startseite erreicht im eigenen Scanner **100/100 / Note A**. Das ist ehrlich, belegbar und extrem glaubwürdig für ein Barrierefreiheits-Produkt — und kompensiert die (bewusst) fehlenden Testimonials. **Empfehlung:** kleines Badge/Zeile einbauen, z. B. „Diese Seite: WCAG-Score 100/100 — wir prüfen, was wir verkaufen." Niedriger Aufwand, hoher Trust-Effekt. (Bewusst NICHT autonom umgesetzt — Platzierung/Wortlaut ist Design-Entscheidung.)

3. **Deaktiviertes Abo „Bald verfügbar"** in den Pricing-Cards. Baut Vorfreude vs. erzeugt Unruhe/Klutter am Kaufpunkt. **Empfehlung:** vertretbar zu lassen; falls Conversion-Fokus, bis zum Abo-Launch ausblenden (`PACKAGES` ohne `abo` an die Homepage-`PricingCards` geben). Niedrige Priorität.

---

## 🔵 Backlog (niedrig/mittel)

- **Hero-Headline-Fade-in:** Die H1 fadet per Animation ein (~1 s unsichtbar beim Laden). LCP-/Conversion-Detail; `prefers-reduced-motion`-Pfad prüfen. Bewusstes Design — nur anfassen, falls Core-Web-Vitals leiden.
- **Volle adversariale A11y-Runde:** Selbst-Scan = 100/A deckt automatisch prüfbare Punkte ab; manuelle Aspekte (Fokus-Reihenfolge, aria-Labels an Scan-Form/Checkout-Modal/Theme-Toggle, Reduced-Motion) wurden hier nicht erschöpfend geprüft (Workflow-Limit). Für nächste Session.

---

## Bewertung pro Dimension

| Dimension | Urteil |
|---|---|
| **Conversion** | Stark — klarer Hero, Gratis-Scan-Hook, glaubwürdiger Mock-Report, Stripe-Transparenz. Einziger echter Leak: der Preis-Toggle (gefixt). |
| **Legal / Wording** | Sehr solide — compliant Copy, korrekte Disclaimer (`LEGAL_NOTE`), §312j-Button, §356a-Consent. Offener Punkt: Titel-Wort „BFSG-konform". |
| **Trust** | Gut — 30-Tage-Geld-zurück, DSGVO, DE-Hosting, ehrliche Differentiators statt Fake-Quotes. Hebel: Selbst-Scan-Badge. |
| **SEO** | Gut — sauberes metadata-Pattern, Sitemap, 6 neue High-Intent-Pillar-Pages (PR #42) mit JSON-LD + interner Verlinkung. |
| **Self-A11y** | Ausgezeichnet — eigener Scanner gibt der eigenen Startseite 100/A / 0 Mängel. Glaubwürdigkeit gesichert. |
| **Offer / Pricing** | Solide — klare Pauschalpreise, Anchoring über Profi (featured). Fix: Toggle; Entscheidung: Abo-Anzeige. |

---

*Erstellt im Co-Founder-Agenten-Sprint, 21.06.2026.*
