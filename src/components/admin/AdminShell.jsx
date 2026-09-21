import { Fragment } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../layout/AppHeader';

const navigation = [
  { label: 'Overview', to: '/admin', icon: 'home' },
  { label: 'Landing page', to: '/admin/landing-content', icon: 'page' },
  { label: 'Blog posts', to: '/admin/blogs', icon: 'blog' },
  { label: 'AI model', to: '/admin/ai-model', icon: 'model' },
  { label: 'Monitoring', to: '/monitoring', icon: 'activity' },
  { label: 'Account settings', to: '/account', icon: 'user' },
];

export function AdminShell({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const editingLanding = location.pathname.startsWith('/admin/landing-content');
  const landingSections = [['navigation', 'Navbar'], ['hero', 'Hero'], ['how-it-works', 'How it works'], ['preview', 'Product preview'], ['platform', 'Platform'], ['faq', 'FAQ'], ['closing', 'Closing CTA'], ['footer', 'Footer']];
  return <div className="min-h-screen bg-[#F5F5F7] pt-14">
    <AppHeader />
    <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-[1600px] lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="border-b border-[#E1E1E5] bg-white lg:border-b-0 lg:border-r">
        <div className="lg:sticky lg:top-14 lg:flex lg:h-[calc(100vh-3.5rem)] lg:flex-col lg:px-4 lg:py-6">
          <div className="flex items-center justify-between px-4 pt-4 lg:hidden"><div><p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-600">Tatparya</p><h1 className="mb-0 mt-1 text-base font-semibold tracking-[-0.02em]">Admin Dashboard</h1></div><Link className="text-xs font-medium text-[#515154]" to="/dashboard">Workspace →</Link></div>
          <div className="hidden px-3 lg:block">
            <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-600">Tatparya</p>
            <h1 className="mb-0 mt-2 text-lg font-semibold tracking-[-0.025em] text-[#1D1D1F]">Admin Dashboard</h1>
            <p className="mb-0 mt-1 text-xs leading-5 text-[#86868B]">Manage content and system operations.</p>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:mt-7 lg:grid lg:overflow-visible lg:px-0 lg:py-0" aria-label="Admin navigation">
            {navigation.map((item) => <Fragment key={item.to}>
              <NavLink className={({ isActive }) => `inline-flex min-w-max items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium transition lg:w-full ${isActive ? 'bg-brand-50 text-brand-700' : 'text-[#515154] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]'}`} end={item.to === '/admin'} to={item.to}><AdminIcon name={item.icon} /><span>{item.label}</span></NavLink>
              {item.to === '/admin/landing-content' && editingLanding && <div className="flex gap-1 overflow-x-auto border-l border-[#ECECEF] pl-2 lg:ml-5 lg:grid lg:overflow-visible lg:py-1" aria-label="Landing page sections">{landingSections.map(([section, label]) => <NavLink className={({ isActive }) => `min-w-max rounded-md px-2.5 py-2 text-[11px] font-medium transition ${isActive ? 'bg-[#F2F2F4] text-[#1D1D1F]' : 'text-[#86868B] hover:text-[#1D1D1F]'}`} key={section} to={`/admin/landing-content/${section}`}>{label}</NavLink>)}</div>}
            </Fragment>)}
          </nav>
          <div className="hidden lg:mt-auto lg:block">
            <div className="mb-3 border-t border-[#ECECEF] pt-4"><p className="m-0 truncate px-3 text-xs font-semibold text-[#3A3A3C]">{user?.name}</p><p className="mb-0 mt-1 truncate px-3 text-[10px] text-[#86868B]">{user?.email}</p></div>
            <Link className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-[#515154] hover:bg-[#F5F5F7]" to="/dashboard"><AdminIcon name="back" />Back to workspace</Link>
            <Link className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-[#515154] hover:bg-[#F5F5F7]" to="/?preview=1" target="_blank"><AdminIcon name="external" />View public site</Link>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-7 sm:px-6 lg:px-8 lg:py-10 xl:px-10">{children}</main>
    </div>
  </div>;
}

function AdminIcon({ name }) {
  const paths = {
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></>,
    page: <><path d="M5 3h10l4 4v14H5z" /><path d="M14 3v5h5M8 13h8M8 17h6" /></>,
    blog: <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    model: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="3" fill="currentColor" /><circle cx="15" cy="17" r="3" fill="currentColor" /></>,
    activity: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V3" /><path d="M2 19h20" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    back: <><path d="m10 17-5-5 5-5" /><path d="M5 12h14" /></>,
    external: <><path d="M14 5h5v5M13 11l6-6" /><path d="M19 13v6H5V5h6" /></>,
  };
  return <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
