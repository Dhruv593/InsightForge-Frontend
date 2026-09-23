import { useEffect } from 'react';

export function Modal({ title, description, children, confirmLabel = 'Confirm', confirmDisabled = false, danger = false, busy = false, onConfirm, onClose }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event) => event.key === 'Escape' && !busy && onClose();
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [busy, onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/25 p-3 backdrop-blur-[2px] sm:p-5" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !busy && onClose()}>
      <section className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.14)]" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className="relative shrink-0 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <button className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg border-0 bg-transparent text-lg text-[#86868B] hover:bg-[#F2F2F4] hover:text-[#1D1D1F]" type="button" aria-label="Close" onClick={onClose} disabled={busy}>×</button>
          <h2 className="m-0 pr-10 text-xl font-semibold tracking-[-0.02em] text-[#1D1D1F]" id="modal-title">{title}</h2>
          {description && <p className="mb-0 mt-1 text-sm leading-6 text-[#6E6E73]">{description}</p>}
        </header>
        <div className="custom-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 pb-5 text-sm leading-6 text-[#515154] sm:px-6 sm:pb-6">{children}</div>
        <footer className="flex shrink-0 flex-col-reverse gap-2.5 border-t border-[#ECECEF] bg-white px-5 py-4 min-[380px]:flex-row min-[380px]:justify-end sm:px-6">
          <button className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-[#D2D2D7] bg-white px-4 py-2 text-sm font-medium text-[#3A3A3C] transition hover:bg-[#F7F7F9] disabled:cursor-not-allowed disabled:opacity-50 min-[380px]:w-auto" type="button" onClick={onClose} disabled={busy}>Cancel</button>
          <button className={`inline-flex min-h-10 w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 min-[380px]:w-auto ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'}`} type="button" onClick={onConfirm} disabled={busy || confirmDisabled}>{busy ? 'Working…' : confirmLabel}</button>
        </footer>
      </section>
    </div>
  );
}
