'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

import { fetchSummary, fetchActions } from '@/lib/api';
import type { CockpitSummary, ActionDef } from '@/lib/types';

import { KpiHeader } from '@/components/KpiHeader';
import { AgentLauncher } from '@/components/AgentLauncher';
import { AgentJobPanel } from '@/components/AgentJobPanel';
import { VoiceBar } from '@/components/VoiceBar';

import { TageskassePanel } from '@/components/panels/TageskassePanel';
import { MonatsPerformancePanel } from '@/components/panels/MonatsPerformancePanel';
import { PaketSplitPanel } from '@/components/panels/PaketSplitPanel';
import { LetzteBestellungenPanel } from '@/components/panels/LetzteBestellungenPanel';
import { GoogleAdsPanel } from '@/components/panels/GoogleAdsPanel';
import { KampagnenPanel } from '@/components/panels/KampagnenPanel';
import { BudgetAmpelPanel } from '@/components/panels/BudgetAmpelPanel';
import { ScanFunnelPanel } from '@/components/panels/ScanFunnelPanel';
import { HealthStatusPanel } from '@/components/panels/HealthStatusPanel';
import { UptimeHistoryPanel } from '@/components/panels/UptimeHistoryPanel';
import { DeployStatusPanel } from '@/components/panels/DeployStatusPanel';
import { UnitEconomicsPanel } from '@/components/panels/UnitEconomicsPanel';
import { AdsBurnRatePanel } from '@/components/panels/AdsBurnRatePanel';
import { NeueKampagnePanel } from '@/components/panels/NeueKampagnePanel';
import { SecondBrainSearch } from '@/components/SecondBrainSearch';

const POLL_INTERVAL_MS = 60_000;

function LoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-screen gap-4 p-4" aria-busy="true" aria-label="Wird geladen">
      <div className="glass-card h-14 animate-pulse" />
      <div className="bento-grid flex-1">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="glass-card h-40 animate-pulse" />
        ))}
      </div>
      <div className="glass-card h-32 animate-pulse" />
      <div className="glass-card h-12 animate-pulse" />
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4" role="alert">
      <AlertCircle className="w-12 h-12" style={{ color: '#ef4444' }} aria-hidden="true" />
      <p className="text-lg font-semibold text-red-400">Verbindungsfehler</p>
      <p className="text-sm text-[var(--text-muted)] max-w-md text-center">{error}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/30 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]"
        aria-label="Erneut versuchen"
      >
        <RefreshCw className="w-4 h-4" aria-hidden="true" />
        Erneut versuchen
      </button>
    </div>
  );
}

export default function CockpitPage() {
  const [summary, setSummary] = useState<CockpitSummary | null>(null);
  const [actions, setActions] = useState<ActionDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [sum] = await Promise.all([fetchSummary()]);
      setSummary(sum);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Backend unter http://127.0.0.1:4317 nicht erreichbar'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadActions = useCallback(async () => {
    try {
      const acts = await fetchActions();
      setActions(acts);
    } catch {
      // Actions sind optional — kein Hard-Error
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
    loadActions();
  }, [loadData, loadActions]);

  // Polling every 60s
  useEffect(() => {
    const timer = setInterval(loadData, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [loadData]);

  if (loading) return <LoadingSkeleton />;
  if (error && !summary) return <ErrorState error={error} onRetry={loadData} />;

  // Fallback summary if backend is down but we have cached data
  const s = summary!;

  return (
    <div className="flex flex-col min-h-screen gap-4 p-4">
      {/* KPI Header */}
      <KpiHeader summary={s} />

      {/* Bento Grid */}
      <main>
        <section aria-label="Dashboard-Panels" className="bento-grid">
          {/* Row 1 */}
          <div className="panel-small">
            <TageskassePanel kpis={s.kpis} />
          </div>
          <div className="panel-small">
            <MonatsPerformancePanel kpis={s.kpis} />
          </div>
          <div className="panel-small">
            <UptimeHistoryPanel uptime={s.uptime} />
          </div>
          <div className="panel-small">
            <DeployStatusPanel deploy={s.deploy} />
          </div>

          {/* Row 2 */}
          <div className="panel-medium">
            <LetzteBestellungenPanel recentOrders={s.recentOrders} />
          </div>
          <div className="panel-small">
            <HealthStatusPanel health={s.health} onRefresh={loadData} />
          </div>
          <div className="panel-small">
            <BudgetAmpelPanel kpis={s.kpis} budget={s.budget} />
          </div>

          {/* Row 3 */}
          <div className="panel-medium">
            <GoogleAdsPanel ads={s.ads} />
          </div>
          <div className="panel-small">
            <PaketSplitPanel packageSplit={s.packageSplit} />
          </div>
          <div className="panel-small">
            <ScanFunnelPanel funnel={s.funnel} />
          </div>

          {/* Row 4 */}
          <div className="panel-small">
            <UnitEconomicsPanel kpis={s.kpis} />
          </div>
          <div className="panel-small">
            <AdsBurnRatePanel budget={s.budget} kpis={s.kpis} />
          </div>
          <div className="panel-small">
            <KampagnenPanel ads={s.ads} />
          </div>
          <div className="panel-small">
            <NeueKampagnePanel onJobStart={setActiveJobId} />
          </div>

          {/* Second Brain */}
          <div className="panel-medium">
            <SecondBrainSearch />
          </div>
        </section>
      </main>

      {/* Agent Launcher + Job Panel */}
      <section aria-label="Agent-Steuerung">
        <AgentLauncher actions={actions} onJobStart={setActiveJobId} />
        {activeJobId && (
          <AgentJobPanel jobId={activeJobId} onClose={() => setActiveJobId(null)} />
        )}
      </section>

      {/* Voice Bar */}
      <VoiceBar onJobStart={setActiveJobId} />
    </div>
  );
}
