import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { BrandLogo } from '../common/BrandLogo';

export function AppHeader({ onToggleSidebar, activeRuns = [], onSelectRun, onCancelRun, showCredits = true, compactProfileMenu = true }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [queueOpen, setQueueOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const accountButtonRef = useRef(null);
  const credits = user?.credits ?? 0;
  const creditTone = credits === 0 ? 'border-red-200 bg-red-50 text-red-700' : credits === 1 ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-[#E1E1E5] bg-[#F7F7F8] text-[#3A3A3C]';
  const creditActionTone = credits === 0 ? 'border-red-200 text-red-700 hover:bg-red-100' : credits === 1 ? 'border-amber-200 text-amber-800 hover:bg-amber-100' : 'border-[#E1E1E5] text-brand-600 hover:bg-brand-50';

  useEffect(() => {
    function closeMenu(event) {
      if (event.key === 'Escape') {
        setAccountOpen(false);
        accountButtonRef.current?.focus();
      } else if (event.type === 'pointerdown' && !accountMenuRef.current?.contains(event.target)) setAccountOpen(false);
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

  function handleAccountMenuKeyDown(event) {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const items = [...accountMenuRef.current.querySelectorAll('[role="menuitem"]')];
    if (!items.length) return;
    event.preventDefault();
    const current = items.indexOf(document.activeElement);
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : event.key === 'ArrowDown' ? (current + 1) % items.length : (current <= 0 ? items.length : current) - 1;
    items[target].focus();
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[70] flex h-14 max-w-full items-center justify-between overflow-x-clip border-b border-white/80 bg-white/94 px-2 backdrop-blur-[16px] backdrop-saturate-[1.1] min-[360px]:px-4 sm:px-5">
      <div className="flex items-center gap-1.5 sm:gap-3">
        {onToggleSidebar && <button className="grid h-11 w-11 place-items-center rounded-xl border-0 bg-transparent text-lg text-[#515154] hover:bg-[#F2F2F4] lg:hidden" type="button" onClick={onToggleSidebar} aria-label="Toggle sidebar">☰</button>}
        <button className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border-0 bg-transparent p-0 hover:bg-[#F7F7F8]" type="button" onClick={() => navigate('/dashboard')} aria-label="Tatparya dashboard"><BrandLogo variant="symbol" className="h-8 w-8 min-[380px]:hidden" /><BrandLogo className="hidden h-8 w-auto max-w-[138px] min-[380px]:block" /></button>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        {showCredits && <div className={`flex items-center overflow-hidden rounded-full border ${creditTone}`}>
          <span className="inline-flex h-11 items-center gap-1.5 px-2.5 text-xs font-semibold" title="Available question credits"><CreditIcon /><span>{credits}</span><span className="hidden sm:inline">credits</span></span>
          <button className={`h-11 border-0 border-l bg-white px-2.5 text-[11px] font-semibold transition sm:px-3 ${creditActionTone}`} type="button" onClick={() => navigate('/plans')} aria-label="Get credits"><span className="hidden sm:inline">Get credits</span><span className="sm:hidden" aria-hidden="true">+</span></button>
        </div>}
        {activeRuns.length > 0 && <div className="relative"><button className="inline-flex h-11 items-center gap-1.5 rounded-xl border-0 bg-indigo-50 px-2.5 text-xs font-medium text-indigo-700 sm:gap-2" type="button" onClick={() => { setQueueOpen((value) => !value); setAccountOpen(false); }} aria-expanded={queueOpen}><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" /><span className="hidden min-[380px]:inline">Queue</span>{activeRuns.length}</button>{queueOpen && <div className="glass-popover absolute right-0 top-12 z-[80] w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl"><div className="border-b border-black/10 px-4 py-3 text-xs font-semibold">Active analyses</div><div className="max-h-72 overflow-y-auto p-2">{activeRuns.map((run) => <div className="flex items-center gap-2 rounded-lg p-2 hover:bg-black/[0.045]" key={run.id}><button className="min-h-11 min-w-0 flex-1 border-0 bg-transparent text-left" type="button" onClick={() => { onSelectRun?.(run); setQueueOpen(false); }}><span className="block truncate text-xs font-medium text-[#1D1D1F]">{run.query}</span><span className="mt-1 block text-[11px] capitalize text-[#6E6E73]">{run.status}</span></button><button className="min-h-11 rounded-lg border-0 bg-transparent px-3 text-xs font-medium text-red-600 hover:bg-red-500/10" type="button" onClick={() => onCancelRun?.(run)}>Cancel</button></div>)}</div></div>}</div>}
        <div className="relative" ref={accountMenuRef} onKeyDown={compactProfileMenu ? handleAccountMenuKeyDown : undefined}>
          <button ref={accountButtonRef} className="inline-flex h-11 items-center gap-2 rounded-full border border-transparent bg-transparent py-1 pl-2 pr-1 transition hover:border-[#E1E1E5] hover:bg-[#F7F7F8]" type="button" onClick={() => { setAccountOpen((value) => !value); setQueueOpen(false); }} aria-expanded={accountOpen} aria-haspopup="menu">
            <span className="hidden max-w-36 truncate text-[13px] font-medium text-[#3A3A3C] sm:block">{user?.name}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#E8E8ED] text-[11px] font-semibold text-[#515154]">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
            <svg className={`mr-1 hidden h-3 w-3 text-[#6E6E73] transition min-[360px]:block ${accountOpen ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d="m3 4.5 3 3 3-3" /></svg>
          </button>
          {accountOpen && compactProfileMenu && <div className="glass-popover absolute right-0 top-12 z-[80] w-[min(13.5rem,calc(100vw-1rem))] overflow-hidden rounded-[14px] p-1.5 text-[#2C2C2E]" role="menu" aria-label="Profile menu">
            <div className="px-2.5 py-2"><span className="block truncate text-[12px] font-semibold leading-4">{user?.name}</span><span className="mt-0.5 block truncate text-[10px] leading-4 text-[#6E6E73]">{user?.email}</span></div>
            <div className="my-0.5 border-t border-black/10" />
            <CompactMenuItem icon="account" label="Account settings" onClick={() => { setAccountOpen(false); navigate('/account'); }} />
            <CompactMenuItem icon="credits" label="Plans & credits" onClick={() => { setAccountOpen(false); navigate('/plans'); }} />
            {user?.is_admin && <><div className="my-0.5 border-t border-black/10" /><CompactMenuItem icon="admin" label="Admin dashboard" onClick={() => { setAccountOpen(false); navigate('/admin'); }} /></>}
            <div className="my-0.5 border-t border-black/10" />
            <CompactMenuItem destructive icon="logout" label="Log out" onClick={handleLogout} trailing="" />
          </div>}
          {accountOpen && !compactProfileMenu && <div className="glass-popover absolute right-0 top-11 z-[80] w-56 overflow-hidden rounded-xl p-1.5" role="menu">
            <div className="border-b border-[#ECECEF] px-3 py-2.5"><span className="block truncate text-xs font-semibold text-[#1D1D1F]">{user?.name}</span><span className="mt-0.5 block truncate text-[11px] text-[#6E6E73]">{user?.email}</span></div>
            <button className="mt-1 flex min-h-11 w-full items-center rounded-lg border-0 bg-transparent px-3 text-left text-xs font-medium text-[#515154] hover:bg-[#F2F2F4]" role="menuitem" type="button" onClick={() => { setAccountOpen(false); navigate('/account'); }}>Account settings</button>
            {user?.is_admin && <button className="flex min-h-11 w-full items-center rounded-lg border-0 bg-transparent px-3 text-left text-xs font-medium text-[#515154] hover:bg-[#F2F2F4]" role="menuitem" type="button" onClick={() => { setAccountOpen(false); navigate('/admin'); }}>Admin Dashboard</button>}
            <div className="my-1 border-t border-[#ECECEF]" />
            <button className="flex min-h-11 w-full items-center rounded-lg border-0 bg-transparent px-3 text-left text-xs font-medium text-red-600 hover:bg-red-50" role="menuitem" type="button" onClick={handleLogout}>Log out</button>
          </div>}
        </div>
      </div>
    </header>
  );
}

function CompactMenuItem({ icon, label, onClick, destructive = false, trailing = '›' }) {
  return <button className={`flex min-h-10 w-full items-center gap-2 rounded-lg border-0 bg-transparent px-2.5 text-left text-[12px] font-medium transition sm:min-h-8 ${destructive ? 'text-red-600 hover:bg-red-500/10 focus-visible:bg-red-500/10' : 'text-[#2C2C2E] hover:bg-black/[0.055] focus-visible:bg-black/[0.055]'}`} role="menuitem" type="button" onClick={onClick}><MenuIcon name={icon} /><span className="min-w-0 flex-1 truncate">{label}</span>{trailing && <span className="text-base font-normal leading-none text-[#8E8E93]" aria-hidden="true">{trailing}</span>}</button>;
}

function MenuIcon({ name }) {
  const paths = {
    account: <><circle cx="8" cy="5.5" r="2.5" /><path d="M3 14c.5-2.6 2.2-4 5-4s4.5 1.4 5 4" /></>,
    credits: <><circle cx="8" cy="8" r="6" /><path d="M8 4.5v7M4.5 8h7" /></>,
    admin: <><rect x="2.5" y="3" width="11" height="10" rx="1.5" /><path d="M5 6h6M5 9h3" /></>,
    logout: <><path d="M6.5 2.5h-3v11h3M9 5l3 3-3 3M12 8H6" /></>,
  };
  return <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function CreditIcon() {
  return <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><circle cx="8" cy="8" r="5.5" /><path d="M8 4.75v6.5M5.75 8h4.5" /></svg>;
}
