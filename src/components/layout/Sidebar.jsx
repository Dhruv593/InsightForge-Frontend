import { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DockPanel } from './DockPanel';

export function Sidebar({ open, pinned, onPin, datasets, datasetProfiles, datasetsLoading, selectedDatasetId, conversations, conversationsLoading, selectedConversationId, uploading, onUpload, onSelectDataset, onSelectConversation, onNewAnalysis, onDeleteDataset }) {
  const inputRef = useRef(null);
  const { user } = useAuth();
  const chooseFile = () => inputRef.current?.click();
  const fileSelected = (event) => {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
    event.target.value = '';
  };

  const content = <>
      <div className="px-3 pt-4">
        <button className="flex min-h-10 w-full items-center gap-2 rounded-lg border border-[#DADAE0] bg-white px-3 text-left text-sm font-medium text-[#1D1D1F] shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition hover:border-[#C8C8CE] hover:bg-[#FBFBFC]" type="button" onClick={onNewAnalysis}>
          <span className="text-lg font-light leading-none text-brand-600">+</span>New Analysis
        </button>
      </div>
      <nav className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-3 pb-5 pt-6" aria-label="Tatparya workspace">
        <SidebarSection title="Recent Analyses">
          {conversationsLoading ? <SidebarNote>Loading analyses…</SidebarNote> : conversations.length === 0 ? <SidebarNote>No analyses yet.</SidebarNote> : <ul className="m-0 grid min-w-0 grid-cols-[minmax(0,1fr)] list-none gap-0.5 p-0">{conversations.map((conversation) => <li className="min-w-0" key={conversation.id}><button className={`block w-full min-w-0 max-w-full overflow-hidden rounded-lg border-0 px-3 py-2.5 text-left transition ${conversation.id === selectedConversationId ? 'bg-indigo-50 text-indigo-950' : 'bg-transparent text-[#3A3A3C] hover:bg-black/[0.035]'}`} type="button" title={conversation.title} onClick={() => onSelectConversation(conversation.id)}><span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium">{conversation.title}</span><span className="mt-0.5 block text-[11px] text-[#86868B]">{formatDate(conversation.updated_at)}</span></button></li>)}</ul>}
        </SidebarSection>
        <SidebarSection title="Datasets" className="mt-7">
          {datasetsLoading ? <SidebarNote>Loading datasets…</SidebarNote> : datasets.length === 0 ? <SidebarNote>No datasets uploaded.</SidebarNote> : <ul className="m-0 grid min-w-0 grid-cols-[minmax(0,1fr)] list-none gap-0.5 p-0">{datasets.map((dataset) => <li className="group relative min-w-0" key={dataset.id}><button className={`block w-full min-w-0 max-w-full overflow-hidden rounded-lg border-0 px-3 py-2.5 pr-10 text-left transition ${dataset.id === selectedDatasetId ? 'bg-indigo-50' : 'bg-transparent hover:bg-black/[0.035]'}`} type="button" title={dataset.original_file_name} onClick={() => onSelectDataset(dataset.id)}><span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium text-[#3A3A3C]">{dataset.original_file_name}</span><span className="mt-0.5 block overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-[#86868B]">{datasetMeta(dataset, datasetProfiles?.[dataset.id])}</span></button>{dataset.id === selectedDatasetId && <button className="absolute right-2 top-2.5 rounded-md border-0 bg-transparent px-1.5 py-1 text-[10px] font-medium text-red-500 opacity-0 transition hover:bg-red-50 group-hover:opacity-100 focus:opacity-100" type="button" onClick={() => onDeleteDataset(dataset)} aria-label={`Delete ${dataset.original_file_name}`}>Delete</button>}</li>)}</ul>}
          <button className="mt-2 flex min-h-9 w-full items-center gap-2 rounded-lg border-0 bg-transparent px-3 text-left text-[13px] font-medium text-[#6E6E73] transition hover:bg-black/[0.035] hover:text-[#1D1D1F] disabled:opacity-50" type="button" onClick={chooseFile} disabled={uploading}><span className="text-base font-light">+</span>{uploading ? 'Uploading…' : 'Upload Dataset'}</button>
          <input ref={inputRef} className="sr-only" type="file" accept=".csv,.xlsx,.xls,.json,.parquet" onChange={fileSelected} />
        </SidebarSection>
      </nav>
      <div className="border-t border-[#E1E1E5] px-4 py-3.5"><div className="flex items-center gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#E5E5EA] text-xs font-semibold text-[#515154]">{initials(user?.name)}</span><div className="min-w-0"><p className="m-0 truncate text-[13px] font-medium text-[#1D1D1F]">{user?.name || 'Account'}</p><p className="m-0 truncate text-[11px] text-[#86868B]">{user?.email}</p></div></div></div>
    </>;
  return <><DockPanel title="Workspace" pinned={pinned} onPin={onPin}>{content}</DockPanel>{open && <aside className="fixed bottom-0 left-0 top-14 z-20 flex w-64 flex-col border-r border-[#E1E1E5] bg-[#FAFAFB] lg:hidden">{content}</aside>}</>;
}

function SidebarSection({ title, className = '', children }) { return <section className={`min-w-0 ${className}`}><h2 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#86868B]">{title}</h2>{children}</section>; }
function SidebarNote({ children }) { return <p className="m-0 px-3 py-2 text-xs leading-5 text-[#86868B]">{children}</p>; }
export function datasetMeta(dataset, profile) { const type = dataset.file_type?.toUpperCase() || 'FILE'; return !profile || profile.profile_status !== 'completed' ? `${type} · Not profiled` : `${type} · ${Number(profile.row_count).toLocaleString()} rows · ${profile.column_count} columns · Ready`; }
function formatDate(value) { return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value)); }
function initials(name) { return (name || 'U').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }
