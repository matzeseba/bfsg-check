# Technische Machbarkeit: Skalierung landingpage-next auf hunderte–tausende Seiten

> Rolle: Machbarkeits-Analyst (Technik). Frage: Kann der bestehende Next.js-Stack (`landingpage-next/`) + Hetzner CPX22 + Caddy hunderte bis wenige tausend Seiten ausliefern? NUR technische Grenzen, keine Policy-Bewertung (dazu: `scaled-abuse-penalties.md`, `1000-pages-claim.md`, `multidomain-pbn-legal.md`).
> Recherche-Datum: 09.07.2026. Codebasis geprüft: `landingpage-next/app/sitemap.ts`, `robots.ts`, `next.config.ts`, `package.json`, `Dockerfile`; `deployment/docker-compose.yml`, `Caddyfile`, `cloud-init.yaml`; `.github/workflows/deploy.yml`. Web-Fakten via Perplexity, mit Quelle+Datum.

---

## Kurzfassung (TL;DR)

**Technisch machbar: ja, bis in den niedrigen vierstelligen Bereich (~500–2.000 Seiten) — aber NICHT mit der aktuellen Deploy-Architektur unverändert.** Der limitierende Faktor ist nicht Next.js an sich (Static Site Generation skaliert nachweislich auf zehntausende Seiten), sondern zwei repo-eigene Engineering-Entscheidungen, die für 23 handgeschriebene Seiten sinnvoll waren, bei hunderten/tausenden Seiten aber zu echten Blockern werden:

1. **Der Production-Build läuft auf dem Live-Server selbst** (SSH → `docker compose up -d --build`), nicht auf einem CI-Runner — auf einer 3-vCPU/4-GB-Maschine, die gleichzeitig bezahlte Scans (Playwright/Chromium, RAM-hungrig) ausliefert.
2. **Jeder Deploy baut IMMER alle Seiten komplett neu** (kein inkrementeller Next.js-Cache im Docker-Build), plus ein hartes **15-Minuten-Timeout** in der GitHub-Actions-Pipeline.

Bei ~20–23 Seiten sind das unsichtbare Nicht-Probleme. Bei 1.000+ Seiten werden sie zum harten Deploy-Risiko (Timeout, OOM auf dem Live-Server, Downtime für zahlende Kunden während jedes Deploys). Das ist lösbar (siehe Abschnitt "Was sich ändern muss"), aber es ist echte Vorarbeit, kein "einfach mehr Seiten committen".

**Kein Blocker:** Sitemap-Größenlimit, robots.txt, Disk-Speicher, Next.js selbst. Diese sind bei "hunderte bis wenige tausend Seiten" technisch bedeutungslos (siehe unten).

---

## 1. Aktueller Zustand — der wichtigste Fakt zuerst

`landingpage-next/app/` hat **23 Seiten, alle als einzelne handgeschriebene `page.tsx`-Dateien** (23 `page.tsx` gezählt, `du -sh app/` = 437 KB). Es gibt **keine einzige dynamische Route** (`[slug]/page.tsx` mit `generateStaticParams()`). `sitemap.ts` ist ein **hartcodiertes Array** von 18 URLs — keine Datenquelle, keine Schleife.

**Konsequenz:** Der aktuelle Aufbau skaliert nicht auf "hundert bis tausend Seiten" durch einfaches Weiterschreiben. Um programmatisch zu skalieren, braucht es zwingend:
- `app/[branche]/[slug]/page.tsx` (oder ähnlich) mit `generateStaticParams()`, das die Slug-Liste aus einer Datenquelle zieht (z. B. einer zur Build-Zeit generierten JSON-Datei aus `scanner/out/`-Aggregaten, siehe `scan-dataset-aggregat`-Skill)
- `sitemap.ts` umgeschrieben auf denselben Datensatz (aktuell unmöglich, weil hartcodiert)

Das ist eine Neuentwicklung (dynamische Route + Datenpipeline von Scan-Ergebnissen → Content), kein Config-Flag. Next.js 16 unterstützt das nativ und gut — das ist der unproblematische Teil.

---

## 2. Static Generation vs. ISR — welches Verfahren passt

`next.config.ts` setzt `output: "standalone"` — das ist Next.js' Server-Modus (Node-Prozess rendert vorgebaute Seiten aus, läuft in `Dockerfile` als `CMD ["node", "server.js"]`). Für hunderte bis niedrige Tausende **rein informationaler, selten wechselnder** Marketing-/Ratgeberseiten ist **reines SSG (Static Site Generation) zur Build-Zeit** die richtige Wahl — kein ISR (Incremental Static Regeneration) nötig:

