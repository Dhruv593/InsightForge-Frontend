import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);
  const dismiss = useCallback((id) => setToasts((items) => items.map((item) => item.id === id ? { ...item, exiting: true } : item)), []);
  const remove = useCallback((id) => setToasts((items) => items.filter((item) => item.id !== id)), []);
  const notify = useCallback((type, message) => {
    if (typeof message !== 'string' || !message.trim()) return;
    const id = ++nextId.current;
    setToasts((items) => [...items.slice(-3), { id, type, message }]);
  }, []);
  const value = useMemo(() => ({
    success: (message) => notify('success', message),
    error: (message) => notify('error', message),
    dismiss,
  }), [notify, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] mx-auto flex w-[calc(100%-2rem)] max-w-sm flex-col items-center gap-2" aria-label="Notifications">
        {toasts.map((toast) => <Toast key={toast.id} toast={toast} onDismiss={dismiss} onRemove={remove} />)}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onDismiss, onRemove }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), 5000);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    if (!toast.exiting) return undefined;
    const timer = window.setTimeout(() => onRemove(toast.id), 180);
    return () => window.clearTimeout(timer);
  }, [toast.exiting, toast.id, onRemove]);

  const success = toast.type === 'success';
  return (
    <div className={`pointer-events-auto flex w-fit max-w-full items-center gap-2 rounded-2xl border border-white/70 py-2 pl-3 pr-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl backdrop-saturate-150 motion-reduce:animate-none ${toast.exiting ? 'animate-[toast-out_180ms_ease-in_forwards]' : 'animate-[toast-in_240ms_ease-out_both]'} ${success ? 'bg-emerald-50/75 text-emerald-900' : 'bg-rose-50/75 text-rose-900'}`}>
      <div className="flex min-w-0 flex-1 items-center gap-2" role={success ? 'status' : 'alert'} aria-atomic="true">
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9" />{success ? <path d="m7.5 12 3 3 6-6" strokeLinecap="round" strokeLinejoin="round" /> : <path d="m9 9 6 6m0-6-6 6" strokeLinecap="round" />}</svg>
        <span className="min-w-0 break-words text-xs font-medium leading-[18px]"><span className="sr-only">{success ? 'Success: ' : 'Error: '}</span>{toast.message}</span>
      </div>
      <button className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-0 bg-transparent text-current opacity-60 transition hover:bg-white/50 hover:opacity-100 focus-visible:opacity-100" type="button" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification"><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider.');
  return context;
}
