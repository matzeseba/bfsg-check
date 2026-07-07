import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  text: string;
  kind: ToastKind;
}

type ShowToast = (text: string, kind?: ToastKind) => void;

const ToastContext = createContext<ShowToast>(() => {
  /* noop default */
});

export function useToast(): ShowToast {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }): ReactNode {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ShowToast>(
    (text, kind = 'success') => {
      const id = counter.current++;
      setToasts((prev) => [...prev, { id, text, kind }]);
      window.setTimeout(() => remove(id), 4200);
    },
    [remove],
  );

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`} onClick={() => remove(t.id)}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
