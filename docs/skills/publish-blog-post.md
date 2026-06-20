---
name: publish-blog-post
description: SEO-optimierten Blog-Artikel schreiben → PR → Newsletter. Trigger "Neuer Blog-Artikel", "Blog-Post über X".
---

# Blog-Post-Skill

## Input
- Thema (Titel oder Stichwort)
- Optional: Ziel-Keyword

## Schritte

### 1. Recherche
- `marketing/seo-content-plan.md` lesen — passt das Thema rein?
- `marketing/google-ads-keywords.csv` lesen — verwandte Keywords
- WebSearch nach 3 Top-Quellen zum Thema (Stand 2026)

### 2. Outline
3 Sektionen + Intro + CTA:
```
H1: [Titel mit Haupt-Keyword]
- Lead (3 Sätze, Hook + Problem)
H2: Was ist [Thema]?
- 200 Wörter
H2: Wie prüft man [Thema]?
- 300 Wörter mit konkretem Beispiel
H2: Was kostet die Umsetzung?
- 200 Wörter mit Preis-Tabelle / Aufwand
CTA: Gratis-Scan auf bfsg-fix.de
```

### 3. Draft schreiben
- 800–1.200 Wörter total
- Haupt-Keyword 5–8× verteilt (nicht stuffing)
- 2–3 interne Links (zu anderen Blog-Artikeln oder Landing)
- Externe Links zu offiziellen Quellen (BFSG-Gesetzestext etc.)
- Bilder: Canva MCP für 1 Header + 1 Inline-Visual

### 4. PR
- File-Path: `landingpage-next/content/blog/[slug].md`
- Frontmatter: title, description, date, keywords, ogImage
- PR-Titel: `blog: [Titel]`

### 5. Newsletter
Brevo MCP `email_campaign_management_create_email_campaign`:
- Empfänger-Liste: bestehende Scan-Leads (Opt-In)
- Betreff: „Neuer Artikel: [Titel]"
- Excerpt + Link zum Vollartikel
- **Status: Draft (NICHT auto-senden!)** — User klickt Senden

### 6. Output
```markdown
## 📝 Blog-Post bereit
- Titel: [...]
- PR: #X (https://github.com/...)
- Newsletter-Draft in Brevo: [Link]
- Geschätzt SEO-Impact: 3–6 Monate bis Top-10 für „[Keyword]"
```
