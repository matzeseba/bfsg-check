'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { CockpitSummary } from '@/lib/types';

interface Props {
  health: CockpitSummary['health'];
  onRefresh?: () => void;
}

type HealthKey = 'ok' | 'stripe' | 'live' | 'mailer';

const HEALTH_LABELS: Record<HealthKey, string> = {
  ok: 'System',
  stripe: 'Stripe',
  live: 'Live-Modus',
  mailer: 'E-Mail',
};

const HEALTH_DESC: Record<HealthKey, string> = {
  ok: 'Backend erreichbar',
  stripe: 'Zahlungsabwicklung aktiv',
  live: 'Produktionsmodus aktiv',
  mailer: 'E-Mail-Versand aktiv',
};

export function HealthStatusPanel({ health, onRefresh }: Props) {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      onRefresh?.();
    }, 30000);
    return () => clearInterval(interval);
  }, [onRefresh]);

  const keys: HealthKey[] = ['ok', 'stripe', 'live', 'mailer'];

  return (
    <div className="glass-card p-4 h-full flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        System-Health
      </h2>

      <div className="flex flex-col gap-2 flex-1">
        {keys.map((key) => {
          const isOk = health[key];
          return (
            <div
              key={key}
              className="flex items-start gap-2"
              role="status"
              aria-label={`${HEALTH_LABELS[key]}: ${isOk ? 'OK' : 'Fehler'}`}
            >
              {isOk ? (
                <CheckCircle
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ color: 'var(--accent-success)' }}
                  aria-hidden="true"
                />
              ) : (
                <XCircle
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ color: '#ef4444' }}
                  aria-hidden="true"
                />
              )}
              <div>
                <p className="text-xs font-medium text-[var(--text-primary)]">
                  {HEALTH_LABELS[key]}
                  <span
                    className={`ml-2 text-xs ${isOk ? 'text-[var(--accent-success)]' : 'text-red-400'}`}
                  >
                    {isOk ? 'OK' : 'FEHLER'}
                  </span>
                </p>
                <p className="text-xs text-[var(--text-muted)]">{HEALTH_DESC[key]}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-[var(--text-muted)]">
        Letzter Check: <time dateTime={health.checkedAt}>{new Date(health.checkedAt).toLocaleTimeString('de-DE')}</time>
        {' '}· Auto-Refresh in 30s
      </p>
    </div>
  );
}
