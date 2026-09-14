export function DockPanel({ side = 'left', title, pinned, onPin, children }) {
  return <div className={`relative hidden h-full shrink-0 lg:block motion-safe:transition-[width] ${pinned ? 'w-60' : 'w-14'}`}>
    <aside className={`absolute inset-y-0 z-30 flex flex-col overflow-hidden border-[#E1E1E5] bg-[#FAFAFB] motion-safe:transition-[width] ${side === 'left' ? 'left-0 border-r' : 'right-0 border-l'} ${pinned ? 'w-60' : 'w-14'}`}>
      <div className="flex h-12 shrink-0 items-center gap-2 px-2">
        <button type="button" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/60 focus-visible:outline-2 focus-visible:outline-indigo-500" aria-label={pinned ? `Close ${title}` : `Open ${title}`} aria-expanded={pinned} onClick={() => onPin(!pinned)} title={pinned ? `Close ${title}` : `Open ${title}`}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="3" /><path d={side === 'left' ? 'M9 4v16' : 'M15 4v16'} /></svg></button>
        {pinned && <span className="truncate text-xs font-semibold text-slate-600">{title}</span>}
      </div>
      {pinned ? <div className="flex min-h-0 flex-1 flex-col">{children}</div> : <button type="button" className="mx-auto mt-3 grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label={`Open ${title}`} onClick={() => onPin(true)}>{side === 'left' ? '+' : '≡'}</button>}
    </aside>
  </div>;
}
