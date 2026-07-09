# EIN gemeinsames Image für alle 4 AOS-MCP-Agenten (Team Beta-2).
#
# Erwarteter Build-Context: aos/mcp/  (dieses Dockerfile liegt in common/).
#   Beispiel: docker build -f common/Dockerfile -t aos-mcp aos/mcp
#   bzw. via docker-compose.aos.yml: context: ../mcp, dockerfile: common/Dockerfile
#
# Pro Agent unterscheidet sich nur AGENT_MODULE + AGENT_PORT (Env, in Compose gesetzt):
#   research_agent.agent:app   / 8101
#   leadscore_agent.agent:app  / 8102
#   competitor_agent.agent:app / 8103
#   debrief_agent.agent:app    / 8104

FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Abhängigkeiten zuerst (Layer-Cache)
COPY common/requirements.txt ./common/requirements.txt
RUN pip install --no-cache-dir -r common/requirements.txt

# Gesamten MCP-Code kopieren (common + alle Agenten-Pakete)
COPY . .

# Non-root-User
RUN useradd -m -u 10001 appuser && chown -R appuser:appuser /app
USER appuser

# Default = Research-Agent; von Compose je Container überschrieben
ENV AGENT_MODULE=research_agent.agent:app \
    AGENT_PORT=8101

EXPOSE 8101 8102 8103 8104

# shell-Form, damit $AGENT_MODULE / $AGENT_PORT expandiert werden
CMD uvicorn $AGENT_MODULE --host 0.0.0.0 --port $AGENT_PORT
