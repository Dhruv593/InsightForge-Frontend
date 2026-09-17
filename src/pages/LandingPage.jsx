import { useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';

const steps = [
  { title: 'Start with your file.', description: 'Upload CSV, Excel, JSON, or Parquet. Review columns, missing values, and data quality before you begin.', image: '/dataset-preview.png', alt: 'Tatparya dataset profile with row, column, and quality information' },
  { title: 'Ask the business question.', description: 'Ask in plain language. Tatparya coordinates the analysis, calculations, and supporting evidence.', image: '/workspace-preview.png', alt: 'Tatparya workspace for asking questions about a dataset' },
  { title: 'Bring the answer to the table.', description: 'Review KPIs, findings, recommendations, and charts. Preview a professional report before downloading it.', image: '/analysis-preview.png', alt: 'Tatparya analysis dashboard with metrics, charts, and findings' },
];

const capabilities = [
  ['Your question, in your words', 'Ask about revenue, growth, customers, products, or regional performance without writing SQL or formulas.'],
  ['Findings with visual context', 'See each result beside the chart that supports it, so the answer is easier to understand and explain.'],
  ['Recommendations you can act on', 'Turn patterns into practical next steps while keeping the final business decision in your hands.'],
  ['A report ready to share', 'Preview and download a polished PDF for your team, client, or next business review.'],
];

const faqs = [
  ['Do I need to know how to code?', 'No. Ask questions using normal business language. Tatparya handles the analysis workflow and presents the answer with supporting evidence.'],
  ['Which files can I upload?', 'Tatparya supports CSV, Excel, JSON, and Parquet files. Files with clear column names and consistent rows produce the best results.'],
  ['Can I ask follow-up questions?', 'Yes. Compare another group, investigate a change, or revisit an earlier result without starting over.'],
  ['Can I download the results?', 'Yes. Preview a report before downloading a PDF with the important metrics, findings, recommendations, and visuals.'],
  ['Is every answer based on my data?', 'Calculations and charts are generated from the selected dataset. Tatparya will not claim facts that the available fields cannot support.'],
];

const primary = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0B111E] px-6 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#172033]';
const heading = 'm-0 text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-5xl';

