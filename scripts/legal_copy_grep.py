#!/usr/bin/env python3
"""
legal_copy_grep.py — Deterministischer Regex-Scan fuer verbotene Marketing-Formulierungen.

Scannt: marketing/*.md, landingpage-next/app/**/*.{tsx,ts,mdx,md},
        landingpage-next/components/**/*.{tsx,ts},
        landingpage-next/content/**/*.{md,mdx}

Exit-Code 0: Keine Treffer (PASS)
Exit-Code 1: Kritische Treffer (FAIL — CI-tauglich)

Verwendung:
  python scripts/legal_copy_grep.py
  python scripts/legal_copy_grep.py --json
  python scripts/legal_copy_grep.py --ci   (kompakt, kein Farb-Output)

Stdlib only. Keine externen Abhaengigkeiten.
"""

import re
import sys
import os
import io
import json
import argparse
import datetime
from pathlib import Path
from typing import NamedTuple

# Windows: stdout auf UTF-8 zwingen damit Sonderzeichen aus gescannten Dateien
# nicht zu UnicodeEncodeError fuehren.
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# ---------------------------------------------------------------------------
# Risiko-Regeln
# ---------------------------------------------------------------------------

class Regel(NamedTuple):
    muster: str          # Regex-Pattern (case-insensitive)
    level: str           # "ROT" | "GELB" | "INFO"
    verbot_durch: str    # Gesetzliche Grundlage
    alternative: str     # Sichere Ersatz-Formulierung


REGELN: list[Regel] = [
    # --- ROT: Eindeutig verboten ---
    Regel(
        muster=r"BFSG[- .]?konform",
        level="ROT",
        verbot_durch="UWG §5 Irrefuehrung",
        alternative='"automatisierte WCAG-2.1-AA-Analyse" oder "BFSG-Pruefung durchgefuehrt"',
    ),
    Regel(
        muster=r"rechtssicher",
        level="ROT",
        verbot_durch="UWG §5 Irrefuehrung",
        alternative="weglassen oder konkret: \"vom Anwalt geprueft\" (nur wenn zutreffend)",
    ),
    Regel(
        muster=r"garantiert?\b",
        level="ROT",
        verbot_durch="UWG §5 Irrefuehrung",
        alternative='"hilft bei", "unterstuetzt", "analysiert", "prueft"',
    ),
    Regel(
        muster=r"\bTUEV\b|\bTÜV\b|\bDEKRA\b",
        level="ROT",
        verbot_durch="UWG §5 (falsche Siegel / falsche Zertifizierung)",
        alternative="Nur verwenden wenn echte Zertifizierung vorliegt",
    ),
    Regel(
        muster=r"zertifiziert\b",
        level="ROT",
        verbot_durch="UWG §5 (Zertifikat ohne Beleg)",
        alternative='"geprueft", "analysiert" — Zertifikat nur mit echtem Nachweis',
    ),
    Regel(
        muster=r"100\s*%\s*(sicher|konform|fehlerfrei|barrierefrei)",
        level="ROT",
        verbot_durch="UWG §5 Irrefuehrung",
        alternative="Konkreten Pruefumfang angeben: \"automatisierter Scan nach WCAG 2.1 AA\"",
    ),
    Regel(
        muster=r"abmahnsicher",
        level="ROT",
        verbot_durch="UWG §5 Irrefuehrung",
        alternative="weglassen — keine Abmahn-Garantien moeglich",
    ),
    Regel(
        muster=r"(kein|ohne)\s+anwalt\s+(noetig|nötig|erforderlich|benoetigt|benötigt)",
        level="ROT",
        verbot_durch="RDG §5 (Rechtsdienstleistungsgesetz)",
        alternative='Disclaimer: "Kein Ersatz fuer Rechtsberatung"',
    ),
    Regel(
        muster=r"ersetzt\s+(einen?\s+)?rechtsberatung",
        level="ROT",
        verbot_durch="RDG §5",
        alternative='Disclaimer: "automatisierte technische Analyse, kein Rechtsrat"',
    ),
    Regel(
        muster=r"vollstaendig\s+barrierefrei|vollständig\s+barrierefrei",
        level="ROT",
        verbot_durch="UWG §5 (ohne Methodennachweis nicht belegbar)",
        alternative='"WCAG-2.1-AA-Pruefung bestanden" mit Einschraenkungshinweis',
    ),

    # --- GELB: Kontext-abhaengig, pruefen ---
    Regel(
        muster=r"TDDDG[- .]?konform",
        level="GELB",
        verbot_durch="UWG §5 (ohne Methodik-Hinweis irreführend)",
        alternative='"TDDDG-Analyse" + Methodik-Disclaimer hinzufuegen',
    ),
    Regel(
        muster=r"voll(staendig|ständig)?\s+(er|WCAG|BFSG|TDDDG)?[- ]?erfuellt?|voll(staendig|ständig)?\s+konform",
        level="GELB",
        verbot_durch="UWG §5 (Pauschalaussage ohne Einschraenkung)",
        alternative="Pruefumfang explizit begrenzen: \"Scan von X Seiten, automatisiert\"",
    ),
    Regel(
        muster=r"barrierefrei\s+nach\s+gesetz|gesetzlich\s+(vorgeschrieben|konform|erfuellt)",
        level="GELB",
        verbot_durch="UWG §5 (ohne Kontext irreführend)",
        alternative='"WCAG-2.1-AA-Pruefung" mit Methodenhinweis',
    ),
    Regel(
        muster=r"keine\s+abmahnung|abmahn(schutz|frei)",
        level="GELB",
        verbot_durch="UWG §5 (Garantie-Versprechen nicht haltbar)",
        alternative="weglassen",
    ),
    Regel(
        muster=r"sofort\s+(konform|sicher|barrierefrei)",
        level="GELB",
        verbot_durch="UWG §5 (irreführende Schnelligkeits-Aussage)",
        alternative='"Analyseergebnis in Minuten" oder "schnelle Fehleridentifikation"',
    ),

    # --- INFO: Hinweise, kein Verbot ---
    Regel(
        muster=r"\bgratis\b",
        level="INFO",
        verbot_durch="kein Verbot",
        alternative='Preisklarheit pruefen - "kostenloser Test" ok wenn tatsaechlich kostenlos',
    ),
    Regel(
        muster=r"einfach\s+klicken|schnell\s+und\s+einfach",
        level="INFO",
        verbot_durch="kein Verbot",
        alternative="Konkrete Schritte nennen statt vagen Versprechen",
    ),
]

