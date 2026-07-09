"""Lead-Scoring-Agent (Port 8102, Team Beta-2).

Tool ``score_leads(leads)`` bewertet Leads deterministisch mit 1-100.
Kern-Idee: Viele kritische A11y-Mängel = die Firma braucht dringend Hilfe =
heißer Lead. Zusätzlich fließen eine Domain-/Budget-Heuristik und die
Paket-Historie ein. Das Scoring ist rein deterministisch (kein LLM nötig);
bei gesetztem ANTHROPIC_API_KEY werden die Begründungen optional sprachlich
verfeinert (best-effort, fällt sonst auf die deterministische Version zurück).

Eingabe je Lead: {domain, score_a11y, issues_critical, issues_total, package}
Ausgabe: nach lead_score absteigend sortierte Liste
         {domain, lead_score, reasoning, recommended_action}
"""

from __future__ import annotations

import json

from common.ai import anthropic_complete, has_anthropic
from common.mcp_server import ToolDef, create_mcp_app

VERSION = "1.0.0"

# Gewichte (Summe der Maxima = 100)
W_CRITICAL = 45  # kritische Mängel
W_TOTAL = 15  # Gesamt-Mängel-Dichte
W_A11Y = 20  # schlechter A11y-Score = hoher Bedarf
W_BUDGET = 12  # Domain-/Budget-Heuristik
W_PACKAGE = 8  # Paket-Historie

_ECOMMERCE_SIGNALS = ("shop", "store", "kaufen", "versand", "handel", "market", "commerce")
_COMMERCIAL_TLDS = ("shop", "store")
_ESTABLISHED_TLDS = ("de", "com", "org", "net", "eu", "at", "ch")


def _to_number(value: object, default: float = 0.0) -> float:
    if isinstance(value, bool):
        return default
    if isinstance(value, (int, float)):
        return float(value)
    return default


def _domain_budget(domain: str) -> tuple[float, str | None]:
    """Budget-Heuristik aus der Domain. Rückgabe: (Punkte, Begründung)."""
    domain = domain.lower().strip()
    if not domain:
        return 0.0, None
    tld = domain.rsplit(".", 1)[-1] if "." in domain else ""
    points = 0.0
    reason: str | None = None

    if any(sig in domain for sig in _ECOMMERCE_SIGNALS) or tld in _COMMERCIAL_TLDS:
        points = float(W_BUDGET)
        reason = "E-Commerce-Signal in der Domain — größeres Budget wahrscheinlich"
    elif tld in _ESTABLISHED_TLDS:
        points = 5.0
        reason = "Etablierte Unternehmensdomain"
    else:
        points = 2.0

    return min(points, float(W_BUDGET)), reason


def _package_points(package: str) -> tuple[float, str | None]:
    package = package.lower().strip()
    if not package:
        return 0.0, None
    if "profi" in package:
        return float(W_PACKAGE), "Profi-Paket in der Historie — zahlungsbereiter Kunde"
    if "abo" in package:
        return 6.0, "Abo-Kunde — bestehende Bindung, gutes Upsell-Potenzial"
    if "basis" in package:
        return 5.0, "Basis-Paket gekauft — konkretes Upgrade-Potenzial"
    return 3.0, "Bestandskontakt mit Kaufhistorie"


def _recommended_action(score: int) -> str:
    if score >= 80:
        return "Sofort kontaktieren — Owner-Mail + priorisiertes Profi-Angebot"
    if score >= 60:
        return "Diese Woche nachfassen — passendes Paket vorschlagen"
    if score >= 40:
        return "In Nurture-Sequenz aufnehmen"
    return "Beobachten — aktuell niedrige Priorität"


