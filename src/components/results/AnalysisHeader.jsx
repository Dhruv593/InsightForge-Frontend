import { useEffect, useState } from 'react';
import { prepareReportPdf } from '../../utils/reportPdf';
import { useToast } from '../../context/ToastContext';
import { ReportPdfPreview } from './ReportPdfPreview';

export function AnalysisHeader({ conversation, dataset, profileComplete, result, onRename, onDelete, onOpenQuestions }) {
  const [downloading, setDownloading] = useState(false);
  const [preview, setPreview] = useState(null);
  const { error, success } = useToast();

  useEffect(() => () => {
    if (preview?.url) globalThis.URL.revokeObjectURL(preview.url);
  }, [preview]);

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
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="m-0 truncate text-lg font-semibold tracking-[-0.02em] text-[#1D1D1F]">{conversation.title}</h1>
          <p className="mb-0 mt-1 flex min-w-0 items-center gap-1.5 truncate text-[11px] text-[#6E6E73]">
            <span className="truncate">{dataset?.original_file_name || 'Dataset'}</span>
            <span className="text-[#C7C7CC]">·</span>
            <span className="inline-flex shrink-0 items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${profileComplete ? 'bg-emerald-500' : 'bg-amber-500'}`} />{profileComplete ? 'Profile ready' : 'Not profiled'}</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          <button className="rounded-lg border-0 bg-transparent px-2 py-1.5 text-[11px] font-medium text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] lg:hidden" type="button" onClick={onOpenQuestions}>Questions</button>
          {result?.report && <button className="rounded-lg border-0 bg-transparent px-2 py-1.5 text-[11px] font-medium text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] disabled:opacity-50" type="button" onClick={openPreview} disabled={downloading}>{downloading ? 'Preparing PDF…' : 'Download PDF'}</button>}
          <button className="rounded-lg border-0 bg-transparent px-2 py-1.5 text-[11px] font-medium text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]" type="button" onClick={onRename}>Rename</button>
          <button className="rounded-lg border-0 bg-transparent px-2 py-1.5 text-[11px] font-medium text-[#86868B] hover:bg-red-50 hover:text-red-600" type="button" onClick={onDelete}>Delete</button>
        </div>
      </div>
      {preview && <ReportPdfPreview url={preview.url} filename={preview.filename} onClose={() => setPreview(null)} onDownloaded={() => success('PDF download started.')} />}
    </header>
  );
}
