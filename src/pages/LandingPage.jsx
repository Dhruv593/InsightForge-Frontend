import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { defaultLandingContent, normalizeLandingContent } from '../content/landingContent';
import { siteContentService } from '../services/siteContentService';
import { getApiError } from '../services/api';
import { Seo } from '../components/common/Seo';

const heading = 'm-0 text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-5xl';
const palettes = {
  light: {
    section: 'bg-white text-slate-950', heading: 'text-slate-950', accent: 'text-slate-500', body: 'text-slate-600', muted: 'text-slate-500', border: 'border-slate-200', surface: 'border-slate-200 bg-[#F7F9FC]', card: 'border-slate-200 bg-white', button: 'bg-slate-950 text-white hover:bg-slate-800', secondaryButton: 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
  },
  dark: {
    section: 'bg-[#0E1726] text-white', heading: 'text-white', accent: 'text-slate-400', body: 'text-slate-300', muted: 'text-slate-400', border: 'border-slate-700/80', surface: 'border-slate-700/80 bg-[#121E31]', card: 'border-slate-700/80 bg-[#121E31]', button: 'bg-white text-slate-950 hover:bg-slate-100', secondaryButton: 'border-slate-600 bg-white/5 text-white hover:bg-white/10',
  },
};

const paletteFor = (theme) => palettes[theme === 'dark' ? 'dark' : 'light'];