def _score_one(lead: dict) -> dict:
    domain = str(lead.get("domain") or "").strip()
    crit = _to_number(lead.get("issues_critical"))
    total = _to_number(lead.get("issues_total"))
    a11y = lead.get("score_a11y")
    package = str(lead.get("package") or "")

    reasons: list[str] = []
    score = 0.0

    # 1) Kritikalität — viele kritische Barrieren = hoher Handlungsdruck
    crit_pts = min(crit, 15.0) / 15.0 * W_CRITICAL
    score += crit_pts
    if crit >= 8:
        reasons.append(f"{int(crit)} kritische Barrieren — hoher Handlungsdruck")
    elif crit > 0:
        reasons.append(f"{int(crit)} kritische Barrieren")

    # 2) Gesamt-Mängel-Dichte
    score += min(total, 60.0) / 60.0 * W_TOTAL
    if total > 0:
        reasons.append(f"{int(total)} Mängel insgesamt")

    # 3) A11y-Score (0-100): je niedriger, desto höher der Bedarf
    a11y_num = _to_number(a11y, default=-1.0)
    if a11y_num >= 0:
        deficit = max(0.0, 100.0 - a11y_num)
        score += deficit / 100.0 * W_A11Y
        if a11y_num < 50:
            reasons.append(
                f"A11y-Score {int(a11y_num)}/100 — deutlicher Nachholbedarf"
            )

    # 4) Domain-/Budget-Heuristik
    budget_pts, budget_reason = _domain_budget(domain)
    score += budget_pts
    if budget_reason:
        reasons.append(budget_reason)

    # 5) Paket-Historie
    pkg_pts, pkg_reason = _package_points(package)
    score += pkg_pts
    if pkg_reason:
        reasons.append(pkg_reason)

    lead_score = max(1, min(100, round(score)))
    if not reasons:
        reasons.append("Keine auffälligen Signale")

    return {
        "domain": domain,
        "lead_score": lead_score,
        "reasoning": "; ".join(reasons),
        "recommended_action": _recommended_action(lead_score),
    }


async def _maybe_refine(scored: list[dict]) -> list[dict]:
    """Optionale sprachliche Verfeinerung der Begründungen via Anthropic.

    Best-effort: bei fehlendem Key oder jedem Fehler bleibt die deterministische
    Begründung erhalten. Scores/Reihenfolge werden NIE verändert.
    """
    if not has_anthropic() or not scored:
        return scored
    system = (
        "Du bist Vertriebs-Analyst für BFSG-Fuchs. Formuliere kurze, sachliche "
        "deutsche Begründungen (max. 25 Wörter, echte Umlaute), warum ein Lead "
        "heiß ist. Keine Werbe-Superlative, keine Garantien."
    )
    payload = [
        {"domain": s["domain"], "score": s["lead_score"], "signale": s["reasoning"]}
        for s in scored
    ]
    user = (
        "Gib ein JSON-Array mit exakt einem String je Lead (gleiche Reihenfolge) "
        "zurück. Basis:\n" + json.dumps(payload, ensure_ascii=False)
    )
    text = await anthropic_complete(system, user, max_tokens=700)
    if not text:
        return scored
    try:
        refined = json.loads(text)
    except Exception:  # noqa: BLE001
        return scored
    if not isinstance(refined, list) or len(refined) != len(scored):
        return scored
    for item, new_reason in zip(scored, refined):
        if isinstance(new_reason, str) and new_reason.strip():
            item["reasoning"] = new_reason.strip()
    return scored


async def score_leads(args: dict) -> dict:
    leads = args.get("leads") or []
    scored = [_score_one(lead) for lead in leads if isinstance(lead, dict)]
    scored.sort(key=lambda item: item["lead_score"], reverse=True)
    scored = await _maybe_refine(scored)
    hot = sum(1 for s in scored if s["lead_score"] >= 80)
    return {
        "leads": scored,
        "count": len(scored),
        "hot_leads": hot,
        "source": "deterministic",
    }


TOOLS = [
    ToolDef(
        name="score_leads",
        description=(
            "Bewertet Leads (1-100) nach A11y-Kritikalität, Domain-/Budget-"
            "Heuristik und Paket-Historie. Deterministisch, absteigend sortiert."
        ),
        input_schema={
            "type": "object",
            "properties": {
                "leads": {
                    "type": "array",
                    "description": (
                        "Liste von {domain, score_a11y, issues_critical, "
                        "issues_total, package}."
                    ),
                }
            },
            "required": ["leads"],
        },
        handler=score_leads,
    ),
]

app = create_mcp_app("leadscore", VERSION, TOOLS)
