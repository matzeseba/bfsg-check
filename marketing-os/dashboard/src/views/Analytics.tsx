import { useMemo, useState, type ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, ApiError } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { AsyncBoundary } from '../components/StateViews';
import { useToast } from '../components/Toast';
import { DemoBanner, DemoTag } from '../components/DemoBanner';
import { channelLabel, daysAgoISO, metricLabel, METRIC_ORDER, todayISO } from '../lib/format';
import type { Kpi, KpiMetric } from '../types';

const ACCENT = '#F97316';

function aggregateByDate(kpis: Kpi[], metric: KpiMetric): { date: string; value: number }[] {
  const map = new Map<string, number>();
  for (const k of kpis) {
    if (k.metric !== metric) continue;
    map.set(k.date, (map.get(k.date) ?? 0) + k.value);
  }
  return [...map.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function aggregateByChannel(
  kpis: Kpi[],
  metric: KpiMetric,
): { channel: string; value: number }[] {
  const map = new Map<string, number>();
  for (const k of kpis) {
    if (k.metric !== metric) continue;
    map.set(k.channel, (map.get(k.channel) ?? 0) + k.value);
  }
  return [...map.entries()]
    .map(([channel, value]) => ({ channel: channelLabel(channel), value }))
    .sort((a, b) => b.value - a.value);
}

function shortDate(iso: string): string {
  const parts = iso.split('-');
  if (parts.length === 3) return `${parts[2]}.${parts[1]}.`;
  return iso;
}

function ImportDialog({ onImported }: { onImported: () => void }): ReactNode {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (): Promise<void> => {
    let kpis: Kpi[];
    try {
      const parsed: unknown = JSON.parse(text);
      const arr = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === 'object' && 'kpis' in parsed
          ? (parsed as { kpis: unknown }).kpis
          : null;
      if (!Array.isArray(arr)) {
        throw new Error('Erwartet: JSON-Array oder { "kpis": [...] }');
      }
      kpis = arr as Kpi[];
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ungültiges JSON', 'error');
      return;
    }

    setBusy(true);
    try {
      const imported = await api.importKpis(kpis);
      toast(`${imported} KPI-Einträge importiert`, 'success');
      setText('');
      setOpen(false);
      onImported();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Import fehlgeschlagen', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button type="button" className="btn btn-ghost" onClick={() => setOpen(true)}>
        KPIs importieren
      </button>
    );
  }

  return (
    <div className="card import-dialog">
      <h2 className="card-title">KPI-Import (JSON)</h2>
      <p className="muted import-hint">
        Format: <code>{'{ "kpis": [{ "date": "2026-07-01", "channel": "seo_pillar", "metric": "leads", "value": 3 }] }'}</code>
      </p>
      <textarea
        className="import-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='{ "kpis": [ … ] }'
        spellCheck={false}
      />
      <div className="import-actions">
        <button type="button" className="btn btn-primary" disabled={busy} onClick={submit}>
          Importieren
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy}
          onClick={() => setOpen(false)}
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}

export function Analytics(): ReactNode {
  const from = useMemo(() => daysAgoISO(29), []);
  const to = useMemo(() => todayISO(), []);
  const [includeDemo, setIncludeDemo] = useState(false);
  const { data, error, loading, reload } = useFetch(
    () => api.getKpis(from, to, includeDemo),
    [from, to, includeDemo],
  );
  const [metric, setMetric] = useState<KpiMetric>('leads');

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">KPI-Verlauf der letzten 30 Tage</p>
        </div>
        <div className="page-actions">
          <label className="field">
            <span className="field-label">Metrik</span>
            <select
              className="select"
              value={metric}
              onChange={(e) => setMetric(e.target.value as KpiMetric)}
            >
              {METRIC_ORDER.map((m) => (
                <option key={m} value={m}>
                  {metricLabel(m)}
                </option>
              ))}
            </select>
          </label>
          <ImportDialog onImported={reload} />
        </div>
      </header>

      <AsyncBoundary loading={loading} error={error} data={data} onRetry={reload}>
        {(wrapped) => {
          const kpis = wrapped.data;
          const showDemoTag = wrapped.meta.hasDemo;
          const overTime = aggregateByDate(kpis, metric).map((d) => ({
            ...d,
            label: shortDate(d.date),
          }));
          const byChannel = aggregateByChannel(kpis, metric);
          const hasData = kpis.some((k) => k.metric === metric);

          const demoControls = wrapped.meta.hasDemo ? (
            <DemoBanner
              demoCount={wrapped.meta.demoCount}
              showingDemo={includeDemo}
              onToggle={() => setIncludeDemo((v) => !v)}
            />
          ) : !includeDemo ? (
            <div className="demo-toggle-hint">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setIncludeDemo(true)}
              >
                Demo-Daten anzeigen
              </button>
            </div>
          ) : null;

          if (!hasData) {
            return (
              <>
                {demoControls}
                <div className="card">
                  <p className="muted">
                    Noch keine echten Daten für „{metricLabel(metric)}" im Zeitraum {from} bis{' '}
                    {to}. KPIs über den Import-Dialog hinzufügen{includeDemo ? '' : ' oder Demo-Daten anzeigen'}.
                  </p>
                </div>
              </>
            );
          }

          return (
            <>
              {demoControls}
              <div className={`analytics-grid${demoControls ? ' stack-gap' : ''}`}>
              <div className="card chart-card">
                <h2 className="card-title">
                  {metricLabel(metric)} über Zeit {showDemoTag ? <DemoTag /> : null}
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={overTime} margin={{ top: 8, right: 16, bottom: 4, left: -12 }}>
                    <CartesianGrid stroke="#272e3b" strokeDasharray="3 3" />
                    <XAxis dataKey="label" stroke="#9aa7b4" fontSize={12} tickMargin={8} />
                    <YAxis stroke="#9aa7b4" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: '#161b22',
                        border: '1px solid #272e3b',
                        borderRadius: 8,
                        color: '#e6edf3',
                      }}
                      labelStyle={{ color: '#9aa7b4' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={metricLabel(metric)}
                      stroke={ACCENT}
                      strokeWidth={2}
                      dot={{ r: 2, fill: ACCENT }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card chart-card">
                <h2 className="card-title">
                  {metricLabel(metric)} nach Kanal {showDemoTag ? <DemoTag /> : null}
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={byChannel} margin={{ top: 8, right: 16, bottom: 4, left: -12 }}>
                    <CartesianGrid stroke="#272e3b" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="channel"
                      stroke="#9aa7b4"
                      fontSize={11}
                      tickMargin={8}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke="#9aa7b4" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(249,115,22,0.08)' }}
                      contentStyle={{
                        background: '#161b22',
                        border: '1px solid #272e3b',
                        borderRadius: 8,
                        color: '#e6edf3',
                      }}
                      labelStyle={{ color: '#9aa7b4' }}
                    />
                    <Bar dataKey="value" name={metricLabel(metric)} fill={ACCENT} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              </div>
            </>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
