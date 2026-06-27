'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Cpu, Radio, AlertTriangle } from 'lucide-react';
import type { ActionDef, JobCategory } from '@/lib/types';
import { launchAction } from '@/lib/api';

interface Props {
  actions: ActionDef[];
  onJobStart: (jobId: string) => void;
}

const CATEGORY_CONFIG: Record<JobCategory, { label: string; Icon: React.ElementType; color: string }> = {
  quick: { label: 'Schnell-Aktionen', Icon: Zap, color: 'var(--accent-primary)' },
  generator: { label: 'Generatoren', Icon: Cpu, color: 'var(--accent-success)' },
  live: { label: 'Live-Aktionen', Icon: Radio, color: 'var(--accent-secondary)' },
};

const CATEGORIES: JobCategory[] = ['quick', 'generator', 'live'];

function ActionButton({
  action,
  onJobStart,
}: {
  action: ActionDef;
  onJobStart: (jobId: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const isLive = action.category === 'live';

  const handleClick = async () => {
    setLoading(true);
    try {
      const { jobId } = await launchAction(action.id, {});
      onJobStart(jobId);
    } catch (err) {
      console.error('Failed to launch action', action.id, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      disabled={loading}
      aria-label={`${action.label}${action.requiresApproval ? ' (erfordert Freigabe)' : ''}${loading ? ' — wird gestartet' : ''}`}
      className={`
        relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
        border transition-all duration-150
        disabled:opacity-60 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]
        ${isLive
          ? 'bg-[var(--accent-secondary)]/10 border-[var(--accent-secondary)]/30 text-[var(--accent-secondary)] hover:bg-[var(--accent-secondary)]/20 focus:ring-[var(--accent-secondary)]'
          : 'bg-white/5 border-white/10 text-[var(--text-primary)] hover:bg-white/10 focus:ring-[var(--accent-primary)]'
        }
      `}
      title={action.description}
    >
      {isLive && (
        <AlertTriangle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
      )}
      <span>{loading ? '...' : action.label}</span>
      {action.requiresApproval && (
        <span
          className="ml-auto text-[9px] text-[var(--accent-warn)] font-normal"
          aria-hidden="true"
        >
          Freigabe
        </span>
      )}
    </motion.button>
  );
}

export function AgentLauncher({ actions, onJobStart }: Props) {
  if (!actions || actions.length === 0) {
    return (
      <div className="glass-card p-4">
        <p className="text-[var(--text-muted)] text-xs">Keine Aktionen verfügbar</p>
      </div>
    );
  }

  return (
    <section aria-label="Agent-Aktionen" className="glass-card p-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
        Agent-Aktionen
      </h2>

      <div className="flex flex-col gap-4">
        {CATEGORIES.map((cat) => {
          const catActions = actions.filter((a) => a.category === cat);
          if (catActions.length === 0) return null;
          const { label, Icon, color } = CATEGORY_CONFIG[cat];

          return (
            <div key={cat}>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className="w-3 h-3" style={{ color }} aria-hidden="true" />
                <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color }}>
                  {label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {catActions.map((action) => (
                  <ActionButton key={action.id} action={action} onJobStart={onJobStart} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