- ISR (`revalidate`) lohnt sich, wenn Content sich häufig ändert und ein Full-Rebuild zu teuer wäre. Bei BFSG-Fuchs-Ratgeberseiten (Quartals-Updates laut `aeo-2026.md` Finding 6) ist ein Full-Rebuild pro Änderungs-Batch technisch unproblematisch — SSG bleibt einfacher, vollständig vorhersagbar und passt zum bestehenden "immer alles neu bauen"-Deploy-Muster.
- Wichtig: **ISR würde das aktuelle Deploy-Problem (Build läuft auf dem Live-Server) NICHT lösen**, sondern nur verlagern (Revalidation-Requests laufen dann zur Laufzeit auf derselben 4-GB-Maschine). Der eigentliche Fix ist strukturell (Abschnitt 5), nicht SSG-vs.-ISR.

**Fazit:** SSG ist der richtige technische Ansatz für diesen Content-Typ und diese Skala. Next.js 16 selbst ist dafür nicht der Flaschenhals.

---

## 3. Build-Zeit-Skalierung — was Next.js tatsächlich leistet

Reale, dokumentierte Next.js-SSG-Benchmarks (Perplexity-Recherche 09.07.2026, mehrere unabhängige Quellen):

| Fall | Seiten | Build-Zeit (reine Generierung) | Quelle |
|---|---|---|---|
| Next.js-13-Testprojekt, einfacher Content, lokale Maschine | 5.000 | ~180 s (~1.670 Seiten/Min) | dev.to Case-Study, "Can Next.js Handle 5000 Pages?" |
| Vercel-Produktions-Deploy, echtes Daten-Fetching | ~3.000 | ~8 Min Build (~375 Seiten/Min), aber 30–35 Min End-to-End inkl. Upload | GitHub Discussion vercel/next.js #14122 |
| DigitalOcean-„7-Dollar"-Droplet (sehr schwache Hardware) | 10.000+ | ~90 Min (~111 Seiten/Min) | Reddit r/nextjs, zitiert 2022–2025 |
| Vercel-eigene Doku | — | Hartes **45-Min-Build-Limit** pro Deployment; Empfehlung ab „tausenden Seiten": nicht alles zur Build-Zeit vorrendern, sondern ISR/On-Demand | vercel.com/kb (Guide „Reduce build time") |

**Ableitung für BFSG-Fuchs (2–4 vCPU / 4–8 GB Klasse, einfache Marketing-Seiten ohne schweres Daten-Fetching):** realistischer Korridor **~100–400 Seiten/Minute** für den reinen Next.js-Build-Schritt. Für den geplanten Zielbereich:
- **500 Seiten:** ~1,5–5 Min Build
- **1.000 Seiten:** ~2,5–10 Min Build
- **3.000 Seiten:** ~8–30 Min Build
- **5.000 Seiten:** ~12–50 Min Build

Diese Zahlen sind Richtwerte aus fremden Setups, keine gemessenen Werte für diesen Stack — aber sie zeigen die Größenordnung: **bis ~1.000–1.500 Seiten bleibt der reine Next.js-Build-Schritt im niedrigen einstelligen bis knapp zweistelligen Minutenbereich**, darüber wächst das Risiko, an harte Zeitlimits zu stoßen (siehe Abschnitt 4).

---

## 4. Der eigentliche technische Blocker: WO wird gebaut

Das ist der Punkt, der in generischen Next.js-Benchmarks nicht auftaucht, weil er BFSG-Fuchs-spezifisch ist:

**`.github/workflows/deploy.yml` baut den Next.js-Production-Build NICHT auf einem GitHub-Actions-Runner.** Der Workflow macht nur `ssh` zum Hetzner-Server und führt dort `docker compose up -d --build` aus (Zeile 91–92). Der komplette `npm run build` (inkl. `next build`) läuft also **auf der Produktionsmaschine selbst**, im `builder`-Stage des `Dockerfile` (Zeile 10–16), während dieselbe Maschine gleichzeitig:

