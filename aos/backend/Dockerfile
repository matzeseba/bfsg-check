# AOS-Backend (Team Beta) — FastAPI + APScheduler.
# Build erfolgt auf dem Server (lokal kein Docker) — muss ohne lokalen Test korrekt sein.
FROM python:3.12-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    TZ=Europe/Berlin

WORKDIR /app

# Abhaengigkeiten zuerst (Layer-Cache).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Datenverzeichnis fuer das SQLite-Volume (aos_data -> /data).
RUN mkdir -p /data

EXPOSE 8100

# Hinweis zur Rechtevergabe: Der Host-Adapter kann optional den Docker-Socket
# (/var/run/docker.sock) lesen (nur bei AOS_DOCKER_SOCK=true). Der Socket gehoert
# root:docker — ein non-root-User im Container haette darauf ohne passende GID keinen
# Zugriff. Daher laeuft der Container pragmatisch als root (Default). Bei Betrieb ohne
# Docker-Socket-Feature kann problemlos ein non-root-User ergaenzt werden.

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8100"]
