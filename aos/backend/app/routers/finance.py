"""Finance-Router (ARCHITECTURE.md Paragraph 4): summary, invoices, thresholds."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from ..adapters import stripe_adapter
from ..auth import require_auth
from ..config import Settings, get_settings
from ..db import get_session, utcnow

router = APIRouter(
    prefix="/api/finance", tags=["finance"], dependencies=[Depends(require_auth)]
)

# Kleinunternehmer-Grenzen (Paragraph 19 UStG, Stand 2025): Vorjahr 25.000, laufend 100.000.
_LIMIT_PREV_YEAR = 25000
_LIMIT_CURRENT_YEAR = 100000


@router.get("/summary")
def summary(
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> dict:
    return stripe_adapter.get_summary(session, settings)


@router.get("/invoices")
def invoices(
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
    limit: int = Query(default=50, ge=1, le=200),
) -> dict:
    return {"invoices": stripe_adapter.get_invoices(session, settings, limit)}


@router.get("/thresholds")
def thresholds(
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> dict:
    fin = stripe_adapter.get_summary(session, settings)
    # Naeherung: Jahres-Ist aus 30-Tage-Umsatz hochgerechnet auf bisherige Jahres-Tage.
    now = utcnow()
    day_of_year = now.timetuple().tm_yday
    monthly = fin["gross_30d"]
    ytd_revenue = round(monthly / 30 * day_of_year, 2)
    projected_year_end = round(monthly / 30 * 365, 2)
    pct_used = (
        round(100.0 * ytd_revenue / _LIMIT_CURRENT_YEAR, 1)
        if _LIMIT_CURRENT_YEAR
        else 0.0
    )
    warn = projected_year_end >= _LIMIT_CURRENT_YEAR * 0.8
    return {
        "kleinunternehmer": {
            "limit_prev_year": _LIMIT_PREV_YEAR,
            "limit_current_year": _LIMIT_CURRENT_YEAR,
            "ytd_revenue": ytd_revenue,
            "pct_used": pct_used,
            "projected_year_end": projected_year_end,
            "warn": warn,
        }
    }
