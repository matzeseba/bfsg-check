# BFSG-Audit Server — lauffähiges Image inkl. Chromium (für Playwright).
# Deploy z. B. auf Render, Railway, Fly.io oder einem Hetzner-Server.
# Hinweis: Vercel-Serverless eignet sich NICHT (Playwright/Chromium zu schwer) —
# nutze einen Container-/VPS-Host.

# Base-Image-Version MUSS zu playwright in package.json passen (sonst Chromium-Revision-Mismatch
# → "Executable doesn't exist", weil --ignore-scripts den postinstall-Browser-Download überspringt).
FROM mcr.microsoft.com/playwright:v1.55.1-jammy

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --ignore-scripts

COPY . .

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "app.js"]
