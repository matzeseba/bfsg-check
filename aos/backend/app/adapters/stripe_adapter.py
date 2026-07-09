"""Stripe-Adapter — NUR lesend (charges, subscriptions, balance) via httpx.

Live-Nutzung mit Bearer STRIPE_SECRET_KEY (rk_live, read-only). 10-Minuten-Cache in
der Tabelle finance_cache. Ohne Key: realistische deutsche Demo-Daten (source="demo").
Shapes exakt nach ARCHITECTURE.md Paragraph 4 (finance/*).
"""

from __future__ import annotations

import json
from datetime import timedelta
from typing import Any

import httpx
from sqlmodel import Session, select

from ..config import Settings
from ..db import utcnow
from ..models import FinanceCache

_STRIPE_BASE = "https://api.stripe.com/v1"
_CACHE_TTL = timedelta(minutes=10)

# Paket-Katalog (EUR) — Grundlage der Demo-Aufschluesselung.
_PACKAGES = [
    ("Basis", 129.0),
    ("Profi", 399.0),
    ("Cookie-Basis", 39.0),
    ("Cookie-Profi", 69.0),
]


def is_live(settings: Settings) -> bool:
    return bool(settings.stripe_secret_key)


# --------------------------------------------------------------------------- #
# Cache-Helfer
# --------------------------------------------------------------------------- #
def _cache_get(session: Session, key: str) -> dict[str, Any] | None:
    row = session.exec(select(FinanceCache).where(FinanceCache.key == key)).first()
    if row is None:
        return None
    if utcnow() - row.fetched_at > _CACHE_TTL:
        return None
    try:
        return json.loads(row.payload_json)
    except (ValueError, json.JSONDecodeError):
        return None


def _cache_set(session: Session, key: str, payload: dict[str, Any]) -> None:
    row = session.exec(select(FinanceCache).where(FinanceCache.key == key)).first()
    if row is None:
        row = FinanceCache(key=key)
        session.add(row)
    row.payload_json = json.dumps(payload)
    row.fetched_at = utcnow()
    session.commit()


# --------------------------------------------------------------------------- #
# Demo-Daten
# --------------------------------------------------------------------------- #
def _demo_summary() -> dict[str, Any]:
    by_package = [
        {"name": "Basis", "count": 7, "eur": 903.0},
        {"name": "Profi", "count": 2, "eur": 798.0},
        {"name": "Cookie-Basis", "count": 5, "eur": 195.0},
        {"name": "Cookie-Profi", "count": 3, "eur": 207.0},
    ]
    gross = sum(p["eur"] for p in by_package)
    fees = round(gross * 0.019 + len(by_package) * 0.25, 2)  # ~1,9 % + 0,25 EUR
    return {
        "gross_30d": round(gross, 2),
        "net_30d": round(gross - fees, 2),
        "fees_30d": fees,
        "mrr": 149.94,  # 6 aktive Re-Check-Abos a 24,99 EUR
        "active_subs": 6,
        "refund_rate_pct": 1.8,
        "by_package": by_package,
        "source": "demo",
    }


def _demo_sparkline() -> list[dict[str, Any]]:
    # Deterministische, plausible 30-Tage-Kurve.
    today = utcnow().date()
    pattern = [
        0, 0, 129, 0, 39, 0, 0, 399, 0, 69,
        129, 0, 0, 39, 129, 0, 0, 0, 129, 69,
        0, 399, 0, 39, 0, 129, 0, 0, 39, 129,
    ]
    out: list[dict[str, Any]] = []
    for i in range(30):
        day = today - timedelta(days=29 - i)
        out.append({"date": day.isoformat(), "eur": float(pattern[i])})
    return out


def _demo_invoices(limit: int) -> list[dict[str, Any]]:
    base = [
        ("in_1042", 0, 129.0, "Basis", "paid", "m***@sanitaer-nord.de"),
        ("in_1041", 1, 399.0, "Profi", "paid", "k***@stadtwerke-lingen.de"),
        ("in_1040", 2, 39.0, "Cookie-Basis", "paid", "info***@zahnarzt-berg.de"),
        ("in_1039", 3, 129.0, "Basis", "paid", "b***@tischlerei-ahrend.de"),
        ("in_1038", 4, 69.0, "Cookie-Profi", "paid", "office***@kanzlei-vogt.de"),
        ("in_1037", 6, 129.0, "Basis", "refunded", "m***@cafe-morgentau.de"),
        ("in_1036", 8, 399.0, "Profi", "paid", "it***@logistik-weser.de"),
        ("in_1035", 11, 39.0, "Cookie-Basis", "paid", "kontakt***@yoga-studio-ol.de"),
        ("in_1034", 14, 129.0, "Basis", "paid", "j***@elektro-timmer.de"),
        ("in_1033", 19, 69.0, "Cookie-Profi", "paid", "mail***@friseur-lux.de"),
    ]
    today = utcnow().date()
    out = []
    for inv_id, days_ago, amount, package, status, masked in base:
        out.append(
            {
                "id": inv_id,
                "date": (today - timedelta(days=days_ago)).isoformat(),
                "amount_eur": amount,
                "package": package,
                "status": status,
                "customer_masked": masked,
            }
        )
    return out[:limit]


