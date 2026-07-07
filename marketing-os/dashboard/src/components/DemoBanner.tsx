import type { ReactNode } from 'react';

interface DemoBannerProps {
  demoCount: number;
  showingDemo: boolean;
  onToggle: () => void;
}

// Deutlicher Warnbanner, sobald Demo-/Platzhalterdaten mit angezeigt werden.
export function DemoBanner({ demoCount, showingDemo, onToggle }: DemoBannerProps): ReactNode {
  return (
    <div className="demo-banner">
      <span>
        ⚠ Demo-Daten — das sind KEINE echten Zahlen ({demoCount}{' '}
        {demoCount === 1 ? 'Demo-Eintrag' : 'Demo-Einträge'})
      </span>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onToggle}>
        {showingDemo ? 'Demo-Daten ausblenden' : 'Demo-Daten anzeigen'}
      </button>
    </div>
  );
}

export function DemoTag(): ReactNode {
  return <span className="demo-tag">DEMO</span>;
}
