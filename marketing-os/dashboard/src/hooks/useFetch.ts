import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';

export interface FetchState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  /** Erneut laden ohne Ladezustand (für Poll-Refresh / nach Aktionen). */
  reload: () => void;
}

/**
 * Kleiner Fetch-Hook mit Lade-/Fehlerzustand. `deps` bestimmt, wann neu geladen wird.
 * `reload()` aktualisiert im Hintergrund und behält vorhandene Daten sichtbar.
 */
export function useFetch<T>(fn: () => Promise<T>, deps: DependencyList = []): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fnRef = useRef(fn);
  fnRef.current = fn;

  const load = useCallback((showLoading: boolean) => {
    if (showLoading) setLoading(true);
    fnRef
      .current()
      .then((result) => {
        setData(result);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load(true);
    // deps steuern bewusst den Reload; load ist stabil.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const reload = useCallback(() => load(false), [load]);

  return { data, error, loading, reload };
}
