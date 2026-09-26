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
      <div className="pointer-events-none fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[100] mx-auto flex w-[calc(100%-1.5rem)] max-w-md flex-col items-center gap-2" aria-label="Notifications">
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
    <div className={`pointer-events-auto flex min-h-12 w-fit max-w-full items-center gap-2.5 rounded-[22px] border py-1.5 pl-2 pr-1.5 backdrop-blur-2xl backdrop-saturate-150 motion-reduce:animate-none ${toast.exiting ? 'animate-[toast-out_180ms_ease-in_forwards]' : 'animate-[toast-in_240ms_ease-out_both]'} ${success ? 'border-black/[0.08] bg-white/95 text-[#1D1D1F] shadow-[0_10px_35px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.9)]' : 'border-red-700/30 bg-[#D70015]/95 text-white shadow-[0_12px_35px_rgba(180,0,18,0.3),inset_0_1px_0_rgba(255,255,255,0.18)]'}`}>
      <div className="flex min-w-0 flex-1 items-center gap-2.5" role={success ? 'status' : 'alert'} aria-atomic="true">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${success ? 'bg-[#1D1D1F] text-white' : 'bg-white/15 text-white'}`}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">{success ? <path d="m6.5 12.5 3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" /> : <><circle cx="12" cy="12" r="8.5" /><path d="m9 9 6 6m0-6-6 6" strokeLinecap="round" /></>}</svg>
        </span>
        <span className="min-w-0 break-words py-1 text-xs font-semibold leading-[18px]"><span className="sr-only">{success ? 'Success: ' : 'Error: '}</span>{toast.message}</span>
      </div>
      <button className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-0 bg-transparent text-current opacity-65 transition hover:opacity-100 focus-visible:opacity-100 ${success ? 'hover:bg-black/[0.06]' : 'hover:bg-white/15'}`} type="button" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification"><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider.');
  return context;
}