# --------------------------------------------------------------------------- #
# Live-Zugriff (read-only)
# --------------------------------------------------------------------------- #
def _live_raw(settings: Settings) -> dict[str, Any] | None:
    """Holt charges + subscriptions + balance. Bei Fehler None (-> Demo)."""
    headers = {"Authorization": f"Bearer {settings.stripe_secret_key}"}
    created_gte = int((utcnow() - timedelta(days=30)).timestamp())
    try:
        with httpx.Client(base_url=_STRIPE_BASE, headers=headers, timeout=10.0) as c:
            charges = c.get(
                "/charges",
                params={"limit": 100, "created[gte]": created_gte},
            )
            charges.raise_for_status()
            subs = c.get("/subscriptions", params={"status": "active", "limit": 100})
            subs.raise_for_status()
            balance = c.get("/balance")
            balance.raise_for_status()
    except (httpx.HTTPError, httpx.InvalidURL):
        return None
    return {
        "charges": charges.json().get("data", []),
        "subscriptions": subs.json().get("data", []),
        "balance": balance.json(),
    }


def _summary_from_raw(raw: dict[str, Any]) -> dict[str, Any]:
    charges = [c for c in raw["charges"] if c.get("paid") and not c.get("refunded")]
    gross_cents = sum(int(c.get("amount", 0)) for c in charges)
    fee_cents = 0
    for c in charges:
        bt = c.get("balance_transaction")
        if isinstance(bt, dict):
            fee_cents += int(bt.get("fee", 0))
    if fee_cents == 0:
        fee_cents = int(round(gross_cents * 0.019))
    refunded = [c for c in raw["charges"] if c.get("refunded")]
    total = len(charges) + len(refunded)
    refund_rate = round(100.0 * len(refunded) / total, 1) if total else 0.0

    subs = raw["subscriptions"]
    mrr_cents = 0
    for s in subs:
        for item in s.get("items", {}).get("data", []):
            price = item.get("price", {}) or {}
            amount = int(price.get("unit_amount", 0) or 0)
            interval = (price.get("recurring", {}) or {}).get("interval", "month")
            if interval == "year":
                amount = int(round(amount / 12))
            mrr_cents += amount

    gross = round(gross_cents / 100, 2)
    fees = round(fee_cents / 100, 2)
    return {
        "gross_30d": gross,
        "net_30d": round(gross - fees, 2),
        "fees_30d": fees,
        "mrr": round(mrr_cents / 100, 2),
        "active_subs": len(subs),
        "refund_rate_pct": refund_rate,
        "by_package": _by_package_from_charges(charges),
        "source": "stripe",
    }


def _by_package_from_charges(charges: list[dict[str, Any]]) -> list[dict[str, Any]]:
    buckets: dict[str, dict[str, Any]] = {}
    for c in charges:
        amount = round(int(c.get("amount", 0)) / 100, 2)
        name = _guess_package(amount)
        b = buckets.setdefault(name, {"name": name, "count": 0, "eur": 0.0})
        b["count"] += 1
        b["eur"] = round(b["eur"] + amount, 2)
    return sorted(buckets.values(), key=lambda x: -x["eur"])


def _guess_package(amount: float) -> str:
    nearest = min(_PACKAGES, key=lambda p: abs(p[1] - amount))
    return nearest[0] if abs(nearest[1] - amount) <= 1.0 else "Sonstiges"


# --------------------------------------------------------------------------- #
# Oeffentliche API
# --------------------------------------------------------------------------- #
def get_summary(session: Session, settings: Settings) -> dict[str, Any]:
    if not is_live(settings):
        return _demo_summary()
    cached = _cache_get(session, "stripe_summary")
    if cached is not None:
        return cached
    raw = _live_raw(settings)
    if raw is None:
        return _demo_summary()
    summary = _summary_from_raw(raw)
    _cache_set(session, "stripe_summary", summary)
    return summary


def get_sparkline(session: Session, settings: Settings) -> list[dict[str, Any]]:
    if not is_live(settings):
        return _demo_sparkline()
    cached = _cache_get(session, "stripe_sparkline")
    if cached is not None:
        return cached.get("points", _demo_sparkline())
    raw = _live_raw(settings)
    if raw is None:
        return _demo_sparkline()
    points = _sparkline_from_charges(raw["charges"])
    _cache_set(session, "stripe_sparkline", {"points": points})
    return points


def _sparkline_from_charges(charges: list[dict[str, Any]]) -> list[dict[str, Any]]:
    today = utcnow().date()
    totals: dict[str, float] = {
        (today - timedelta(days=29 - i)).isoformat(): 0.0 for i in range(30)
    }
    for c in charges:
        if not c.get("paid") or c.get("refunded"):
            continue
        created = c.get("created")
        if not created:
            continue
        day = utcnow().fromtimestamp(created).date().isoformat()
        if day in totals:
            totals[day] += round(int(c.get("amount", 0)) / 100, 2)
    return [{"date": d, "eur": round(v, 2)} for d, v in totals.items()]


def get_invoices(
    session: Session, settings: Settings, limit: int = 50
) -> list[dict[str, Any]]:
    if not is_live(settings):
        return _demo_invoices(limit)
    raw = _live_raw(settings)
    if raw is None:
        return _demo_invoices(limit)
    out = []
    for c in raw["charges"][:limit]:
        amount = round(int(c.get("amount", 0)) / 100, 2)
        out.append(
            {
                "id": c.get("id", ""),
                "date": utcnow().fromtimestamp(c.get("created", 0)).date().isoformat(),
                "amount_eur": amount,
                "package": _guess_package(amount),
                "status": "refunded" if c.get("refunded") else c.get("status", "paid"),
                "customer_masked": _mask_email(
                    (c.get("billing_details", {}) or {}).get("email")
                ),
            }
        )
    return out


def _mask_email(email: str | None) -> str:
    if not email or "@" not in email:
        return "unbekannt"
    local, _, domain = email.partition("@")
    keep = local[0] if local else "m"
    return f"{keep}***@{domain}"
