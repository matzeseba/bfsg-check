import type { ReactNode } from 'react';
import type { Gate } from '../types';

export type GateLevel = 'block' | 'warn' | 'ok' | 'pending';

export function gateLevel(gate: Gate | null): GateLevel {
  if (!gate || !gate.checked) return 'pending';
  const hasBlock = gate.findings.some((f) => f.severity === 'block');
  if (hasBlock) return 'block';
  const hasWarn = gate.findings.some((f) => f.severity === 'warn');
  if (hasWarn) return 'warn';
  return 'ok';
}

const LABELS: Record<GateLevel, string> = {
  block: 'Gate: blockiert',
  warn: 'Gate: Warnung',
  ok: 'Gate: ok',
  pending: 'Gate: ausstehend',
};

export function GateBadge({ gate }: { gate: Gate | null }): ReactNode {
  const level = gateLevel(gate);
  return <span className={`gate-badge gate-${level}`}>{LABELS[level]}</span>;
}
