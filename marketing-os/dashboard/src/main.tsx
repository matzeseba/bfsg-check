import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { App } from './App';
import { ToastProvider } from './components/Toast';
import './styles.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root-Element #root nicht gefunden.');
}

createRoot(container).render(
  <StrictMode>
    <HashRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </HashRouter>
  </StrictMode>,
);
