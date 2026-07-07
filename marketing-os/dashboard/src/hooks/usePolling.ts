import { useEffect, useRef } from 'react';

/**
 * Ruft `callback` alle `intervalMs` Millisekunden auf (setInterval).
 * Der Callback darf sich jederzeit ändern, ohne das Intervall neu zu starten.
 */
export function usePolling(callback: () => void, intervalMs: number, enabled = true): void {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => savedCallback.current(), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, enabled]);
}
