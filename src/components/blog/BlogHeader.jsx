import { Link } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';

export function BlogHeader() {
  return <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12"><Link to="/" aria-label="Tatparya home"><BrandLogo className="h-9 w-auto max-w-[160px]" /></Link><nav className="flex items-center gap-5 text-sm font-medium text-slate-600"><Link className="text-slate-950" to="/blog">Blog</Link><Link className="hidden hover:text-slate-950 sm:block" to="/login">Log in</Link><Link className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800" to="/register">Get started</Link></nav></div></header>;
}

export function BlogFooter() {
  return <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-5 py-8 text-sm text-slate-500 sm:px-8 lg:px-12"><Link to="/">Home</Link><Link to="/blog">Blog</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><span className="sm:ml-auto">© {new Date().getFullYear()} Tatparya</span></div></footer>;
}
