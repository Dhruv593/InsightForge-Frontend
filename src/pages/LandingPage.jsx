import { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { defaultLandingContent, normalizeLandingContent } from '../content/landingContent';
import { siteContentService } from '../services/siteContentService';
import { Seo } from '../components/common/Seo';
import { ContactSection } from '../components/landing/ContactSection';
import { ProductWalkthrough } from '../components/landing/ProductWalkthrough';
import { Arrow, CapabilityIcon, ContentLink, HeroProcessGraphic } from '../components/landing/LandingElements';
import { landingHeading as heading, paletteFor } from '../components/landing/landingStyles';

export function LandingPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const [content, setContent] = useState(defaultLandingContent);

  useEffect(() => {
    document.documentElement.classList.add('landing-smooth-scroll');
    return () => document.documentElement.classList.remove('landing-smooth-scroll');
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 560);
      setNavbarScrolled(window.scrollY > 24);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    let active = true;
    siteContentService.getLanding()
      .then((response) => { if (active && response.content) setContent(normalizeLandingContent(response.content)); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [menuOpen]);

  const isAdminPreview = user?.is_admin && searchParams.get('preview') === '1';
  if (!isLoading && isAuthenticated && !isAdminPreview) return <Navigate to="/dashboard" replace />;

  const sectionForAnchor = { '#preview': 'preview', '#how-it-works': 'how_it_works', '#platform': 'platform', '#faq': 'faq', '#tutorial': 'video', '#contact': 'contact' };
  const sectionPosition = Object.fromEntries(content.section_order.map((section, index) => [section, index]));
  const navigationLinks = content.navigation.links
    .map((link, index) => ({ ...link, originalIndex: index }))
    .filter((link) => {
      if (link.href === '/blog' && content.blog?.enabled === false) return false;
      if (link.href === '#tutorial' && (!content.video?.enabled || !content.video?.video_url)) return false;
      return !sectionForAnchor[link.href] || content[sectionForAnchor[link.href]]?.enabled !== false;
    })
    .sort((left, right) => {
      const leftSection = sectionForAnchor[left.href];
      const rightSection = sectionForAnchor[right.href];
      if (leftSection && rightSection) return sectionPosition[leftSection] - sectionPosition[rightSection];
      if (leftSection) return -1;
      if (rightSection) return 1;
      return left.originalIndex - right.originalIndex;
    });

  return <div className="landing-page min-h-screen overflow-x-hidden bg-[#FAFBFD] text-slate-900 selection:bg-slate-900 selection:text-white">
    <Seo />
    {content.navigation.enabled && <header className={`fixed left-1/2 top-3 z-40 w-[calc(100%-1.5rem)] max-w-7xl -translate-x-1/2 rounded-2xl border bg-white/90 backdrop-blur-xl transition-[box-shadow,border-color] duration-200 sm:w-[calc(100%-2.5rem)] ${navbarScrolled ? 'border-slate-300/90 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.48)]' : 'border-slate-200/90 shadow-[0_10px_35px_-22px_rgba(15,23,42,0.45)]'}`}>
      <div className={`mx-auto flex items-center justify-between px-4 transition-[height] duration-200 sm:px-6 lg:px-8 ${navbarScrolled ? 'h-14' : 'h-16'}`}>
        <Link to="/" className="inline-flex" aria-label="Tatparya home"><BrandLogo className={`w-auto max-w-[180px] transition-[height] duration-200 ${navbarScrolled ? 'h-8' : 'h-10'}`} /></Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex" aria-label="Main navigation">
          {navigationLinks.map((link) => <ContentLink className="hover:text-slate-950" link={link} key={link.href}>{link.label}</ContentLink>)}
        </nav>
        <div className="flex items-center gap-5">
          <Link className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 sm:block" to="/login">{content.navigation.login_label}</Link>
          <ContentLink className="hidden rounded-full bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 sm:inline-flex sm:items-center sm:gap-2" link={content.navigation.action}>{content.navigation.action.label} <Arrow /></ContentLink>
          <button className="relative grid h-11 w-11 place-items-center rounded-full border border-slate-300 bg-white text-slate-950 shadow-sm transition hover:bg-slate-50 lg:hidden" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
            <span className="relative block h-4 w-5" aria-hidden="true"><span className={`absolute left-0 top-0.5 h-0.5 w-5 rounded bg-current transition ${menuOpen ? 'translate-y-[6px] rotate-45' : ''}`} /><span className={`absolute left-0 top-[7px] h-0.5 w-5 rounded bg-current transition ${menuOpen ? 'scale-x-0 opacity-0' : ''}`} /><span className={`absolute bottom-0.5 left-0 h-0.5 w-5 rounded bg-current transition ${menuOpen ? '-translate-y-[6px] -rotate-45' : ''}`} /></span>
          </button>
        </div>
      </div>
      {menuOpen && <><button className="fixed inset-x-0 bottom-0 top-[76px] z-10 border-0 bg-slate-950/15 backdrop-blur-[2px] lg:hidden" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} /><nav id="mobile-navigation" className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-20 grid overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-sm font-medium text-slate-700 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.38)] lg:hidden" aria-label="Mobile navigation">{navigationLinks.map((link) => <ContentLink className="flex min-h-11 items-center rounded-xl px-4 hover:bg-slate-100 hover:text-slate-950" link={link} key={link.href} onClick={() => setMenuOpen(false)}>{link.label}</ContentLink>)}<div className="my-1 border-t border-slate-200" /><Link className="flex min-h-11 items-center rounded-xl px-4 hover:bg-slate-100" to="/login" onClick={() => setMenuOpen(false)}>{content.navigation.login_label}</Link><ContentLink className="m-1 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-white" link={content.navigation.action} onClick={() => setMenuOpen(false)}>{content.navigation.action.label}<span className="ml-2">→</span></ContentLink></nav></>}
    </header>}

    <main className={`flex flex-col ${content.navigation.enabled ? 'pt-16' : ''}`}>
      {content.hero.enabled && <section className={`${paletteFor(content.hero.theme).section} flex min-h-[calc(100svh-4rem)] items-center`} style={{ order: sectionPosition.hero }}><div className="mx-auto w-full max-w-7xl px-4 py-10 text-center sm:px-6 sm:py-16 lg:px-12 lg:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center">
          <h1 className={`m-0 text-[34px] font-bold leading-[1.1] tracking-[-0.042em] min-[375px]:text-[39px] sm:text-6xl sm:leading-[1.07] lg:text-7xl ${paletteFor(content.hero.theme).heading}`}><span>{content.hero.title}</span>{' '}<span className={paletteFor(content.hero.theme).accent}>{content.hero.accent}</span></h1>
          <HeroProcessGraphic content={content.hero} />
          <div className="mt-6 grid w-full max-w-[290px] gap-3 sm:mt-8 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-4"><ContentLink className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 ${paletteFor(content.hero.theme).button}`} link={content.hero.primary_action}>{content.hero.primary_action.label} <Arrow /></ContentLink><ContentLink className={`inline-flex min-h-12 items-center justify-center rounded-xl border px-5 text-sm font-semibold ${paletteFor(content.hero.theme).secondaryButton}`} link={content.hero.secondary_action}>{content.hero.secondary_action.label} ↓</ContentLink></div>
        </div>
      </div></section>}

      {content.how_it_works.enabled && <section id="how-it-works" className={`scroll-mt-20 ${paletteFor(content.how_it_works.theme).section}`} style={{ order: sectionPosition.how_it_works }}>
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-20 lg:px-12 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="min-w-0 lg:col-span-7"><h2 className={`${heading} ${paletteFor(content.how_it_works.theme).heading}`}>{content.how_it_works.title}<br /><span className={paletteFor(content.how_it_works.theme).accent}>{content.how_it_works.accent}</span></h2></div>
            <div className={`min-w-0 rounded-2xl border p-6 lg:col-span-5 lg:p-7 ${paletteFor(content.how_it_works.theme).surface}`}><p className={`m-0 text-base leading-7 ${paletteFor(content.how_it_works.theme).body}`}>{content.how_it_works.description}</p><div className={`mt-6 flex flex-wrap items-center gap-2 text-[11px] font-semibold ${paletteFor(content.how_it_works.theme).body}`}>{content.how_it_works.flow_labels.map((label, index) => <span className="contents" key={label}><span className="rounded-full bg-blue-500/15 px-3 py-1.5 text-blue-400">{label}</span>{index < content.how_it_works.flow_labels.length - 1 && <span className={paletteFor(content.how_it_works.theme).muted}>→</span>}</span>)}</div></div>
          </div>
          <div className="mx-auto mt-12 grid max-w-6xl gap-3 md:mt-16 md:grid-cols-3">{content.how_it_works.cards.map((card, index) => <article className={`rounded-2xl border p-6 md:min-h-56 md:p-7 lg:p-8 ${paletteFor(content.how_it_works.theme).card}`} key={card.title}><span className="font-mono text-xs font-bold tracking-widest text-blue-400">0{index + 1}</span><div className="mt-7 md:mt-12"><h3 className={`m-0 text-lg font-semibold tracking-[-0.02em] sm:text-xl ${paletteFor(content.how_it_works.theme).heading}`}>{card.title}</h3><p className={`mb-0 mt-3 text-sm leading-6 md:leading-7 ${paletteFor(content.how_it_works.theme).muted}`}>{card.description}</p></div></article>)}</div>
        </div>
      </section>}

      {content.preview.enabled && <ProductWalkthrough content={content.preview} order={sectionPosition.preview} />}

      {content.platform.enabled && <section id="platform" className={`scroll-mt-20 ${paletteFor(content.platform.theme).section}`} style={{ order: sectionPosition.platform }}>
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 sm:gap-14 sm:py-20 lg:grid-cols-12 lg:px-12 lg:py-28">
          <div className="h-fit lg:sticky lg:top-32 lg:col-span-4"><h2 className={`${heading} ${paletteFor(content.platform.theme).heading}`}>{content.platform.title}<br /><span className={paletteFor(content.platform.theme).accent}>{content.platform.accent}</span></h2><p className={`mb-0 mt-6 max-w-sm text-base leading-7 ${paletteFor(content.platform.theme).body}`}>{content.platform.description}</p><ContentLink className={`mt-8 inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition hover:-translate-y-0.5 ${paletteFor(content.platform.theme).button}`} link={content.platform.action}>{content.platform.action.label} <Arrow /></ContentLink></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-8">{content.platform.cards.map((card, index) => <article className={`rounded-2xl border p-6 ${paletteFor(content.platform.theme).card} ${index === 0 ? 'sm:col-span-2 sm:p-8' : 'sm:p-7'}`} key={card.title}><div className="flex items-start justify-between gap-6"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-sm font-bold text-blue-400">0{index + 1}</span><CapabilityIcon index={index} /></div><h3 className={`mb-0 mt-7 text-xl font-semibold tracking-[-0.02em] ${paletteFor(content.platform.theme).heading}`}>{card.title}</h3><p className={`mb-0 mt-3 max-w-xl text-sm leading-7 ${paletteFor(content.platform.theme).muted}`}>{card.description}</p></article>)}</div>
        </div>
      </section>}

      {content.faq.enabled && <section id="faq" className={`scroll-mt-20 ${paletteFor(content.faq.theme).section}`} style={{ order: sectionPosition.faq }}>
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 sm:gap-14 sm:py-20 lg:grid-cols-12 lg:px-12 lg:py-24">
          <div className="lg:col-span-5"><h2 className={`${heading} ${paletteFor(content.faq.theme).heading}`}>{content.faq.title}<br /><span className={paletteFor(content.faq.theme).accent}>{content.faq.accent}</span></h2><p className={`mb-0 mt-5 max-w-sm text-base leading-7 ${paletteFor(content.faq.theme).body}`}>{content.faq.description}</p></div>
          <div className="lg:col-span-7">{content.faq.items.map((item) => <details className={`group border-b py-6 first:pt-0 ${paletteFor(content.faq.theme).border}`} key={item.question}><summary className={`flex cursor-pointer list-none items-center justify-between gap-6 font-semibold [&::-webkit-details-marker]:hidden ${paletteFor(content.faq.theme).heading}`}>{item.question}<span className={`text-2xl font-light transition group-open:rotate-45 ${paletteFor(content.faq.theme).muted}`}>+</span></summary><p className={`mb-0 mt-4 pr-8 text-sm leading-7 ${paletteFor(content.faq.theme).body}`}>{item.answer}</p></details>)}</div>
        </div>
      </section>}

      {content.video.enabled && content.video.video_url && <section id="tutorial" className={`scroll-mt-20 border-t ${paletteFor(content.video.theme).border} ${paletteFor(content.video.theme).section}`} style={{ order: sectionPosition.video }}><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-12 lg:py-24"><div className="grid gap-8 lg:grid-cols-12 lg:items-end"><div className="lg:col-span-7"><h2 className={`${heading} ${paletteFor(content.video.theme).heading}`}>{content.video.title}<br /><span className={paletteFor(content.video.theme).accent}>{content.video.accent}</span></h2></div><p className={`m-0 max-w-xl text-base leading-7 lg:col-span-5 ${paletteFor(content.video.theme).body}`}>{content.video.description}</p></div><div className={`mt-8 overflow-hidden rounded-2xl border bg-black shadow-[0_24px_65px_-42px_rgba(15,23,42,0.55)] sm:mt-10 sm:rounded-3xl ${paletteFor(content.video.theme).border}`}><video className="block aspect-video w-full" controls playsInline preload="metadata" poster={content.video.poster_url || undefined} aria-label={content.video.caption}><source src={content.video.video_url} />Your browser does not support embedded video.</video></div><p className={`mb-0 mt-3 text-xs ${paletteFor(content.video.theme).muted}`}>{content.video.caption}</p></div></section>}

      {content.contact.enabled && <ContactSection content={content.contact} order={sectionPosition.contact} />}

      {content.closing.enabled && <section className={paletteFor(content.closing.theme).section} style={{ order: sectionPosition.closing }}><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-14 sm:flex-row sm:items-center sm:gap-10 sm:py-20 lg:px-12"><h2 className={`${heading} max-w-2xl ${paletteFor(content.closing.theme).heading}`}>{content.closing.title}</h2><div><ContentLink className={`inline-flex min-h-14 items-center gap-3 rounded-xl px-7 text-sm font-bold transition hover:-translate-y-0.5 ${paletteFor(content.closing.theme).button}`} link={content.closing.action}>{content.closing.action.label} <Arrow /></ContentLink><p className={`mb-0 mt-4 text-xs ${paletteFor(content.closing.theme).muted}`}>{content.closing.note}</p></div></div></section>}
    </main>

    {content.footer.enabled && <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-6 py-10 text-sm text-slate-500 sm:flex-row sm:items-center lg:px-12"><Link className="inline-flex min-h-11 items-center" to="/" aria-label="Tatparya home"><BrandLogo className="h-9 w-auto max-w-[160px]" /></Link><div className="grid gap-4 sm:justify-items-end"><div className="flex flex-wrap gap-x-5 gap-y-3"><a href={content.footer.preview_link.href}>{content.footer.preview_link.label}</a>{content.blog?.enabled !== false && <Link to="/blog">Blog</Link>}<Link to="/login">{content.footer.login_label}</Link></div><div className="flex flex-wrap gap-x-5 gap-y-3 text-xs"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><span>© {new Date().getFullYear()} {content.footer.copyright_name}</span></div></div></div></footer>}
    <button className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-30 grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-lg shadow-slate-900/15 transition duration-200 hover:-translate-y-1 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${showBackToTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`} type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 15 6-6 6 6" /></svg></button>
  </div>;
}
