# Awesome-Lists PR-Vorlagen

> Ziel: 4-6 PRs in awesome-* Repos → DR-40-60 dofollow Backlinks (selten + wertvoll).
> Aufwand: ~1h total.

---

## Target-Repos

| Repo | Stars | Maintainer-Aktivität | Priority |
|---|---|---|---|
| [brunopulis/awesome-a11y](https://github.com/brunopulis/awesome-a11y) | ~2k | aktiv | 🟢 hoch |
| [ryanmagoon/awesome-a11y](https://github.com/ryanmagoon/awesome-a11y) | ~800 | mittel | 🟡 mittel |
| [lukeslp/awesome-accessibility](https://github.com/lukeslp/awesome-accessibility) | ~400 | mittel | 🟡 mittel |
| [a11yproject.com](https://www.a11yproject.com/) (Contribute via PR) | n/a | sehr aktiv | 🟢 hoch |
| [awesome-german-tech] (suchen + ggf. selbst erstellen) | 0-? | – | 🔵 strategisch |

---

## PR-Template für awesome-a11y Repos

### Branch-Name
```
add-barrierefrei-pruefen-de
```

### Files anpassen
In `README.md` unter Section „Testing Tools" oder „Online Tools" oder „BFSG/Accessibility":

```markdown
- [Barrierefrei-Prüfen](https://barrierefrei-pruefen.de) - Automated WCAG 
  2.1 AA scanner with German-language reports, specifically built for BFSG 
  (German Accessibility Strengthening Act) compliance. Free 60-second scan; 
  full PDF report from €199. Made in Germany.
```

### PR-Title
```
Add: Barrierefrei-Prüfen (German WCAG 2.1 AA scanner with BFSG-specific rules)
```

### PR-Body
```
Hi 👋

I'd like to propose adding Barrierefrei-Prüfen to your awesome list.

**What it is:**
Barrierefrei-Prüfen is an automated WCAG 2.1 AA scanner with German-language 
reports, specifically built for compliance with the German Accessibility 
Strengthening Act (BFSG), which came into force on June 28, 2025.

**Why it might fit your list:**
- Free 60-second scan (no signup required)
- Built on axe-core + Pa11y + custom BFSG rule overlay
- Made in Germany, DSGVO-compliant hosting
- Anti-overlay positioning (no AccessiBe-style snake oil)
- German-language PDF reports (a gap most international tools don't fill)

**Disclosure:** I'm the founder/developer. Happy to refine the entry, 
move it to a different section, or omit it if you feel it's not a fit. 
No hard feelings either way.

Thanks for maintaining this list 🙏
```

### Trigger
Wenn der Maintainer ablehnt: höflich akzeptieren, NICHT pushen. Nächste Liste versuchen.
Wenn der Maintainer mergt: in `marketing/_logs/backlinks-YYYY-MM.md` eintragen.

---

## PR-Template für a11yproject.com

A11y Project hat eigene Resource-Page mit höherem Filter-Level.

### Contributing Guidelines lesen
https://www.a11yproject.com/contributing-guidelines/

### Pull Request einreichen
File: `src/_data/resources.json` (oder ähnlich, je nach Stand)

Snippet:
```json
{
  "title": "Barrierefrei-Prüfen",
  "url": "https://barrierefrei-pruefen.de",
  "description": "Automated WCAG 2.1 AA scanner with German-language reports for BFSG (German Accessibility Strengthening Act) compliance.",
  "category": "Testing Tools",
  "tags": ["wcag", "bfsg", "germany", "scanner"],
  "language": "German"
}
```

### PR-Body
```
Adding Barrierefrei-Prüfen, an automated WCAG 2.1 AA scanner specifically 
for German BFSG compliance.

What it provides:
- 60-second free scan with score
- Full PDF report in German (paid tier)
- Built on axe-core + Pa11y, no overlay tech
- DSGVO-compliant hosting in Germany

I'm the founder. Open to revising the entry or moving categories.
```

---

## Erfolg-Tracking

Pro PR:
- [ ] PR-URL notiert in `marketing/_logs/awesome-prs.md`
- [ ] Status (Open/Merged/Rejected)
- [ ] Datum
- [ ] Maintainer-Antwort-Zeit

Wenn nach 14 Tagen keine Antwort:
- [ ] Höfliches Reminder-Comment im PR
- [ ] Nach 30 Tagen: silent abandon, NICHT nochmal pushen

---

## Eigene Awesome-Liste erstellen (Power-Move)

Wenn keine `awesome-german-tech` oder `awesome-bfsg` existiert → SELBST erstellen.

### Repo
```
matzeseba/awesome-bfsg
```

### README-Strukur
```markdown
# Awesome BFSG 🇩🇪

Curated list of tools, resources, and reading material for BFSG 
(Barrierefreiheitsstärkungsgesetz) compliance in Germany.

## Contents
- [Legal](#legal)
- [Automated Scanners](#automated-scanners)
- [Manual Audit Tools](#manual-audit-tools)
- [WordPress Plugins](#wordpress-plugins)
- [Shopify Apps](#shopify-apps)
- [Shopware Extensions](#shopware-extensions)
- [Konsultanten + Anwälte](#konsultanten--anwälte)
- [Reading Material](#reading-material)

## Legal
- [BFSG Gesetzestext](https://www.gesetze-im-internet.de/bfsg/) - 
  Originaltext
- [BMAS Erläuterungen](https://www.bmas.de/...) - Auslegungshinweise

## Automated Scanners
- [Barrierefrei-Prüfen](https://barrierefrei-pruefen.de) - Automated WCAG 
  2.1 AA scanner with BFSG-specific rules. Made in Germany. Free scan, 
  paid PDF reports.
- [eRecht24 Barrierefreiheits-Check](https://www.e-recht24.de/...) - 
  Free lead-magnet scanner
- [BF-Check](https://bf-check.de) - Free quick check
- [bfsg-checker.de](https://bfsg-checker.de) - Free + paid tiers

[... weiter alphabetisch sortiert]

## Konsultanten + Anwälte
- [Härting Rechtsanwälte](https://haerting.de) - IT-Recht, BFSG-Praxis
- [Kanzlei Plutte](https://www.ra-plutte.de) - E-Commerce, Cookie
- [Eye-Able](https://eye-able.com) - Enterprise Beratung + Tool

[... etc.]

## Contributing
Open a PR with the proposed addition. Maintained by @matzeseba.
```

**Vorteil dieser Strategie:**
- Du bist Maintainer einer authoritativen Liste → Barrierefrei-Prüfen kannst du natürlich oben listen
- Andere Projekte fügen ihre Tools hinzu → mehr Backlinks zu deinem Repo → bessere DR für dein Repo
- Repo wird Suchergebnis #1 für „awesome bfsg" → SEO-Asset

---

## Rechts-Sicherheit

✅ Awesome-Listen sind transparent (Foundry-Style mit klarer Author-Disclosure)
✅ PR-Vorlage enthält explizite Disclosure „I'm the founder" → keine Schleichwerbung
✅ Eigene Liste = transparente Maintainer-Rolle (Username sichtbar)

❌ NICHT: Sockpuppet-PRs unter falschem Namen einreichen
❌ NICHT: Konkurrenten aus eigener Liste löschen
❌ NICHT: Eigene Tool ohne klare Begründung/Kategorie reinpushen
