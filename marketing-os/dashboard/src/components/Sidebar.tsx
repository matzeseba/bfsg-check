import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { api } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { usePolling } from '../hooks/usePolling';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: '/', label: 'Übersicht', icon: '📊', end: true },
  { to: '/pipeline', label: 'Pipeline', icon: '🗂️' },
  { to: '/review', label: 'Content-Review', icon: '📝' },
  { to: '/ads', label: 'Paid Ads', icon: '💰' },
  { to: '/playbooks', label: 'Playbooks', icon: '⚙️' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
  { to: '/compliance', label: 'Compliance', icon: '🛡️' },
];

function HealthIndicator(): ReactNode {
  const { data, error, reload } = useFetch(() => api.health(), []);
  usePolling(reload, 15000);

  if (error || !data) {
    return (
      <div className="health health-offline">
        <span className="health-dot" />
        <div>
          <div className="health-title">Engine offline</div>
          <div className="health-sub">nicht erreichbar</div>
        </div>
      </div>
    );
  }

  return (
    <div className="health health-online">
      <span className="health-dot" />
      <div>
        <div className="health-title">Engine online</div>
        <div className="health-sub">
          v{data.version}
          {data.dryRun ? ' · DRY-RUN' : ''}
        </div>
      </div>
    </div>
  );
}

export function Sidebar(): ReactNode {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          🦊
        </span>
        <div className="brand-text">
          <div className="brand-title">BFSG-Fuchs</div>
          <div className="brand-sub">Marketing-OS</div>
        </div>
      </div>

      <nav className="nav">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link${isActive ? ' nav-active' : ''}`}
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <HealthIndicator />
      </div>
    </aside>
  );
}