export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  if (!isLoading && isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <div className="landing-page min-h-screen overflow-x-hidden bg-[#FAFBFD] text-slate-900 selection:bg-slate-900 selection:text-white">
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#FAFBFD]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        <Link to="/" className="inline-flex" aria-label="Tatparya home"><BrandLogo className="h-10 w-auto max-w-[180px]" /></Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex" aria-label="Main navigation">
          <a className="hover:text-slate-950" href="#preview">Product preview</a><a className="hover:text-slate-950" href="#how-it-works">How it works</a><a className="hover:text-slate-950" href="#platform">Platform</a><a className="hover:text-slate-950" href="#faq">FAQs</a>
        </nav>
        <div className="flex items-center gap-5">
          <Link className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 sm:block" to="/login">Log in</Link>
          <Link className="hidden rounded-full bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 sm:inline-flex sm:items-center sm:gap-2" to="/register">Get started <Arrow /></Link>
          <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:hidden" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'}</button>
        </div>
      </div>
      {menuOpen && <nav className="grid gap-4 border-t border-slate-200 bg-white px-6 py-5 text-sm md:hidden">{[['#preview', 'Product preview'], ['#how-it-works', 'How it works'], ['#platform', 'Platform'], ['#faq', 'FAQs']].map(([href, label]) => <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</a>)}<Link to="/login">Log in</Link><Link to="/register">Create an account →</Link></nav>}
    </header>

    <main>
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-20 text-center lg:px-12 lg:pb-28 lg:pt-28">
        <div className="mx-auto flex max-w-4xl flex-col items-center">
          <h1 className="m-0 text-5xl font-extrabold leading-[1.06] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl">Less spreadsheet.<br /><span className="text-slate-600">More perspective.</span></h1>
          <p className="mb-0 mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">Ask a question about your business data and receive clear findings, useful visuals, and practical recommendations—without writing code.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-4"><Link className={primary} to="/register">Explore your data <Arrow /></Link><a className="inline-flex min-h-12 items-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50" href="#preview">See the product ↓</a></div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-slate-400"><span>No coding required</span><span>•</span>{['CSV', 'XLSX', 'JSON', 'PARQUET'].map((item) => <span className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-500" key={item}>{item}</span>)}</div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 bg-[#0E1726] text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
          <div className="grid items-end gap-8 border-b border-slate-700/60 pb-16 lg:grid-cols-12"><h2 className={`${heading} lg:col-span-7`}>The question is yours.<br /><span className="text-slate-400">The heavy lifting is ours.</span></h2><p className="m-0 text-base leading-7 text-slate-400 lg:col-span-5">Tatparya combines reliable calculations, clear explanations, and visual evidence so you can spend less time preparing data and more time deciding what comes next.</p></div>
          <div className="grid gap-12 pt-16 md:grid-cols-3 lg:gap-16">{[
            ['Understand performance', 'Compare products, regions, and customers to see what contributes most to the business.'],
            ['Investigate the change', 'Explore trends over time and ask follow-up questions when something needs a closer look.'],
            ['Share a clear answer', 'Keep findings, recommendations, and charts together in one report your team can review.'],
          ].map(([title, text], index) => <article className="space-y-4" key={title}><span className="block border-b border-slate-700/60 pb-2 font-mono text-xs font-bold tracking-widest text-slate-400">0{index + 1}</span><h3 className="m-0 text-xl font-bold">{title}</h3><p className="m-0 text-sm leading-7 text-slate-400">{text}</p></article>)}</div>
        </div>
      </section>

      <ProductWalkthrough />

      <section id="platform" className="scroll-mt-20 bg-[#070D18] text-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-12 lg:px-12">
          <div className="h-fit lg:sticky lg:top-32 lg:col-span-5"><h2 className={heading}>Useful answers.<br />Room to go deeper.</h2><p className="mb-0 mt-6 max-w-md text-base leading-7 text-slate-400">A good analysis should start a better conversation. Follow a result, compare another group, or take the findings into your next review.</p><Link className="mt-8 inline-flex items-center gap-2 border-b border-slate-600 pb-1 text-sm font-semibold hover:border-blue-400 hover:text-blue-400" to="/register">Start your first analysis <Arrow /></Link></div>
          <div className="grid gap-6 lg:col-span-7">{capabilities.map(([title, text], index) => <article className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 hover:border-slate-700" key={title}><span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-500/10 text-sm font-bold text-blue-400">0{index + 1}</span><h3 className="mb-0 mt-5 text-xl font-bold">{title}</h3><p className="mb-0 mt-3 text-sm leading-7 text-slate-400">{text}</p></article>)}</div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 bg-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-5"><h2 className={`${heading} text-slate-950`}>A few things<br />worth knowing.</h2><p className="mb-0 mt-5 max-w-sm text-base leading-7 text-slate-600">Everything you need to know before starting with your first file.</p></div>
          <div className="lg:col-span-7">{faqs.map(([question, answer]) => <details className="group border-b border-slate-200 py-6 first:pt-0" key={question}><summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">{question}<span className="text-2xl font-light text-slate-400 transition group-open:rotate-45">+</span></summary><p className="mb-0 mt-4 pr-8 text-sm leading-7 text-slate-600">{answer}</p></details>)}</div>
        </div>
      </section>

      <section className="bg-[#0E1726] text-white"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-6 py-20 sm:flex-row sm:items-center lg:px-12"><h2 className={`${heading} max-w-2xl`}>Your next insight starts with a question.</h2><div><Link className="inline-flex min-h-14 items-center gap-3 rounded-xl bg-white px-7 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100" to="/register">Get started <Arrow /></Link><p className="mb-0 mt-4 text-xs text-slate-400">Bring your file. We’ll help you explore it.</p></div></div></section>
    </main>

    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-6 py-10 text-sm text-slate-500 sm:flex-row sm:items-center lg:px-12"><Link className="inline-flex" to="/" aria-label="Tatparya home"><BrandLogo className="h-9 w-auto max-w-[160px]" /></Link><div className="flex flex-wrap gap-6"><a href="#preview">Product preview</a><Link to="/login">Log in</Link><span>© {new Date().getFullYear()} Tatparya</span></div></div></footer>
  </div>;
}

function ProductWalkthrough() {
  const [active, setActive] = useState(0);
  const dialog = useRef(null);
  const stage = steps[active];
  return <section id="preview" className="scroll-mt-20 border-b border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
    <div className="max-w-3xl"><h2 className={`${heading} text-slate-950`}>One file.<br />A whole new perspective.</h2><p className="mb-0 mt-5 text-lg leading-8 text-slate-600">A connected workspace for your data, questions, and decisions. See how Tatparya moves from upload to a shareable answer.</p></div>
    <div className="mt-16 grid items-start gap-10 lg:grid-cols-12">
      <div className="grid gap-3 lg:col-span-4">{steps.map((item, index) => <button type="button" key={item.title} aria-pressed={active === index} onClick={() => setActive(index)} className={`rounded-2xl border p-5 text-left transition ${active === index ? 'border-slate-800 bg-slate-900 text-white shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}><span className="font-mono text-xs text-slate-400">0{index + 1}</span><span className={`mt-1 block text-base font-bold ${active === index ? 'text-white' : 'text-slate-900'}`}>{item.title}</span><span className={`mt-2 block text-xs leading-6 ${active === index ? 'text-slate-300' : 'text-slate-500'}`}>{item.description}</span></button>)}</div>
      <div className="min-w-0 lg:col-span-8"><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70"><div className="flex h-10 items-center justify-between border-b border-slate-200 bg-slate-100/90 px-4"><div className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-slate-300" /><i className="h-3 w-3 rounded-full bg-slate-300" /><i className="h-3 w-3 rounded-full bg-slate-300" /><span className="ml-3 hidden font-mono text-[10px] text-slate-500 sm:inline">Tatparya workspace</span></div><span className="font-mono text-[10px] text-slate-400">Product preview</span></div><button type="button" className="block w-full cursor-zoom-in border-0 bg-white p-0" onClick={() => dialog.current?.showModal()}><img key={stage.image} className="block h-auto w-full animate-[preview-reveal_300ms_ease-out]" src={stage.image} alt={stage.alt} width="1847" height="1015" /></button></div><div className="mt-4 flex justify-between text-xs text-slate-400"><span>Inside Tatparya · Real product screen</span><button type="button" className="border-0 bg-transparent p-0 font-medium text-slate-600" onClick={() => dialog.current?.showModal()}>View full screen ↗</button></div></div>
    </div>
    <dialog ref={dialog} className="fixed inset-0 m-auto max-h-[94dvh] w-[96vw] max-w-[1600px] overflow-auto rounded-2xl border border-slate-700 bg-slate-950 p-3 text-white backdrop:bg-slate-950/85"><div className="mb-3 flex items-center justify-between"><p className="m-0 text-sm font-semibold">{stage.title}</p><button type="button" className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm" onClick={() => dialog.current?.close()}>Close ×</button></div><img className="block h-auto w-full rounded-xl" src={stage.image} alt={stage.alt} width="1847" height="1015" /></dialog>
  </div></section>;
}

function Arrow() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}
