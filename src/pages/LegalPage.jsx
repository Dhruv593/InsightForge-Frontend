import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/common/BrandLogo';
import { Seo } from '../components/common/Seo';
import { defaultLegalContent, normalizeLegalContent } from '../content/legalContent';
import { siteContentService } from '../services/siteContentService';

export function LegalPage({ type }) {
  const [content, setContent] = useState(defaultLegalContent);
  useEffect(() => {
    let active = true;
    siteContentService.getLegal().then((response) => { if (active) setContent(normalizeLegalContent(response.content)); }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  const document = content[type] || content.privacy;
  const path = type === 'privacy' ? '/privacy' : '/terms';
  return <div className="min-h-screen bg-[#F7F8FA] text-[#1D1D1F]">
    <Seo title={`${document.title} — Tatparya`} description={document.description} path={path} />
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8"><Link to="/" aria-label="Tatparya home"><BrandLogo className="h-9 w-auto max-w-[160px]" /></Link><Link className="text-sm font-semibold text-slate-600 hover:text-slate-950" to="/">Back to home</Link></div></header>
    <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="m-0 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">{document.title}</h1><p className="mb-0 mt-4 text-sm text-slate-500">Effective {document.effective_date}</p><p className="mb-0 mt-8 text-base leading-8 text-slate-700">{document.introduction}</p>
      <div className="mt-12 grid gap-10">{document.sections.map((section) => <section key={section.heading}><h2 className="m-0 text-xl font-semibold tracking-[-0.02em]">{section.heading}</h2><div className="mt-4 grid gap-3">{section.paragraphs.map((paragraph, index) => <p className="m-0 text-sm leading-7 text-slate-600" key={`${section.heading}-${index}`}>{paragraph}</p>)}</div></section>)}</div>
    </main>
    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl flex-wrap gap-5 px-5 py-8 text-sm text-slate-500 sm:px-8"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/login">Log in</Link><span className="sm:ml-auto">© {new Date().getFullYear()} Tatparya</span></div></footer>
  </div>;
}