# ---------------------------------------------------------------------------
# Scan-Pfade (relativ zum Repo-Root)
# ---------------------------------------------------------------------------

SCAN_GLOB_PATTERNS = [
    "marketing/*.md",
    "marketing/*.txt",
    "landingpage-next/app/**/*.tsx",
    "landingpage-next/app/**/*.ts",
    "landingpage-next/app/**/*.mdx",
    "landingpage-next/app/**/*.md",
    "landingpage-next/components/**/*.tsx",
    "landingpage-next/components/**/*.ts",
    "landingpage-next/content/**/*.md",
    "landingpage-next/content/**/*.mdx",
]

# Verzeichnisse ignorieren
IGNORE_DIRS = {
    "node_modules", ".next", ".git", "__pycache__", ".cache",
    "dist", "build", ".turbo",
}

# ---------------------------------------------------------------------------
# Hilfsfunktionen
# ---------------------------------------------------------------------------


def repo_root() -> Path:
    """Ermittle den Repo-Root (eine Ebene ueber dem scripts/-Ordner)."""
    this_script = Path(__file__).resolve()
    # scripts/legal_copy_grep.py -> parent = scripts/ -> parent = repo-root
    candidate = this_script.parent.parent
    # Sicherheitscheck: CLAUDE.md oder .git muss existieren
    if (candidate / "CLAUDE.md").exists() or (candidate / ".git").exists():
        return candidate
    # Fallback: cwd
    return Path.cwd()


def collect_files(root: Path) -> list[Path]:
    """Sammle alle zu pruefenden Dateien anhand der Glob-Patterns."""
    collected: list[Path] = []
    seen: set[Path] = set()

    for pattern in SCAN_GLOB_PATTERNS:
        for path in root.glob(pattern):
            # Ignoriere Verzeichnisse in Pfad-Komponenten
            skip = False
            for part in path.parts:
                if part in IGNORE_DIRS:
                    skip = True
                    break
            if skip:
                continue
            if path.is_file() and path not in seen:
                collected.append(path)
                seen.add(path)

    return sorted(collected)


def scan_file(filepath: Path, root: Path) -> list[dict]:
    """Scanne eine Datei auf alle Regeln. Gibt Liste von Findings zurueck."""
    findings = []
    try:
        text = filepath.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return findings

    lines = text.splitlines()
    rel_path = str(filepath.relative_to(root)).replace("\\", "/")

    for regel in REGELN:
        pattern = re.compile(regel.muster, re.IGNORECASE)
        for lineno, line in enumerate(lines, start=1):
            match = pattern.search(line)
            if match:
                findings.append({
                    "datei": rel_path,
                    "zeile": lineno,
                    "level": regel.level,
                    "muster": regel.muster,
                    "treffer": match.group(0),
                    "kontext": line.strip(),
                    "verbot_durch": regel.verbot_durch,
                    "alternative": regel.alternative,
                })

    return findings


# ---------------------------------------------------------------------------
# Output-Formatierung
# ---------------------------------------------------------------------------

LEVEL_ORDER = {"ROT": 0, "GELB": 1, "INFO": 2}
LEVEL_EMOJI = {"ROT": "[ROT]", "GELB": "[GELB]", "INFO": "[INFO]"}


def format_markdown(findings: list[dict], files_checked: int, ci_mode: bool = False) -> str:
    """Formatiere Ergebnisse als Markdown-Report."""
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    lines = [f"## Legal-Copy-Grep - {now}", ""]

    rot = [f for f in findings if f["level"] == "ROT"]
    gelb = [f for f in findings if f["level"] == "GELB"]
    info = [f for f in findings if f["level"] == "INFO"]

    status = "PASS" if not rot else "FAIL"
    lines.append(f"Gescannte Dateien: {files_checked}")
    lines.append(f"Treffer gesamt: {len(findings)} (ROT: {len(rot)}, GELB: {len(gelb)}, INFO: {len(info)})")
    lines.append(f"Status: **{status}**")
    lines.append("")

    if rot:
        lines.append("### [ROT] Kritische Treffer (sofort beheben)")
        lines.append("")
        for f in rot:
            lines.append(f"**{f['datei']}:{f['zeile']}**")
            lines.append(f"  Treffer:    `{f['treffer']}`")
            lines.append(f"  Kontext:    {f['kontext'][:120]}")
            lines.append(f"  Verboten:   {f['verbot_durch']}")
            lines.append(f"  Alternative: {f['alternative']}")
            lines.append("")

    if gelb and not ci_mode:
        lines.append("### [GELB] Warnungen (Kontext pruefen)")
        lines.append("")
        for f in gelb:
            lines.append(f"**{f['datei']}:{f['zeile']}**")
            lines.append(f"  Treffer:    `{f['treffer']}`")
            lines.append(f"  Kontext:    {f['kontext'][:120]}")
            lines.append(f"  Hinweis:    {f['verbot_durch']}")
            lines.append(f"  Empfehlung: {f['alternative']}")
            lines.append("")

    if info and not ci_mode:
        lines.append("### [INFO] Hinweise")
        lines.append("")
        for f in info:
            lines.append(f"  {f['datei']}:{f['zeile']} — `{f['treffer']}` — {f['alternative']}")
        lines.append("")

    if not findings:
        lines.append("Keine Treffer gefunden. Alles sauber.")

    return "\n".join(lines)


def format_json(findings: list[dict], files_checked: int) -> str:
    """Formatiere Ergebnisse als JSON."""
    rot_count = sum(1 for f in findings if f["level"] == "ROT")
    return json.dumps({
        "ts": datetime.datetime.now().isoformat(),
        "files_checked": files_checked,
        "total_findings": len(findings),
        "rot": rot_count,
        "gelb": sum(1 for f in findings if f["level"] == "GELB"),
        "info": sum(1 for f in findings if f["level"] == "INFO"),
        "status": "FAIL" if rot_count > 0 else "PASS",
        "findings": findings,
    }, ensure_ascii=False, indent=2)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Legal-Copy-Grep — Regex-Scan auf verbotene Marketing-Formulierungen"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Ausgabe als JSON",
    )
    parser.add_argument(
        "--ci",
        action="store_true",
        help="Kompakter CI-Modus (nur ROT, kein Farb-Output)",
    )
    parser.add_argument(
        "--root",
        type=str,
        default=None,
        help="Repo-Root-Pfad (Standard: automatisch ermittelt)",
    )
    args = parser.parse_args()

    root = Path(args.root).resolve() if args.root else repo_root()

    if not args.ci and not args.json:
        print(f"Repo-Root: {root}")
        print(f"Scan laeuft...\n")

    files = collect_files(root)

    if not files:
        print("WARN: Keine Dateien zum Scannen gefunden. Pfad pruefen.")
        return 0

    all_findings: list[dict] = []
    for filepath in files:
        findings = scan_file(filepath, root)
        all_findings.extend(findings)

    # Nach Level und Datei sortieren
    all_findings.sort(key=lambda f: (LEVEL_ORDER.get(f["level"], 9), f["datei"], f["zeile"]))

    # Ausgabe
    if args.json:
        print(format_json(all_findings, len(files)))
    else:
        print(format_markdown(all_findings, len(files), ci_mode=args.ci))

    # Exit-Code: 1 bei kritischen (ROT) Treffern
    rot_count = sum(1 for f in all_findings if f["level"] == "ROT")
    return 1 if rot_count > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
