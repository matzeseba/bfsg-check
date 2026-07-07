import type { ReactNode } from 'react';
import type { Gate } from '../types';
import { gateLevel } from './GateBadge';

// Prominente Anzeige der Gate-Findings über einem Artefakt.
export function GateFindings({ gate }: { gate: Gate | null }): ReactNode {
  const level = gateLevel(gate);

  if (level === 'ok') {
    return (
      <div className="findings findings-ok">
        <strong>Compliance-Gate bestanden</strong> — keine problematischen Muster gefunden.
      </div>
    );
  }

  if (level === 'pending') {
    return (
      <div className="findings findings-pending">
        <strong>Gate ausstehend</strong> — dieses Artefakt wurde noch nicht geprüft.
      </div>
    );
  }

  const findings = gate?.findings ?? [];
  const boxClass = level === 'block' ? 'findings findings-block' : 'findings findings-warn';
  const heading =
    level === 'block'
      ? 'Compliance-Gate blockiert — vor Freigabe beheben'
      : 'Compliance-Gate mit Warnungen';

  return (
    <div className={boxClass}>
      <strong>{heading}</strong>
      <ul className="findings-list">
        {findings.map((f, idx) => (
          <li key={`${f.pattern}-${idx}`}>
            <span className={`sev-pill sev-${f.severity}`}>
              {f.severity === 'block' ? 'Block' : 'Warnung'}
            </span>
            <span className="findings-match">
              „{f.match}"
              <span className="findings-pattern"> (Muster: {f.pattern})</span>
            </span>
            <span className="findings-hint">{f.hint}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
