import { useRef, useState } from 'react';
import { DockPanel } from './DockPanel';

export function Sidebar({ open, pinned, onPin, datasets, datasetsLoading, selectedDatasetId, conversations, conversationsLoading, selectedConversationId, uploading, onUpload, onViewDatasets, onSelectConversation, onNewAnalysis }) {
  const inputRef = useRef(null);
  const [analysisSearch, setAnalysisSearch] = useState('');
  const chooseFile = () => inputRef.current?.click();
  const fileSelected = (event) => {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
    event.target.value = '';
  };
  const filteredConversations = conversations.filter((conversation) => conversation.title.toLowerCase().includes(analysisSearch.trim().toLowerCase()));

  const content = <>
      <div className="grid gap-2 px-3 pt-4">
        <button className="flex min-h-10 w-full items-center gap-2 rounded-lg border border-[#DADAE0] bg-white px-3 text-left text-sm font-medium text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition hover:border-[#C8C8CE] hover:bg-[#FBFBFC]" type="button" onClick={onNewAnalysis}>
          <span className="text-lg font-light leading-none text-brand-600">+</span>New Analysis
        </button>
        <button className="flex min-h-10 w-full items-center gap-2 rounded-lg border border-[#DADAE0] bg-white px-3 text-left text-sm font-medium text-[#1D1D1F] transition hover:border-[#C8C8CE] hover:bg-[#FBFBFC] disabled:opacity-50" type="button" onClick={chooseFile} disabled={uploading}>
          <UploadIcon />{uploading ? 'Uploading…' : 'Upload Dataset'}
        </button>
        <button className={`flex min-h-10 w-full items-center gap-2 rounded-lg border-0 px-3 text-left text-sm font-medium transition ${!selectedDatasetId ? 'bg-indigo-50 text-indigo-950' : 'bg-transparent text-[#515154] hover:bg-black/[0.035] hover:text-[#1D1D1F]'}`} type="button" onClick={onViewDatasets} aria-current={!selectedDatasetId ? 'page' : undefined}>
          <DatasetsIcon /><span className="min-w-0 flex-1">View datasets</span><span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-[#6E6E73]">{datasetsLoading ? '…' : datasets.length}</span>
        </button>
        <input ref={inputRef} className="sr-only" type="file" accept=".csv,.xlsx,.xls,.json,.parquet" onChange={fileSelected} />
      </div>
      <nav className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-3 pb-5 pt-7" aria-label="Tatparya workspace">
        <SidebarSection title="Recent Analyses">
          {conversations.length > 8 && <label className="relative mb-2 block px-1"><span className="sr-only">Search analyses</span><SearchIcon /><input className="h-9 w-full rounded-lg border border-[#DADAE0] bg-white pl-8 pr-3 text-xs text-[#3A3A3C] outline-none placeholder:text-[#98989D] focus:border-brand-400 focus:ring-2 focus:ring-brand-50" type="search" value={analysisSearch} placeholder="Search analyses" onChange={(event) => setAnalysisSearch(event.target.value)} /></label>}
          {conversationsLoading ? <SidebarNote>Loading analyses…</SidebarNote> : conversations.length === 0 ? <SidebarNote>No analyses yet.</SidebarNote> : filteredConversations.length === 0 ? <SidebarNote>No matching analyses.</SidebarNote> : <ul className="m-0 grid min-w-0 grid-cols-[minmax(0,1fr)] list-none gap-0.5 p-0">{filteredConversations.map((conversation) => <li className="min-w-0" key={conversation.id}><button className={`block w-full min-w-0 max-w-full overflow-hidden rounded-lg border-0 px-3 py-2.5 text-left transition ${conversation.id === selectedConversationId ? 'bg-indigo-50 text-indigo-950' : 'bg-transparent text-[#3A3A3C] hover:bg-black/[0.035]'}`} type="button" title={conversation.title} onClick={() => onSelectConversation(conversation.id)}><span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium">{conversation.title}</span><span className="mt-0.5 block text-[11px] text-[#86868B]">{formatDate(conversation.updated_at)}</span></button></li>)}</ul>}
        </SidebarSection>
      </nav>
    </>;
  return <><DockPanel title="Workspace" pinned={pinned} onPin={onPin}>{content}</DockPanel>{open && <aside className="fixed bottom-0 left-0 top-14 z-20 flex w-64 flex-col border-r border-[#E1E1E5] bg-[#FAFAFB] lg:hidden">{content}</aside>}</>;
}

function SidebarSection({ title, className = '', children }) { return <section className={`min-w-0 ${className}`}><h2 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#86868B]">{title}</h2>{children}</section>; }
function SidebarNote({ children }) { return <p className="m-0 px-3 py-2 text-xs leading-5 text-[#86868B]">{children}</p>; }
export function datasetMeta(dataset, profile) { const type = dataset.file_type?.toUpperCase() || 'FILE'; return !profile || profile.profile_status !== 'completed' ? `${type} · Not profiled` : `${type} · ${Number(profile.row_count).toLocaleString()} rows · ${profile.column_count} columns · Ready`; }
function formatDate(value) { return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value)); }
function UploadIcon() { return <svg className="h-4 w-4 shrink-0 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" /><path d="M5 15v4h14v-4" /></svg>; }
function DatasetsIcon() { return <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="7" ry="3" /><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></svg>; }
function SearchIcon() { return <svg className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#98989D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg>; }
