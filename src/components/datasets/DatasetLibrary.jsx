import { datasetMeta } from '../layout/Sidebar';

export function DatasetLibrary({ datasets, profiles, uploading, onUpload, onOpen, onPreview, onDelete }) {
  return <section className="mx-auto max-w-5xl">
    <header className="flex flex-col items-start justify-between gap-4 py-5 sm:flex-row sm:items-end sm:py-7">
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-600">Data</p><h1 className="m-0 text-3xl font-semibold tracking-[-0.035em] text-[#1D1D1F]">Your datasets</h1><p className="mb-0 mt-2 text-sm text-[#6E6E73]">Open a dataset to review its profile or start an analysis.</p></div>
      <button className="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50" type="button" onClick={onUpload} disabled={uploading}>{uploading ? 'Uploading…' : 'Upload Dataset'}</button>
    </header>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{datasets.map((dataset) => {
      const profile = profiles?.[dataset.id];
      const ready = profile?.profile_status === 'completed';
      return <article className="group min-w-0 rounded-xl border border-[#E1E1E5] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.025)] transition hover:border-[#CBCBD1] hover:shadow-[0_5px_18px_rgba(0,0,0,0.055)]" key={dataset.id}>
        <button className="block w-full min-w-0 border-0 bg-transparent p-0 text-left" type="button" onClick={() => onOpen(dataset.id)}>
          <span className="mb-4 grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><DatasetFileIcon /></span>
          <span className="block truncate text-sm font-semibold text-[#1D1D1F]" title={dataset.original_file_name}>{dataset.original_file_name}</span>
          <span className="mt-1 block truncate text-xs text-[#86868B]">{datasetMeta(dataset, profile)}</span>
        </button>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#EFEFF1] pt-3"><span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${ready ? 'text-emerald-700' : 'text-amber-700'}`}><span className={`h-1.5 w-1.5 rounded-full ${ready ? 'bg-emerald-500' : 'bg-amber-500'}`} />{ready ? 'Ready' : 'Not profiled'}</span><div className="flex items-center gap-3"><button className="border-0 bg-transparent p-0 text-xs font-medium text-[#515154] hover:text-[#1D1D1F]" type="button" onClick={() => onPreview(dataset)}>View data</button><button className="border-0 bg-transparent p-0 text-xs font-medium text-brand-600 hover:text-brand-700" type="button" onClick={() => onOpen(dataset.id)}>Open</button><button className="border-0 bg-transparent p-0 text-xs font-medium text-red-500 hover:text-red-700" type="button" onClick={() => onDelete(dataset)}>Delete</button></div></div>
      </article>;
    })}</div>
  </section>;
}

function DatasetFileIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5M10 13h5M10 17h5" /></svg>;
}
