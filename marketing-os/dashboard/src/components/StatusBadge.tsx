import type { ReactNode } from 'react';
import type { JobStatus } from '../types';
import { statusLabel, statusTooltip } from '../lib/format';

// Einheitliches Status-Badge für Jobs — überall im Dashboard gleich (Farbe + Tooltip).
export function StatusBadge({ status }: { status: JobStatus }): ReactNode {
  return (
    <span className={`status-pill status-${status}`} title={statusTooltip(status)}>
      {statusLabel(status)}
    </span>
  );
}
