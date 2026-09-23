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
    <header className="border-b border-[#E5E5EA] bg-white px-3 py-1.5 sm:px-5 sm:py-2.5">
      <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="m-0 truncate text-[15px] font-semibold tracking-[-0.02em] text-[#1D1D1F] sm:text-base" title={conversation.title}>{conversation.title}</h1>
          <p className="mb-0 mt-0.5 hidden min-w-0 items-center gap-1.5 text-[11px] leading-4 text-[#6E6E73] sm:flex">
            <span className="min-w-0 truncate" title={dataset?.original_file_name}>{dataset?.original_file_name || 'Dataset'}</span>
            <span className="shrink-0 text-[#C7C7CC]">·</span>
            <span className="inline-flex shrink-0 items-center gap-1.5" title={profileComplete ? 'Profile ready' : 'Not profiled'}><span className={`h-1.5 w-1.5 rounded-full ${profileComplete ? 'bg-emerald-500' : 'bg-amber-500'}`} /><span className="hidden min-[390px]:inline">{profileComplete ? 'Profile ready' : 'Not profiled'}</span></span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button className="inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl border-0 bg-transparent px-2 text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] sm:h-9 sm:min-w-9 lg:hidden" type="button" onClick={onOpenQuestions} aria-label="Open questions" title="Questions"><QuestionsIcon /><span className="hidden text-[11px] font-medium md:inline">Questions</span></button>
          {result?.report && <button className="inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl border-0 bg-transparent px-2 text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] disabled:opacity-50 sm:h-9 sm:min-w-9" type="button" onClick={openPreview} disabled={downloading} aria-label={downloading ? 'Preparing PDF' : 'Preview PDF'} title={downloading ? 'Preparing PDF…' : 'Preview PDF'}>{downloading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#C7C7CC] border-t-[#515154]" /> : <PdfIcon />}<span className="hidden text-[11px] font-medium md:inline">{downloading ? 'Preparing…' : 'Preview PDF'}</span></button>}
          <button className="hidden rounded-lg border-0 bg-transparent px-2 py-1.5 text-[11px] font-medium text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] sm:block" type="button" onClick={onRename}>Rename</button>
          <span className="mx-1 hidden h-5 w-px bg-[#E5E5EA] sm:block" aria-hidden="true" />
          <button className="hidden rounded-lg border-0 bg-transparent px-2 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50 sm:block" type="button" onClick={onDelete}>Delete</button>
          <div className="relative sm:hidden" ref={moreMenuRef}><button className="grid h-11 w-11 place-items-center rounded-xl border-0 bg-transparent text-[#515154] hover:bg-[#F5F5F7]" type="button" aria-label="More analysis actions" aria-haspopup="menu" aria-expanded={moreOpen} onClick={() => setMoreOpen((value) => !value)}><MoreIcon /></button>{moreOpen && <div className="absolute right-0 top-12 z-30 w-40 overflow-hidden rounded-xl border border-[#E1E1E5] bg-white p-1.5 shadow-xl" role="menu"><button className="flex min-h-11 w-full items-center rounded-lg border-0 bg-transparent px-3 text-left text-xs font-medium text-[#515154] hover:bg-[#F5F5F7]" type="button" role="menuitem" onClick={() => { setMoreOpen(false); onRename(); }}>Rename</button><div className="my-1 border-t border-[#ECECEF]" /><button className="flex min-h-11 w-full items-center rounded-lg border-0 bg-transparent px-3 text-left text-xs font-medium text-red-600 hover:bg-red-50" type="button" role="menuitem" onClick={() => { setMoreOpen(false); onDelete(); }}>Delete analysis</button></div>}</div>
        </div>
      </div>
      {preview && <ReportPdfPreview url={preview.url} filename={preview.filename} onClose={() => setPreview(null)} onDownloaded={() => success('PDF download started.')} />}
    </header>
  );
}

function QuestionsIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M4.25 4.25h11.5v8.5H8l-3.75 3v-11.5Z" /><path d="M7 7.25h6M7 9.75h4" /></svg>;
}

function PdfIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="M5 2.75h6l4 4v10.5H5V2.75Z" /><path d="M11 2.75v4h4M7.25 13.5h5.5M7.25 10.75h5.5" /></svg>;
}

function MoreIcon() {
  return <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><circle cx="4" cy="10" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="16" cy="10" r="1.5" /></svg>;
}
