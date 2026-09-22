import { useEffect, useRef, useState } from 'react';
import { prepareReportPdf } from '../../utils/reportPdf';
import { useToast } from '../../context/ToastContext';
import { ReportPdfPreview } from './ReportPdfPreview';

export function AnalysisHeader({ conversation, dataset, profileComplete, result, onRename, onDelete, onOpenQuestions }) {
  const [downloading, setDownloading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreMenuRef = useRef(null);
  const { error, success } = useToast();

  useEffect(() => () => {
    if (preview?.url) globalThis.URL.revokeObjectURL(preview.url);
  }, [preview]);

  useEffect(() => {
    function closeMore(event) {
      if (event.key === 'Escape' || (event.type === 'pointerdown' && !moreMenuRef.current?.contains(event.target))) setMoreOpen(false);
    }
    document.addEventListener('pointerdown', closeMore);
    document.addEventListener('keydown', closeMore);
    return () => { document.removeEventListener('pointerdown', closeMore); document.removeEventListener('keydown', closeMore); };
  }, []);

  async function openPreview() {
    if (!result?.report) return;
    setDownloading(true);
    try {
      const prepared = await prepareReportPdf(result.report, result.charts || []);
      setPreview({ ...prepared, url: globalThis.URL.createObjectURL(prepared.blob) });
    } catch {
      error('PDF export failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <header className="border-b border-[#E5E5EA] bg-white px-4 py-3 sm:px-6">
      <div className="flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="m-0 truncate text-lg font-semibold tracking-[-0.02em] text-[#1D1D1F]">{conversation.title}</h1>
          <p className="mb-0 mt-1 flex min-w-0 items-center gap-1.5 truncate text-[11px] text-[#6E6E73]">
            <span className="truncate">{dataset?.original_file_name || 'Dataset'}</span>
            <span className="text-[#C7C7CC]">·</span>
            <span className="inline-flex shrink-0 items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${profileComplete ? 'bg-emerald-500' : 'bg-amber-500'}`} />{profileComplete ? 'Profile ready' : 'Not profiled'}</span>
          </p>
        </div>
        <div className="flex w-full shrink-0 items-center gap-1 pb-0.5 sm:w-auto sm:flex-wrap sm:justify-end sm:pb-0">
          <button className="rounded-lg border-0 bg-transparent px-2 py-1.5 text-[11px] font-medium text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] lg:hidden" type="button" onClick={onOpenQuestions}>Questions</button>
          {result?.report && <button className="rounded-lg border-0 bg-transparent px-2 py-1.5 text-[11px] font-medium text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] disabled:opacity-50" type="button" onClick={openPreview} disabled={downloading}>{downloading ? 'Preparing PDF…' : 'Download PDF'}</button>}
          <button className="hidden rounded-lg border-0 bg-transparent px-2 py-1.5 text-[11px] font-medium text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] sm:block" type="button" onClick={onRename}>Rename</button>
          <span className="mx-1 hidden h-5 w-px bg-[#E5E5EA] sm:block" aria-hidden="true" />
          <button className="hidden rounded-lg border-0 bg-transparent px-2 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50 sm:block" type="button" onClick={onDelete}>Delete</button>
          <div className="relative ml-auto sm:hidden" ref={moreMenuRef}><button className="grid h-8 w-8 place-items-center rounded-lg border border-[#E1E1E5] bg-white text-base leading-none text-[#515154]" type="button" aria-label="More analysis actions" aria-haspopup="menu" aria-expanded={moreOpen} onClick={() => setMoreOpen((value) => !value)}>•••</button>{moreOpen && <div className="absolute right-0 top-10 z-30 w-40 overflow-hidden rounded-xl border border-[#E1E1E5] bg-white p-1.5 shadow-xl" role="menu"><button className="flex w-full rounded-lg border-0 bg-transparent px-3 py-2 text-left text-xs font-medium text-[#515154] hover:bg-[#F5F5F7]" type="button" role="menuitem" onClick={() => { setMoreOpen(false); onRename(); }}>Rename</button><div className="my-1 border-t border-[#ECECEF]" /><button className="flex w-full rounded-lg border-0 bg-transparent px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50" type="button" role="menuitem" onClick={() => { setMoreOpen(false); onDelete(); }}>Delete analysis</button></div>}</div>
        </div>
      </div>
      {preview && <ReportPdfPreview url={preview.url} filename={preview.filename} onClose={() => setPreview(null)} onDownloaded={() => success('PDF download started.')} />}
    </header>
  );
}
