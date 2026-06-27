'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { launchAction } from '@/lib/api';

interface Props {
  onJobStart: (jobId: string) => void;
}

export function NeueKampagnePanel({ onJobStart }: Props) {
  const [goal, setGoal] = useState('');
  const [audience, setAudience] = useState('');
  const [dailyBudget, setDailyBudget] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    const budget = Math.min(dailyBudget, 15);

    setLoading(true);
    setError(null);
    try {
      const { jobId } = await launchAction('A05', {
        goal: goal.trim(),
        audience: audience.trim() || undefined,
        dailyBudget: budget,
      });
      onJobStart(jobId);
      setGoal('');
      setAudience('');
      setDailyBudget(10);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Starten der Kampagne');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-4 h-full flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Neue Kampagne
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1">
        <div>
          <label htmlFor="campaign-goal" className="block text-xs text-[var(--text-muted)] mb-1">
            Kampagnenziel <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="campaign-goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
            rows={2}
            placeholder="Ziel der Kampagne beschreiben..."
            className="w-full bg-white/5 border border-white/10 rounded text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] p-2 resize-none focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="campaign-audience" className="block text-xs text-[var(--text-muted)] mb-1">
            Zielgruppe
          </label>
          <input
            id="campaign-audience"
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="z.B. Webseitenbetreiber, Online-Shops"
            className="w-full bg-white/5 border border-white/10 rounded text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] p-2 focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
          />
        </div>

        <div>
          <label htmlFor="campaign-budget" className="block text-xs text-[var(--text-muted)] mb-1">
            Tagesbudget (max. 15 €)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="campaign-budget"
              type="number"
              min={1}
              max={15}
              step={1}
              value={dailyBudget}
              onChange={(e) => setDailyBudget(Math.min(15, Math.max(1, Number(e.target.value))))}
              className="w-24 bg-white/5 border border-white/10 rounded text-xs text-[var(--text-primary)] p-2 focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              aria-label="Tagesbudget in Euro"
            />
            <span className="text-xs text-[var(--text-muted)]">€/Tag</span>
            {dailyBudget >= 15 && (
              <span className="text-xs text-[var(--accent-warn)]" role="alert">Maximum erreicht</span>
            )}
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400" role="alert">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !goal.trim()}
          className="flex items-center justify-center gap-2 mt-auto py-2 px-4 rounded text-xs font-semibold transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            bg-[var(--accent-primary)] text-[var(--bg-base)] hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]"
          aria-label="Kampagne starten"
        >
          <Send className="w-3 h-3" aria-hidden="true" />
          {loading ? 'Wird gestartet...' : 'Kampagne starten'}
        </button>
      </form>
    </div>
  );
}
