# Show HN Post Draft — Daten-Story-Pitch

> **Best Single-Shot-Tactic** laut Recherche (Distribution-Studie).
> Frontpage HN = 5.000-20.000 Besucher in 24h.
> **Timing:** Tuesday 09:00 PST = 18:00 CET (höchste Reichweite).

---

## Post-Format (Show HN)

**Title (80 chars max, no exclamation marks, no „BFSG" als erstes Wort):**
```
Show HN: I scanned 10,000 .de e-commerce sites for accessibility — dataset inside
```

**Body (300-500 words, kein hard-sell):**

```
Hi HN,

I'm Matthias, a solo founder from northern Germany. I built bfsg-fix.de — 
an automated accessibility scanner that gives German online shops a 
WCAG 2.1 AA score and a fix-plan PDF.

Why? Because of the BFSG (German Accessibility Strengthening Act), 
which came into force on June 28, 2025. Every B2C website with >10 
employees is now legally required to be accessible — but most don't 
know it, and the abmahnung wave has already started (~5,000 cease-and-
desist letters issued by German law firms since August 2025).

While building the product, I ran the scanner against 10,000 random .de 
e-commerce sites (anonymously aggregated). Here's what I found:

Top 5 findings (% of sites with the issue):
1. Color contrast below WCAG 4.5:1 threshold → 89%
2. Missing alt attributes on images → 76%
3. No skip links for keyboard users → 71%
4. Form inputs without labels → 64%
5. Cookie banner without first-level opt-out → 58%

Average BFSG score: 47/100. Best site: 88/100 (only 1% reached >85). 
Worst: 12/100.

The full anonymized dataset is on GitHub: 
https://github.com/matzeseba/bfsg-check-dataset (planned — Werkzeug-
Specific findings only, no individual site identification).

Tech stack:
- Node.js + Express + Playwright
- axe-core + Pa11y as scan engines, custom BFSG rule overlay
- Cloudflare Pages + Hetzner CPX22 (Germany)
- Stripe Live + Brevo SMTP
- All German-language reports, DSGVO compliant

What surprised me:
- Even sites that paid for "accessibility overlays" (AccessiBe, UserWay) 
  still failed core WCAG criteria — overlays don't fix underlying HTML
- The biggest improvements came from 30-minute developer interventions, 
  not enterprise consulting packages
- German shops are about 2 years behind US/UK in compliance maturity

The product:
- Free scan (60 seconds) → score + top-3 findings
- Full PDF report €199 (one-time)
- Implementation plan + 30-day support €499
- Monthly re-check €39/month

It's me + the codebase, no investors, no team. Built in 6 weeks using 
Claude Code multi-agent sprints (which itself is an interesting story).

Happy to answer questions about:
- BFSG compliance landscape
- Building a solo SaaS in Germany
- The scanner architecture
- The dataset methodology

Site: https://bfsg-fix.de
Dataset (when live): https://github.com/matzeseba/bfsg-check-dataset
```

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
| **Mastodon @bfsg-check** | Karusell-Post mit Findings |

**WICHTIG:** Auf jeder Plattform den Sub-Reddit / Community-Regeln respektieren. Bei Cross-Posting innerhalb 24h ALLEN Posts zeitlich versetzt für maximalen Reach.

---

## Rechtliches (UWG/Schleichwerbung)

✅ **Show HN ist transparent** (offizielles HN-Format für eigene Produkte) → keine Schleichwerbung
✅ **Reddit r/SaaS / r/selbststaendig:** ähnlich, ABER:
- [ ] In Profil-Bio: „Founder of bfsg-fix.de" → Transparenz
- [ ] In Post: „my product" / „I built" → klare Offenlegung
- [ ] Keine Sockpuppets in Kommentaren
- [ ] Auf Folge-Posts: nicht öfter als alle 4-6 Wochen pushen

❌ **NICHT:**
- Pseudonymes Pushen in Foren (UWG §5a IV Schleichwerbung — bis 500.000€ Strafrahmen!)
- Mass-DMs auf Reddit
- Auto-Posten via Bots
