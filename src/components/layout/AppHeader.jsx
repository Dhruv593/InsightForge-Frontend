import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { BrandLogo } from '../common/BrandLogo';

export function AppHeader({ onToggleSidebar, activeRuns = [], onSelectRun, onCancelRun }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [queueOpen, setQueueOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    function closeMenu(event) {
      if (event.key === 'Escape' || (event.type === 'pointerdown' && !accountMenuRef.current?.contains(event.target))) setAccountOpen(false);
    }
    document.addEventListener('pointerdown', closeMenu);
    document.addEventListener('keydown', closeMenu);
    return () => {
      document.removeEventListener('pointerdown', closeMenu);
      document.removeEventListener('keydown', closeMenu);
    };
  }, []);

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
        <button className="inline-flex items-center border-0 bg-transparent p-0" type="button" onClick={() => navigate('/dashboard')} aria-label="Tatparya dashboard"><BrandLogo variant="symbol" className="h-8 w-8 min-[380px]:hidden" /><BrandLogo className="hidden h-8 w-auto max-w-[138px] min-[380px]:block" /></button>
      </div>
      <div className="flex items-center gap-2">
        {activeRuns.length > 0 && <div className="relative"><button className="inline-flex items-center gap-1.5 rounded-lg border-0 bg-indigo-50 px-2 py-1.5 text-xs font-medium text-indigo-700 sm:gap-2 sm:px-2.5" type="button" onClick={() => { setQueueOpen((value) => !value); setAccountOpen(false); }} aria-expanded={queueOpen}><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" /><span className="hidden min-[380px]:inline">Queue</span>{activeRuns.length}</button>{queueOpen && <div className="absolute right-0 top-10 z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[#E1E1E5] bg-white shadow-xl"><div className="border-b border-[#ECECEF] px-4 py-3 text-xs font-semibold">Active analyses</div><div className="max-h-72 overflow-y-auto p-2">{activeRuns.map((run) => <div className="flex items-center gap-2 rounded-lg p-2 hover:bg-[#F7F7F8]" key={run.id}><button className="min-w-0 flex-1 border-0 bg-transparent text-left" type="button" onClick={() => { onSelectRun?.(run); setQueueOpen(false); }}><span className="block truncate text-xs font-medium text-[#1D1D1F]">{run.query}</span><span className="mt-1 block text-[10px] capitalize text-[#86868B]">{run.status}</span></button><button className="rounded-md border-0 bg-transparent px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-50" type="button" onClick={() => onCancelRun?.(run)}>Cancel</button></div>)}</div></div>}</div>}
        <div className="relative" ref={accountMenuRef}>
          <button className="inline-flex h-10 items-center gap-2 rounded-full border border-transparent bg-transparent py-1 pl-2 pr-1 transition hover:border-[#E1E1E5] hover:bg-[#F7F7F8]" type="button" onClick={() => { setAccountOpen((value) => !value); setQueueOpen(false); }} aria-expanded={accountOpen} aria-haspopup="menu">
            <span className="hidden max-w-36 truncate text-[13px] font-medium text-[#3A3A3C] sm:block">{user?.name}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#E8E8ED] text-[11px] font-semibold text-[#515154]">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
            <svg className={`mr-1 h-3 w-3 text-[#86868B] transition ${accountOpen ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m3 4.5 3 3 3-3" /></svg>
          </button>
          {accountOpen && <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-[#E1E1E5] bg-white p-1.5 shadow-xl" role="menu">
            <div className="border-b border-[#ECECEF] px-3 py-2.5"><span className="block truncate text-xs font-semibold text-[#1D1D1F]">{user?.name}</span><span className="mt-0.5 block truncate text-[10px] text-[#86868B]">{user?.email}</span></div>
            <button className="mt-1 flex w-full items-center rounded-lg border-0 bg-transparent px-3 py-2 text-left text-xs font-medium text-[#515154] hover:bg-[#F2F2F4]" role="menuitem" type="button" onClick={() => { setAccountOpen(false); navigate('/account'); }}>Account settings</button>
            {user?.is_admin && <button className="flex w-full items-center rounded-lg border-0 bg-transparent px-3 py-2 text-left text-xs font-medium text-[#515154] hover:bg-[#F2F2F4]" role="menuitem" type="button" onClick={() => { setAccountOpen(false); navigate('/monitoring'); }}>Monitoring</button>}
            <div className="my-1 border-t border-[#ECECEF]" />
            <button className="flex w-full items-center rounded-lg border-0 bg-transparent px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50" role="menuitem" type="button" onClick={handleLogout}>Log out</button>
          </div>}
        </div>
      </div>
    </header>
  );
}
