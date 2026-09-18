import { useEffect } from 'react';

export function Modal({ title, description, children, confirmLabel = 'Confirm', confirmDisabled = false, danger = false, busy = false, onConfirm, onClose }) {
  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && !busy && onClose();
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [busy, onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/25 p-3 backdrop-blur-[2px] sm:p-5" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !busy && onClose()}>
      <section className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-black/10 bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.14)] sm:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg border-0 bg-transparent text-lg text-[#86868B] hover:bg-[#F2F2F4] hover:text-[#1D1D1F]" type="button" aria-label="Close" onClick={onClose} disabled={busy}>×</button>
        <h2 className="mb-1 pr-10 text-xl font-semibold tracking-[-0.02em] text-[#1D1D1F]" id="modal-title">{title}</h2>
        {description && <p className="mb-5 mt-0 text-sm leading-6 text-[#6E6E73]">{description}</p>}
        <div className="text-sm leading-6 text-[#515154]">{children}</div>
        <div className="mt-6 flex flex-col-reverse gap-2.5 min-[380px]:flex-row min-[380px]:justify-end">
          <button className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-[#D2D2D7] bg-white px-4 py-2 text-sm font-medium text-[#3A3A3C] transition hover:bg-[#F7F7F9] disabled:cursor-not-allowed disabled:opacity-50 min-[380px]:w-auto" type="button" onClick={onClose} disabled={busy}>Cancel</button>
          <button className={`inline-flex min-h-10 w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 min-[380px]:w-auto ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'}`} type="button" onClick={onConfirm} disabled={busy || confirmDisabled}>{busy ? 'Working…' : confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
