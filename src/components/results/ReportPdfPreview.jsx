import { useEffect } from 'react';

export function ReportPdfPreview({ url, filename, onClose, onDownloaded }) {
  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const previewUrl = `${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

  return (
    <div className="fixed inset-0 z-[110] flex min-h-0 min-w-0 items-center justify-center overflow-hidden bg-slate-950/45 backdrop-blur-sm sm:p-4 lg:p-6" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="flex h-[100dvh] min-h-0 w-full min-w-0 max-w-6xl flex-col overflow-hidden bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:h-[min(94dvh,960px)] sm:rounded-2xl sm:border sm:border-white/30" role="dialog" aria-modal="true" aria-labelledby="pdf-preview-title">
        <div className="flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-[#E5E5EA] px-3 py-2.5 sm:gap-4 sm:px-5 sm:py-3">
          <div className="min-w-0">
            <h2 id="pdf-preview-title" className="m-0 text-sm font-semibold text-slate-900">Report preview</h2>
            <p className="mb-0 mt-0.5 hidden truncate text-xs text-slate-500 sm:block">{filename}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <a className="inline-flex h-11 items-center rounded-xl bg-[#1D1D1F] px-3.5 text-xs font-semibold text-white transition hover:bg-[#3A3A3C] sm:px-4" href={url} download={filename} onClick={onDownloaded}><span className="sm:hidden">Download</span><span className="hidden sm:inline">Download PDF</span></a>
            <button className="grid h-11 w-11 place-items-center rounded-xl border border-[#D2D2D7] bg-white text-lg text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]" type="button" aria-label="Close report preview" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden bg-[#E8E8ED] p-0 sm:p-3">
          <iframe className="block h-full w-full min-w-0 border-0 bg-white sm:rounded-xl sm:border sm:border-[#D2D2D7]" src={previewUrl} title="Tatparya PDF report preview" />
        </div>
      </section>
    </div>
  );
}
