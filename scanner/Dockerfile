# BFSG-Audit Server — lauffähiges Image inkl. Chromium (für Playwright).
# Deploy z. B. auf Render, Railway, Fly.io oder einem Hetzner-Server.
# Hinweis: Vercel-Serverless eignet sich NICHT (Playwright/Chromium zu schwer) —
# nutze einen Container-/VPS-Host.

FROM mcr.microsoft.com/playwright:v1.49.1-jammy

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --ignore-scripts

COPY . .

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "app.js"]
