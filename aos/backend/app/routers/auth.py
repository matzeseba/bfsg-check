"""Auth-Router: login, logout, me. login bleibt oeffentlich (siehe main.py)."""

from __future__ import annotations

import hmac

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel

from ..auth import COOKIE_NAME, _TTL_SECONDS, make_session_cookie, require_auth
from ..config import Settings, get_settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginIn(BaseModel):
    token: str


@router.post("/login")
def login(
    body: LoginIn, response: Response, settings: Settings = Depends(get_settings)
) -> dict:
    if not settings.admin_token or not hmac.compare_digest(
        body.token, settings.admin_token
    ):
        raise HTTPException(status_code=401, detail="Ungueltiger Token")
    cookie = make_session_cookie(settings.session_secret)
    response.set_cookie(
        key=COOKIE_NAME,
        value=cookie,
        max_age=_TTL_SECONDS,
        httponly=True,
        secure=True,
        samesite="lax",
        path="/",
    )
    return {"ok": True}


@router.post("/logout")
def logout(response: Response) -> dict:
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"ok": True}


@router.get("/me")
def me(request: Request, _: bool = Depends(require_auth)) -> dict:
    return {"authenticated": True}
