# data/seed/ — Seed-Daten für den Erststart

Diese Dateien sind **versioniert** und werden vom Engine-Bootstrap (`engine/src/store.js`)
beim ersten Start nach `data/*.json` kopiert (die Laufzeit-Kopien sind gitignored).
Existiert kein Seed, schreibt der Bootstrap einen validen Leer-Default.

## Integritäts-Regeln

- **`outputFile` ist in allen Seed-Jobs bewusst `null`.** Die Seed-Jobs sind historische
  Beispiel-/Demo-Datensätze — die referenzierten Artefakte unter `data/outbox/` haben nie
  existiert (die Outbox ist gitignored und war leer). Frühere Seed-Stände zeigten mit
  `outputFile: "data/outbox/<jobId>.md"` auf Dateien, die beim Abruf in der API nur einen
  404 erzeugt hätten. `null` ist die ehrliche Repräsentation „kein Artefakt vorhanden".
  (Korrektur vom 23.07.2026, PR `chore/marketing-os-repair`.)
- Seed-Jobs dürfen Status wie `published`, `approved`, `review`, `failed`, `queued` oder
  `skipped` tragen — aber **nicht `running`**: ein `running`-Job im Seed würde bei jedem
  Erststart sofort von der Runner-Recovery als Zombie erkannt und auf `failed` gesetzt
  (siehe `engine/src/runner.js`).
- `gate`- und `publishAction`-Felder sind dokumentarisch (zeigen Gate-Findings und die
  manuellen Publish-Schritte) und spiegeln den damaligen QA-Stand.
