import { useCallback, useEffect, useState } from 'react';
import { datasetService } from '../../services/datasetService';
import { getApiError } from '../../services/api';

export function DatasetPreviewDialog({ dataset, onClose }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [offset, setOffset] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', closeOnEscape); };
  }, [onClose]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    datasetService.preview(dataset.id, { limit: pageSize, offset }).then((response) => { if (active) setPreview(response); }).catch((failure) => { if (active) setError(getApiError(failure, 'Dataset preview could not be loaded.').message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [dataset.id, offset, reload]);

  const retry = useCallback(() => setReload((value) => value + 1), []);

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-2 backdrop-blur-[2px] sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="flex max-h-[94dvh] w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-[#DADAE0] bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="dataset-preview-title">
      <header className="flex items-start justify-between gap-4 border-b border-[#E5E5EA] px-4 py-3.5 sm:px-5"><div className="min-w-0"><h2 className="m-0 truncate text-base font-semibold text-[#1D1D1F]" id="dataset-preview-title">{dataset.original_file_name}</h2><p className="mb-0 mt-1 text-[11px] text-[#86868B]">Read-only data preview</p></div><button className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#E1E1E5] bg-white text-lg text-[#515154] hover:bg-[#F5F5F7]" type="button" onClick={onClose} aria-label="Close dataset preview">×</button></header>
      {loading ? <div className="grid min-h-80 place-items-center"><div className="flex items-center gap-2 text-sm text-[#6E6E73]" role="status"><span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />Loading data preview…</div></div> : error ? <div className="grid min-h-80 place-items-center p-6 text-center"><div><p className="m-0 text-sm text-red-700" role="alert">{error}</p><button className="mt-4 rounded-lg border border-[#D2D2D7] bg-white px-4 py-2 text-xs font-semibold" type="button" onClick={retry}>Try again</button></div></div> : <>
        {preview.warnings?.map((warning) => <p className="m-0 border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-900 sm:px-5" key={warning}>{warning}</p>)}
        <div className="custom-scrollbar min-h-0 flex-1 overflow-auto"><table className="min-w-max border-separate border-spacing-0 text-left text-xs"><thead className="sticky top-0 z-20 bg-[#F7F7F8]"><tr><th className="sticky left-0 z-30 min-w-14 border-b border-r border-[#DADAE0] bg-[#F7F7F8] px-3 py-2.5 text-center font-semibold text-[#86868B]">#</th>{preview.columns.map((column, index) => <th className="max-w-72 border-b border-r border-[#DADAE0] bg-[#F7F7F8] px-3 py-2.5 font-semibold text-[#3A3A3C]" key={`${column}-${index}`} title={column}>{column || `Column ${index + 1}`}</th>)}</tr></thead><tbody>{preview.rows.map((row, rowIndex) => <tr className="hover:bg-brand-50/40" key={rowIndex}><th className="sticky left-0 z-10 border-b border-r border-[#ECECEF] bg-white px-3 py-2.5 text-center font-medium tabular-nums text-[#86868B]">{preview.offset + rowIndex + 1}</th>{row.map((value, columnIndex) => <td className="max-w-72 truncate border-b border-r border-[#ECECEF] px-3 py-2.5 text-[#515154]" key={columnIndex} title={formatCell(value)}>{formatCell(value)}</td>)}</tr>)}</tbody></table></div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E5EA] bg-white px-4 py-3 text-[11px] text-[#6E6E73] sm:px-5">
          <span>{preview.returned_rows > 0 ? `Showing rows ${(preview.offset + 1).toLocaleString()}–${(preview.offset + preview.returned_rows).toLocaleString()}` : 'No rows on this page'} · {preview.columns.length.toLocaleString()} columns</span>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-[#D2D2D7] bg-white px-3 py-1.5 font-semibold text-[#3A3A3C] enabled:hover:bg-[#F5F5F7] disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={preview.offset === 0} onClick={() => setOffset(Math.max(0, preview.offset - pageSize))}>Previous</button>
            <button className="rounded-lg border border-[#D2D2D7] bg-white px-3 py-1.5 font-semibold text-[#3A3A3C] enabled:hover:bg-[#F5F5F7] disabled:cursor-not-allowed disabled:opacity-40" type="button" disabled={!preview.truncated} onClick={() => setOffset(preview.offset + pageSize)}>Next</button>
          </div>
        </footer>
      </>}
    </section>
  </div>;
}

function formatCell(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
