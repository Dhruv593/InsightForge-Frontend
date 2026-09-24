import { Fragment, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AppHeader } from '../layout/AppHeader';

const navigation = [
  { label: 'Overview', to: '/admin', icon: 'home' },
  { label: 'Landing page', to: '/admin/landing-content', icon: 'page' },
  { label: 'Blog posts', to: '/admin/blogs', icon: 'blog' },
  { label: 'Plans page', to: '/admin/plans', icon: 'plans' },
  { label: 'Legal pages', to: '/admin/legal-pages', icon: 'legal' },
  { label: 'AI model', to: '/admin/ai-model', icon: 'model' },
  { label: 'Email templates', to: '/admin/email-templates', icon: 'email' },
  { label: 'Users & access', to: '/admin/users', icon: 'users' },
  { label: 'Monitoring', to: '/monitoring', icon: 'activity' },
  { label: 'Account settings', to: '/account', icon: 'user' },
];

export function AdminShell({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const editingLanding = location.pathname.startsWith('/admin/landing-content');
  const editingLegal = location.pathname.startsWith('/admin/legal-pages');
  const landingSections = [['navigation', 'Navbar'], ['layout', 'Layout & colors'], ['hero', 'Hero'], ['how-it-works', 'How it works'], ['preview', 'Product preview'], ['platform', 'Platform'], ['video', 'Tutorial video'], ['faq', 'FAQ'], ['contact', 'Contact'], ['closing', 'Closing CTA'], ['footer', 'Footer']];
  const legalSections = [['privacy', 'Privacy policy'], ['terms', 'Terms and conditions']];
  return <div className="min-h-screen bg-[#F5F5F7] pt-14">
    <AppHeader showCredits={false} />
    <div className="grid min-h-[calc(100vh-3.5rem)] w-full lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="relative z-40 border-b border-[#E1E1E5] bg-white lg:z-auto lg:border-b-0 lg:border-r">
        <div className="lg:sticky lg:top-14 lg:flex lg:h-[calc(100vh-3.5rem)] lg:flex-col lg:px-4 lg:py-6">
          <div className="flex min-h-16 items-center justify-between gap-3 px-3 lg:hidden"><div className="min-w-0"><p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-600">Tatparya</p><h1 className="mb-0 mt-0.5 truncate text-sm font-semibold tracking-[-0.02em]">Admin Dashboard</h1></div><button className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-[#D2D2D7] bg-white px-3 text-xs font-semibold text-[#3A3A3C]" type="button" aria-expanded={mobileMenuOpen} aria-controls="admin-navigation" onClick={() => setMobileMenuOpen((value) => !value)}><AdminIcon name="menu" />Menu</button></div>
          <div className="hidden px-3 lg:block">
            <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-600">Tatparya</p>
            <h1 className="mb-0 mt-2 text-lg font-semibold tracking-[-0.025em] text-[#1D1D1F]">Admin Dashboard</h1>
            <p className="mb-0 mt-1 text-xs leading-5 text-[#86868B]">Manage content and system operations.</p>
          </div>
          <nav className={`${mobileMenuOpen ? 'grid' : 'hidden'} absolute inset-x-0 top-full max-h-[calc(100dvh-7.5rem)] gap-1 overflow-y-auto border-b border-[#E1E1E5] bg-white px-3 py-3 shadow-xl lg:static lg:mt-7 lg:grid lg:max-h-none lg:overflow-visible lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none`} id="admin-navigation" aria-label="Admin navigation">
            {navigation.map((item) => <Fragment key={item.to}>
              <NavLink className={({ isActive }) => `inline-flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-xs font-medium transition lg:w-full ${isActive ? 'bg-brand-50 text-brand-700' : 'text-[#515154] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]'}`} end={item.to === '/admin'} to={item.to} onClick={() => setMobileMenuOpen(false)}><AdminIcon name={item.icon} /><span>{item.label}</span></NavLink>
              {item.to === '/admin/landing-content' && editingLanding && <SubNavigation items={landingSections} base="/admin/landing-content" label="Landing page sections" onNavigate={() => setMobileMenuOpen(false)} />}
              {item.to === '/admin/legal-pages' && editingLegal && <SubNavigation items={legalSections} base="/admin/legal-pages" label="Legal page sections" onNavigate={() => setMobileMenuOpen(false)} />}
            </Fragment>)}
            <Link className="inline-flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-xs font-medium text-[#515154] hover:bg-[#F5F5F7] lg:hidden" to="/dashboard"><AdminIcon name="back" />Back to workspace</Link>
          </nav>
          <div className="hidden lg:mt-auto lg:block">
            <div className="mb-3 border-t border-[#ECECEF] pt-4"><p className="m-0 truncate px-3 text-xs font-semibold text-[#3A3A3C]">{user?.name}</p><p className="mb-0 mt-1 truncate px-3 text-[10px] text-[#86868B]">{user?.email}</p></div>
            <Link className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-[#515154] hover:bg-[#F5F5F7]" to="/dashboard"><AdminIcon name="back" />Back to workspace</Link>
            <Link className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-[#515154] hover:bg-[#F5F5F7]" to="/?preview=1" target="_blank"><AdminIcon name="external" />View public site</Link>
          </div>
        </div>
      </aside>
      <main className="min-w-0 overflow-x-hidden px-3 py-6 min-[360px]:px-4 sm:px-6 sm:py-7 lg:px-8 lg:py-10 xl:px-10">{children}</main>
    </div>
  </div>;
}

function SubNavigation({ items, base, label, onNavigate }) {
  return <div className="grid gap-0.5 border-l border-[#ECECEF] py-1 pl-3 lg:ml-5" aria-label={label}>{items.map(([section, title]) => <NavLink className={({ isActive }) => `flex min-h-10 items-center rounded-lg px-3 text-[11px] font-medium transition ${isActive ? 'bg-[#F2F2F4] text-[#1D1D1F]' : 'text-[#6E6E73] hover:text-[#1D1D1F]'}`} key={section} to={`${base}/${section}`} onClick={onNavigate}>{title}</NavLink>)}</div>;
}

function AdminIcon({ name }) {
  const paths = {
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></>,
    page: <><path d="M5 3h10l4 4v14H5z" /><path d="M14 3v5h5M8 13h8M8 17h6" /></>,
    blog: <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    model: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="3" fill="currentColor" /><circle cx="15" cy="17" r="3" fill="currentColor" /></>,
    plans: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18M7 15h4" /></>,
    activity: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V3" /><path d="M2 19h20" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    users: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20a6 6 0 0 1 12 0M14 15a5 5 0 0 1 7 4.5" /></>,
    email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    legal: <><path d="M6 3h9l3 3v15H6z" /><path d="M14 3v4h4M9 11h6M9 15h6" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    back: <><path d="m10 17-5-5 5-5" /><path d="M5 12h14" /></>,
    external: <><path d="M14 5h5v5M13 11l6-6" /><path d="M19 13v6H5V5h6" /></>,
  };
  return <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
