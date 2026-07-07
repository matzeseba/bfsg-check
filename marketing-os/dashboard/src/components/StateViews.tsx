import type { ReactNode } from 'react';

export function LoadingView({ label = 'Wird geladen …' }: { label?: string }): ReactNode {
  return (
    <div className="state-view">
      <div className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}): ReactNode {
  return (
    <div className="state-view state-error">
      <div className="state-icon" aria-hidden="true">
        ⚠️
      </div>
      <p className="state-title">Verbindungsfehler</p>
      <p className="state-message">{message}</p>
      {onRetry ? (
        <button type="button" className="btn btn-ghost" onClick={onRetry}>
          Erneut versuchen
        </button>
      ) : null}
    </div>
  );
}

export function EmptyView({ message }: { message: string }): ReactNode {
  return (
    <div className="state-view state-empty">
      <div className="state-icon" aria-hidden="true">
        🦊
      </div>
      <p className="state-message">{message}</p>
    </div>
  );
}

/**
 * Rahmen für datengetriebene Bereiche: zeigt Lade-/Fehler-/Leerzustand,
 * sonst den Inhalt. `isEmpty` optional.
 */
export function AsyncBoundary<T>({
  loading,
  error,
  data,
  onRetry,
  isEmpty,
  emptyMessage,
  children,
}: {
  loading: boolean;
  error: string | null;
  data: T | null;
  onRetry?: () => void;
  isEmpty?: (data: T) => boolean;
  emptyMessage?: string;
  children: (data: T) => ReactNode;
}): ReactNode {
  if (data === null && loading) return <LoadingView />;
  if (data === null && error) return <ErrorView message={error} onRetry={onRetry} />;
  if (data === null) return <LoadingView />;
  if (isEmpty && isEmpty(data)) {
    return <EmptyView message={emptyMessage ?? 'Noch keine Daten vorhanden.'} />;
  }
  return <>{children(data)}</>;
}
