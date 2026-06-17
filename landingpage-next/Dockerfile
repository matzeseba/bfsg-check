# Multi-Stage Build für Next.js 16 (standalone-Output → schlankes Production-Image).
# Erwartet: next.config.ts hat `output: 'standalone'` (ist bereits gesetzt).

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# --no-audit + --no-fund für schnelleren CI-Build, keine Sicherheit-Einbuße (Audit läuft separat in W5).
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root-User für Defense-in-Depth.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Standalone-Build enthält Server + minimal node_modules; static + public separat.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Healthcheck — Caddy soll keine 503er an User durchreichen wenn Next.js noch bootet.
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
