import { useEffect } from 'react';

export function ReportPdfPreview({ url, filename, onClose, onDownloaded }) {
  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="flex h-[min(90vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]" role="dialog" aria-modal="true" aria-labelledby="pdf-preview-title">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 id="pdf-preview-title" className="m-0 text-sm font-semibold text-slate-900">Report preview</h2>
            <p className="mb-0 mt-0.5 truncate text-xs text-slate-500">{filename}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a className="inline-flex h-9 items-center rounded-lg bg-indigo-600 px-3.5 text-xs font-semibold text-white hover:bg-indigo-700" href={url} download={filename} onClick={onDownloaded}>Download PDF</a>
            <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900" type="button" aria-label="Close report preview" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="min-h-0 flex-1 bg-slate-100 p-2 sm:p-4">
          <iframe className="h-full w-full rounded-lg border border-slate-200 bg-white" src={url} title="Tatparya PDF report preview" />
        </div>
      </section>
    </div>
  );
}
