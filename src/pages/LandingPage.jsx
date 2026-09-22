import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { defaultLandingContent, normalizeLandingContent } from '../content/landingContent';
import { siteContentService } from '../services/siteContentService';
import { Seo } from '../components/common/Seo';

const primary = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0B111E] px-6 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#172033]';
const heading = 'm-0 text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-5xl';

export function LandingPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const [content, setContent] = useState(defaultLandingContent);

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

  const isAdminPreview = user?.is_admin && searchParams.get('preview') === '1';
  if (!isLoading && isAuthenticated && !isAdminPreview) return <Navigate to="/dashboard" replace />;

  const sectionForAnchor = { '#preview': 'preview', '#how-it-works': 'how_it_works', '#platform': 'platform', '#faq': 'faq' };
  const navigationLinks = content.navigation.links.filter((link) => {
    if (link.href === '/blog' && content.blog?.enabled === false) return false;
    return !sectionForAnchor[link.href] || content[sectionForAnchor[link.href]]?.enabled !== false;
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
          <button className="relative grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-white text-slate-950 shadow-sm transition hover:bg-slate-50 lg:hidden" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
            <span className="relative block h-4 w-5" aria-hidden="true"><span className={`absolute left-0 top-0.5 h-0.5 w-5 rounded bg-current transition ${menuOpen ? 'translate-y-[6px] rotate-45' : ''}`} /><span className={`absolute left-0 top-[7px] h-0.5 w-5 rounded bg-current transition ${menuOpen ? 'scale-x-0 opacity-0' : ''}`} /><span className={`absolute bottom-0.5 left-0 h-0.5 w-5 rounded bg-current transition ${menuOpen ? '-translate-y-[6px] -rotate-45' : ''}`} /></span>
          </button>
        </div>
      </div>
      {menuOpen && <><button className="fixed inset-x-0 bottom-0 top-[76px] z-10 border-0 bg-slate-950/20 lg:hidden" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} /><nav id="mobile-navigation" className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-20 grid overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-sm font-medium text-slate-700 shadow-2xl shadow-slate-900/15 lg:hidden" aria-label="Mobile navigation">{navigationLinks.map((link) => <ContentLink className="rounded-xl px-4 py-3 hover:bg-slate-100 hover:text-slate-950" link={link} key={link.href}>{link.label}</ContentLink>)}<div className="my-1 border-t border-slate-200" /><Link className="rounded-xl px-4 py-3 hover:bg-slate-100" to="/login" onClick={() => setMenuOpen(false)}>{content.navigation.login_label}</Link><ContentLink className="m-1 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-white" link={content.navigation.action}>{content.navigation.action.label}<span className="ml-2">→</span></ContentLink></nav></>}
    </header>}

    <main className={content.navigation.enabled ? 'pt-16' : ''}>
      {content.hero.enabled && <section className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl items-center px-4 py-14 text-center sm:px-6 sm:py-16 lg:px-12 lg:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center">
          <h1 className="m-0 text-[35px] font-extrabold leading-[1.05] tracking-[-0.05em] text-slate-950 min-[375px]:text-[40px] sm:text-6xl lg:text-7xl">{content.hero.title}<br /><span className="text-slate-500">{content.hero.accent}</span></h1>
          <HeroProcessGraphic content={content.hero} />
          <div className="mt-8 flex flex-wrap justify-center gap-4"><ContentLink className={primary} link={content.hero.primary_action}>{content.hero.primary_action.label} <Arrow /></ContentLink><ContentLink className="inline-flex min-h-12 items-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50" link={content.hero.secondary_action}>{content.hero.secondary_action.label} ↓</ContentLink></div>
        </div>
      </section>}

      {content.how_it_works.enabled && <section id="how-it-works" className="scroll-mt-20 bg-[#0E1726] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-12 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="min-w-0 lg:col-span-7"><h2 className={heading}>{content.how_it_works.title}<br /><span className="text-slate-400">{content.how_it_works.accent}</span></h2></div>
            <div className="min-w-0 rounded-2xl border border-slate-700/70 bg-[#121E31] p-6 lg:col-span-5 lg:p-7"><p className="m-0 text-base leading-7 text-slate-300">{content.how_it_works.description}</p><div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-300">{content.how_it_works.flow_labels.map((label, index) => <span className="contents" key={label}><span className="rounded-full bg-blue-500/15 px-3 py-1.5 text-blue-300">{label}</span>{index < content.how_it_works.flow_labels.length - 1 && <span className="text-slate-600">→</span>}</span>)}</div></div>
          </div>
          <div className="mt-16 grid overflow-hidden rounded-2xl border border-slate-700/70 bg-[#121E31] md:grid-cols-3">{content.how_it_works.cards.map((card, index) => <article className="group relative border-b border-slate-700/70 p-6 last:border-b-0 md:min-h-64 md:border-b-0 md:border-r md:p-7 md:last:border-r-0 lg:p-9" key={card.title}><span className="font-mono text-xs font-bold tracking-widest text-blue-400">0{index + 1}</span><div className="mt-9 md:mt-16"><h3 className="m-0 text-lg font-bold tracking-[-0.02em] sm:text-xl">{card.title}</h3><p className="mb-0 mt-3 text-sm leading-6 text-slate-400 md:leading-7">{card.description}</p></div><span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-blue-500 transition-transform duration-300 group-hover:scale-x-100" /></article>)}</div>
        </div>
      </section>}

      {content.preview.enabled && <ProductWalkthrough content={content.preview} />}

      {content.platform.enabled && <section id="platform" className="scroll-mt-20 bg-[#070D18] text-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-16 sm:py-20 lg:grid-cols-12 lg:px-12 lg:py-28">
          <div className="h-fit lg:sticky lg:top-32 lg:col-span-4"><h2 className={heading}>{content.platform.title}<br /><span className="text-slate-400">{content.platform.accent}</span></h2><p className="mb-0 mt-6 max-w-sm text-base leading-7 text-slate-400">{content.platform.description}</p><ContentLink className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100" link={content.platform.action}>{content.platform.action.label} <Arrow /></ContentLink></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">{content.platform.cards.map((card, index) => <article className={`group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0E1726] p-7 transition hover:-translate-y-1 hover:border-slate-700 ${index === 0 || index === 3 ? 'sm:col-span-2' : ''}`} key={card.title}><div className="flex items-start justify-between gap-6"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-sm font-bold text-blue-400">0{index + 1}</span><CapabilityIcon index={index} /></div><h3 className="mb-0 mt-8 text-xl font-bold tracking-[-0.02em]">{card.title}</h3><p className="mb-0 mt-3 max-w-xl text-sm leading-7 text-slate-400">{card.description}</p><span className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-blue-500 transition-transform duration-300 group-hover:scale-x-100" /></article>)}</div>
        </div>
      </section>}

      {content.faq.enabled && <section id="faq" className="scroll-mt-20 bg-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-16 sm:py-20 lg:grid-cols-12 lg:px-12 lg:py-24">
          <div className="lg:col-span-5"><h2 className={`${heading} text-slate-950`}>{content.faq.title}<br />{content.faq.accent}</h2><p className="mb-0 mt-5 max-w-sm text-base leading-7 text-slate-600">{content.faq.description}</p></div>
          <div className="lg:col-span-7">{content.faq.items.map((item) => <details className="group border-b border-slate-200 py-6 first:pt-0" key={item.question}><summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">{item.question}<span className="text-2xl font-light text-slate-400 transition group-open:rotate-45">+</span></summary><p className="mb-0 mt-4 pr-8 text-sm leading-7 text-slate-600">{item.answer}</p></details>)}</div>
        </div>
      </section>}

      {content.closing.enabled && <section className="bg-[#0E1726] text-white"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-6 py-16 sm:flex-row sm:items-center sm:py-20 lg:px-12"><h2 className={`${heading} max-w-2xl`}>{content.closing.title}</h2><div><ContentLink className="inline-flex min-h-14 items-center gap-3 rounded-xl bg-white px-7 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100" link={content.closing.action}>{content.closing.action.label} <Arrow /></ContentLink><p className="mb-0 mt-4 text-xs text-slate-400">{content.closing.note}</p></div></div></section>}
    </main>

    {content.footer.enabled && <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-6 py-10 text-sm text-slate-500 sm:flex-row sm:items-center lg:px-12"><Link className="inline-flex" to="/" aria-label="Tatparya home"><BrandLogo className="h-9 w-auto max-w-[160px]" /></Link><div className="flex flex-wrap gap-6"><a href={content.footer.preview_link.href}>{content.footer.preview_link.label}</a>{content.blog?.enabled !== false && <Link to="/blog">Blog</Link>}<Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/login">{content.footer.login_label}</Link><span>© {new Date().getFullYear()} {content.footer.copyright_name}</span></div></div></footer>}
    <button className={`fixed bottom-5 right-5 z-30 grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-lg shadow-slate-900/15 transition duration-200 hover:-translate-y-1 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${showBackToTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`} type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 15 6-6 6 6" /></svg></button>
  </div>;
}

function ProductWalkthrough({ content }) {
  const [active, setActive] = useState(0);
  const dialog = useRef(null);
  const steps = content.steps;
  const stage = steps[active] ?? steps[0];
  const selectPrevious = () => setActive((current) => (current + steps.length - 1) % steps.length);
  const selectNext = () => setActive((current) => (current + 1) % steps.length);

  return <section id="preview" className="scroll-mt-24 border-b border-slate-200 bg-[#F4F7FB]"><div className="mx-auto max-w-[1500px] px-6 py-16 sm:py-20 lg:px-12 lg:py-28">
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-12 lg:items-end"><h2 className={`${heading} text-slate-950 lg:col-span-7`}>{content.title}<br /><span className="text-slate-500">{content.accent}</span></h2><p className="m-0 max-w-xl text-lg leading-8 text-slate-600 lg:col-span-5">{content.description}</p></div>

    <div className="mt-14">
      <div className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-3 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0" role="tablist" aria-label="Product workflow">
        {steps.map((item, index) => <button type="button" role="tab" key={item.title} aria-selected={active === index} aria-controls="product-preview-panel" onClick={() => setActive(index)} className={`group min-w-[82vw] snap-center rounded-2xl border p-5 text-left transition sm:min-w-[58vw] md:min-w-0 lg:p-6 ${active === index ? 'border-[#172033] bg-[#0E1726] text-white shadow-lg shadow-slate-900/10' : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:-translate-y-0.5'}`}><span className="flex items-center gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-[11px] font-bold ${active === index ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>0{index + 1}</span><span className="text-sm font-bold sm:text-base">{item.title}</span></span><span className={`mt-4 block text-xs leading-6 sm:pl-12 ${active === index ? 'text-slate-300' : 'text-slate-500'}`}>{item.description}</span></button>)}
      </div>
      <div className="mt-1 flex items-center justify-center gap-3 md:hidden"><span className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-400">Swipe to explore</span><div className="flex gap-1.5">{steps.map((item, index) => <button className={`h-1.5 rounded-full border-0 p-0 transition-all ${active === index ? 'w-5 bg-blue-500' : 'w-1.5 bg-slate-300'}`} type="button" key={item.title} aria-label={`Show ${item.title}`} aria-current={active === index ? 'step' : undefined} onClick={() => setActive(index)} />)}</div></div>

      <div id="product-preview-panel" role="tabpanel" className="mt-5 rounded-[30px] bg-[#0E1726] p-3 shadow-[0_35px_90px_-45px_rgba(15,23,42,0.65)] sm:p-5 lg:p-7">
        <div className="flex items-center justify-between gap-4 px-1 pb-3 sm:px-2 sm:pb-4"><div className="flex min-w-0 items-center gap-2.5"><BrandLogo variant="symbol" className="h-7 w-7 shrink-0" alt="" /><div className="min-w-0"><span className="block truncate text-xs font-semibold text-white">{stage.title}</span><span className="hidden text-[10px] text-slate-400 sm:block">{content.workspace_label}</span></div></div><div className="flex shrink-0 items-center gap-1.5"><button className="grid h-9 w-9 place-items-center rounded-full border border-slate-700 bg-slate-800 text-white transition hover:border-slate-600 hover:bg-slate-700" type="button" onClick={selectPrevious} aria-label="Previous product step">←</button><span className="min-w-12 text-center font-mono text-[10px] text-slate-400">{active + 1} / {steps.length}</span><button className="grid h-9 w-9 place-items-center rounded-full border border-slate-700 bg-slate-800 text-white transition hover:border-slate-600 hover:bg-slate-700" type="button" onClick={selectNext} aria-label="Next product step">→</button></div></div>
        <div className="overflow-hidden rounded-[20px] border border-white/10 bg-white shadow-2xl shadow-black/30"><button type="button" className="block w-full cursor-zoom-in border-0 bg-white p-0" onClick={() => dialog.current?.showModal()} aria-label={`Open ${stage.title} preview full screen`}><img key={stage.image} className="block h-auto w-full animate-[preview-reveal_300ms_ease-out] object-contain" src={stage.image} alt={stage.alt} width="1847" height="1015" loading="lazy" decoding="async" /></button></div>
      </div>

      <div className="flex flex-col gap-3 px-1 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span><strong className="font-semibold text-slate-800">{stage.title}</strong> {content.helper_text}</span><button type="button" className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50" onClick={() => dialog.current?.showModal()}>{content.open_label} <span aria-hidden="true">↗</span></button></div>
    </div>

    <dialog ref={dialog} className="fixed inset-0 m-auto max-h-[94dvh] w-[96vw] max-w-[1600px] overflow-auto rounded-2xl border border-slate-700 bg-slate-950 p-3 text-white backdrop:bg-slate-950/85"><div className="mb-3 flex items-center justify-between"><p className="m-0 text-sm font-semibold">{stage.title}</p><button type="button" className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm" onClick={() => dialog.current?.close()}>Close ×</button></div><img className="block h-auto w-full rounded-xl" src={stage.image} alt={stage.alt} width="1847" height="1015" loading="lazy" decoding="async" /></dialog>
  </div></section>;
}

function Arrow() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

function HeroProcessGraphic({ content }) {
  const icons = [<><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" /><path d="M5 15v4h14v-4" /></>, <><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9h8M8 12h5" /></>, <><path d="M5 19V9m5 10V5m5 14v-7m5 7V3" /><path d="M3 19h19" /></>];
  const items = content.process_items.map((item, index) => ({ ...item, icon: icons[index] }));
  return <div className="mt-9 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-[0_22px_55px_-38px_rgba(15,23,42,0.5)] sm:px-7 sm:py-6" role="img" aria-label="Tatparya process: upload a business file, ask a question, and decide using clear evidence">
    <div className="relative">
      <span className="absolute left-[16.67%] right-[16.67%] top-6 h-px bg-slate-200" aria-hidden="true" />
      <span className="hero-flow-beam absolute left-[16.67%] top-6 h-px w-[66.66%] origin-left bg-blue-500" aria-hidden="true" />
      <span className="hero-flow-dot absolute top-[21px] h-[7px] w-[7px] rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]" aria-hidden="true" />
      <div className="relative grid grid-cols-3 gap-2">
        {items.map((item, index) => <div className="flex min-w-0 flex-col items-center text-center" key={item.label}><span className={`hero-flow-node hero-flow-delay-${index} grid h-12 w-12 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm`}><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{item.icon}</svg></span><span className="mt-3 text-xs font-bold text-slate-900 sm:text-sm">{item.label}</span><span className="mt-1 truncate text-[9px] text-slate-400 sm:text-[10px]">{item.detail}</span></div>)}
      </div>
    </div>
    <div className="mt-5 border-t border-slate-100 pt-3 text-center text-[10px] font-medium text-slate-400">{content.process_footer}</div>
  </div>;
}

function ContentLink({ link, className, children }) {
  return link.href.startsWith('#')
    ? <a className={className} href={link.href}>{children}</a>
    : <Link className={className} to={link.href}>{children}</Link>;
}

function CapabilityIcon({ index }) {
  const paths = [
    <><path d="M5 6h14M5 12h9M5 18h6" /><path d="m16 15 3 3-3 3" /></>,
    <><path d="M4 19V9M10 19V5M16 19v-7M22 19V3" /><path d="M2 19h20" /></>,
    <><path d="m4 13 4 4L20 5" /><path d="M20 12v7H4V5h11" /></>,
    <><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6M9 13h8M9 17h6" /></>,
  ];
  return <svg className="h-8 w-8 text-slate-600 transition group-hover:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[index]}</svg>;
}
