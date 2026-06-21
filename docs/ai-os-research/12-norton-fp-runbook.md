# 🛡️ Runbook: Norton-Fehlalarm „MD:HttpRequest-inf [Susp]"

> **Erstellt:** 21.06.2026 · **Status:** GELÖST · Forensik: `09-cockpit-security-review.md` + Analyse-Workflow
> Dieses Runbook existiert, damit niemand bei diesem (harmlosen) Alarm erneut in Panik gerät.

## Was passiert ist
Norton 360 for Gamers hat am 21.06.2026 **~10 Markdown-Dateien** in Quarantäne verschoben (Signatur `MD:HttpRequest-inf [Susp]`) — ausschließlich selbst erzeugte **Second-Brain-/Obsidian-Recherchenotizen** im Projektordner. Das war auch der Grund, warum ein Recherche-Agent seine Datei „nicht speichern" konnte (Norton löschte jede Kopie in Echtzeit).

## Urteil: False Positive (hoch, adversarial verifiziert)
- `[Susp]` = rein heuristisch, **kein** Signatur-Match (höchste Fehlalarmquote).
- Trigger = **Cluster** aus `type:http` + `url:` + `Authorization: Bearer …` im selben Codeblock, plus `NODE_TLS_REJECT_UNAUTHORIZED=0`, plus ~20 fast identische Kopien in Sekunden (wirkt wie Datei-Dropping).
- Keine IOCs, keine Obfuskation, keine fremden Dateien, nur Token-**Platzhalter**.
- Bekannte FP-Familie (trifft auch Joplin, Deno, Ultimaker Cura).

## Was bereits umgesetzt wurde (21.06.2026)
1. ✅ **Ordner-Ausschluss** in Norton (Einstellungen → Antivirus → Ausschlüsse): `C:\Users\Administrator\bfsg-check\*` (Echtzeit/Auto-Protect). → verhindert erneutes Quarantänieren.
2. ✅ **Quarantäne geleert** — eindeutig benannte Varianten wiederhergestellt, gleichnamige Duplikate (nach Sicherung der kanonischen Datei) endgültig entfernt.
3. ✅ **Repo konsolidiert** — `docs/ai-os-research/03-second-brain-obsidian.md` enthält die vollständigste Fassung; Duplikate (`-FINAL`, `-AGENT3-…`, `memory-layer-…`, `.03-source.md`) gelöscht.

## Offen / optional
- ⏳ **FP an Norton melden:** Der eingebaute Weg (Quarantäne → „Zur Analyse senden" → „Fehlalarm") reagierte nicht (vermutlich Norton-Konto-Login nötig). Alternativ via Web: <https://submissions.norton.com/> → *False positive* → Datei (`03-second-brain-obsidian.md`) hochladen. Verbessert nur die globale Engine; lokal ist durch den Ausschluss bereits alles sauber.

## Falls es wieder auftritt
- **Im Repo:** ist durch den Ordner-Ausschluss abgedeckt — sollte nicht mehr passieren.
- **Echter Obsidian-Vault außerhalb des Repos** (z.B. `C:\Users\Administrator\bfsg-vault`): diesen Pfad **separat** in dieselbe Norton-Ausschlussliste eintragen.
- **Microsoft Defender** falls parallel aktiv: dort denselben Ordner-Ausschluss setzen (Erkennung ist herstellerübergreifend).

## Ursache vermeiden
- Recherche-/Generator-Agenten sollen **einen festen Dateinamen mit Overwrite** schreiben, nicht ~20 gleichnamige/zeitgestempelte Kopien in Sekunden (das Replikationsmuster war der Brandbeschleuniger).
- In Doku: `Bearer`-Token-Platzhalter nicht zwingend im selben JSON-Block direkt neben `url`+`type:http` — und `NODE_TLS_REJECT_UNAUTHORIZED=0` immer als kommentiertes Warn-Beispiel.

## ⚠️ Nicht tun
- Nicht ganz `C:\` ausschließen, Auto-Protect/SONAR nicht global abschalten, Signatur-Ausschluss nur als allerletztes Mittel (wirkt systemweit).
