import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Uebersicht } from './views/Uebersicht';
import { Pipeline } from './views/Pipeline';
import { ContentReview } from './views/ContentReview';
import { PaidAds } from './views/PaidAds';
import { Playbooks } from './views/Playbooks';
import { Analytics } from './views/Analytics';
import { Compliance } from './views/Compliance';

export function App(): ReactNode {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Uebersicht />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/review" element={<ContentReview />} />
          <Route path="/ads" element={<PaidAds />} />
          <Route path="/playbooks" element={<Playbooks />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