export function LandingPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const [contactInView, setContactInView] = useState(false);
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

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [menuOpen]);

  useEffect(() => {
    if (!content.contact.enabled) {
      setContactInView(false);
      return undefined;
    }
    const section = document.getElementById('contact');
    if (!section || !globalThis.IntersectionObserver) return undefined;
    const observer = new globalThis.IntersectionObserver(([entry]) => setContactInView(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [content.contact.enabled]);

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
    <button className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-30 grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-lg shadow-slate-900/15 transition duration-200 hover:-translate-y-1 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${showBackToTop && !contactInView ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`} type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 15 6-6 6 6" /></svg></button>
  </div>;
}

function ContactSection({ content, order }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', website: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (status.type === 'error') setStatus({ type: '', message: '' });
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      const response = await siteContentService.submitContact(form);
      setForm({ name: '', email: '', subject: '', message: '', website: '' });
      setStatus({ type: 'success', message: response.message || content.success_message });
    } catch (error) {
      setStatus({ type: 'error', message: getApiError(error, 'Your message could not be sent. Please try again.').message });
    } finally {
      setSubmitting(false);
    }
  }

  const palette = paletteFor(content.theme);
  return <section id="contact" className={`scroll-mt-20 border-t ${palette.border} ${palette.section}`} style={{ order }}><div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:gap-10 sm:px-6 sm:py-20 lg:grid-cols-12 lg:px-12 lg:py-24">
    <div className="lg:col-span-5"><h2 className={`${heading} ${palette.heading}`}>{content.title}<br /><span className={palette.accent}>{content.accent}</span></h2><p className={`mb-0 mt-5 max-w-lg text-base leading-7 ${palette.body}`}>{content.description}</p><dl className="mt-8 grid gap-3 text-sm"><ContactDetail label="Email" value={content.email} href={`mailto:${content.email}`} palette={palette} /><ContactDetail label="Phone" value={content.phone} palette={palette} /><ContactDetail label="Location" value={content.address} palette={palette} /></dl></div>
    <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_55px_-42px_rgba(15,23,42,0.4)] sm:p-7 lg:col-span-7" onSubmit={submit}><div><h3 className="m-0 text-xl font-semibold tracking-[-0.025em] text-slate-950">{content.form_title}</h3><p className="mb-0 mt-1 text-xs leading-5 text-slate-500">We’ll reply to the email address you provide.</p></div><div className="grid gap-4 sm:grid-cols-2"><ContactField label="Name" name="name" value={form.name} onChange={update} autoComplete="name" /><ContactField label="Email" name="email" type="email" value={form.email} onChange={update} autoComplete="email" /></div><ContactField label="Subject (optional)" name="subject" value={form.subject} onChange={update} required={false} /><label className="grid gap-2 text-sm font-medium text-slate-700">Message<textarea className="min-h-32 resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal leading-6 outline-none transition hover:border-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100" name="message" value={form.message} onChange={update} required minLength={10} maxLength={5000} /></label><label className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">Website<input name="website" value={form.website} onChange={update} tabIndex="-1" autoComplete="off" /></label>{status.message && <p className={`m-0 rounded-xl px-4 py-3 text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`} role={status.type === 'error' ? 'alert' : 'status'}>{status.message}</p>}<button className="inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:justify-self-start" type="submit" disabled={submitting}>{submitting ? 'Sending…' : content.submit_label}</button></form>
  </div></section>;
}

function ContactDetail({ label, value, href, palette }) {
  const Value = href ? 'a' : 'span';
  return <div className={`grid grid-cols-[72px_minmax(0,1fr)] gap-3 border-b py-3 ${palette.border}`}><dt className={`text-xs font-semibold uppercase tracking-[0.08em] ${palette.muted}`}>{label}</dt><dd className={`m-0 min-w-0 break-words font-medium ${palette.body}`}><Value href={href} className={palette.heading}>{value}</Value></dd></div>;
}

function ContactField({ label, name, value, onChange, type = 'text', autoComplete, required = true }) {
  return <label className="grid gap-2 text-sm font-medium text-slate-700">{label}<input className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm font-normal outline-none transition hover:border-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100" name={name} type={type} value={value} onChange={onChange} autoComplete={autoComplete} required={required} maxLength={160} /></label>;
}

function ProductWalkthrough({ content, order }) {
  const [active, setActive] = useState(0);
  const dialog = useRef(null);
  const steps = content.steps;
  const stage = steps[active] ?? steps[0];

  const palette = paletteFor(content.theme);
  return <section id="preview" className={`scroll-mt-24 border-b ${palette.border} ${palette.section}`} style={{ order }}><div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 sm:py-20 lg:px-12 lg:py-28">
    <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-12 lg:items-end"><h2 className={`${heading} lg:col-span-7 ${palette.heading}`}>{content.title}<br /><span className={palette.accent}>{content.accent}</span></h2><p className={`m-0 max-w-xl text-base leading-7 sm:text-lg sm:leading-8 lg:col-span-5 ${palette.body}`}>{content.description}</p></div>

    <div className="mx-auto mt-10 max-w-7xl sm:mt-14">
      <div className={`mx-auto grid max-w-2xl grid-cols-3 rounded-2xl border p-1.5 shadow-sm ${palette.surface}`} role="tablist" aria-label="Product workflow">
        {steps.map((item, index) => <button type="button" role="tab" key={item.title} aria-selected={active === index} aria-controls="product-preview-panel" onClick={() => setActive(index)} className={`min-h-11 rounded-xl border-0 px-2 text-xs font-semibold transition sm:text-sm ${active === index ? palette.button : `${palette.muted} hover:bg-blue-500/10`}`}><span className="hidden min-[380px]:inline">0{index + 1} · </span>{item.label ?? `Step ${index + 1}`}</button>)}
      </div>

      <div className="mx-auto mt-6 max-w-3xl text-center"><h3 className={`m-0 text-xl font-semibold tracking-[-0.025em] sm:text-2xl ${palette.heading}`}>{stage.title}</h3><p className={`mx-auto mb-0 mt-2 max-w-2xl text-sm leading-6 sm:text-base sm:leading-7 ${palette.body}`}>{stage.description}</p></div>

      <div id="product-preview-panel" role="tabpanel" className={`mt-6 overflow-hidden rounded-2xl border bg-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.45)] sm:rounded-3xl ${palette.border}`}>
        <button type="button" className="group relative block w-full cursor-zoom-in border-0 bg-white p-0" onClick={() => dialog.current?.showModal()} aria-label={`Open ${stage.title} preview full screen`}><img key={stage.image} className="product-preview-image block h-auto w-full object-contain" src={stage.image} alt={stage.alt} width="1847" height="1015" loading="lazy" decoding="async" /><span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/85 px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg backdrop-blur sm:hidden">Tap to enlarge</span></button>
      </div>

      <div className={`flex flex-col gap-3 pt-4 text-xs leading-5 sm:flex-row sm:items-center sm:justify-between ${palette.muted}`}><span><strong className={`font-semibold ${palette.heading}`}>{content.workspace_label}.</strong> {content.helper_text}</span><button type="button" className={`inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border px-4 font-semibold transition ${palette.secondaryButton}`} onClick={() => dialog.current?.showModal()}>{content.open_label} <span aria-hidden="true">↗</span></button></div>
    </div>

    <dialog ref={dialog} className="fixed inset-0 m-auto max-h-[94dvh] w-[96vw] max-w-[1600px] overflow-auto rounded-2xl border border-slate-200 bg-white p-3 text-slate-950 shadow-2xl backdrop:bg-slate-950/75"><div className="mb-3 flex items-center justify-between gap-4"><p className="m-0 truncate text-sm font-semibold">{stage.title}</p><button type="button" className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold hover:bg-slate-50" onClick={() => dialog.current?.close()}>Close ×</button></div><img className="block h-auto w-full rounded-xl border border-slate-200" src={stage.image} alt={stage.alt} width="1847" height="1015" loading="lazy" decoding="async" /></dialog>
  </div></section>;
}

function Arrow() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

function HeroProcessGraphic({ content }) {
  const icons = [<><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" /><path d="M5 15v4h14v-4" /></>, <><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9h8M8 12h5" /></>, <><path d="M5 19V9m5 10V5m5 14v-7m5 7V3" /><path d="M3 19h19" /></>];
  const items = content.process_items.map((item, index) => ({ ...item, icon: icons[index] }));
  const animated = content.motion_enabled !== false;
  const palette = paletteFor(content.theme);
  return <div className={`mt-7 w-full max-w-2xl rounded-2xl border px-4 py-4 shadow-[0_22px_55px_-38px_rgba(15,23,42,0.5)] sm:mt-9 sm:px-7 sm:py-6 ${palette.surface}`} role="img" aria-label="Tatparya process: upload a business file, ask a question, and decide using clear evidence">
    <div className="relative">
      <span className={`absolute left-[16.67%] right-[16.67%] top-6 h-px ${content.theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`} aria-hidden="true" />
      <span className={`${animated ? 'hero-flow-beam' : ''} absolute left-[16.67%] top-6 h-px w-[66.66%] origin-left bg-blue-500`} aria-hidden="true" />
      {animated && <span className="hero-flow-dot absolute top-[21px] h-[7px] w-[7px] rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]" aria-hidden="true" />}
      <div className="relative grid grid-cols-3 gap-2">
        {items.map((item, index) => <div className="flex min-w-0 flex-col items-center text-center" key={item.label}><span className={`${animated ? `hero-flow-node hero-flow-delay-${index}` : ''} grid h-12 w-12 place-items-center rounded-xl border shadow-sm ${palette.card} ${palette.body}`}><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{item.icon}</svg></span><span className={`mt-3 text-xs font-bold sm:text-sm ${palette.heading}`}>{item.label}</span><span className={`mt-1 block w-full min-w-0 whitespace-normal px-0.5 text-[10px] leading-4 sm:text-xs ${palette.muted}`}>{item.detail}</span></div>)}
      </div>
    </div>
    <div className={`mt-5 border-t pt-3 text-center text-xs font-medium ${palette.border} ${palette.muted}`}>{content.process_footer}</div>
  </div>;
}

function ContentLink({ link, className, children, onClick }) {
  return link.href.startsWith('#')
    ? <a className={className} href={link.href} onClick={onClick}>{children}</a>
    : <Link className={className} to={link.href} onClick={onClick}>{children}</Link>;
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