- den `app`-Container mit **Playwright/Chromium-Scans** für zahlende Kunden ausführt (`shm_size: 1gb`, `mem_limit: 3g` — laut Compose-Kommentar bewusst so gesetzt, weil „4-GB-Host: 3g lässt ~1 GB für landing-next/admin-next/caddy/OS")
- `admin-next` und `caddy` weiterlaufen lässt

Zwei harte technische Fakten dazu:

1. **Server-Spezifikation (Perplexity-Recherche 09.07.2026, Hetzner-Preisliste/CostGoat, Stand nach Preisanpassung 15.06.2026):** CPX22 = **3 vCPU (AMD EPYC, shared), 4 GB RAM, 80 GB SSD**. Das deckt sich mit dem `docker-compose.yml`-Kommentar „4-GB-Host". Das ist die *gesamte* verfügbare Rechenleistung für App + Scans + Landing-Build + Admin + Caddy + OS gleichzeitig.
2. **`timeout-minutes: 15`** ist im Workflow hart gesetzt (Zeile 27). Nach den Build-Zeit-Schätzungen aus Abschnitt 3 ist das für ~500–800 Seiten auf einer *dedizierten, ungestörten* Maschine vermutlich noch ausreichend — auf einer Maschine, die währenddessen live Scan-Traffic bedient (CPU-Konkurrenz) und nur ~1 GB freien RAM-Headroom hat (Next.js' Compiler ist RAM-hungrig, besonders bei parallelen Worker-Prozessen), ist das Risiko real, dass Builds ab dem mittleren drei- bis niedrigen vierstelligen Seitenbereich entweder **das 15-Minuten-Timeout reißen** oder **den Host per OOM destabilisieren** — mit Downtime-Risiko für den `app`-Container (Scans, Stripe-Webhook, Bestell-Flow), nicht nur für die Landingpage.

**Zusätzlich verschärfend:** Der Docker-Build hat **keinen funktionierenden Layer-Cache für den Build-Schritt**. `Dockerfile` Zeile 12–13 (`COPY . .` im `builder`-Stage) invalidiert bei **jeder** Code-Änderung — auch einem einzelnen Typo-Fix in einer bestehenden Seite — den kompletten `npm run build`-Layer. Es gibt kein Next.js-Build-Cache-Volume, das zwischen Deploys persistiert (der `builder`-Stage ist ein flüchtiger Multi-Stage-Container, der nach dem Build verworfen wird). **Das bedeutet: bei 1.000+ Seiten baut JEDER künftige Deploy — auch für eine einzelne geänderte Zeile — alle Seiten komplett neu, mit demselben Zeit-/Ressourcenrisiko wie ein Erst-Build.** Das ist der Punkt, der bei kontinuierlicher redaktioneller Pflege (Quartals-Updates laut AEO-Recherche) am stärksten schmerzt.

**Einordnung:** Das ist kein Next.js- oder Hetzner-Limit im engeren Sinn — CPX22 könnte hunderte/tausende statische Seiten mühelos *ausliefern* (statische HTML-Dateien sind trivial klein, siehe Abschnitt 6). Das Limit ist die **Kombination aus „Build auf dem Live-Server" + „kein Build-Cache" + „hartes 15-Min-CI-Timeout"** — eine Architekturentscheidung, keine Hardware-Grenze.

---

## 5. Was sich ändern müsste, um sicher zu skalieren

Aufsteigend nach Aufwand:

**A. Sofort machbar, kein Risiko (bis ~300–500 Seiten):**
- Dynamische Route + `generateStaticParams()` bauen (s. Abschnitt 1) — Grundvoraussetzung für jede Skalierung, unabhängig von der Deploy-Frage.
- `timeout-minutes` im Workflow vorsichtshalber auf 25–30 erhöhen (Kostenlos, GitHub-Actions-Jobzeit ist nicht der Engpass — der SSH-Schritt läuft ohnehin auf dem eigenen Server).
- Rollout in Batches (deckt sich mit der Owner-Strategie aus `pseo-right.md`/`1000-pages-claim.md`: ~20–50 Seiten/Batch), jeder Batch ein normaler Deploy — hält die Build-Zeit pro Deploy in einem beobachtbaren Rahmen, bevor man weiterskaliert.
- Nach jedem Batch: Deploy-Dauer + Server-RAM (`docker stats` / Hetzner-Metrics) beobachten, um empirisch die eigene Grenze zu finden, statt sich auf fremde Benchmarks zu verlassen.

**B. Nötig für den mittleren drei- bis niedrigen vierstelligen Bereich (~500–2.000 Seiten), damit das Deploy-Risiko nicht mit wächst:**
- **Build vom Live-Server weg auf den GitHub-Actions-Runner verlagern** (Standard-Pattern: `next build` + Docker-Image-Build in der CI-Pipeline, fertiges Image in eine Registry pushen, Server pullt nur noch das fertige Image statt selbst zu bauen). Das ist der wirksamste Einzel-Hebel: GitHub-Actions-`ubuntu-latest`-Runner haben Stand 2026 typischerweise 2 vCPU/7 GB RAM dediziert und konkurrieren mit nichts — kein OOM-Risiko für den Live-Scan-Betrieb, kein Downtime-Risiko während des Builds.
- Next.js-Build-Cache (`.next/cache`) zwischen CI-Runs persistieren (GitHub-Actions-Cache-Action) — reduziert Rebuild-Zeit bei kleinen Änderungen erheblich, statt jedes Mal komplett neu zu bauen.
- `sitemap.ts` von hartcodiertem Array auf datengetriebene Generierung umstellen (liest denselben Slug-Datensatz wie `generateStaticParams()`).

**C. Erst relevant, falls deutlich über „wenige Tausend" skaliert wird (nicht Teil der aktuellen Owner-Anfrage, nur zur Einordnung der Obergrenze):**
- Ab ca. 10.000+ Seiten empfiehlt Vercels eigene Doku explizit, NICHT mehr alles zur Build-Zeit vorzurendern, sondern auf ISR/On-Demand-Generierung umzusteigen (s. Tabelle Abschnitt 3) — für „hunderte bis wenige tausend" nicht nötig, aber die nächste Wand, falls die Strategie später weiterwächst.
- Sitemap-Index/`generateSitemaps()`-Split erst ab 50.000 URLs/Sitemap technisch nötig (Google-Limit) — bei „wenige Tausend" weiterhin irrelevant.

---

## 6. Was explizit KEIN technischer Blocker ist (Gegenprobe)

- **Sitemap-Größe:** Google erlaubt bis zu 50.000 URLs bzw. 50 MB unkomprimiert pro Sitemap-Datei. Bei „hunderte bis wenige tausend" Seiten bleibt eine einzelne `sitemap.xml` (Next.js `MetadataRoute.Sitemap`) technisch völlig ausreichend — kein Sitemap-Index nötig.
- **`robots.ts`:** bereits sauber generisch (`allow: "/"`, `disallow: ["/api/", "/admin/"]`, Sitemap-Referenz aus `SITE.url`) — skaliert ohne Änderung auf jede Seitenzahl.
- **Disk-Speicher:** CPX22 hat 80 GB SSD (Perplexity-Recherche, s. o.). Tausende einfache HTML-Seiten (typischerweise wenige zehn bis ~100 KB pro Next.js-Seite inkl. RSC-Payload) summieren sich auf niedrige einstellige GB — kein Engpass, nicht mal in der Nähe.
- **Next.js selbst / `output: "standalone"`:** unproblematisch bei dieser Skala, siehe Abschnitt 2–3. Next 16 wirbt zusätzlich mit 2–5× schnelleren Production-Builds ggü. Vorversionen (Next.js-16-Release-Notes, zitiert in Perplexity-Recherche 09.07.2026) — tendenziell hilfreich, aber kein Ersatz für die strukturellen Fixes in Abschnitt 5.
- **Crawl-Budget:** technisch hängt Crawl-Budget primär an Server-Antwortzeit/-Konsistenz, nicht an Seitenanzahl — ein Next.js-Standalone-Server, der vorgerenderte HTML-Seiten ausliefert, ist für Crawler-Traffic in dieser Größenordnung trivial performant (statisches Ausliefern ist die günstigste Next.js-Betriebsart). Die eigentliche Crawl-Budget-Frage ("wie viele der Tausenden Seiten crawlt/indexiert Google überhaupt zeitnah") ist eine Domain-Autoritäts-/Policy-Frage, keine Hosting-Kapazitätsfrage — das gehört in die SEO-Policy-Recherchen (`scaled-abuse-penalties.md`), nicht hierher.
- **CPU/RAM für den *Auslieferungs*-Betrieb (nicht den Build):** Der laufende `landing-next`-Container liest bei Standalone-Output vorgebaute Seiten aus — das ist für Crawler- und Nutzer-Traffic bei „wenige Tausend" Seiten auf 3 vCPU/4 GB unproblematisch. Das Risiko liegt ausschließlich im **Build-Vorgang**, nicht im laufenden Betrieb danach.

---

## 7. Verdikt mit konkreten Größenordnungen

| Seitenzahl | Technisch machbar mit aktuellem Setup? | Bedingung |
|---|---|---|
| **bis ~300–500** | Ja, mit überschaubarem Risiko | Dynamische Route + `generateStaticParams()` bauen; Batches ausrollen; Deploy-Zeiten beobachten |
| **~500–2.000** | Ja, aber NICHT ohne Änderung an der Build-Architektur | Build muss von der Live-Maschine weg auf CI verlagert werden (Abschnitt 5B), sonst reales Timeout-/OOM-/Downtime-Risiko bei laufendem Scan-Betrieb |
| **~2.000–5.000** | Grenzwertig, mit 5B-Fixes plausibel, ohne sie nicht zu empfehlen | Wie oben, plus engmaschiges Monitoring von Build-Dauer/RAM; Next.js selbst ist in diesem Bereich laut Benchmarks noch komfortabel im SSG-Modus |
| **>5.000–10.000+** | Nicht mehr „einfach SSG" — Architekturwechsel nötig | ISR/On-Demand-Generierung statt Full-SSG (Vercel-eigene Empfehlung ab diesem Bereich); nicht Gegenstand der aktuellen Owner-Anfrage |

**Kernaussage für die Owner-Entscheidung:** Die Formulierung „hunderte bis wenige tausend Seiten" aus dem Auftrag ist technisch am oberen Ende (Richtung 2.000–5.000) **nur mit der Build-Architektur-Änderung aus Abschnitt 5B seriös machbar**, am unteren Ende (300–500) **mit dem bestehenden Deploy-Muster noch vertretbar**, wenn in Batches ausgerollt und die Deploy-Dauer nach jedem Batch beobachtet wird. Der limitierende Faktor ist in beiden Fällen nicht Next.js, Hetzner-Hardware oder Sitemap/robots — sondern die Tatsache, dass der Build heute auf derselben 4-GB-Maschine läuft wie der zahlende Live-Betrieb, ohne Build-Cache und mit einem 15-Minuten-CI-Timeout.

---

## Quellenliste

1. Repo (gelesen 09.07.2026): `landingpage-next/app/sitemap.ts`, `app/robots.ts`, `next.config.ts`, `package.json`, `Dockerfile`; `deployment/docker-compose.yml`, `deployment/Caddyfile`, `deployment/cloud-init.yaml`; `.github/workflows/deploy.yml`
2. GitHub Discussion vercel/next.js #14122 — reale ~3.000-Seiten-SSG-Timings auf Vercel — https://github.com/vercel/next.js/discussions/14122
3. dev.to — "Can Next.js Handle 5000 Pages?" (Next.js 13 SSG-Case-Study) — https://dev.to/codebeast/can-nextjs-handle-5000-pages-1ejn
4. Reddit r/nextjs — "Improve generating static pages speed" (10.000+ Seiten, DigitalOcean-Droplet) — https://www.reddit.com/r/nextjs/comments/wopaci/improve_generating_static_pages_speed/
5. Vercel — "How do I reduce my Build Time with Next.js on Vercel" (45-Min-Limit, ISR-Empfehlung ab „thousands of static pages") — https://vercel.com/kb/guide/how-do-i-reduce-my-build-time-with-next-js-on-vercel
6. Next.js — Next.js 16 Release Notes (Build-Performance-Claims) — https://nextjs.org/blog/next-16
7. CostGoat — Hetzner-Cloud-Preistabelle 2026 inkl. CPX22-Specs (3 vCPU AMD EPYC, 4 GB RAM, 80 GB SSD) — https://costgoat.com/pricing/hetzner
8. Hetzner Docs — Price-Adjustment-Dokumentation (Preisänderung 15.06.2026) — https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/
9. Google Search Central — Sitemap-Limits (50.000 URLs / 50 MB pro Datei) — allgemein bekannter, unveränderter Grenzwert, nicht gesondert neu recherchiert, da unstrittig

**Recherche-Methode:** Perplexity `perplexity_ask` (Sonar Pro, `search_context_size=high` für Build-Benchmarks; `search_recency_filter=year` für Hetzner-Specs), 09.07.2026. Alle Build-Zeit-Schätzungen für den BFSG-Fuchs-Stack selbst sind **Extrapolationen aus fremden Next.js-Projekten**, keine gemessenen Werte für diesen Stack — als Richtwert, nicht als Garantie zu behandeln. Ein realer Testlauf (z. B. 100 synthetische Seiten generieren, Deploy-Zeit auf dem echten CPX22 messen) wäre die belastbarste nächste Verifikation, falls die Skalierung ernsthaft verfolgt wird.
