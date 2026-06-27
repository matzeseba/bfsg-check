'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, FileText, Clock, AlertCircle } from 'lucide-react';
import { searchBrain, recentBrain, fetchBrainNote } from '@/lib/api';
import type { BrainSearchResult } from '@/lib/types';

type ViewMode = 'recent' | 'search';

interface NoteModalProps {
  path: string;
  onClose: () => void;
}

function NoteModal({ path, onClose }: NoteModalProps) {
  const [content, setContent] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBrainNote(path)
      .then((res) => {
        if (!res.configured) {
          setError('Vault nicht konfiguriert');
        } else {
          setTitle(res.title);
          setContent(res.content);
        }
      })
      .catch(() => setError('Notiz konnte nicht geladen werden'))
      .finally(() => setLoading(false));
  }, [path]);

  // Trap focus + Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Notiz'}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="glass-card w-full max-w-2xl max-h-[80vh] flex flex-col focus:outline-none"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate pr-4">
            {loading ? 'Lade...' : title || path}
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] rounded"
            aria-label="Notiz schliessen"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {loading && (
            <div className="animate-pulse space-y-2">
              <div className="h-3 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/10 rounded w-full" />
              <div className="h-3 bg-white/10 rounded w-2/3" />
            </div>
          )}
          {error && (
            <p className="text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              {error}
            </p>
          )}
          {content && (
            <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap font-mono leading-relaxed">
              {content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

interface ResultItemProps {
  item: BrainSearchResult;
  onClick: (path: string) => void;
}

function ResultItem({ item, onClick }: ResultItemProps) {
  return (
    <li>
      <button
        onClick={() => onClick(item.path)}
        className="w-full text-left p-2 rounded hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-inset"
        aria-label={`Notiz oeffnen: ${item.title || item.path}`}
      >
        <div className="flex items-start gap-2">
          <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-[var(--text-primary)] truncate">
              {item.title || item.path}
            </p>
            {item.snippet && (
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-2 leading-relaxed">
                {item.snippet}
              </p>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}

export function SecondBrainSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BrainSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('recent');
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent notes on mount
  useEffect(() => {
    recentBrain()
      .then((res) => {
        setConfigured(res.configured);
        if (res.configured) {
          setResults(res.notes ?? []);
        }
      })
      .catch(() => {
        // Backend not reachable — show unconfigured state gracefully
        setConfigured(false);
      });
  }, []);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      // Fall back to recent
      setViewMode('recent');
      setLoading(true);
      try {
        const res = await recentBrain();
        setConfigured(res.configured);
        setResults(res.configured ? (res.notes ?? []) : []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
      return;
    }

    setViewMode('search');
    setLoading(true);
    setSearchError(null);
    try {
      const res = await searchBrain(q);
      setConfigured(res.configured);
      setResults(res.configured ? res.results : []);
    } catch {
      setSearchError('Suche fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), 350);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    runSearch(query);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const isEmpty = !loading && results.length === 0 && configured !== false;

  return (
    <>
      <div className="glass-card p-4 flex flex-col gap-3 h-full" aria-label="Second Brain">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            Second Brain
          </h2>
          {viewMode === 'recent' && configured !== false && (
            <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
          )}
          {viewMode === 'search' && configured !== false && (
            <Search className="w-3.5 h-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
          )}
        </div>

        {/* Vault not configured */}
        {configured === false && (
          <p className="text-[var(--text-muted)] text-xs" role="status">
            Vault nicht konfiguriert
          </p>
        )}

        {/* Search form */}
        {configured !== false && (
          <form onSubmit={handleSubmit} aria-label="Notizen durchsuchen">
            <label htmlFor="brain-search-input" className="sr-only">
              Notizen durchsuchen
            </label>
            <div className="relative">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]"
                aria-hidden="true"
              />
              <input
                id="brain-search-input"
                ref={inputRef}
                type="search"
                value={query}
                onChange={handleQueryChange}
                placeholder="Notizen suchen..."
                className="w-full bg-white/5 border border-white/10 rounded text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] pl-8 pr-3 py-1.5 focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                aria-label="Suchbegriff eingeben"
              />
            </div>
          </form>
        )}

        {/* Results area */}
        {configured !== false && (
          <div className="flex-1 overflow-auto min-h-0">
            {loading && (
              <div className="animate-pulse space-y-2 pt-1" aria-busy="true" aria-label="Lade Notizen">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-9 bg-white/5 rounded" />
                ))}
              </div>
            )}

            {searchError && !loading && (
              <p className="text-red-400 text-xs flex items-center gap-1.5 pt-1" role="alert">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                {searchError}
              </p>
            )}

            {!loading && !searchError && isEmpty && (
              <p className="text-[var(--text-muted)] text-xs pt-1" role="status">
                {viewMode === 'search' ? 'Keine Treffer' : 'Keine Notizen vorhanden'}
              </p>
            )}

            {!loading && !searchError && results.length > 0 && (
              <ul
                role="list"
                aria-label={viewMode === 'search' ? 'Suchergebnisse' : 'Zuletzt geaenderte Notizen'}
                className="space-y-0.5"
              >
                {results.map((item) => (
                  <ResultItem
                    key={item.path}
                    item={item}
                    onClick={(path) => setActiveNote(path)}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Note detail modal */}
      {activeNote && (
        <NoteModal path={activeNote} onClose={() => setActiveNote(null)} />
      )}
    </>
  );
}
