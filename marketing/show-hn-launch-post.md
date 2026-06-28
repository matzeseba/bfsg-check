# Show HN Post Draft — Daten-Story-Pitch

> **Best Single-Shot-Tactic** laut Recherche (Distribution-Studie).
> Frontpage HN = 5.000-20.000 Besucher in 24h.
> **Timing:** Tuesday 09:00 PST = 18:00 CET (höchste Reichweite).

---

## Post-Format (Show HN)

> **WICHTIG — EHRLICHKEITS-REGEL:** Nur belegbare Behauptungen im Post.
> Unbelegte Statistiken (z. B. "89% der Sites", "10.000 Scans") ERST einfügen,
> wenn das Dataset tatsächlich existiert und public ist. HN-Community erkennt
> und bestraft aufgeblasene Launch-Claims sofort — das vernichtet Reputation.
> AKTUELLE VERSION: Ehrlicher Tool-Launch ohne Dataset-Behauptungen.
> VERSION 2 (nach erstem echten Dataset): Datenstory-Version weiter unten.

---

### VERSION 1 — Jetzt launchbar (ehrlich, ohne Dataset)

**Title (80 chars max):**
```
Show HN: I built a WCAG 2.1 AA compliance scanner for German websites (BFSG law)
```

**Body:**

```
Hi HN,

I'm Matthias, a solo developer from northern Germany. I built 
barrierefrei-pruefen.de — an automated accessibility scanner for German 
websites, with German-language PDF reports and fix recommendations.

**Why this exists:** Germany's BFSG (Barrierefreiheitsstärkungsgesetz /
Accessibility Strengthening Act) came into force June 28, 2025. Every B2C
website with >10 employees must meet WCAG 2.1 AA. German law firms have
been sending cease-and-desist letters since August 2025 (covered by WBS
Legal, Heise, t3n).

**What the scanner does:**
- Free 60-second scan: score (0–100) + top findings
- Full PDF report in German: all WCAG 2.1 AA issues with code-level fix
  suggestions (€199 one-time)
- Multi-page crawl + implementation plan + 30-day support (€499)
- Cookie banner compliance check per TDDDG (€49/€79)

**Tech stack:**
- Node.js + Express + Playwright (headless browser)
- axe-core + Pa11y as base engines, with custom BFSG-specific rules
- Hetzner CPX22 in Nürnberg (German data residency, GDPR-compliant)
- Stripe Live payments, Brevo SMTP for delivery

**What I learned building this:**
- axe-core misses ~30–50% of real-world WCAG failures (color contrast
  calculation differs depending on rendering engine and font anti-aliasing)
- Pa11y + axe-core together have meaningful but not full overlap —
  combining them catches more, but manual testing is still irreplaceable
- Overlay tools (AccessiBe, UserWay) are explicitly called out by German
  accessibility watchdogs as insufficient — the market wants honest audits
- Building a scanner for German-specific law required reading the actual
  BFSG text, not just mapping to WCAG (there are BFSG-specific exemptions
  and scope nuances)

**What I don't claim:**
The tool gives you an automated technical analysis — not a legal guarantee
of conformity. No tool can. The report says so explicitly.

**Honest status:** Just launched. Zero customers so far. If you run a
German-market website or know someone who does, I'd genuinely love
feedback on the scan results (the free scan requires no login).

I'm the founder. Happy to answer questions about WCAG internals, the
German compliance landscape, or building solo SaaS in Germany.

https://barrierefrei-pruefen.de — free scan, no login required.
```

---

### VERSION 2 — Erst verwenden wenn Dataset real existiert

> [BELEG NÖTIG] Die folgende Version enthält Statistiken aus einem
> noch nicht existenten aggregierten Dataset. Sie darf ERST gepostet werden,
> wenn bfsg-check-dataset auf GitHub public ist und die Zahlen aus echten
> Scan-Daten stammen (nicht aus Schätzungen). Vorher ist das Schleichwerbung
> mit falschen Tatsachenbehauptungen — UWG §5 + HN-Bann-Risiko.

**Title V2 (erst nach echtem Dataset):**
```
Show HN: I scanned N .de e-commerce sites for WCAG compliance — dataset + tool
```

**Was zu belegen wäre vor Posting:**
- [ ] Tatsächliche Anzahl gescannter Sites (nicht geschätzt)
- [ ] Aggregierter CSV-Datensatz public auf GitHub (MIT-Lizenz, kein PII)
- [ ] Statistiken aus echten Scan-Ergebnissen berechnet (nicht angenommen)
- [ ] README mit Methodik: welche Sites, wie gesampelt, welche axe-Regeln

