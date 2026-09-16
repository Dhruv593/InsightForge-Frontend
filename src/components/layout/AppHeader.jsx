import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function AppHeader({ onToggleSidebar, activeRuns = [], onSelectRun, onCancelRun }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [queueOpen, setQueueOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      toast.success('You’ve been logged out.');
    } catch {
      toast.error('Signed out on this device, but the server could not confirm logout.');
    } finally {
      navigate('/login', { replace: true });
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-[#E1E1E5] bg-white px-4 sm:px-5">
      <div className="flex items-center gap-3">
        {onToggleSidebar && <button className="grid h-8 w-8 place-items-center rounded-lg border-0 bg-transparent text-lg text-[#515154] hover:bg-[#F2F2F4] lg:hidden" type="button" onClick={onToggleSidebar} aria-label="Toggle sidebar">☰</button>}
        <button className="inline-flex items-center gap-2.5 border-0 bg-transparent p-0 text-[16px] font-semibold tracking-[-0.01em] text-[#1D1D1F]" type="button" onClick={() => navigate('/dashboard')}><span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-[9px] font-semibold text-white">IF</span>InsightForge</button>
      </div>
      <div className="flex items-center gap-1">{activeRuns.length > 0 && <div className="relative"><button className="inline-flex items-center gap-2 rounded-lg border-0 bg-indigo-50 px-2.5 py-1.5 text-xs font-medium text-indigo-700" type="button" onClick={() => setQueueOpen((value) => !value)} aria-expanded={queueOpen}><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />Queue {activeRuns.length}</button>{queueOpen && <div className="absolute right-0 top-10 z-50 w-80 overflow-hidden rounded-xl border border-[#E1E1E5] bg-white shadow-xl"><div className="border-b border-[#ECECEF] px-4 py-3 text-xs font-semibold">Active analyses</div><div className="max-h-72 overflow-y-auto p-2">{activeRuns.map((run) => <div className="flex items-center gap-2 rounded-lg p-2 hover:bg-[#F7F7F8]" key={run.id}><button className="min-w-0 flex-1 border-0 bg-transparent text-left" type="button" onClick={() => { onSelectRun?.(run); setQueueOpen(false); }}><span className="block truncate text-xs font-medium text-[#1D1D1F]">{run.query}</span><span className="mt-1 block text-[10px] capitalize text-[#86868B]">{run.status}</span></button><button className="rounded-md border-0 bg-transparent px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-50" type="button" onClick={() => onCancelRun?.(run)}>Cancel</button></div>)}</div></div>}</div>}<button className="rounded-lg border-0 bg-transparent px-2 py-1.5 text-xs font-medium text-[#6E6E73] hover:bg-[#F2F2F4]" type="button" onClick={() => navigate('/account')}>Account</button>{user?.is_admin && <button className="rounded-lg border-0 bg-transparent px-2 py-1.5 text-xs font-medium text-[#6E6E73] hover:bg-[#F2F2F4]" type="button" onClick={() => navigate('/monitoring')}>Monitoring</button>}<span className="hidden text-[13px] font-medium text-[#515154] sm:inline">{user?.name}</span><span className="grid h-7 w-7 place-items-center rounded-full bg-[#E5E5EA] text-[10px] font-semibold text-[#515154]">{(user?.name || 'U').charAt(0).toUpperCase()}</span><button className="rounded-lg border-0 bg-transparent px-2 py-1.5 text-xs font-medium text-[#6E6E73] transition hover:bg-[#F2F2F4] hover:text-[#1D1D1F]" type="button" onClick={handleLogout}>Log out</button></div>
    </header>
  );
}
