import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/common/BrandLogo';
import { Seo } from '../components/common/Seo';

export function NotFoundPage() {
  return <main className="grid min-h-screen place-items-center bg-[#F7F8FA] px-5 text-center"><Seo title="Page not found — Tatparya" description="The requested page could not be found." path={window.location.pathname} noIndex /><section className="max-w-lg"><Link className="mb-10 inline-flex" to="/" aria-label="Tatparya home"><BrandLogo className="h-10 w-auto max-w-[180px]" /></Link><p className="m-0 text-sm font-semibold text-brand-600">404</p><h1 className="mb-0 mt-3 text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl">This page doesn’t exist.</h1><p className="mb-0 mt-5 text-base leading-7 text-slate-600">The address may be incorrect, or the page may have moved.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800" to="/">Go to homepage</Link><Link className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50" to="/login">Log in</Link></div></section></main>;
}
