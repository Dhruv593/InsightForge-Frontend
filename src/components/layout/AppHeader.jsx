import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function AppHeader({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

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
        <button className="grid h-8 w-8 place-items-center rounded-lg border-0 bg-transparent text-lg text-[#515154] hover:bg-[#F2F2F4] lg:hidden" type="button" onClick={onToggleSidebar} aria-label="Toggle sidebar">☰</button>
        <div className="inline-flex items-center gap-2.5 text-[16px] font-semibold tracking-[-0.01em] text-[#1D1D1F]"><span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-[9px] font-semibold text-white">IF</span>InsightForge</div>
      </div>
      <div className="flex items-center gap-2"><span className="hidden text-[13px] font-medium text-[#515154] sm:inline">{user?.name}</span><span className="grid h-7 w-7 place-items-center rounded-full bg-[#E5E5EA] text-[10px] font-semibold text-[#515154]">{(user?.name || 'U').charAt(0).toUpperCase()}</span><button className="rounded-lg border-0 bg-transparent px-2 py-1.5 text-xs font-medium text-[#6E6E73] transition hover:bg-[#F2F2F4] hover:text-[#1D1D1F]" type="button" onClick={handleLogout}>Log out</button></div>
    </header>
  );
}
