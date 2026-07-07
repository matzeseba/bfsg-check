import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { api, ApiError } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { AsyncBoundary } from '../components/StateViews';
import { useToast } from '../components/Toast';
import { JobDrawer } from '../components/JobDrawer';
import {
  adCampaignStatusLabel,
  adChannelLabel,
  daysAgoISO,
  formatDateTime,
  formatEur,
  formatOrDash,
  formatPercent,
  todayISO,
} from '../lib/format';
import type { AdCampaign, AdChannel, Job } from '../types';

interface SummaryTile {
  label: string;
  value: string;
}

function SummaryTiles({ from, to }: { from: string; to: string }): ReactNode {
  const { data, error, loading, reload } = useFetch(() => api.getAdsSummary(from, to), [from, to]);
  return (
    <AsyncBoundary loading={loading} error={error} data={data} onRetry={reload}>
      {(s) => {
        const tiles: SummaryTile[] = [
          { label: 'Ausgaben', value: formatOrDash(s.spend, formatEur) },
          { label: 'Impressionen', value: formatOrDash(s.impressions) },
          { label: 'Klicks', value: formatOrDash(s.clicks) },
          { label: 'CPC', value: formatOrDash(s.cpc, formatEur) },
          { label: 'CTR', value: formatOrDash(s.ctr, formatPercent) },
          { label: 'Conversions', value: formatOrDash(s.conversions) },
          { label: 'CAC', value: formatOrDash(s.cac, formatEur) },
        ];
        return (
          <div className="kpi-grid">
            {tiles.map((t) => (
              <div key={t.label} className="card kpi-tile">
                <div className="kpi-label">{t.label}</div>
                <div className="kpi-value">{t.value}</div>
              </div>
            ))}
          </div>
        );
      }}
    </AsyncBoundary>
  );
}

function CreateCampaignModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}): ReactNode {
  const toast = useToast();
  const [goal, setGoal] = useState('');
  const [channel, setChannel] = useState<AdChannel>('google');
  const [budget, setBudget] = useState('10');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (): Promise<void> => {
    if (goal.trim() === '') {
      toast('Bitte ein Ziel/Thema angeben', 'error');
      return;
    }
    const budgetNum = Number(budget.replace(',', '.'));
    if (!Number.isFinite(budgetNum) || budgetNum <= 0) {
      toast('Bitte ein gültiges Tagesbudget angeben', 'error');
      return;
    }
    setBusy(true);
    try {
      await api.generateAdsCampaign({
        goal: goal.trim(),
        channel,
        budgetPerDay: budgetNum,
        notes: notes.trim(),
      });
      toast(
        'Kampagne wird recherchiert und ausgearbeitet — erscheint danach unter „Wartet auf Freigabe"',
        'success',
      );
      onCreated();
      onClose();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Erstellen fehlgeschlagen', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <h2 className="card-title">Neue Kampagne erstellen</h2>

        <ol className="modal-steps">
          <li>Der Agent recherchiert Keywords/Zielgruppe und entwirft die Kampagne.</li>
          <li>Du prüfst den Entwurf im Content-Review.</li>
          <li>Du gibst die Kampagne frei.</li>
          <li>
            Du schaltest sie selbst in Google/Bing Ads live und bestätigst das hier mit „Live
            geschaltet" + Link.
          </li>
        </ol>

        <label className="field" htmlFor="campaign-goal">
          <span className="field-label">Ziel / Thema</span>
          <input
            id="campaign-goal"
            name="goal"
            className="text-input"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="z. B. BFSG-Pflicht für Online-Shops"
            disabled={busy}
          />
        </label>

        <label className="field" htmlFor="campaign-channel">
          <span className="field-label">Kanal</span>
          <select
            id="campaign-channel"
            name="channel"
            className="select"
            value={channel}
            onChange={(e) => setChannel(e.target.value as AdChannel)}
            disabled={busy}
          >
            <option value="google">Google Ads</option>
            <option value="bing">Bing Ads</option>
          </select>
        </label>

        <label className="field" htmlFor="campaign-budget">
          <span className="field-label">Tagesbudget (€)</span>
          <input
            id="campaign-budget"
            name="budgetPerDay"
            className="text-input"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            inputMode="decimal"
            disabled={busy}
          />
        </label>

        <label className="field" htmlFor="campaign-notes">
          <span className="field-label">Notizen (optional)</span>
          <textarea
            id="campaign-notes"
            name="notes"
            className="import-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={busy}
          />
        </label>

        <div className="import-actions">
          <button type="button" className="btn btn-primary" disabled={busy} onClick={submit}>
            Kampagne erstellen
          </button>
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={onClose}>
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}

interface MetricsFormState {
  date: string;
  impressions: string;
  clicks: string;
  costEur: string;
  conversions: string;
}

function emptyMetricsForm(): MetricsFormState {
  return { date: todayISO(), impressions: '', clicks: '', costEur: '', conversions: '' };
}

function CampaignDrawer({
  campaign,
  jobsById,
  onClose,
  onChanged,
  onOpenJob,
}: {
  campaign: AdCampaign;
  jobsById: Map<string, Job>;
  onClose: () => void;
  onChanged: () => void;
  onOpenJob: (job: Job) => void;
}): ReactNode {
  const toast = useToast();
  const {
    data: metrics,
    error,
    loading,
    reload,
  } = useFetch(() => api.getCampaignMetrics(campaign.id), [campaign.id]);
  const [busy, setBusy] = useState(false);
  const [liveUrl, setLiveUrl] = useState('');
  const [form, setForm] = useState<MetricsFormState>(emptyMetricsForm());

  const linkedJob = campaign.jobId ? (jobsById.get(campaign.jobId) ?? null) : null;

  const confirmLive = async (): Promise<void> => {
    setBusy(true);
    try {
      await api.setCampaignLive(campaign.id, liveUrl);
      toast(`„${campaign.name}" ist live`, 'success');
      onChanged();
      onClose();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Aktion fehlgeschlagen', 'error');
    } finally {
      setBusy(false);
    }
  };

  const pause = async (): Promise<void> => {
    setBusy(true);
    try {
      await api.pauseCampaign(campaign.id);
      toast(`„${campaign.name}" pausiert`, 'success');
      onChanged();
      onClose();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Aktion fehlgeschlagen', 'error');
    } finally {
      setBusy(false);
    }
  };

  const submitMetrics = async (): Promise<void> => {
    const impressions = Number(form.impressions);
    const clicks = Number(form.clicks);
    const costEur = Number(form.costEur.replace(',', '.'));
    const conversions = Number(form.conversions);
    if (![impressions, clicks, costEur, conversions].every(Number.isFinite)) {
      toast('Bitte alle Werte als Zahl angeben', 'error');
      return;
    }
    setBusy(true);
    try {
      await api.postAdMetrics({
        campaignId: campaign.id,
        date: form.date,
        impressions,
        clicks,
        costEur,
        conversions,
      });
      toast('Tageswerte gespeichert', 'success');
      setForm(emptyMetricsForm());
      reload();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Speichern fehlgeschlagen', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label={campaign.name}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <h2 className="drawer-title">{campaign.name}</h2>
            <div className="job-meta">
              <span className={`status-pill ad-status-${campaign.status}`}>
                {adCampaignStatusLabel(campaign.status)}
              </span>
              <span className="chip chip-channel">{adChannelLabel(campaign.channel)}</span>
              <span className="chip">{formatEur(campaign.budgetPerDay)}/Tag</span>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm drawer-close" onClick={onClose}>
            Schließen ✕
          </button>
        </div>

        <div className="drawer-section">
          <h3 className="drawer-section-title">Ziel</h3>
          <p>{campaign.goal}</p>
          {campaign.notes ? <p className="muted">{campaign.notes}</p> : null}
        </div>

        {linkedJob ? (
          <div className="drawer-section">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onOpenJob(linkedJob)}
            >
              Zugehörige Aufgabe öffnen →
            </button>
          </div>
        ) : null}

        {campaign.status === 'freigegeben' ? (
          <div className="drawer-section publish-confirm">
            <p className="muted">
              Wenn du die Kampagne in Google/Bing Ads live geschaltet hast, bestätige das hier.
            </p>
            <label className="field" htmlFor="campaign-live-url">
              <span className="field-label">Live-URL (optional)</span>
              <input
                id="campaign-live-url"
                name="liveUrl"
                type="url"
                className="text-input"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://ads.google.com/…"
                disabled={busy}
              />
            </label>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={confirmLive}>
              Live geschaltet
            </button>
          </div>
        ) : null}

        {campaign.status === 'live' ? (
          <div className="drawer-section">
            <p>Live seit {formatDateTime(campaign.liveAt)}</p>
            {campaign.liveUrl ? (
              <a href={campaign.liveUrl} target="_blank" rel="noreferrer noopener">
                {campaign.liveUrl}
              </a>
            ) : null}
            <div className="drawer-actions">
              <button type="button" className="btn btn-ghost" disabled={busy} onClick={pause}>
                Pausieren
              </button>
            </div>
          </div>
        ) : null}

        <div className="drawer-section">
          <h3 className="drawer-section-title">Tageswerte nachtragen</h3>
          <div className="metrics-form">
            <label className="field" htmlFor="metric-date">
              <span className="field-label">Datum</span>
              <input
                id="metric-date"
                name="date"
                type="date"
                className="text-input"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </label>
            <label className="field" htmlFor="metric-impressions">
              <span className="field-label">Impressionen</span>
              <input
                id="metric-impressions"
                name="impressions"
                className="text-input"
                inputMode="numeric"
                value={form.impressions}
                onChange={(e) => setForm((f) => ({ ...f, impressions: e.target.value }))}
              />
            </label>
            <label className="field" htmlFor="metric-clicks">
              <span className="field-label">Klicks</span>
              <input
                id="metric-clicks"
                name="clicks"
                className="text-input"
                inputMode="numeric"
                value={form.clicks}
                onChange={(e) => setForm((f) => ({ ...f, clicks: e.target.value }))}
              />
            </label>
            <label className="field" htmlFor="metric-cost">
              <span className="field-label">Kosten (€)</span>
              <input
                id="metric-cost"
                name="costEur"
                className="text-input"
                inputMode="decimal"
                value={form.costEur}
                onChange={(e) => setForm((f) => ({ ...f, costEur: e.target.value }))}
              />
            </label>
            <label className="field" htmlFor="metric-conversions">
              <span className="field-label">Conversions</span>
              <input
                id="metric-conversions"
                name="conversions"
                className="text-input"
                inputMode="numeric"
                value={form.conversions}
                onChange={(e) => setForm((f) => ({ ...f, conversions: e.target.value }))}
              />
            </label>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={busy}
              onClick={submitMetrics}
            >
              Speichern
            </button>
          </div>
        </div>

        <div className="drawer-section">
          <h3 className="drawer-section-title">Verlauf</h3>
          <AsyncBoundary
            loading={loading}
            error={error}
            data={metrics}
            onRetry={reload}
            isEmpty={(m) => m.length === 0}
            emptyMessage="Noch keine Tageswerte erfasst."
          >
            {(m) => (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Datum</th>
                      <th className="num">Impr.</th>
                      <th className="num">Klicks</th>
                      <th className="num">Kosten</th>
                      <th className="num">Conv.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...m]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((row) => (
                        <tr key={row.date}>
                          <td>{row.date}</td>
                          <td className="num">{row.impressions}</td>
                          <td className="num">{row.clicks}</td>
                          <td className="num">{formatEur(row.costEur)}</td>
                          <td className="num">{row.conversions}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </AsyncBoundary>
        </div>
      </aside>
    </div>
  );
}

export function PaidAds(): ReactNode {
  const from = useMemo(() => daysAgoISO(29), []);
  const to = useMemo(() => todayISO(), []);

  const { data: campaigns, error, loading, reload } = useFetch(() => api.getAdsCampaigns(), []);
  const { data: allJobs, reload: reloadJobs } = useFetch(() => api.getJobs(), []);
  const jobsById = useMemo(() => {
    const map = new Map<string, Job>();
    (allJobs ?? []).forEach((j) => map.set(j.id, j));
    return map;
  }, [allJobs]);

  const [showCreate, setShowCreate] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);
  const [openJob, setOpenJob] = useState<Job | null>(null);

  const handleChanged = useCallback(() => {
    reload();
    reloadJobs();
  }, [reload, reloadJobs]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Paid Ads</h1>
          <p className="page-subtitle">Google &amp; Bing Ads — Performance, Kampagnen, Freigaben</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)}>
            Neue Kampagne erstellen
          </button>
        </div>
      </header>

      <SummaryTiles from={from} to={to} />

      <div className="card campaigns-card stack-gap">
        <h2 className="card-title">Kampagnen</h2>
        <AsyncBoundary
          loading={loading}
          error={error}
          data={campaigns}
          onRetry={reload}
          isEmpty={(c) => c.length === 0}
          emptyMessage="Noch keine Kampagnen — erstelle die erste."
        >
          {(list) => (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Kanal</th>
                    <th className="num">Tagesbudget</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((c) => (
                    <tr key={c.id} className="clickable-row" onClick={() => setSelectedCampaign(c)}>
                      <td>{c.name}</td>
                      <td>{adChannelLabel(c.channel)}</td>
                      <td className="num">{formatEur(c.budgetPerDay)}</td>
                      <td>
                        <span className={`status-pill ad-status-${c.status}`}>
                          {adCampaignStatusLabel(c.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AsyncBoundary>
      </div>

      {selectedCampaign ? (
        <CampaignDrawer
          key={selectedCampaign.id}
          campaign={selectedCampaign}
          jobsById={jobsById}
          onClose={() => setSelectedCampaign(null)}
          onChanged={handleChanged}
          onOpenJob={(job) => {
            setSelectedCampaign(null);
            setOpenJob(job);
          }}
        />
      ) : null}

      {openJob ? (
        <JobDrawer key={openJob.id} job={openJob} onClose={() => setOpenJob(null)} onChanged={reloadJobs} />
      ) : null}

      {showCreate ? (
        <CreateCampaignModal onClose={() => setShowCreate(false)} onCreated={reload} />
      ) : null}
    </div>
  );
}
