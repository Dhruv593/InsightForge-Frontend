import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { datasetMeta } from '../layout/Sidebar';

export function NewAnalysisFields({ datasets, profiles, title, datasetId, uploading, onTitleChange, onDatasetChange, onUpload }) {
  return <div className="grid gap-5">
    <label className="grid gap-2 text-sm font-medium text-[#3A3A3C]">Analysis name<input className="min-h-11 rounded-lg border border-[#D2D2D7] bg-white px-3 py-2 text-[#1D1D1F] transition focus:border-brand-500" value={title} onChange={(event) => onTitleChange(event.target.value)} maxLength={200} autoFocus /></label>
    {datasets.length ? <DatasetPicker datasets={datasets} profiles={profiles} value={datasetId} onChange={onDatasetChange} /> : <div className="rounded-xl bg-[#F5F5F7] p-4"><p className="m-0 text-sm font-medium text-[#3A3A3C]">No datasets uploaded yet.</p><p className="mb-4 mt-1 text-xs leading-5 text-[#6E6E73]">Upload a dataset before starting an analysis.</p><button className="inline-flex min-h-9 items-center rounded-lg border border-[#D2D2D7] bg-white px-3 text-xs font-medium text-[#3A3A3C] hover:bg-[#FAFAFB] disabled:opacity-50" type="button" onClick={onUpload} disabled={uploading}>{uploading ? 'Uploading…' : 'Upload Dataset'}</button></div>}
  </div>;
}

export function DatasetPicker({ datasets, profiles, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [listPosition, setListPosition] = useState(null);
  const pickerRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const labelId = useId();
  const listId = useId();
  const selected = datasets.find((dataset) => dataset.id === value) ?? datasets[0];

  const positionList = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const viewportHeight = document.documentElement.clientHeight;
    const margin = 12;
    const gap = 6;
    const desiredHeight = Math.min(224, (datasets.length * 58) + 12);
    const spaceBelow = viewportHeight - rect.bottom - margin - gap;
    const spaceAbove = rect.top - margin - gap;
    const placeBelow = spaceBelow >= desiredHeight || spaceBelow >= spaceAbove;
    const maxHeight = Math.max(96, Math.min(desiredHeight, placeBelow ? spaceBelow : spaceAbove));
    const top = placeBelow
      ? rect.bottom + gap
      : Math.max(margin, rect.top - gap - maxHeight);

    setListPosition({
      top,
      left: Math.max(margin, rect.left),
      width: Math.min(rect.width, window.innerWidth - (margin * 2)),
      maxHeight,
    });
  }, [datasets.length]);

  useEffect(() => {
    function close(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.type === 'pointerdown' && !pickerRef.current?.contains(event.target) && !listRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setListPosition(null);
      return undefined;
    }
    positionList();
    window.addEventListener('resize', positionList);
    window.addEventListener('scroll', positionList, true);
    return () => {
      window.removeEventListener('resize', positionList);
      window.removeEventListener('scroll', positionList, true);
    };
  }, [open, positionList]);

  return <div className="grid gap-2" ref={pickerRef}>
    <span className="text-sm font-medium text-[#3A3A3C]" id={labelId}>Dataset</span>
    <div className="relative min-w-0">
      <button ref={triggerRef} className="flex min-h-13 w-full min-w-0 items-center gap-3 rounded-xl border border-[#D2D2D7] bg-white px-3 py-2 text-left transition hover:border-[#B8B8C0] focus:border-brand-500" type="button" aria-labelledby={labelId} aria-controls={listId} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
        <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium text-[#1D1D1F]" title={selected?.original_file_name}>{selected?.original_file_name}</span><span className="mt-0.5 block truncate text-[11px] font-normal text-[#86868B]">{selected ? datasetMeta(selected, profiles?.[selected.id]) : 'Choose a dataset'}</span></span>
        <svg className={`h-4 w-4 shrink-0 text-[#86868B] transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
      </button>
      {open && listPosition && createPortal(<div ref={listRef} id={listId} className="custom-scrollbar fixed z-[100] overflow-x-hidden overflow-y-auto overscroll-contain rounded-xl border border-[#DADAE0] bg-white p-1.5 shadow-[0_14px_34px_rgba(0,0,0,0.14)]" style={{ top: listPosition.top, left: listPosition.left, width: listPosition.width, maxHeight: listPosition.maxHeight }} role="listbox" aria-labelledby={labelId}>
        {datasets.map((dataset) => {
          const active = dataset.id === value;
          return <button className={`flex w-full min-w-0 items-center gap-3 rounded-lg border-0 px-3 py-2.5 text-left transition ${active ? 'bg-indigo-50' : 'bg-transparent hover:bg-[#F5F5F7]'}`} type="button" role="option" aria-selected={active} key={dataset.id} onClick={() => { onChange(dataset.id); setOpen(false); }}>
            <span className="min-w-0 flex-1"><span className={`block truncate text-[13px] font-medium ${active ? 'text-indigo-700' : 'text-[#1D1D1F]'}`} title={dataset.original_file_name}>{dataset.original_file_name}</span><span className="mt-0.5 block truncate text-[11px] text-[#86868B]">{datasetMeta(dataset, profiles?.[dataset.id])}</span></span>
            {active && <svg className="h-4 w-4 shrink-0 text-indigo-600" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m3.5 8 3 3 6-6" /></svg>}
          </button>;
        })}
      </div>, document.body)}
    </div>
  </div>;
}
