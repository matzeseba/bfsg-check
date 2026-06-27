'use client';

import type { CockpitSummary } from '@/lib/types';

interface Props {
  summary: CockpitSummary;
}

function HealthDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`status-dot ${ok ? 'status-dot-success' : 'status-dot-error'}`}
      role="img"
      aria-label={ok ? 'System OK' : 'System-Fehler'}
    />
  );
}

function KpiItem({
  label,
  value,
  ariaLabel,
  color,
}: {
  label: string;
  value: string;
  ariaLabel: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center px-3 border-r border-white/10 last:border-r-0">
      <p
        className="text-lg font-bold tabular-nums"
        style={{ color: color ?? 'var(--text-primary)' }}
        aria-label={ariaLabel}
      >
        {value}
      </p>
      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap">
        {label}
      </p>
    </div>
  );
}

export function KpiHeader({ summary }: Props) {
  const { kpis, health } = summary;

  const cacColor =
    kpis.cac === null
      ? 'var(--text-muted)'
      : kpis.cac < 100
      ? 'var(--accent-success)'
      : kpis.cac <= kpis.cacCeiling
      ? 'var(--accent-warn)'
      : '#ef4444';

  return (
    <header
      className="glass-card px-4 py-3 flex items-center gap-2 overflow-x-auto"
      role="banner"
    >
      {/* Brand */}
      <div className="flex items-center gap-2 mr-4 flex-shrink-0">
        <span
          className="text-sm font-bold tracking-widest"
          style={{ color: 'var(--accent-primary)' }}
        >
          JARVIS
        </span>
        <span className="text-[10px] text-[var(--text-muted)] uppercase">Cockpit</span>
        <HealthDot ok={health.ok} />
      </div>

      <nav aria-label="KPI-Übersicht" className="flex items-center flex-1 overflow-x-auto">
        <KpiItem
          label="Heute"
          value={kpis.revenueToday.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          ariaLabel={`Umsatz heute: ${kpis.revenueToday.toFixed(2)} Euro`}
          color="var(--accent-success)"
        />
        <KpiItem
          label="Monat"
          value={kpis.revenueMonth.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          ariaLabel={`Umsatz Monat: ${kpis.revenueMonth.toFixed(2)} Euro`}
        />
        <KpiItem
          label="Sales (h/m)"
          value={`${kpis.salesToday} / ${kpis.salesMonth}`}
          ariaLabel={`Sales: ${kpis.salesToday} heute, ${kpis.salesMonth} Monat`}
        />
        <KpiItem
          label="MRR"
          value={
            kpis.aboEnabled
              ? kpis.mrr.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
              : `${kpis.mrr.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} (inaktiv)`
          }
          ariaLabel={`MRR: ${kpis.mrr.toFixed(2)} Euro${!kpis.aboEnabled ? ', Abo deaktiviert' : ''}`}
          color={kpis.aboEnabled ? undefined : 'var(--text-muted)'}
        />
        <KpiItem
          label={`CAC (Max ${kpis.cacCeiling}€)`}
          value={kpis.cac !== null ? kpis.cac.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : 'Nicht konfiguriert'}
          ariaLabel={`CAC: ${kpis.cac !== null ? kpis.cac.toFixed(2) + ' Euro' : 'nicht konfiguriert'}`}
          color={cacColor}
        />
        <KpiItem
          label="ROAS"
          value={kpis.roas !== null ? `${kpis.roas.toFixed(1)}x` : 'Nicht konfiguriert'}
          ariaLabel={`ROAS: ${kpis.roas !== null ? kpis.roas.toFixed(1) + 'x' : 'nicht konfiguriert'}`}
          color={kpis.roas !== null ? 'var(--accent-secondary)' : 'var(--text-muted)'}
        />
      </nav>

      <div className="flex items-center gap-3 flex-shrink-0 ml-4 text-xs text-[var(--text-muted)]">
        <span aria-label={`Stripe: ${health.stripe ? 'aktiv' : 'inaktiv'}`}>
          {health.stripe ? (
            <span style={{ color: 'var(--accent-success)' }}>Stripe ✓</span>
          ) : (
            <span className="text-red-400">Stripe ✗</span>
          )}
        </span>
        <span aria-label={`Mailer: ${health.mailer ? 'aktiv' : 'inaktiv'}`}>
          {health.mailer ? (
            <span style={{ color: 'var(--accent-success)' }}>Mail ✓</span>
          ) : (
            <span className="text-red-400">Mail ✗</span>
          )}
        </span>
      </div>
    </header>
  );
}
