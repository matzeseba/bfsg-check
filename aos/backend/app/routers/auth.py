"""Auth-Router: login, logout, me, set-password. login bleibt oeffentlich (main.py).

Login-Logik (Einzel-Admin-Dashboard):
  - Ist noch KEIN Passwort gesetzt: nur der Bootstrap-Token (AOS_ADMIN_TOKEN) ist
    gueltig; die Antwort signalisiert must_set_password=True → das Frontend leitet
    auf /set-password.
  - Ist ein Passwort gesetzt: es zaehlt das Passwort ODER (als Notfall-/Recovery-
    Zugang) weiterhin der Bootstrap-Token.
"""

from __future__ import annotations

import hmac

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel
from sqlmodel import Session, select

from ..auth import (
    COOKIE_NAME,
    MAX_PASSWORD_LEN,
    MIN_PASSWORD_LEN,
    _TTL_SECONDS,
    hash_password,
    make_session_cookie,
    require_auth,
    verify_password,
)
from ..config import Settings, get_settings
from ..db import get_session, utcnow
from ..models import AuthCredential

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginIn(BaseModel):
    token: str  # akzeptiert Passwort ODER Bootstrap-Token


class SetPasswordIn(BaseModel):
    new_password: str


def _load_credential(session: Session) -> AuthCredential | None:
    return session.exec(select(AuthCredential)).first()


def _token_ok(secret: str, settings: Settings) -> bool:
    return bool(settings.admin_token) and hmac.compare_digest(
        secret, settings.admin_token
    )


def _set_session_cookie(response: Response, settings: Settings) -> None:
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


@router.post("/login")
def login(
    body: LoginIn,
    response: Response,
    settings: Settings = Depends(get_settings),
    session: Session = Depends(get_session),
) -> dict:
    secret = body.token
    cred = _load_credential(session)

    if cred is not None:
        password_ok = verify_password(
            secret, cred.password_hash, cred.salt, cred.iterations
        )
        if not (password_ok or _token_ok(secret, settings)):
            raise HTTPException(status_code=401, detail="Passwort oder Token ungueltig")
    else:
        if not _token_ok(secret, settings):
            raise HTTPException(status_code=401, detail="Ungueltiger Token")

    _set_session_cookie(response, settings)
    return {"ok": True, "must_set_password": cred is None}


@router.post("/set-password")
def set_password(
    body: SetPasswordIn,
    _: bool = Depends(require_auth),
    session: Session = Depends(get_session),
) -> dict:
    pw = body.new_password
    if not (MIN_PASSWORD_LEN <= len(pw) <= MAX_PASSWORD_LEN):
        raise HTTPException(
            status_code=422,
            detail=f"Passwort muss zwischen {MIN_PASSWORD_LEN} und {MAX_PASSWORD_LEN} Zeichen lang sein",
        )
    pw_hash, salt, iterations = hash_password(pw)
    cred = _load_credential(session)
    if cred is None:
        cred = AuthCredential(password_hash=pw_hash, salt=salt, iterations=iterations)
    else:
        cred.password_hash = pw_hash
        cred.salt = salt
        cred.iterations = iterations
        cred.updated_at = utcnow()
    session.add(cred)
    session.commit()
    return {"ok": True}


@router.post("/logout")
def logout(response: Response) -> dict:
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"ok": True}


@router.get("/me")
def me(
    request: Request,
    _: bool = Depends(require_auth),
    session: Session = Depends(get_session),
) -> dict:
    return {"authenticated": True, "must_set_password": _load_credential(session) is None}