Erst dann: Title mit echter Zahl, Body mit echten Statistiken.

---

## Pre-Launch-Checklist

**24h vor Posting:**
- [ ] Landing-Page mobile-optimized + Lighthouse-Score ≥ 90
- [ ] Server-Load-Test: Cloudflare-DDoS-Protection aktiv
- [ ] Stripe-Live-Mode getestet (Test-Charge 1€ + Refund)
- [ ] Email-Capture-Funnel funktioniert (kein 500-Error)
- [ ] HN-Account hat genug Karma (>10 — sonst Auto-Hidden)
- [ ] Dataset-Repo auf GitHub vorbereitet (public, README, MIT-License)
- [ ] OG-Image für Twitter/LinkedIn-Shares vorhanden

**Posting-Tag:**
- [ ] Posting um exakt 18:00 CET (Tuesday/Wednesday)
- [ ] Erste Stunde: alle 5-10 Min HN-Seite refreshen
- [ ] JEDE Frage in <10 Min beantworten (HN-Algorithmus liebt das)
- [ ] Bei kritischen Kommentaren: NICHT defensiv, sondern "Good point — fixed in v1.1"
- [ ] NICHT um Upvotes betteln (Bann-Risiko)
- [ ] NICHT mit eigenen Sock-Puppets upvoten (Shadow-Ban-Risiko)

**Falls Frontpage (Top 30):**
- [ ] Hetzner-Server: htop + Cloudflare-Analytics offen halten
- [ ] Notion-DB für eingehende Sales-Anfragen vorbereiten
- [ ] Brevo-SMTP-Quota überprüfen (Free-Plan: 300/Tag — bei >500 Sales-Mails Upgrade)

---

## Erfolgs-Szenarien

| Position | Erwartete Besucher | Sales (1-2%) |
|---|---|---|
| Frontpage Top 1-3 | 15.000-30.000 | 30-150 |
| Frontpage Top 4-10 | 8.000-15.000 | 15-80 |
| Frontpage Top 11-30 | 3.000-8.000 | 5-40 |
| Second Page | 500-2.000 | 0-10 |
| Hidden (low karma) | <100 | 0 |

**Realistisch für 1. HN-Post von Solo-Founder:** Second-Page bis Top 30 = 1-10 Sales + 100-200 Newsletter-Subscribers + 5-20 Backlinks.

---

## Follow-Up-Posts (alle 4-6 Wochen)

| Post-Idee | Hook |
|---|---|
| „Show HN: I open-sourced my BFSG-CLI" | nach npm-Release Tag 14 |
| „1 month after Show HN: Lessons learned" | retrospective, 30 days post |
| „Show HN: Chrome Extension for BFSG-Score on any site" | nach Extension-Release |
| „Show HN: WordPress plugin with 1000 BFSG-rules" | nach WP-Release |
| „2 years of BFSG: Did the abmahn-wave actually help?" | Juni 2027 retrospective |

---

## Mirror-Posts (gleicher Inhalt, andere Plattformen)

| Plattform | Anpassung |
|---|---|
| **IndieHackers** | Add: "Solo Bootstrap, 6 weeks built, 0 funding, 100% MRR-pursuit" |
| **Reddit r/SaaS** | Add: "Built solo, looking for early users, AMA in comments" |
| **Reddit r/selbststaendig** (DE) | DE-translation, focus on BFSG-Pflicht |
| **Reddit r/de** | DE-version, focus on Daten-Story |
| **Hacker News Show HN** | Original |
| **Lobsters** (Tech Community) | Code-fokus, weniger Marketing |
| **Mastodon @barrierefrei-pruefen** | Karusell-Post mit Findings |

**WICHTIG:** Auf jeder Plattform den Sub-Reddit / Community-Regeln respektieren. Bei Cross-Posting innerhalb 24h ALLEN Posts zeitlich versetzt für maximalen Reach.

---

## Rechtliches (UWG/Schleichwerbung)

✅ **Show HN ist transparent** (offizielles HN-Format für eigene Produkte) → keine Schleichwerbung
✅ **Reddit r/SaaS / r/selbststaendig:** ähnlich, ABER:
- [ ] In Profil-Bio: „Founder of barrierefrei-pruefen.de" → Transparenz
- [ ] In Post: „my product" / „I built" → klare Offenlegung
- [ ] Keine Sockpuppets in Kommentaren
- [ ] Auf Folge-Posts: nicht öfter als alle 4-6 Wochen pushen

❌ **NICHT:**
- Pseudonymes Pushen in Foren (UWG §5a IV Schleichwerbung — bis 500.000€ Strafrahmen!)
- Mass-DMs auf Reddit
- Auto-Posten via Bots
